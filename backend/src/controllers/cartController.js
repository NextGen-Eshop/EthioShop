import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";


// GET USER CART
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product", "name price image countInStock");

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: { items: [] },
      });
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ADD TO CART (WITH STOCK VALIDATION)
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.countInStock < quantity) {
      return res.status(400).json({
        message: `Only ${product.countInStock} items in stock`,
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > product.countInStock) {
        return res.status(400).json({
          message: `Cannot exceed stock (${product.countInStock})`,
        });
      }

      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
      });
    }

    await cart.save();

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// UPDATE CART ITEM QUANTITY
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (item) => item._id.toString() === req.params.id
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    const product = await Product.findById(item.product);

    if (!product) {
      return res.status(404).json({ message: "Product no longer exists" });
    }

    if (quantity > product.countInStock) {
      return res.status(400).json({
        message: `Only ${product.countInStock} items available`,
      });
    }

    item.quantity = quantity;

    await cart.save();

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// REMOVE ITEM FROM CART
export const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== req.params.id
    );

    await cart.save();

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};