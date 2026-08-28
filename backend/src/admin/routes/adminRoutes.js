import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getAdminOverviewStats,
} from "../controllers/adminController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { adminOnly } from "../../middleware/roleMiddleware.js";

const router = express.Router();

// Apply auth and admin-only protection to all admin routes
router.use(protect, adminOnly);

// Users management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Products management
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// Orders management
router.get("/orders", getAllOrders);
router.put("/orders/:id", updateOrderStatus);
router.delete("/orders/:id", deleteOrder);

// Dashboard metrics
router.get("/overview", getAdminOverviewStats);

export default router;
