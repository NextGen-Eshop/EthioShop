import Order from "../models/Order.js";
import { initializePayment, verifyPayment } from "../services/paymentService.js";


//   INITIATE PAYMENT (REAL - CHAPA)

export const payOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        message: "Order already paid or processed",
      });
    }

    const payment = await initializePayment(order, order.user);

    // save transaction reference
    order.paymentRef = payment.tx_ref;
    await order.save();

    res.json({
      success: true,
      checkout_url: payment.checkout_url,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



//   VERIFY PAYMENT 

export const verifyOrderPayment = async (req, res) => {
  try {
    const { tx_ref } = req.params;

    const verification = await verifyPayment(tx_ref);

    if (verification.status === "success") {
      const order = await Order.findOne({ paymentRef: tx_ref });

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      order.status = "paid";
      order.isPaid = true;
      order.paidAt = Date.now();

      await order.save();

      return res.json({
        success: true,
        message: "Payment verified & order updated",
      });
    }

    res.status(400).json({ message: "Payment not successful" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



//   DEMO PAYMENT 

export const payOrderDemo = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "paid") {
      return res.status(400).json({ message: "Order already paid" });
    }

    // simulate success
    order.status = "paid";
    order.isPaid = true;
    order.paidAt = Date.now();

    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: "Payment successful (SIMULATED)",
      data: updatedOrder,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};