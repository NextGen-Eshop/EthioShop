import express from "express";
import {
  registerUser,
  loginUser,
  googleAuth,
  refreshToken,
  logoutUser,
  getMe,
  updateAvatar,
} from "../controllers/authController.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.post("/refresh", refreshToken);
router.post("/logout", logoutUser);
router.get("/me", protect, getMe);
router.put("/avatar", protect, updateAvatar);

export default router;
