import Cart from "../models/Cart.js";

// GET cart items
export const getCart = async (req, res) => {
  try {
    const cartItems = await Cart.find();
    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD to cart
export const addToCart = async (req, res) => {
  try {
    const { userId, productId, name, price, quantity } = req.body;

    const newItem = await Cart.create({
      userId,
      productId,
      name,
      price,
      quantity
    });

    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE cart item
export const updateCartItem = async (req, res) => {
  try {
    const updated = await Cart.findByIdAndUpdate(
      req.params.id,
      { quantity: req.body.quantity },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE cart item
export const removeFromCart = async (req, res) => {
  try {
    const deleted = await Cart.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item removed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};