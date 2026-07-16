import express from "express";

import {
    registerUser,
    loginUser,
    logoutUser,
    getProfile,
    googleAuth,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);

// Protected Routes
router.get("/profile", protect, getProfile);
router.post("/logout", logoutUser);

export default router;