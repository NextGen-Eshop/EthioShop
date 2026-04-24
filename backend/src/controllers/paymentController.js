import path from "path";
import fs from "fs";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import {
  sendPaymentApprovedEmail,
  sendPaymentRejectedEmail,
} from "../services/emailService.js";
import { uploadsPaymentsDir } from "../middleware/uploadMiddleware.js";

const publicUrl = (filename) => `/uploads/payments/${filename}`;

function resolveUploadPath(screenshotUrl) {
  if (!screenshotUrl) return null;
  const name = path.basename(screenshotUrl);
  return path.join(uploadsPaymentsDir, name);
}

export const uploadPaymentProof = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      fs.unlink(path.join(uploadsPaymentsDir, req.file.filename), () => {});
      return res.status(404).json({ message: "Order not found" });
    }

    if (String(order.user) !== req.user.id) {
      fs.unlink(path.join(uploadsPaymentsDir, req.file.filename), () => {});
      return res.status(403).json({ message: "Not your order" });
    }

    if (!["pending_payment", "rejected"].includes(order.status)) {
      fs.unlink(path.join(uploadsPaymentsDir, req.file.filename), () => {});
      return res.status(400).json({ message: "This order is not waiting for a payment upload" });
    }

    const rel = publicUrl(req.file.filename);
    const existing = await Payment.findOne({ order: order._id });
    if (existing) {
      const oldPath = resolveUploadPath(existing.screenshotUrl);
      if (oldPath && fs.existsSync(oldPath)) fs.unlink(oldPath, () => {});
      existing.screenshotUrl = rel;
      existing.originalFilename = req.file.originalname;
      await existing.save();
    } else {
      await Payment.create({
        order: order._id,
        user: req.user.id,
        screenshotUrl: rel,
        originalFilename: req.file.originalname,
      });
    }

    order.status = "under_review";
    order.rejectionReason = undefined;
    await order.save();

    const populated = await Order.findById(order._id)
      .populate("items.product", "name price imageUrl")
      .lean();

    res.json({ success: true, data: { order: populated, screenshotUrl: rel } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approvePayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.status !== "under_review") {
      return res.status(400).json({ message: "Order is not awaiting review" });
    }

    const payment = await Payment.findOne({ order: order._id });
    if (!payment) {
      return res.status(400).json({ message: "No payment upload found" });
    }

    for (const line of order.items) {
      const p = await Product.findById(line.product);
      if (!p) {
        return res.status(400).json({ message: "Product missing from catalog" });
      }
      if (p.countInStock < line.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${p.name}` });
      }
      p.countInStock -= line.quantity;
      await p.save();
    }

    order.status = "approved";
    order.isPaid = true;
    order.paidAt = new Date();
    order.reviewedBy = req.user._id;
    order.reviewedAt = new Date();
    order.rejectionReason = undefined;
    await order.save();

    const customer = await User.findById(order.user);
    if (customer) {
      sendPaymentApprovedEmail({
        to: order.deliveryAddress?.email || customer.email,
        firstName: order.deliveryAddress?.firstName || customer.firstName,
        orderId: order._id,
      }).catch(() => {});
    }

    res.json({ success: true, data: { order } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectPayment = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.status !== "under_review") {
      return res.status(400).json({ message: "Order is not awaiting review" });
    }

    order.status = "rejected";
    order.isPaid = false;
    order.reviewedBy = req.user._id;
    order.reviewedAt = new Date();
    order.rejectionReason = reason ? String(reason).slice(0, 1000) : "Could not verify payment";
    await order.save();

    const customer = await User.findById(order.user);
    if (customer) {
      sendPaymentRejectedEmail({
        to: order.deliveryAddress?.email || customer.email,
        firstName: order.deliveryAddress?.firstName || customer.firstName,
        orderId: order._id,
        reason: order.rejectionReason,
      }).catch(() => {});
    }

    res.json({ success: true, data: { order } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
