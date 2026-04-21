import express from "express";
import {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  createUser,
  deleteUser,
} from "../controllers/authController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", authUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Admin Exclusive Routes
router
  .route("/users")
  .get(protect, admin, getUsers)
  .post(protect, admin, createUser);

router.route("/users/:id").delete(protect, admin, deleteUser);

export default router;
