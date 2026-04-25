import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews,
} from "../controllers/productController.js";
import { protect, authorizePermissions } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Public ──
router.get("/", getProducts);
router.get("/:id", getProductById);
router.get("/:id/reviews", getProductReviews);

// ── Authenticated ──
router.post("/:id/reviews", protect, authorizePermissions("place_order"), createProductReview);

// ── Admin only ──
router.post("/",    protect, authorizePermissions("create_product"), createProduct);
router.put("/:id",  protect, authorizePermissions("update_product"), updateProduct);
router.delete("/:id", protect, authorizePermissions("delete_product"), deleteProduct);

export default router;
