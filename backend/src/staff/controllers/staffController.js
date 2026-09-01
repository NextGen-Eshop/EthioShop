import Product from "../../models/Product.js";
import Order from "../../models/Order.js";
import Promotion from "../../models/Promotion.js";
import PaymentMethod from "../../models/PaymentMethod.js";
import { sendSystemNotification } from "../../controllers/notificationController.js";

// ─── STAFF INVENTORY / PRODUCTS ───

// GET all products for staff inventory management
export const getStaffProducts = async (req, res) => {
  try {
    const { category, lowStock } = req.query;
    const query = {};

    if (category && category !== 'all') query.category = category.toLowerCase();
    if (lowStock === "true") query.countInStock = { $lte: 5 };

    const products = await Product.find(query).sort({ countInStock: 1, createdAt: -1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE product stock quantity
export const updateStockQuantity = async (req, res) => {
  try {
    const { countInStock, isActive, price, originalPrice } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (countInStock !== undefined) product.countInStock = Number(countInStock);
    if (isActive !== undefined) product.isActive = Boolean(isActive);
    if (price !== undefined) product.price = Number(price);
    if (originalPrice !== undefined) product.originalPrice = Number(originalPrice);

    const updatedProduct = await product.save();
    res.json({
      success: true,
      message: "Inventory updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── STAFF ORDERS & FULFILLMENT ───

// GET all orders for fulfillment
export const getStaffOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;

    const orders = await Order.find(query)
      .populate("user", "firstName lastName email avatar")
      .populate("items.product", "name price image")
      .populate("paymentMethodRef", "name type")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE order fulfillment status (Pending -> Processing -> Shipped -> Delivered, or Cancelled)
export const updateOrderFulfillment = async (req, res) => {
  try {
    const { status, isPaid, cancellationReason, carrier, trackingNumber } = req.body;
    const allowedStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

    const order = await Order.findById(req.params.id).populate("user", "firstName lastName email");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status "${status}". Allowed: ${allowedStatuses.join(', ')}` });
    }

    const previousStatus = order.status;
    const staffUser = req.user;

    // Handle cancellation: mandatory reason
    if (status === 'cancelled') {
      if (!cancellationReason || !cancellationReason.trim()) {
        return res.status(400).json({ message: "Cancellation reason is mandatory when cancelling an order." });
      }
      order.cancellationReason = cancellationReason.trim();

      // Restore product stock if cancelled
      if (previousStatus !== 'cancelled') {
        for (const item of order.items) {
          if (item.product) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { countInStock: item.quantity },
            });
          }
        }
      }

      // Notify User
      if (order.user) {
        await sendSystemNotification({
          recipientUser: order.user._id || order.user,
          title: `Order Cancelled (#${order._id.toString().slice(-6).toUpperCase()})`,
          message: `Your order has been cancelled by staff. Reason: ${cancellationReason.trim()}`,
          type: 'order_cancelled',
          link: '/account',
          orderId: order._id.toString(),
        });
      }

      // Notify Admin
      await sendSystemNotification({
        recipientRole: 'admin',
        title: `Order Cancelled by Staff (#${order._id.toString().slice(-6).toUpperCase()})`,
        message: `Staff ${staffUser.firstName} ${staffUser.lastName} cancelled order #${order._id.toString().slice(-6).toUpperCase()}. Reason: ${cancellationReason.trim()}`,
        type: 'order_cancelled',
        link: '/admin/orders',
        orderId: order._id.toString(),
      });
    }

    // Handle Shipped
    if (status === 'shipped') {
      order.shippedAt = Date.now();
      if (carrier) order.carrier = carrier;
      if (trackingNumber) order.trackingNumber = trackingNumber;

      // Notify User: Packing Slip Available
      if (order.user) {
        await sendSystemNotification({
          recipientUser: order.user._id || order.user,
          title: `Order Shipped! (#${order._id.toString().slice(-6).toUpperCase()})`,
          message: `Your order is on the way! Your official Packing Slip is now available to view and download in your account.`,
          type: 'packing_slip_ready',
          link: '/account',
          orderId: order._id.toString(),
        });
      }

      // Notify Admin
      await sendSystemNotification({
        recipientRole: 'admin',
        title: `Order Shipped (#${order._id.toString().slice(-6).toUpperCase()})`,
        message: `Staff ${staffUser.firstName} ${staffUser.lastName} dispatched order with ${order.carrier} (${order.trackingNumber || 'Standard'}).`,
        type: 'order_status',
        link: '/admin/orders',
        orderId: order._id.toString(),
      });
    }

    // Handle Delivered
    if (status === 'delivered') {
      order.deliveredAt = Date.now();
      order.isPaid = true;

      // Notify User
      if (order.user) {
        await sendSystemNotification({
          recipientUser: order.user._id || order.user,
          title: `Order Delivered (#${order._id.toString().slice(-6).toUpperCase()})`,
          message: `Your order has been delivered successfully. Thank you for shopping with EthioShopping!`,
          type: 'order_status',
          link: '/account',
          orderId: order._id.toString(),
        });
      }

      // Notify Admin
      await sendSystemNotification({
        recipientRole: 'admin',
        title: `Order Delivered (#${order._id.toString().slice(-6).toUpperCase()})`,
        message: `Staff confirmed successful delivery for order #${order._id.toString().slice(-6).toUpperCase()}.`,
        type: 'order_status',
        link: '/admin/orders',
        orderId: order._id.toString(),
      });
    }

    // Handle Processing
    if (status === 'processing') {
      // Notify User
      if (order.user) {
        await sendSystemNotification({
          recipientUser: order.user._id || order.user,
          title: `Order Processing (#${order._id.toString().slice(-6).toUpperCase()})`,
          message: `Staff is currently preparing and packing your ordered items.`,
          type: 'order_status',
          link: '/account',
          orderId: order._id.toString(),
        });
      }

      // Notify Admin
      await sendSystemNotification({
        recipientRole: 'admin',
        title: `Order Processing (#${order._id.toString().slice(-6).toUpperCase()})`,
        message: `Staff ${staffUser.firstName} began processing order #${order._id.toString().slice(-6).toUpperCase()}.`,
        type: 'order_status',
        link: '/admin/orders',
        orderId: order._id.toString(),
      });
    }

    if (status) {
      order.status = status;
      order.handledByStaff = staffUser._id;
      order.statusHistory.push({
        status,
        changedAt: new Date(),
        changedBy: staffUser._id,
        note: cancellationReason || `Status advanced to ${status} by ${staffUser.firstName}`,
      });
    }

    if (isPaid !== undefined) {
      order.isPaid = Boolean(isPaid);
      if (order.isPaid && !order.paidAt) {
        order.paidAt = Date.now();
      }
    }

    const updatedOrder = await order.save();
    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── STAFF PAYMENTS VERIFICATION ───

// GET list of payments / orders payment status
export const getStaffPayments = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "firstName lastName email")
      .populate("paymentMethodRef", "name type accountNumber")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── STAFF OPERATIONAL OVERVIEW ───

// GET Staff Overview Dashboard stats
export const getStaffOverview = async (req, res) => {
  try {
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const processingOrders = await Order.countDocuments({ status: "processing" });
    const shippedOrders = await Order.countDocuments({ status: "shipped" });
    const deliveredOrders = await Order.countDocuments({ status: "delivered" });
    const lowStockProducts = await Product.countDocuments({ countInStock: { $lte: 5 } });
    const pendingDiscounts = await Promotion.countDocuments({ status: "pending_approval" });

    res.json({
      success: true,
      data: {
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        lowStockProducts,
        pendingDiscounts,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
