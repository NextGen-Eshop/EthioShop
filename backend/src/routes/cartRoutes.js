import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";
import { userOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", protect, userOnly, getCart);
router.post("/", protect, userOnly, addToCart);
router.put("/:id", protect, userOnly, updateCartItem);
router.delete("/:id", protect, userOnly, removeFromCart);

export default router;
