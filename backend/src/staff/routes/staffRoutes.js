import express from "express";
import {
  getStaffProducts,
  updateStockQuantity,
  getStaffOrders,
  updateOrderFulfillment,
  generatePackingSlip,
  sendPackingSlipToCustomer,
  addStaffOrderMessage,
  processOrderRefund,
  getStaffPayments,
  getStaffOverview,
} from "../controllers/staffController.js";
import {
  getStaffPaymentMethods,
  configurePaymentMethodStaff,
} from "../../controllers/paymentMethodController.js";
import {
  getStaffPromotions,
  createDiscountProposalStaff,
} from "../../controllers/promotionController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { staffOrAdmin } from "../../middleware/roleMiddleware.js";

const router = express.Router();

// Apply auth and staff/admin protection to all staff routes
router.use(protect, staffOrAdmin);

// Staff operational overview
router.get("/overview", getStaffOverview);

// Staff inventory & stock management
router.get("/products", getStaffProducts);
router.put("/products/:id/stock", updateStockQuantity);

// Staff order packing & fulfillment
router.get("/orders", getStaffOrders);
router.put("/orders/:id/status", updateOrderFulfillment);
router.post("/orders/:id/generate-slip", generatePackingSlip);
router.post("/orders/:id/send-slip", sendPackingSlipToCustomer);
router.post("/orders/:id/message", addStaffOrderMessage);
router.post("/orders/:id/refund", processOrderRefund);

// Staff payment verification
router.get("/payments", getStaffPayments);

// Staff payment method configuration
router.get("/payment-methods", getStaffPaymentMethods);
router.put("/payment-methods/:id/configure", configurePaymentMethodStaff);

// Staff discount proposals
router.get("/promotions", getStaffPromotions);
router.post("/promotions", createDiscountProposalStaff);

export default router;

