import User from "../../models/User.js";
import Product from "../../models/Product.js";
import Order from "../../models/Order.js";
import mongoose from "mongoose";

// ─── USER & STAFF MANAGEMENT ───

// GET all users
export const getAllUsers = async (req, res) => {
  try {
    const { role, keyword } = req.query;
    const query = {};

    if (role) {
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
    if (email) user.email = email;
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
    const { name, price, description, category, countInStock, image, images, isFeatured, badge } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: "Name, price, and category are required" });
    }

    const product = new Product({
      name,
      price: Number(price),
      description: description || "",
      category,
      countInStock: Number(countInStock) || 0,
      image: image || "",
      images: Array.isArray(images) ? images : [],
      isFeatured: Boolean(isFeatured),
      badge: badge || null,
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

// ─── ORDER MANAGEMENT ───

// GET all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "firstName lastName email")
      .populate("items.product", "name price image")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    if (status === "delivered") {
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.json({ success: true, data: updatedOrder });
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

// GET Admin overview stats
export const getAdminOverviewStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStaff = await User.countDocuments({ role: { $in: ["staff", "admin"] } });
    const totalProducts = await Product.countDocuments();
    const lowStockCount = await Product.countDocuments({ countInStock: { $lte: 5 } });
    const totalOrders = await Order.countDocuments();

    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const completedOrders = await Order.countDocuments({ status: "delivered" });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalStaff,
        totalProducts,
        lowStockCount,
        totalOrders,
        totalRevenue,
        pendingOrders,
        completedOrders,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
