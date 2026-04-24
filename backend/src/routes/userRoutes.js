import express from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { protect, authorizePermissions } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Admin only ──
router.get("/",       protect, authorizePermissions("view_all_users"), getUsers);
router.get("/:id",    protect, authorizePermissions("view_all_users"), getUserById);
router.put("/:id",    protect, authorizePermissions("update_user"),    updateUser);
router.delete("/:id", protect, authorizePermissions("delete_user"),    deleteUser);

export default router;
