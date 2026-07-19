import express from "express";

import {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getReviewEligibility,
    submitReview,
    uploadProductImage,
} from "../controllers/productController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getProducts);

router.get("/:id", getProduct);

router.post(
    "/upload-image",
    protect,
    adminOnly,
    upload.single("image"),
    uploadProductImage
);

router.post("/", protect, adminOnly, createProduct);

router.put("/:id", protect, adminOnly, updateProduct);

router.delete("/:id", protect, adminOnly, deleteProduct);

router.get("/:id/review-eligibility", protect, getReviewEligibility);

router.post("/:id/reviews", protect, submitReview);

export default router;