import mongoose from "mongoose";

const ORDER_STATUSES = [
  "pending_payment",
  "under_review",
  "approved",
  "rejected",
  "shipped",
  "delivered",
  "cancelled",
];

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Product" },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        name: { type: String, maxlength: 200 },
      },
    ],
    totalPrice: { type: Number, required: true, default: 0, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending_payment",
    },
    paymentMethod: { type: String, default: "bank_transfer" },
    deliveryAddress: {
      firstName: { type: String },
      lastName: { type: String },
      email: { type: String },
      phone: { type: String },
      address: { type: String },
      city: { type: String },
      note: { type: String },
    },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    paymentRef: { type: String },
    rejectionReason: { type: String, maxlength: 1000 },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

orderSchema.set("toJSON", { virtuals: true });
orderSchema.set("toObject", { virtuals: true });

const Order = mongoose.model("Order", orderSchema);
export { ORDER_STATUSES };
export default Order;
