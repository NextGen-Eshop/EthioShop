import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/", protect, adminOnly, getOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id", protect, adminOnly, updateOrderStatus);
router.delete("/:id", protect, adminOnly, deleteOrder);

export default router;
