import express from "express";
import {
  getProducts,
  getProductById,
  getRelatedProducts,
  getProductReviews,
  createProductReview,
} from "../controllers/userCatalogController.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/userCartController.js";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  requestPackingSlip,
  updateDeliveryDestination,
  replyToStaffMessage,
  requestRefund,
  escalateToAdmin,
} from "../controllers/userOrderController.js";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/userProfileController.js";
import {
  payOrder,
  verifyOrderPayment,
  payOrderDemo,
} from "../controllers/userPaymentController.js";
import { getPublicPaymentMethods } from "../../controllers/paymentMethodController.js";
import { getActivePromotions } from "../../controllers/promotionController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { userOnly } from "../../middleware/roleMiddleware.js";

const router = express.Router();

// ─── CATALOG (Public / Customer) ───
router.get("/products", getProducts);
router.get("/products/:id/related", getRelatedProducts);
router.get("/products/:id", getProductById);
router.get("/products/:id/reviews", getProductReviews);
router.post("/products/:id/reviews", protect, userOnly, createProductReview);

// ─── PROMOTIONS & DEALS (Public) ───
router.get("/promotions", getActivePromotions);

// ─── PAYMENT METHODS (Public / Checkout) ───
router.get("/payment-methods", getPublicPaymentMethods);

// ─── CART (Customer - strictly user role only) ───
router.get("/cart", protect, userOnly, getCart);
router.post("/cart", protect, userOnly, addToCart);
router.put("/cart/:productId", protect, userOnly, updateCartItem);
router.delete("/cart/:productId", protect, userOnly, removeFromCart);
router.delete("/cart", protect, userOnly, clearCart);

// ─── ORDERS (Customer - strictly user role only) ───
router.post("/orders", protect, userOnly, createOrder);
router.get("/orders/my", protect, userOnly, getMyOrders);
router.get("/orders/:id", protect, userOnly, getOrderById);
router.post("/orders/:id/request-slip", protect, userOnly, requestPackingSlip);
router.put("/orders/:id/destination", protect, userOnly, updateDeliveryDestination);
router.post("/orders/:id/reply", protect, userOnly, replyToStaffMessage);
router.post("/orders/:id/refund-request", protect, userOnly, requestRefund);
router.post("/orders/:id/escalate", protect, userOnly, escalateToAdmin);

// ─── PROFILE (Customer - strictly user role only) ───
router.get("/profile", protect, userOnly, getUserProfile);
router.put("/profile", protect, userOnly, updateUserProfile);

// ─── PAYMENTS (Customer - strictly user role only) ───
router.post("/payments/order/:id", protect, userOnly, payOrder);
router.post("/payments/demo/:id", protect, userOnly, payOrderDemo);
router.get("/payments/verify/:tx_ref", verifyOrderPayment);

export default router;
