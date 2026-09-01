import Order from "../../models/Order.js";
import Cart from "../../models/Cart.js";
import Product from "../../models/Product.js";
import mongoose from "mongoose";
import { sendSystemNotification } from "../../controllers/notificationController.js";

// CREATE ORDER (User Checkout)
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      items,
      subtotal,
      discountAmount = 0,
      deliveryFee = 0,
      deliveryType = 'free',
      totalPrice,
      paymentMethod = 'telebirr',
      paymentMethodRef,
      paymentDetails = {},
      shippingAddress = {},
      deliveryLocation = {},
    } = req.body;

    // Validate items
    const orderItems = Array.isArray(items) && items.length > 0 ? items : [];

    if (orderItems.length === 0) {
      return res.status(400).json({ message: "Your order has no items" });
    }

    // Validate stock and deduct
    for (const item of orderItems) {
      const prodId = item.product?._id || item.product || item.id;
      const product = await Product.findById(prodId);

      if (!product) {
        return res.status(404).json({ message: `Product ${item.name || 'item'} not found` });
      }

      if (product.countInStock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name} (Available: ${product.countInStock})`,
        });
      }

      product.countInStock = Math.max(0, product.countInStock - item.quantity);
      product.salesCount = (product.salesCount || 0) + item.quantity;
      await product.save();
    }

    // Compute or verify total
    const computedSubtotal = orderItems.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0);
    const finalTotal = totalPrice !== undefined ? Number(totalPrice) : Math.max(0, computedSubtotal - Number(discountAmount) + Number(deliveryFee));

    // Save order
    const order = new Order({
      user: userId,
      items: orderItems.map((item) => ({
        product: item.product?._id || item.product || item.id,
        name: item.name,
        image: item.image || item.imageUrl,
        quantity: Number(item.quantity),
        price: Number(item.price),
      })),
      subtotal: subtotal !== undefined ? Number(subtotal) : computedSubtotal,
      discountAmount: Number(discountAmount),
      deliveryFee: Number(deliveryFee),
      deliveryType,
      totalPrice: finalTotal,
      status: "pending",
      paymentMethod,
      paymentMethodRef: paymentMethodRef || undefined,
      paymentDetails,
      shippingAddress,
      deliveryLocation,
      isPaid: paymentDetails?.receiptImage || paymentDetails?.transactionId ? true : false,
      paidAt: paymentDetails?.receiptImage || paymentDetails?.transactionId ? new Date() : undefined,
    });

    const savedOrder = await order.save();

    // Send notifications to Admin and Staff about new order
    await sendSystemNotification({
      recipientRole: 'admin',
      title: `New Order Placed (#${savedOrder._id.toString().slice(-6).toUpperCase()})`,
      message: `Customer ${shippingAddress.fullName || req.user.firstName || 'User'} placed an order of ETB ${finalTotal.toLocaleString()}.`,
      type: 'order_placed',
      link: '/admin/orders',
      orderId: savedOrder._id.toString(),
    });

    await sendSystemNotification({
      recipientRole: 'staff',
      title: `New Order to Process (#${savedOrder._id.toString().slice(-6).toUpperCase()})`,
      message: `New order received from ${shippingAddress.fullName || req.user.firstName || 'User'} (${shippingAddress.city || 'Ethiopia'}). Pending validation.`,
      type: 'order_placed',
      link: '/staff/orders',
      orderId: savedOrder._id.toString(),
    });

    // Send confirmation notification to User
    await sendSystemNotification({
      recipientUser: userId,
      title: `Order Confirmed (#${savedOrder._id.toString().slice(-6).toUpperCase()})`,
      message: `Your order has been received and is currently in Pending verification.`,
      type: 'order_placed',
      link: '/account',
      orderId: savedOrder._id.toString(),
    });

    // Clear cart if user had cart in DB
    try {
      const cart = await Cart.findOne({ user: userId });
      if (cart) {
        cart.items = [];
        await cart.save();
      }
    } catch (_) {
      // Cart clearing is non-fatal
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
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
      .populate("paymentMethodRef", "name type accountNumber accountName")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single order details
export const getOrderById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(req.params.id)
      .populate("user", "firstName lastName email")
      .populate("items.product", "name price image")
      .populate("paymentMethodRef", "name type accountNumber accountName");

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
