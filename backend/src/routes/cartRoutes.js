import express from "express";

import {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    mergeGuestCart,
} from "../controllers/cartController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get logged-in user's cart
router.get("/", protect, getCart);

// Add product to cart
router.post("/add", protect, addToCart);

// Update quantity
router.put("/update", protect, updateCartItem);

// Remove item
router.delete("/remove", protect, removeCartItem);

// Clear entire cart
router.delete("/clear", protect, clearCart);
router.post("/merge", protect, mergeGuestCart);

export default router;