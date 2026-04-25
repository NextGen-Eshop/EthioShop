import express from "express";
import {
  uploadPaymentProof,
  approvePayment,
  rejectPayment,
} from "../controllers/paymentController.js";
import { protect, authorizePermissions } from "../middleware/authMiddleware.js";
import { uploadPaymentScreenshot } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/order/:orderId/proof",
  protect,
  authorizePermissions("place_order"),
  uploadPaymentScreenshot.single("screenshot"),
  uploadPaymentProof
);

router.post(
  "/order/:orderId/approve",
  protect,
  authorizePermissions("approve_payment"),
  approvePayment
);

router.post(
  "/order/:orderId/reject",
  protect,
  authorizePermissions("approve_payment"),
  rejectPayment
);

export default router;
