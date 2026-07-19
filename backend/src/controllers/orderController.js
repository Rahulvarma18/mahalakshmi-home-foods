import Order from "../models/Order.js";
import Product from "../models/Product.js";

// ======================
// Create Order (any logged-in user)
// ======================

export const createOrder = async (req, res) => {

    try {

        const { items, address, payment } = req.body;

        if (!items || items.length === 0) {

            return res.status(400).json({
                message: "Order must have at least one item",
            });

        }

        // Never trust prices/total from the client — look up the real
        // price for each item from the database so a tampered request
        // body can't place an order at an arbitrary price.
        let total = 0;
        const verifiedItems = [];

        for (const item of items) {

            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(400).json({
                    message: `Product not found: ${item.productId}`,
                });
            }

            const variant = product.variants.find(
                (v) => v.weight === item.weight
            );

            if (!variant) {
                return res.status(400).json({
                    message: `Invalid variant for ${product.name}`,
                });
            }

            const qty = Number(item.qty) || 1;

            // This just blocks placing an order for a variant that's
            // already out of stock. It does NOT reserve/deduct stock —
            // that only happens once an admin approves the order (see
            // updateOrderStatus), since a "Pending Approval" order isn't
            // guaranteed to ever be fulfilled.
            if (variant.stock < qty) {
                return res.status(400).json({
                    message:
                        variant.stock === 0
                            ? `${product.name} (${variant.weight}) is out of stock.`
                            : `Only ${variant.stock} left of ${product.name} (${variant.weight}).`,
                });
            }

            total += variant.price * qty;

            verifiedItems.push({
                productId: item.productId,
                slug: product.id,
                name: product.name,
                image: product.image,
                weight: variant.weight,
                qty,
                price: variant.price,
            });

        }

        const order = await Order.create({
            id: `MHF-${Date.now().toString().slice(-6)}`,
            user: req.user._id,
            userEmail: req.user.email,
            items: verifiedItems,
            total,
            address,
            payment,
            status: "Pending Approval",
        });

        res.status(201).json(order);

    } catch (err) {

        res.status(500).json({
            message: err.message,
        });

    }

};

// ======================
// Get logged-in user's own orders
// ======================

export const getMyOrders = async (req, res) => {

    try {

        const orders = await Order.find({
            user: req.user._id,
        }).sort({ createdAt: -1 });

        res.json(orders);

    } catch (err) {

        res.status(500).json({
            message: err.message,
        });

    }

};

// ======================
// Get all orders (admin only)
// ======================

export const getAllOrders = async (req, res) => {

    try {

        const orders = await Order.find().sort({ createdAt: -1 });

        res.json(orders);

    } catch (err) {

        res.status(500).json({
            message: err.message,
        });

    }

};

// ======================
// Update order status (admin only)
// ======================

export const updateOrderStatus = async (req, res) => {

    try {

        const { status: newStatus } = req.body;

        const order = await Order.findOne({ id: req.params.id });

        if (!order) {

            return res.status(404).json({
                message: "Order not found",
            });

        }

        // The order is being approved out of "Pending Approval" for the
        // first time — this is the moment stock actually gets deducted,
        // not when the customer originally placed the order.
        const isFirstApproval =
            !order.stockDecremented && newStatus !== "Pending Approval";

        if (isFirstApproval) {

            const reserved = [];

            for (const item of order.items) {

                const updated = await Product.findOneAndUpdate(
                    {
                        _id: item.productId,
                        variants: {
                            $elemMatch: {
                                weight: item.weight,
                                stock: { $gte: item.qty },
                            },
                        },
                    },
                    { $inc: { "variants.$[v].stock": -item.qty } },
                    {
                        new: true,
                        arrayFilters: [{ "v.weight": item.weight }],
                    }
                );

                if (!updated) {

                    // Not enough stock left to honor this order — put back
                    // whatever we already deducted for it in this pass and
                    // reject the approval without changing its status.
                    await Promise.all(
                        reserved.map(({ id, weight, qty }) =>
                            Product.updateOne(
                                { _id: id },
                                { $inc: { "variants.$[v].stock": qty } },
                                { arrayFilters: [{ "v.weight": weight }] }
                            )
                        )
                    );

                    return res.status(400).json({
                        message: `Can't approve — ${item.name} (${item.weight}) no longer has enough stock (needs ${item.qty}).`,
                    });

                }

                reserved.push({
                    id: item.productId,
                    weight: item.weight,
                    qty: item.qty,
                });

            }

            order.stockDecremented = true;

        }

        order.status = newStatus;

        await order.save();

        res.json(order);

    } catch (err) {

        res.status(500).json({
            message: err.message,
        });

    }

};

