<<<<<<< HEAD
import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      default: 1
    }
=======
import mongoose from 'mongoose';

const cartSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
        quantity: { type: Number, required: true, default: 1 },
      },
    ],
>>>>>>> 53413c49f1034c42c7b057a5fc8a3cc414ccd848
  },
  { timestamps: true }
);

<<<<<<< HEAD
const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
=======
const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
>>>>>>> 53413c49f1034c42c7b057a5fc8a3cc414ccd848
