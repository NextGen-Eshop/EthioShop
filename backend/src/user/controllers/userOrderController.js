import Order from "../../models/Order.js";
import Cart from "../../models/Cart.js";
import Product from "../../models/Product.js";
import mongoose from "mongoose";

// CREATE ORDER (User Checkout)
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get user cart
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // 2. Validate & deduct stock
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);

      if (!product) {
        return res.status(404).json({ message: `Product ${item.product.name} not found` });
      }

      if (product.countInStock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name} (Available: ${product.countInStock})`,
        });
      }

      product.countInStock -= item.quantity;
      await product.save();
    }

    // 3. Compute total
    const totalPrice = cart.items.reduce((acc, item) => {
      return acc + item.product.price * item.quantity;
    }, 0);

    // 4. Save order
    const order = new Order({
      user: userId,
      items: cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      })),
      totalPrice,
      status: "pending",
      paymentMethod: req.body.paymentMethod || "chapa",
      paymentDetails: req.body.paymentDetails || {},
      shippingAddress: req.body.shippingAddress || {},
      deliveryLocation: req.body.deliveryLocation || {},
    });

    const savedOrder = await order.save();

    // 5. Clear cart
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

// GET logged-in user's orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product", "name price image")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single order details (User owner or Admin)
export const getOrderById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(req.params.id)
      .populate("user", "firstName lastName email")
      .populate("items.product", "name price image");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Must be order owner or staff/admin
    if (
      order.user._id.toString() !== req.user.id &&
      req.user.role !== "admin" &&
      req.user.role !== "staff"
    ) {
      return res.status(403).json({ message: "Unauthorized access to order" });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
