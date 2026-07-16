import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
    {
        weight: {
            type: String,
            required: true,
        },

        price: {
            type: Number,
            required: true,
        },

        oldPrice: Number,
    },
    { _id: false }
);

const nutritionSchema = new mongoose.Schema(
    {
        calories: Number,
        protein: String,
        carbs: String,
        fat: String,
        sugar: String,
        fiber: String,
    },
    { _id: false }
);

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        name: String,

        rating: Number,

        title: String,

        comment: String,

        date: String,

        helpful: {
            type: Number,
            default: 0,
        },
    },
    { _id: false }
);

const productSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            unique: true,
            required: true,
        },

        name: {
            type: String,
            required: true,
        },

        category: {
            type: String,
            required: true,
        },

        image: {
            type: String,
            required: true,
        },

        gallery: {
            type: [String],
            default: [],
        },

        description: String,

        variants: [variantSchema],

        rating: {
            type: Number,
            default: 4.5,
        },

        totalReviews: {
            type: Number,
            default: 0,
        },

        ingredients: {
            type: [String],
            default: [],
        },

        nutrition: nutritionSchema,

        shelfLife: String,

        storage: String,

        delivery: String,

        stock: {
            type: Number,
            default: 0,
        },

        sku: String,

        tags: {
            type: [String],
            default: [],
        },

        bestSeller: {
            type: Boolean,
            default: false,
        },

        reviews: [reviewSchema],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Product", productSchema);