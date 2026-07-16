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
    uploadProductGalleryImages,
} from "../controllers/productController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import upload, { uploadGallery } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Admin-only: send a single file under the "image" field (multipart/form-data)
// and get back { url, publicId } pointing at Cloudinary. Call this BEFORE
// createProduct/updateProduct, then send the returned url as the product's
// `image` field.
router.post(
    "/upload-image",
    protect,
    adminOnly,
    upload.single("image"),
    uploadProductImage
);

// Admin-only: send up to 6 files under the "images" field, get back
// { images: [{ url, publicId }, ...] } for the product's `gallery` field.
router.post(
    "/upload-gallery",
    protect,
    adminOnly,
    uploadGallery,
    uploadProductGalleryImages
);

router.get("/", getProducts);

router.get("/:id", getProduct);

router.post("/", protect, adminOnly, createProduct);

router.put("/:id", protect, adminOnly, updateProduct);

router.delete("/:id", protect, adminOnly, deleteProduct);

router.get("/:id/review-eligibility", protect, getReviewEligibility);

router.post("/:id/reviews", protect, submitReview);

export default router;