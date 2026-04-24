import Cart from "../models/Cart.js";
import mongoose from "mongoose";

// GET cart items
export const getCart = async (req, res) => {
  try {
    const userId = req.query.userId || req.query.user;

    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user id" });
      }

      const cart = await Cart.findOne({ user: userId }).populate("items.product");
      return res.json(cart || { user: userId, items: [] });
    }

    const carts = await Cart.find().populate("items.product");
    res.json(carts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD to cart
export const addToCart = async (req, res) => {
  try {
    const { user, userId, product, productId, quantity } = req.body;
    const resolvedUserId = user || userId;
    const resolvedProductId = product || productId;

    if (!resolvedUserId || !resolvedProductId) {
      return res.status(400).json({ message: "userId and productId are required" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(resolvedUserId) ||
      !mongoose.Types.ObjectId.isValid(resolvedProductId)
    ) {
      return res.status(400).json({ message: "Invalid user or product id" });
    }

    let cart = await Cart.findOne({ user: resolvedUserId });

    if (!cart) {
      cart = new Cart({ user: resolvedUserId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === resolvedProductId
    );

    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      cart.items.push({
        product: resolvedProductId,
        quantity: quantity || 1,
      });
    }

    await cart.save();
    await cart.populate("items.product");

    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE cart item
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.body.userId || req.body.user || req.query.userId || req.query.user;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.quantity = req.body.quantity ?? item.quantity;

    await cart.save();
    await cart.populate("items.product");

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE cart item
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.body.userId || req.body.user || req.query.userId || req.query.user;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.deleteOne();
    await cart.save();
    await cart.populate("items.product");

    res.json({ message: "Item removed successfully", cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
