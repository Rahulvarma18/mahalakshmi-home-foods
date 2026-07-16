import express from "express";

import {
    createOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    getSalesStats,
} from "../controllers/orderController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// IMPORTANT: specific routes before the admin list route so "/mine" and
// "/stats" aren't swallowed by anything with a param.
router.get("/mine", protect, getMyOrders);

router.get("/stats", protect, adminOnly, getSalesStats);

router.get("/", protect, adminOnly, getAllOrders);

router.post("/", protect, createOrder);

router.put("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;