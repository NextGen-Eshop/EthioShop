import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    screenshotUrl: { type: String, required: true },
    originalFilename: { type: String, maxlength: 255 },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
