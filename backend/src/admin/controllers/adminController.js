import User from "../../models/User.js";
import Product from "../../models/Product.js";
import Order from "../../models/Order.js";
import PaymentMethod from "../../models/PaymentMethod.js";
import Promotion from "../../models/Promotion.js";
import mongoose from "mongoose";

// ─── USER & STAFF MANAGEMENT ───

// GET all users
export const getAllUsers = async (req, res) => {
  try {
    const { role, keyword } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (keyword) {
      query.$or = [
        { firstName: { $regex: keyword, $options: "i" } },
        { lastName: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
      ];
    }

    const users = await User.find(query).select("-passwordHash -refreshToken").sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET user by ID
export const getUserById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(req.params.id).select("-passwordHash -refreshToken");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE Staff / Admin account (Admin only)
export const createStaffOrAdminUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const assignedRole = ["staff", "admin", "user"].includes(role) ? role : "staff";

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ message: "A user with this email already exists" });
    }

    const newUser = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: password,
      role: assignedRole,
    });

    res.status(201).json({
      success: true,
      message: `${assignedRole.toUpperCase()} account created successfully`,
      data: {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE user (Admin edit role/details)
export const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email.toLowerCase().trim();
    if (role && ["user", "admin", "staff"].includes(role)) {
      user.role = role;
    }

    const updatedUser = await user.save();
    res.json({
      success: true,
      message: "User updated successfully",
      data: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── PRODUCT CATALOG MANAGEMENT ───

// CREATE Product
export const createProduct = async (req, res) => {
  try {
    const { name, price, originalPrice, description, category, countInStock, image, images, shortVideoUrl, isFeatured, badge } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: "Name, price, and category are required" });
    }

    const product = new Product({
      name,
      price: Number(price),
      originalPrice: Number(originalPrice) || Number(price),
      description: description || "",
      category: category.toLowerCase(),
      countInStock: Number(countInStock) || 0,
      image: image || "",
      images: Array.isArray(images) ? images : (image ? [image] : []),
      shortVideoUrl: shortVideoUrl || "",
      isFeatured: Boolean(isFeatured),
      badge: badge || "",
      isActive: true,
    });

    const createdProduct = await product.save();
    res.status(201).json({ success: true, data: createdProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE Product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    Object.assign(product, req.body);
    const updatedProduct = await product.save();
    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE Product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── ORDER MANAGEMENT (ADMIN MONITORING ROLE) ───

// GET all orders for Admin monitoring
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "firstName lastName email avatar")
      .populate("items.product", "name price image countInStock")
      .populate("paymentMethodRef", "name type accountNumber")
      .populate("handledByStaff", "firstName lastName email")
      .populate("statusHistory.changedBy", "firstName lastName email role")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE order status - Restricted for Admin (Monitoring only)
export const updateOrderStatus = async (req, res) => {
  try {
    return res.status(403).json({
      success: false,
      message: "Admin is a monitoring role for order progress and cannot directly advance order status. Order fulfillment is managed by Staff.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE order
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.deleteOne();
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── ADMIN DASHBOARD & ANALYTICS ───

// GET Admin overview stats - Real Database Metrics
export const getAdminOverviewStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStaff = await User.countDocuments({ role: "staff" });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Order status counts
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const completedOrders = await Order.countDocuments({ status: "delivered" });
    const cancelledOrders = await Order.countDocuments({ status: "cancelled" });

    // Stock counts
    const outOfStock = await Product.countDocuments({ countInStock: { $lte: 0 } });
    const lowStock = await Product.countDocuments({ countInStock: { $gt: 0, $lte: 5 } });

    // Payment counts & Revenue
    const successfulPayments = await Order.countDocuments({ isPaid: true });
    const failedPayments = await Order.countDocuments({ status: "cancelled" });
    const pendingPayments = await Order.countDocuments({ isPaid: false, status: { $ne: "cancelled" } });

    // Total Revenue from completed or paid orders
    const allOrders = await Order.find().select("totalPrice status isPaid createdAt");
    const totalRevenue = allOrders
      .filter((o) => o.status === "delivered" || o.isPaid === true)
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    const pendingPromotions = await Promotion.countDocuments({ status: "pending_approval" });
    const pendingPaymentMethods = await PaymentMethod.countDocuments({ status: "pending_approval" });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalStaff,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        outOfStock,
        lowStock,
        successfulPayments,
        failedPayments,
        pendingPayments,
        pendingPromotions,
        pendingPaymentMethods,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
