import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Collapses any items that share the same product + weight into a
// single entry (summing quantities). This is a safety net: if a race
// condition (e.g. a fast double-click on "Add to Cart", or two
// near-simultaneous requests) ever manages to push two separate
// entries for the same product+weight, this quietly merges them back
// into one on the very next read or write — so duplicates can't
// persist, and "remove" (which matches by product+weight) can't
// accidentally look like it "deleted two rows" again.
function dedupeCartItems(items) {

    const map = new Map();

    for (const item of items) {

        const key = `${item.product.toString()}-${item.weight}`;

        if (map.has(key)) {

            map.get(key).qty += item.qty;

        } else {

            map.set(key, {
                product: item.product,
                weight: item.weight,
                qty: item.qty,
            });

        }

    }

    return Array.from(map.values());

}

// ==========================================
// GET USER CART
// ==========================================

export const getCart = async (req, res) => {

    try {

        let cart = await Cart.findOne({
            user: req.user._id,
        });

        if (!cart) {

            cart = await Cart.create({
                user: req.user._id,
                items: [],
            });

        }

        // Self-heal: if duplicates already exist from before this fix,
        // collapse them the next time this user's cart is touched.
        const deduped = dedupeCartItems(cart.items);

        if (deduped.length !== cart.items.length) {

            cart.items = deduped;

            await cart.save();

        }

        const populatedCart = await Cart.findById(cart._id)
            .populate("items.product");

        res.status(200).json(populatedCart);

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};

// ==========================================
// ADD ITEM TO CART
// ==========================================

export const addToCart = async (req, res) => {

    try {

        const { productId, weight, qty = 1 } = req.body;

        // Check product exists
        const product = await Product.findById(productId);

        if (!product) {

            return res.status(404).json({
                message: "Product not found",
            });

        }

        let cart = await Cart.findOne({
            user: req.user._id,
        });

        if (!cart) {

            cart = new Cart({
                user: req.user._id,
                items: [],
            });

        }

        // Find same product + weight
        const existingItem = cart.items.find(
            item =>
                item.product.toString() === productId &&
                item.weight === weight
        );

        if (existingItem) {

            existingItem.qty += qty;

        } else {

            cart.items.push({
                product: productId,
                weight,
                qty,
            });

        }

        cart.items = dedupeCartItems(cart.items);

        await cart.save();

        const populatedCart = await Cart.findById(cart._id)
            .populate("items.product");

        res.status(200).json(populatedCart);

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};

// ==========================================
// UPDATE CART ITEM QUANTITY
// ==========================================

export const updateCartItem = async (req, res) => {

    try {

        const { productId, weight, qty } = req.body;

        if (qty < 1) {

            return res.status(400).json({
                message: "Quantity must be at least 1",
            });

        }

        const cart = await Cart.findOne({
            user: req.user._id,
        });

        if (!cart) {

            return res.status(404).json({
                message: "Cart not found",
            });

        }

        cart.items = dedupeCartItems(cart.items);

        const item = cart.items.find(
            item =>
                item.product.toString() === productId &&
                item.weight === weight
        );

        if (!item) {

            return res.status(404).json({
                message: "Item not found in cart",
            });

        }

        item.qty = qty;

        await cart.save();

        const populatedCart = await Cart.findById(cart._id)
            .populate("items.product");

        res.status(200).json(populatedCart);

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};

// ==========================================
// REMOVE ITEM FROM CART
// ==========================================

export const removeCartItem = async (req, res) => {

    try {

        const { productId, weight } = req.body;

        const cart = await Cart.findOne({
            user: req.user._id,
        });

        if (!cart) {

            return res.status(404).json({
                message: "Cart not found",
            });

        }

        cart.items = dedupeCartItems(cart.items).filter(
            item =>
                !(
                    item.product.toString() === productId &&
                    item.weight === weight
                )
        );

        await cart.save();

        const populatedCart = await Cart.findById(cart._id)
            .populate("items.product");

        res.status(200).json(populatedCart);

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};

// ==========================================
// CLEAR CART
// ==========================================

export const clearCart = async (req, res) => {

    try {

        const cart = await Cart.findOne({
            user: req.user._id,
        });

        if (!cart) {

            return res.status(404).json({
                message: "Cart not found",
            });

        }

        cart.items = [];

        await cart.save();

        res.status(200).json({
            message: "Cart cleared successfully",
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};

// ==========================================
// MERGE GUEST CART
// ==========================================

export const mergeGuestCart = async (req, res) => {

    try {

        const { items } = req.body;

        if (!items || !Array.isArray(items)) {

            return res.status(400).json({
                message: "Invalid cart data",
            });

        }

        let cart = await Cart.findOne({
            user: req.user._id,
        });

        if (!cart) {

            cart = new Cart({
                user: req.user._id,
                items: [],
            });

        }

        for (const guestItem of items) {

            if (!guestItem?.productId || !guestItem?.weight) continue;

            let product;

            try {

                product = await Product.findById(guestItem.productId);

            } catch (err) {

                // Not a valid ObjectId — skip this item instead of crashing the whole merge
                continue;

            }

            if (!product) continue;

            const existing = cart.items.find(

                item =>

                    item.product.toString() === product._id.toString() &&

                    item.weight === guestItem.weight

            );

            if (existing) {

                existing.qty += guestItem.qty;

            } else {

                cart.items.push({

                    product: product._id,

                    weight: guestItem.weight,

                    qty: guestItem.qty,

                });

            }

        }

        cart.items = dedupeCartItems(cart.items);

        await cart.save();

        const populatedCart = await Cart.findById(cart._id)
            .populate("items.product");

        res.status(200).json(populatedCart);

    } catch (error) {

        res.status(500).json({

            message: error.message,

        });

    }

};