import Product from "../../models/Product.js";
import Order from "../../models/Order.js";

// ─── STAFF INVENTORY / PRODUCTS ───

// GET all products for staff inventory management
export const getStaffProducts = async (req, res) => {
  try {
    const { category, lowStock } = req.query;
    const query = {};

    if (category) query.category = category;
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
    const { countInStock, isActive } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (countInStock !== undefined) product.countInStock = Number(countInStock);
    if (isActive !== undefined) product.isActive = Boolean(isActive);

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

    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate("user", "firstName lastName email")
      .populate("items.product", "name price image")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE order fulfillment status
export const updateOrderFulfillment = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["processing", "shipped", "delivered", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid fulfillment status" });
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
      .select("_id user totalPrice status paymentMethod paymentRef isPaid paidAt createdAt")
      .populate("user", "firstName lastName email")
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
    const lowStockProducts = await Product.countDocuments({ countInStock: { $lte: 5 } });

    res.json({
      success: true,
      data: {
        pendingOrders,
        processingOrders,
        shippedOrders,
        lowStockProducts,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
