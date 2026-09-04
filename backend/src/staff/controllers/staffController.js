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
          senderUser: staffUser._id,
          recipientUser: order.user._id || order.user,
          title: `Order Cancelled (#${order._id.toString().slice(-6).toUpperCase()})`,
          message: `Your order has been cancelled by staff. Reason: ${cancellationReason.trim()}`,
          type: 'order_cancelled',
          link: `/account?tab=orders&orderId=${order._id.toString()}`,
          orderId: order._id.toString(),
        });
      }

      // Notify Admin
      await sendSystemNotification({
        senderUser: staffUser._id,
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

      // Auto-prepare packing slip
      if (!order.packingSlip?.isGenerated) {
        const slipNumber = `PS-${order._id.toString().slice(-6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
        order.packingSlip = {
          isGenerated: true,
          generatedAt: new Date(),
          generatedBy: staffUser._id,
          slipNumber,
          notes: 'Auto-prepared upon shipment dispatch.',
          sentToCustomer: false,
          requestedByCustomer: false,
        };
      }

      // Notify User: Order Shipped
      if (order.user) {
        await sendSystemNotification({
          senderUser: staffUser._id,
          recipientUser: order.user._id || order.user,
          title: `Order Shipped! (#${order._id.toString().slice(-6).toUpperCase()})`,
          message: `Your order is on the way with ${order.carrier} (${order.trackingNumber || 'Standard'}). Track its progress in your account.`,
          type: 'order_status',
          link: `/account?tab=orders&orderId=${order._id.toString()}`,
          orderId: order._id.toString(),
        });
      }

      // Notify Admin
      await sendSystemNotification({
        senderUser: staffUser._id,
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

      // Auto-prepare packing slip if not already done
      if (!order.packingSlip?.isGenerated) {
        const slipNumber = `PS-${order._id.toString().slice(-6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
        order.packingSlip = {
          isGenerated: true,
          generatedAt: new Date(),
          generatedBy: staffUser._id,
          slipNumber,
          notes: 'Auto-prepared upon delivery confirmation.',
          sentToCustomer: false,
          requestedByCustomer: false,
        };
      }

      // Notify User
      if (order.user) {
        await sendSystemNotification({
          senderUser: staffUser._id,
          recipientUser: order.user._id || order.user,
          title: `Order Delivered (#${order._id.toString().slice(-6).toUpperCase()})`,
          message: `Your order has been delivered successfully. Thank you for shopping with EthioShopping!`,
          type: 'order_status',
          link: `/account?tab=orders&orderId=${order._id.toString()}`,
          orderId: order._id.toString(),
        });
      }

      // Notify Admin
      await sendSystemNotification({
        senderUser: staffUser._id,
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
          senderUser: staffUser._id,
          recipientUser: order.user._id || order.user,
          title: `Order Processing (#${order._id.toString().slice(-6).toUpperCase()})`,
          message: `Staff is currently preparing and packing your ordered items.`,
          type: 'order_status',
          link: `/account?tab=orders&orderId=${order._id.toString()}`,
          orderId: order._id.toString(),
        });
      }

      // Notify Admin
      await sendSystemNotification({
        senderUser: staffUser._id,
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

// GENERATE PACKING SLIP (Official Staff Action for Shipped/Delivered orders)
export const generatePackingSlip = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "firstName lastName email");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status !== 'shipped' && order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: "Packing slip can only be generated once the order has reached Shipped or Delivered stage.",
      });
    }

    const staffUser = req.user;
    const slipNumber = `PS-${order._id.toString().slice(-6).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    order.packingSlip = {
      isGenerated: true,
      generatedAt: new Date(),
      generatedBy: staffUser._id,
      slipNumber,
      notes: req.body.notes || 'Official dispatch slip generated by fulfillment staff.',
    };

    await order.save();

    // Notify User about official packing slip availability
    if (order.user) {
      await sendSystemNotification({
        senderUser: staffUser._id,
        recipientUser: order.user._id || order.user,
        title: `Official Packing Slip Available (#${order._id.toString().slice(-6).toUpperCase()})`,
        message: `Your official Packing Slip #${slipNumber} has been generated by staff and is ready to view and print.`,
        type: 'packing_slip_ready',
        link: `/account?tab=orders&orderId=${order._id.toString()}`,
        orderId: order._id.toString(),
      });
    }

    res.json({
      success: true,
      message: "Packing slip generated successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const processingOrders = await Order.countDocuments({ status: "processing" });
    const shippedOrders = await Order.countDocuments({ status: "shipped" });
    const deliveredOrders = await Order.countDocuments({ status: "delivered" });
    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.countDocuments({ countInStock: { $gt: 0, $lte: 5 } });
    const outOfStockProducts = await Product.countDocuments({ countInStock: { $lte: 0 } });
    const pendingDiscounts = await Promotion.countDocuments({ status: "pending_approval" });

    // Aggregate total sales
    const allOrders = await Order.find().select("totalPrice status isPaid createdAt user");
    const totalSales = allOrders
      .filter((o) => o.status === "delivered" || o.isPaid === true)
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Unique customer count
    const uniqueUsers = new Set(allOrders.map((o) => o.user?.toString()).filter(Boolean));
    const totalCustomers = uniqueUsers.size || await User.countDocuments({ role: "user" });

    res.json({
      success: true,
      data: {
        totalSales,
        totalOrders,
        totalCustomers,
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        pendingDiscounts,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── STAFF: SEND PACKING SLIP TO CUSTOMER ───

// POST /api/staff/orders/:id/send-slip
export const sendPackingSlipToCustomer = async (req, res) => {
  try {
    const staffUser = req.user;
    const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (!order.packingSlip?.isGenerated) {
      return res.status(400).json({ success: false, message: 'Packing slip has not been prepared yet.' });
    }

    order.packingSlip.sentToCustomer = true;
    order.packingSlip.sentAt = new Date();
    await order.save();

    if (order.user) {
      await sendSystemNotification({
        senderUser: staffUser._id,
        recipientUser: order.user._id || order.user,
        title: `Packing Slip Sent (#${order._id.toString().slice(-6).toUpperCase()})`,
        message: `Your packing slip #${order.packingSlip.slipNumber} has been sent by staff. You can view and download it in your account.`,
        type: 'packing_slip_sent',
        link: `/account?tab=orders&orderId=${order._id.toString()}`,
        orderId: order._id.toString(),
      });
    }

    res.json({ success: true, message: 'Packing slip sent to customer', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── STAFF: ADD MESSAGE TO ORDER (Customer Communication) ───

// POST /api/staff/orders/:id/message
export const addStaffOrderMessage = async (req, res) => {
  try {
    const staffUser = req.user;
    const { message, requiresAddressUpdate = false } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const newMsg = {
      sender: staffUser._id,
      senderName: `${staffUser.firstName} ${staffUser.lastName}`,
      message: message.trim(),
      sentAt: new Date(),
      requiresAddressUpdate: Boolean(requiresAddressUpdate),
    };

    order.staffMessages.push(newMsg);
    await order.save();

    // Notify customer
    if (order.user) {
      await sendSystemNotification({
        senderUser: staffUser._id,
        recipientUser: order.user._id || order.user,
        title: `Staff Message on Order #${order._id.toString().slice(-6).toUpperCase()}`,
        message: message.trim().length > 100 ? message.trim().slice(0, 97) + '...' : message.trim(),
        type: 'staff_message',
        link: `/account?tab=orders&orderId=${order._id.toString()}`,
        orderId: order._id.toString(),
      });
    }

    // Notify admin
    await sendSystemNotification({
      senderUser: staffUser._id,
      recipientRole: 'admin',
      title: `Staff Message Added (#${order._id.toString().slice(-6).toUpperCase()})`,
      message: `Staff ${staffUser.firstName} ${staffUser.lastName} sent a message on order #${order._id.toString().slice(-6).toUpperCase()}.`,
      type: 'staff_message',
      link: '/admin/orders',
      orderId: order._id.toString(),
    });

    res.json({ success: true, message: 'Message sent to customer', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── STAFF: PROCESS REFUND ───

// POST /api/staff/orders/:id/refund
export const processOrderRefund = async (req, res) => {
  try {
    const staffUser = req.user;
    const { amount, reason } = req.body;

    if (!amount || !reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Refund amount and reason are required.' });
    }

    const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.refundInfo = {
      isRefunded: true,
      amount: Number(amount),
      reason: reason.trim(),
      refundedAt: new Date(),
      processedBy: staffUser._id,
    };

    // Cancel order when refunded
    if (order.status !== 'cancelled') {
      order.status = 'cancelled';
      order.cancellationReason = `Refund issued: ${reason.trim()}`;
      order.statusHistory.push({
        status: 'cancelled',
        changedAt: new Date(),
        changedBy: staffUser._id,
        note: `Refund processed by ${staffUser.firstName}. Amount: ETB ${amount}. Reason: ${reason.trim()}`,
      });
    }

    await order.save();

    // Notify customer
    if (order.user) {
      await sendSystemNotification({
        senderUser: staffUser._id,
        recipientUser: order.user._id || order.user,
        title: `Refund Processed for Order #${order._id.toString().slice(-6).toUpperCase()}`,
        message: `A refund of ETB ${Number(amount).toLocaleString()} has been processed for your order. Reason: ${reason.trim()}`,
        type: 'refund_processed',
        link: `/account?tab=orders&orderId=${order._id.toString()}`,
        orderId: order._id.toString(),
      });
    }

    // Notify admin
    await sendSystemNotification({
      senderUser: staffUser._id,
      recipientRole: 'admin',
      title: `Refund Processed (#${order._id.toString().slice(-6).toUpperCase()})`,
      message: `Staff ${staffUser.firstName} ${staffUser.lastName} processed refund of ETB ${Number(amount).toLocaleString()}.`,
      type: 'refund_processed',
      link: '/admin/orders',
      orderId: order._id.toString(),
    });

    res.json({ success: true, message: 'Refund processed successfully', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
