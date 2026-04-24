import express from "express";
import { protect, authorizePermissions } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const router = express.Router();

router.use(protect, authorizePermissions("view_analytics"));

router.get("/dashboard", async (req, res) => {
  try {
    const [totalUsers, totalOrders, totalProducts, orders] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Order.find().select("totalPrice status createdAt").lean(),
    ]);

    const totalRevenue = orders
      .filter((o) => ["approved", "shipped", "delivered"].includes(o.status))
      .reduce((sum, o) => sum + o.totalPrice, 0);

    const activeOrders = orders.filter(
      (o) => !["delivered", "cancelled", "rejected"].includes(o.status)
    ).length;

    const now = new Date();
    const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = d.toLocaleString("default", { month: "short" });
      const revenue = orders
        .filter((o) => {
          if (!["approved", "shipped", "delivered"].includes(o.status)) return false;
          const od = new Date(o.createdAt);
          return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
        })
        .reduce((sum, o) => sum + o.totalPrice, 0);
      return { month: label, revenue };
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalRevenue,
        activeOrders,
        revenueByMonth,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const VALID_ROLES = ["admin", "manager", "customer", "user"];

router.put(
  "/users/:id/role",
  authorizePermissions("change_role"),
  async (req, res) => {
    try {
      const { role } = req.body;
      if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      if (req.params.id === req.user.id.toString()) {
        return res.status(400).json({ message: "Cannot change your own role" });
      }
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
      ).select("-passwordHash -refreshToken");

      if (!user) return res.status(404).json({ message: "User not found" });

      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
