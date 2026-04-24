import Order, { ORDER_STATUSES } from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Payment from "../models/Payment.js";
import mongoose from "mongoose";
import {
  sendOrderPlacedEmail,
} from "../services/emailService.js";

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

function computeShipping(subtotal) {
  return subtotal >= 2000 ? 0 : 150;
}

export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items: bodyItems, deliveryAddress, paymentMethod, totalPrice: bodyTotal, shipping: bodyShipping } = req.body;

    if (!bodyItems?.length) {
      return res.status(400).json({ message: "Order must include at least one item" });
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of bodyItems) {
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({ message: "Invalid product id" });
      }
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }
      const qty = Math.max(1, Math.min(500, Number(item.quantity) || 1));
      if (product.countInStock < qty) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name} (available: ${product.countInStock})`,
        });
      }
      orderItems.push({
        product: product._id,
        quantity: qty,
        price: product.price,
        name: product.name,
      });
      subtotal += product.price * qty;
    }

    const shipping =
      bodyShipping != null && !Number.isNaN(Number(bodyShipping))
        ? round2(bodyShipping)
        : computeShipping(subtotal);

    const expectedTotal = round2(subtotal + shipping);
    const clientTotal = bodyTotal != null ? round2(bodyTotal) : expectedTotal;
    if (Math.abs(clientTotal - expectedTotal) > 0.02) {
      return res.status(400).json({
        message: "Order total does not match server calculation",
        details: { expectedTotal, subtotal, shipping },
      });
    }

    const order = new Order({
      user: userId,
      items: orderItems,
      totalPrice: expectedTotal,
      shipping,
      deliveryAddress: deliveryAddress || {},
      paymentMethod: paymentMethod || "bank_transfer",
      status: "pending_payment",
    });

    const savedOrder = await order.save();

    const u = req.user;
    sendOrderPlacedEmail({
      to: deliveryAddress?.email || u.email,
      firstName: deliveryAddress?.firstName || u.firstName,
      orderId: savedOrder._id,
      total: expectedTotal,
    }).catch(() => {});

    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    const populated = await Order.findById(savedOrder._id)
      .populate("items.product", "name price imageUrl")
      .lean();

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product", "name price imageUrl")
      .sort({ createdAt: -1 })
      .lean();

    const ids = orders.map((o) => o._id);
    const payments = await Payment.find({ order: { $in: ids } }).lean();
    const payByOrder = Object.fromEntries(payments.map((p) => [String(p.order), p]));

    const data = orders.map((o) => ({
      ...o,
      paymentScreenshotUrl: payByOrder[String(o._id)]?.screenshotUrl || null,
    }));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "firstName lastName email")
      .populate("items.product", "name price imageUrl")
      .sort({ createdAt: -1 })
      .lean();

    const ids = orders.map((o) => o._id);
    const payments = await Payment.find({ order: { $in: ids } }).lean();
    const payByOrder = Object.fromEntries(payments.map((p) => [String(p.order), p]));

    const data = orders.map((o) => ({
      ...o,
      paymentScreenshotUrl: payByOrder[String(o._id)]?.screenshotUrl || null,
    }));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(req.params.id)
      .populate("user", "firstName lastName email")
      .populate("items.product", "name price imageUrl countInStock")
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const ownerId = order.user?._id != null ? String(order.user._id) : String(order.user);
    if (ownerId !== req.user.id && req.user.role !== "admin" && req.user.role !== "manager") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const pay = await Payment.findOne({ order: order._id }).lean();

    res.status(200).json({
      success: true,
      data: { ...order, paymentScreenshotUrl: pay?.screenshotUrl || null },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await Payment.deleteMany({ order: order._id });
    await order.deleteOne();

    res.status(200).json({ success: true, message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
