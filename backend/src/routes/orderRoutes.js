import express from "express";
import {
  createOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";
import { protect, authorizePermissions } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizePermissions("place_order"), createOrder);
router.get("/my", protect, authorizePermissions("view_own_orders"), getMyOrders);
router.get("/", protect, authorizePermissions("view_all_orders"), getOrders);
router.get("/:id", protect, authorizePermissions("view_own_orders"), getOrderById);
router.put("/:id", protect, authorizePermissions("update_order"), updateOrderStatus);
router.delete("/:id", protect, authorizePermissions("delete_order"), deleteOrder);

export default router;
