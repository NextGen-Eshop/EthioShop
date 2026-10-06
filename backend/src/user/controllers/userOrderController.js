import Order from "../../models/Order.js";
import Cart from "../../models/Cart.js";
import Product from "../../models/Product.js";
import Setting from "../../models/Setting.js";
import mongoose from "mongoose";
import { sendSystemNotification } from "../../controllers/notificationController.js";

// CREATE ORDER (User Checkout)
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    // ── Check System Configuration (Order Acceptance & Maintenance) ──
    const systemSettings = await Setting.getSettings();
    if (systemSettings.maintenanceMode) {
      return res.status(503).json({
        success: false,
        message: systemSettings.maintenanceMessage || "EthioShop is currently undergoing maintenance. Please try again soon.",
      });
    }

    if (systemSettings.orderAcceptance === false) {
      return res.status(403).json({
        success: false,
        message: "Order placement is temporarily paused by store administration. Please check back shortly.",
      });
    }

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

    // Validate stock, deduct, and check low-stock thresholds
    const lowStockThreshold = Number(systemSettings.lowStockThreshold) || 5;

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

      const previousStock = product.countInStock;
      const remainingStock = Math.max(0, product.countInStock - item.quantity);
      product.countInStock = remainingStock;
      product.salesCount = (product.salesCount || 0) + item.quantity;
      await product.save();

      // Trigger low-stock / out-of-stock notification if threshold breached
      if (remainingStock <= lowStockThreshold && previousStock > remainingStock) {
        const isOutOfStock = remainingStock === 0;
        const alertType = isOutOfStock ? 'out_of_stock' : 'low_stock';
        const alertTitle = isOutOfStock
          ? `Out of Stock: ${product.name}`
          : `Low Stock Warning: ${product.name} (${remainingStock} left)`;
        const alertMessage = isOutOfStock
          ? `Product "${product.name}" has completely run out of stock and requires immediate replenishment.`
          : `Product "${product.name}" has only ${remainingStock} unit(s) remaining in inventory.`;

        // Notify Staff
        await sendSystemNotification({
          recipientRole: 'staff',
          title: alertTitle,
          message: alertMessage,
          type: alertType,
          link: '/staff/products',
        });

        // Notify Admin (automatically checked against notifyLowStock preference in notificationController)
        await sendSystemNotification({
          recipientRole: 'admin',
          title: alertTitle,
          message: alertMessage,
          type: alertType,
          link: '/admin/inventory',
        });
      }
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

    // Send notifications to Admin and Staff about new order (senderUser set to userId so customer never receives them)
    await sendSystemNotification({
      senderUser: userId,
      recipientRole: 'admin',
      title: `New Order Placed (#${savedOrder._id.toString().slice(-6).toUpperCase()})`,
      message: `Customer ${shippingAddress.fullName || req.user.firstName || 'User'} placed an order of ETB ${finalTotal.toLocaleString()}.`,
      type: 'order_placed',
      link: '/admin/orders',
      orderId: savedOrder._id.toString(),
    });

    await sendSystemNotification({
      senderUser: userId,
      recipientRole: 'staff',
      title: `New Order to Process (#${savedOrder._id.toString().slice(-6).toUpperCase()})`,
      message: `New order received from ${shippingAddress.fullName || req.user.firstName || 'User'} (${shippingAddress.city || 'Ethiopia'}). Pending validation.`,
      type: 'order_placed',
      link: '/staff/orders',
      orderId: savedOrder._id.toString(),
    });

    // Send confirmation notification to User (direct order tracking link)
    await sendSystemNotification({
      recipientUser: userId,
      title: `Order Confirmed (#${savedOrder._id.toString().slice(-6).toUpperCase()})`,
      message: `Your order has been received and is currently in Pending verification.`,
      type: 'order_placed',
      link: `/account?tab=orders&orderId=${savedOrder._id.toString()}`,
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

// REQUEST PACKING SLIP (User asks for slip if not yet sent)
export const requestPackingSlip = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Only the order owner can request
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    if (order.packingSlip?.sentToCustomer) {
      return res.status(400).json({ message: 'Packing slip has already been sent to you.' });
    }

    order.packingSlip = order.packingSlip || {};
    order.packingSlip.requestedByCustomer = true;
    order.packingSlip.requestedAt = new Date();
    await order.save();

    // Notify staff
    await sendSystemNotification({
      senderUser: req.user.id,
      recipientRole: 'staff',
      title: `Packing Slip Requested (#${order._id.toString().slice(-6).toUpperCase()})`,
      message: `Customer requested the packing slip for order #${order._id.toString().slice(-6).toUpperCase()}. Please review and send.`,
      type: 'packing_slip_requested',
      link: '/staff/orders',
      orderId: order._id.toString(),
    });

    res.json({ success: true, message: 'Packing slip requested. Staff will send it shortly.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE DELIVERY DESTINATION (Customer updates address — only when staff explicitly requested it)
export const updateDeliveryDestination = async (req, res) => {
  try {
    const { destinationAddress, subCity, landmark, useSensedLocation, sensedCoords } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Only owner can update
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({ message: 'Delivery address can only be updated while the order is Pending or Processing.' });
    }

    // PERMISSION GUARD: only allow address update if staff explicitly requested it
    const addressUpdateRequested = order.staffMessages?.some((m) => m.requiresAddressUpdate === true);
    if (!addressUpdateRequested) {
      return res.status(403).json({
        message: 'Address update is not permitted. Staff has not requested an address update for this order.',
      });
    }

    if (destinationAddress !== undefined) order.deliveryLocation.destinationAddress = destinationAddress;
    if (subCity !== undefined) order.deliveryLocation.subCity = subCity;
    if (landmark !== undefined) order.deliveryLocation.landmark = landmark;
    if (useSensedLocation !== undefined) order.deliveryLocation.useSensedLocation = Boolean(useSensedLocation);
    if (sensedCoords) order.deliveryLocation.sensedCoords = sensedCoords;

    // Update shippingAddress city/address too for consistency
    if (subCity !== undefined && order.shippingAddress) order.shippingAddress.city = subCity;
    if (destinationAddress !== undefined && order.shippingAddress) order.shippingAddress.address = destinationAddress;

    await order.save();

    // Notify staff about the update
    await sendSystemNotification({
      senderUser: req.user.id,
      recipientRole: 'staff',
      title: `Delivery Address Updated (#${order._id.toString().slice(-6).toUpperCase()})`,
      message: `Customer updated their delivery destination for order #${order._id.toString().slice(-6).toUpperCase()}: ${destinationAddress || ''}, ${subCity || ''}.`,
      type: 'order_status',
      link: '/staff/orders',
      orderId: order._id.toString(),
    });

    // Notify admin
    await sendSystemNotification({
      senderUser: req.user.id,
      recipientRole: 'admin',
      title: `Customer Updated Delivery Address (#${order._id.toString().slice(-6).toUpperCase()})`,
      message: `Customer updated the delivery address for order #${order._id.toString().slice(-6).toUpperCase()} as requested by staff.`,
      type: 'order_status',
      link: '/admin/orders',
      orderId: order._id.toString(),
    });

    res.json({ success: true, message: 'Delivery destination updated successfully', data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REPLY TO STAFF MESSAGE (Customer sends a reply — e.g. can't update address, wants refund)
export const replyToStaffMessage = async (req, res) => {
  try {
    const { message, isRefundRequest = false } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Reply message is required.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const customerName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Customer';

    const reply = {
      sender: req.user.id,
      senderName: customerName,
      message: message.trim(),
      sentAt: new Date(),
      isRefundRequest: Boolean(isRefundRequest),
    };

    order.userReplies.push(reply);
    await order.save();

    const shortId = order._id.toString().slice(-6).toUpperCase();
    const notifTitle = isRefundRequest
      ? `Customer Refund Request on Order #${shortId}`
      : `Customer Reply on Order #${shortId}`;
    const notifMsg = isRefundRequest
      ? `Customer ${customerName} requested a refund: "${message.trim().slice(0, 120)}"`
      : `Customer ${customerName} replied: "${message.trim().slice(0, 120)}"${message.trim().length > 120 ? '...' : ''}`;

    // Notify staff
    await sendSystemNotification({
      senderUser: req.user.id,
      recipientRole: 'staff',
      title: notifTitle,
      message: notifMsg,
      type: isRefundRequest ? 'refund_requested' : 'customer_reply',
      link: '/staff/orders',
      orderId: order._id.toString(),
    });

    // Notify admin
    await sendSystemNotification({
      senderUser: req.user.id,
      recipientRole: 'admin',
      title: notifTitle,
      message: notifMsg,
      type: isRefundRequest ? 'refund_requested' : 'customer_reply',
      link: '/admin/orders',
      orderId: order._id.toString(),
    });

    res.json({ success: true, message: 'Reply sent to staff.', data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REQUEST REFUND (Customer submits a standalone refund request with reason)
export const requestRefund = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Refund reason is required.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    if (order.refundInfo?.isRefunded) {
      return res.status(400).json({ message: 'A refund has already been processed for this order.' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot request a refund on a cancelled order.' });
    }

    const customerName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Customer';
    const shortId = order._id.toString().slice(-6).toUpperCase();

    // Add as a user reply marked as refund request
    order.userReplies.push({
      sender: req.user.id,
      senderName: customerName,
      message: reason.trim(),
      sentAt: new Date(),
      isRefundRequest: true,
    });
    await order.save();

    // Notify staff
    await sendSystemNotification({
      senderUser: req.user.id,
      recipientRole: 'staff',
      title: `Refund Request from Customer (#${shortId})`,
      message: `Customer ${customerName} requested a refund for order #${shortId}. Reason: "${reason.trim().slice(0, 150)}".`,
      type: 'refund_requested',
      link: '/staff/orders',
      orderId: order._id.toString(),
    });

    // Notify admin
    await sendSystemNotification({
      senderUser: req.user.id,
      recipientRole: 'admin',
      title: `Refund Request from Customer (#${shortId})`,
      message: `Customer ${customerName} requested a refund for order #${shortId}. Reason: "${reason.trim().slice(0, 150)}".`,
      type: 'refund_requested',
      link: '/admin/orders',
      orderId: order._id.toString(),
    });

    res.json({ success: true, message: 'Refund request submitted. Staff and admin have been notified.', data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ESCALATE TO ADMIN (Customer escalates unresolved issue)
export const escalateToAdmin = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Escalation reason is required.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    if (order.escalation?.isEscalated) {
      return res.status(400).json({ message: 'This order has already been escalated to admin.' });
    }

    order.escalation = {
      isEscalated: true,
      reason: reason.trim(),
      escalatedAt: new Date(),
      escalatedBy: req.user.id,
    };
    await order.save();

    const customerName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Customer';
    const shortId = order._id.toString().slice(-6).toUpperCase();

    // Notify admin with full context
    await sendSystemNotification({
      senderUser: req.user.id,
      recipientRole: 'admin',
      title: `⚠️ Order Escalated to Admin (#${shortId})`,
      message: `Customer ${customerName} escalated order #${shortId} for admin review. Reason: "${reason.trim().slice(0, 200)}". Please review the full order history.`,
      type: 'escalation',
      link: '/admin/orders',
      orderId: order._id.toString(),
    });

    // Notify staff that admin has been looped in
    await sendSystemNotification({
      senderUser: req.user.id,
      recipientRole: 'staff',
      title: `Order Escalated to Admin (#${shortId})`,
      message: `Customer escalated order #${shortId} to admin. Admin has been notified and will review this case.`,
      type: 'escalation',
      link: '/staff/orders',
      orderId: order._id.toString(),
    });

    res.json({ success: true, message: 'Issue escalated to Admin. Admin will review and contact you shortly.', data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

