import mongoose from "mongoose";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// ======================
// Upload product image(s) to Cloudinary (admin only)
// Actual upload happens in multer's CloudinaryStorage (see
// middleware/uploadMiddleware.js) before this handler even runs — by the
// time we get here the file already lives on Cloudinary and req.file/
// req.files just contains the resulting metadata.
// ======================

export const uploadProductImage = async (req, res) => {

    try {

        if (!req.file) {

            return res.status(400).json({
                message: "No image file received.",
            });

        }

        // multer-storage-cloudinary puts the Cloudinary secure_url on `path`
        // and the public_id (needed later if you ever want to delete it) on
        // `filename`.
        res.status(201).json({
            url: req.file.path,
            publicId: req.file.filename,
        });

    } catch (err) {

        res.status(500).json({
            message: err.message,
        });

    }

};

export const uploadProductGalleryImages = async (req, res) => {

    try {

        if (!req.files || req.files.length === 0) {

            return res.status(400).json({
                message: "No image files received.",
            });

        }

        const images = req.files.map((f) => ({
            url: f.path,
            publicId: f.filename,
        }));

        res.status(201).json({ images });

    } catch (err) {

        res.status(500).json({
            message: err.message,
        });

    }

};

// Finds a product by its URL slug (Product.id, e.g. "special-laddu") OR
// by its Mongo _id. The Product page and most routes use the slug, but
// Order.items only ever stores the Mongo _id (older orders don't have
// the slug at all) — so review routes need to accept either.
async function findProductByIdOrSlug(idOrSlug) {

    let product = await Product.findOne({ id: idOrSlug });

    if (!product && mongoose.Types.ObjectId.isValid(idOrSlug)) {

        product = await Product.findById(idOrSlug);

    }

    return product;

}

export const getProducts = async (req, res) => {

    try {

        const products = await Product.find();

        res.json(products);

    } catch (err) {

        res.status(500).json({
            message: err.message,
        });

    }

};

export const getProduct = async (req, res) => {

    try {

        const product = await Product.findOne({
            id: req.params.id,
        });

        if (!product) {

            return res.status(404).json({
                message: "Product not found",
            });

        }

        res.json(product);

    } catch (err) {

        res.status(500).json({
            message: err.message,
        });

    }

};

// ======================
// Create Product (admin only)
// ======================

export const createProduct = async (req, res) => {

    try {

        const existing = await Product.findOne({ id: req.body.id });

        if (existing) {

            return res.status(400).json({
                message: "A product with that ID already exists.",
            });

        }

        const product = await Product.create(req.body);

        res.status(201).json(product);

    } catch (err) {

        res.status(500).json({
            message: err.message,
        });

    }

};

// ======================
// Update Product (admin only)
// ======================

export const updateProduct = async (req, res) => {

    try {

        const product = await Product.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {

            return res.status(404).json({
                message: "Product not found",
            });

        }

        res.json(product);

    } catch (err) {

        res.status(500).json({
            message: err.message,
        });

    }

};

// ======================
// Delete Product (admin only)
// ======================

export const deleteProduct = async (req, res) => {

    try {

        const product = await Product.findOneAndDelete({
            id: req.params.id,
        });

        if (!product) {

            return res.status(404).json({
                message: "Product not found",
            });

        }

        res.json({ message: "Product deleted" });

    } catch (err) {

        res.status(500).json({
            message: err.message,
        });

    }

};

// ======================
// Review eligibility (any logged-in user)
// Tells the frontend whether the current user is allowed to write a
// review for this product: they must have at least one Delivered
// order containing it, and must not have already reviewed it.
// ======================

export const getReviewEligibility = async (req, res) => {

    try {

        const product = await findProductByIdOrSlug(req.params.id);

        if (!product) {

            return res.status(404).json({
                message: "Product not found",
            });

        }

        const hasDeliveredOrder = await Order.exists({
            user: req.user._id,
            status: "Delivered",
            "items.productId": product._id.toString(),
        });

        const alreadyReviewed = product.reviews.some(
            (r) => r.user && r.user.toString() === req.user._id.toString()
        );

        res.json({
            canReview: !!hasDeliveredOrder,
            alreadyReviewed,
        });

    } catch (err) {

        res.status(500).json({
            message: err.message,
        });

    }

};

// ======================
// Submit a review (any logged-in user who has received the product)
// ======================

export const submitReview = async (req, res) => {

    try {

        const { rating, title, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {

            return res.status(400).json({
                message: "Rating must be between 1 and 5",
            });

        }

        const product = await findProductByIdOrSlug(req.params.id);

        if (!product) {

            return res.status(404).json({
                message: "Product not found",
            });

        }

        const hasDeliveredOrder = await Order.exists({
            user: req.user._id,
            status: "Delivered",
            "items.productId": product._id.toString(),
        });

        if (!hasDeliveredOrder) {

            return res.status(403).json({
                message:
                    "You can only review products from orders that have been delivered to you.",
            });

        }

        const alreadyReviewed = product.reviews.some(
            (r) => r.user && r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {

            return res.status(400).json({
                message: "You've already reviewed this product.",
            });

        }

        product.reviews.push({
            user: req.user._id,
            name: req.user.name,
            rating,
            title: title || "",
            comment: comment || "",
            date: new Date().toISOString(),
            helpful: 0,
        });

        product.totalReviews = product.reviews.length;

        product.rating =
            product.reviews.reduce((sum, r) => sum + r.rating, 0) /
            product.reviews.length;

        await product.save();

        res.status(201).json(product);

    } catch (err) {

        res.status(500).json({
            message: err.message,
        });

    }

};