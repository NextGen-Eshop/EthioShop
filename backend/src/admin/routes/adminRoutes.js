import express from "express";
import {
  getAllUsers,
  getUserById,
  createStaffOrAdminUser,
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
import {
  getAllPaymentMethodsAdmin,
  createPaymentMethodAdmin,
  updatePaymentMethodAdmin,
  deletePaymentMethodAdmin,
} from "../../controllers/paymentMethodController.js";
import {
  getAllPromotionsAdmin,
  reviewPromotionAdmin,
  deletePromotionAdmin,
} from "../../controllers/promotionController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { adminOnly } from "../../middleware/roleMiddleware.js";

const router = express.Router();

// Apply auth and admin-only protection to all admin routes
router.use(protect, adminOnly);

// Users & Staff management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.post("/users", createStaffOrAdminUser);
router.post("/staff", createStaffOrAdminUser);
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

// Payment Methods management & approval
router.get("/payment-methods", getAllPaymentMethodsAdmin);
router.post("/payment-methods", createPaymentMethodAdmin);
router.put("/payment-methods/:id", updatePaymentMethodAdmin);
router.delete("/payment-methods/:id", deletePaymentMethodAdmin);

// Promotions & Discounts review & approval
router.get("/promotions", getAllPromotionsAdmin);
router.put("/promotions/:id", reviewPromotionAdmin);
router.delete("/promotions/:id", deletePromotionAdmin);

// Dashboard metrics
router.get("/overview", getAdminOverviewStats);

export default router;
