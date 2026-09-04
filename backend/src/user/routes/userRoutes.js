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

const router = express.Router();

// ─── CATALOG (Public / Customer) ───
router.get("/products", getProducts);
router.get("/products/:id/related", getRelatedProducts);
router.get("/products/:id", getProductById);
router.get("/products/:id/reviews", getProductReviews);
router.post("/products/:id/reviews", protect, createProductReview);

// ─── PROMOTIONS & DEALS (Public) ───
router.get("/promotions", getActivePromotions);

// ─── PAYMENT METHODS (Public / Checkout) ───
router.get("/payment-methods", getPublicPaymentMethods);

// ─── CART (Customer) ───
router.get("/cart", protect, getCart);
router.post("/cart", protect, addToCart);
router.put("/cart/:productId", protect, updateCartItem);
router.delete("/cart/:productId", protect, removeFromCart);
router.delete("/cart", protect, clearCart);

// ─── ORDERS (Customer) ───
router.post("/orders", protect, createOrder);
router.get("/orders/my", protect, getMyOrders);
router.get("/orders/:id", protect, getOrderById);
router.post("/orders/:id/request-slip", protect, requestPackingSlip);
router.put("/orders/:id/destination", protect, updateDeliveryDestination);

// ─── PROFILE (Customer) ───
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

// ─── PAYMENTS (Customer) ───
router.post("/payments/order/:id", protect, payOrder);
router.post("/payments/demo/:id", protect, payOrderDemo);
router.get("/payments/verify/:tx_ref", verifyOrderPayment);

export default router;
