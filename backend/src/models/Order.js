import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        productId: {
            type: String,
            required: true,
        },

        // The product's URL slug (Product.id), e.g. "special-laddu".
        // Kept separate from productId (which is the Mongo _id) so the
        // Orders page can link to /shop/:slug and check review
        // eligibility without an extra lookup. Optional for backward
        // compatibility with orders placed before this field existed.
        slug: {
            type: String,
        },

        name: {
            type: String,
            required: true,
        },

        image: {
            type: String,
        },

        weight: {
            type: String,
        },

        qty: {
            type: Number,
            required: true,
            default: 1,
        },

        price: {
            type: Number,
            required: true,
        },
    },
    { _id: false }
);

const addressSchema = new mongoose.Schema(
    {
        name: String,
        phone: String,
        line1: String,
        city: String,
        pincode: String,
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        // Human-friendly order code shown to customers (e.g. MHF-482910).
        // Kept separate from Mongo's _id so existing frontend code that
        // reads order.id keeps working unchanged.
        id: {
            type: String,
            required: true,
            unique: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        userEmail: {
            type: String,
            required: true,
        },

        items: [orderItemSchema],

        total: {
            type: Number,
            required: true,
        },

        address: addressSchema,

        payment: {
            type: String,
            default: "COD",
        },

        status: {
            type: String,
            enum: [
                "Pending Approval",
                "Placed",
                "Pending",
                "Processing",
                "Shipped",
                "Delivered",
            ],
            default: "Pending Approval",
        },

        // Set true the first time this order's stock is actually deducted
        // (when it leaves "Pending Approval"), so re-saving/changing the
        // status again later never double-deducts.
        stockDecremented: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Order", orderSchema);