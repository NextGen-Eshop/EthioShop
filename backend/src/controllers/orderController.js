import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";


// CREATE ORDER (USER ONLY)
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    // 🔹 1. Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 🔹 2. VALIDATE & UPDATE STOCK
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);

      if (!product) {
        return res.status(404).json({
          message: `Product not found`,
        });
      }

      if (product.countInStock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name} (Available: ${product.countInStock})`,
        });
      }

      // Deduct stock
      product.countInStock -= item.quantity;
      await product.save();
    }

    // 🔹 3. Calculate total
    const totalPrice = cart.items.reduce((acc, item) => {
      return acc + item.product.price * item.quantity;
    }, 0);

    // 🔹 4. Create order
    const order = new Order({
      user: userId,
      items: cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      })),
      totalPrice,
      status: "pending",
    });

    const savedOrder = await order.save();

    // 🔹 5. Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      data: savedOrder,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// GET ALL ORDERS (ADMIN ONLY)
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name price");

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// GET SINGLE ORDER (OWNER OR ADMIN)
export const getOrderById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product", "name price");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Owner or admin
    if (
      order.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// UPDATE ORDER STATUS (ADMIN ONLY)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// DELETE ORDER (ADMIN ONLY)
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.deleteOne();

    res.status(200).json({
      success: true,
      message: "Order deleted",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};