// ======================
// Sales dashboard stats (admin only)
// ======================

export const getSalesStats = async (req, res) => {

    try {

        // How many days back the trend chart should cover — defaults to
        // 7, but the dashboard can request 14 / 30 / 90 for a wider view.
        const ALLOWED_RANGES = [7, 14, 30, 90];
        const requested = parseInt(req.query.days, 10);
        const rangeDays = ALLOWED_RANGES.includes(requested) ? requested : 7;

        const orders = await Order.find();

        const totalSales = orders.reduce(
            (sum, o) => sum + (o.total || 0),
            0
        );

        const totalOrders = orders.length;

        const avgOrderValue =
            totalOrders > 0 ? totalSales / totalOrders : 0;

        const ordersByStatus = orders.reduce((acc, o) => {
            acc[o.status] = (acc[o.status] || 0) + 1;
            return acc;
        }, {});

        // Sales for each day in the requested range, oldest first.
        const days = [];

        for (let i = rangeDays - 1; i >= 0; i--) {

            const d = new Date();

            d.setHours(0, 0, 0, 0);

            d.setDate(d.getDate() - i);

            days.push(d);

        }

        const salesByRange = days.map((day) => {

            const next = new Date(day);

            next.setDate(next.getDate() + 1);

            const dayOrders = orders.filter(
                (o) => o.createdAt >= day && o.createdAt < next
            );

            const dayTotal = dayOrders.reduce(
                (sum, o) => sum + (o.total || 0),
                0
            );

            return {
                date: day.toISOString().slice(0, 10),
                total: dayTotal,
                orders: dayOrders.length,
            };

        });

        // Trend comparison: current range vs the equivalent prior range
        // (e.g. last 30 days vs the 30 days before that).
        const rangeStart = new Date();
        rangeStart.setHours(0, 0, 0, 0);
        rangeStart.setDate(rangeStart.getDate() - rangeDays);

        const prevRangeStart = new Date(rangeStart);
        prevRangeStart.setDate(prevRangeStart.getDate() - rangeDays);

        const currentRangeOrders = orders.filter(
            (o) => o.createdAt >= rangeStart
        );
        const previousRangeOrders = orders.filter(
            (o) => o.createdAt >= prevRangeStart && o.createdAt < rangeStart
        );

        const currentRangeSales = currentRangeOrders.reduce(
            (sum, o) => sum + (o.total || 0),
            0
        );
        const previousRangeSales = previousRangeOrders.reduce(
            (sum, o) => sum + (o.total || 0),
            0
        );

        // Percentage change helper — null when there's no prior data to
        // compare against, so the frontend can show "—" instead of a
        // misleading "+100%".
        const pctChange = (current, previous) => {
            if (previous === 0) return current > 0 ? null : 0;
            return ((current - previous) / previous) * 100;
        };

        const salesTrend = pctChange(currentRangeSales, previousRangeSales);
        const ordersTrend = pctChange(
            currentRangeOrders.length,
            previousRangeOrders.length
        );

        // Top-selling products by revenue, aggregated across every order.
        const productTotals = new Map();

        for (const order of orders) {
            for (const item of order.items) {
                const key = item.slug || item.productId;

                const existing = productTotals.get(key) || {
                    name: item.name,
                    image: item.image,
                    qty: 0,
                    revenue: 0,
                };

                existing.qty += item.qty;
                existing.revenue += item.price * item.qty;

                productTotals.set(key, existing);
            }
        }

        const topProducts = Array.from(productTotals.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        res.json({
            totalSales,
            totalOrders,
            avgOrderValue,
            ordersByStatus,
            rangeDays,
            salesByRange,
            salesTrend,
            ordersTrend,
            topProducts,
        });

    } catch (err) {

        res.status(500).json({
            message: err.message,
        });

    }

};