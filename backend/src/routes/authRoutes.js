import express from "express";
import {
  registerUser,
  authUser,
  refreshToken,
  logoutUser,
  getUserProfile,
  updateUserProfile,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", authUser);
router.post("/refresh", refreshToken);
router.post("/logout", logoutUser);

router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

export default router;