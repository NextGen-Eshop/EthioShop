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
  },
  { timestamps: true }
);

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
