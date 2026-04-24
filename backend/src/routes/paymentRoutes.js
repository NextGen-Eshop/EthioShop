import express from "express";
import { payOrder, verifyOrderPayment,payOrderDemo } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:id/pay", protect, payOrder);

router.get("/verify/:tx_ref", verifyOrderPayment);
router.post("/:id/pay-demo", protect, payOrderDemo);
// router.put("/:id/pay", protect, payOrder);

export default router;