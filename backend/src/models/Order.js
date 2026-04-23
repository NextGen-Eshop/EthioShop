<<<<<<< HEAD
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: [
      {
        productId: String,
        name: String,
        price: Number,
        quantity: Number
      }
    ],
    totalPrice: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      default: "pending"
    }
=======
import mongoose from 'mongoose';

const orderSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true, default: 0.0 },
    status: { type: String, enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    paymentId: { type: String }, 
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      phoneNumber: { type: String, required: true },
    },
>>>>>>> 53413c49f1034c42c7b057a5fc8a3cc414ccd848
  },
  { timestamps: true }
);

<<<<<<< HEAD
const Order = mongoose.model("Order", orderSchema);

export default Order;
=======
const Order = mongoose.model('Order', orderSchema);
export default Order;
>>>>>>> 53413c49f1034c42c7b057a5fc8a3cc414ccd848
