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

        // Recompute every item's price from the actual Product/variant in
        // the database — never trust price or total sent by the client.
        // Without this, anyone could edit the request in devtools/Postman
        // and check out with any total they want.
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
                    message: `"${item.weight}" isn't a valid option for ${product.name}`,
                });

            }

            const qty = Math.max(1, Number(item.qty) || 1);

            verifiedItems.push({
                productId: item.productId,
                slug: product.id,
                name: product.name,
                image: product.image,
                weight: item.weight,
                qty,
                price: variant.price,
            });

        }

        const subtotal = verifiedItems.reduce(
            (sum, i) => sum + i.price * i.qty,
            0
        );

        // Same free-shipping rule as the Checkout page (₹999+ ships free,
        // otherwise a flat ₹60) — kept in sync here so the server-computed
        // total always matches what the customer saw on screen.
        const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 60;

        const total = subtotal + shipping;

        const order = await Order.create({
            id: `MHF-${Date.now().toString().slice(-6)}`,
            user: req.user._id,
            userEmail: req.user.email,
            items: verifiedItems,
            total,
            address,
            payment,
            // Starts as Pending, not Placed — the order is only saved at
            // this point, it isn't confirmed until the customer actually
            // sends the WhatsApp message and you acknowledge it. Flip it
            // to Placed from the Admin panel once you do.
            status: "Pending",
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

        const order = await Order.findOneAndUpdate(
            { id: req.params.id },
            { status: req.body.status },
            { new: true }
        );

        if (!order) {

            return res.status(404).json({
                message: "Order not found",
            });

        }

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

        // Sales for each of the last 7 days, oldest first — enough for a
        // simple bar/line chart on the admin dashboard.
        const days = [];

        for (let i = 6; i >= 0; i--) {

            const d = new Date();

            d.setHours(0, 0, 0, 0);

            d.setDate(d.getDate() - i);

            days.push(d);

        }

        const salesLast7Days = days.map((day) => {

            const next = new Date(day);

            next.setDate(next.getDate() + 1);

            const dayTotal = orders
                .filter(
                    (o) =>
                        o.createdAt >= day && o.createdAt < next
                )
                .reduce((sum, o) => sum + (o.total || 0), 0);

            return {
                date: day.toISOString().slice(0, 10),
                total: dayTotal,
            };

        });

        res.json({
            totalSales,
            totalOrders,
            avgOrderValue,
            ordersByStatus,
            salesLast7Days,
        });

    } catch (err) {

        res.status(500).json({
            message: err.message,
        });

    }

};