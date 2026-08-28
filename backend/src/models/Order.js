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
    status: { type: String, enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    paymentId: { type: String }, 
    paymentMethod: { type: String, default: 'chapa' },
    paymentDetails: {
      provider: { type: String }, // 'telebirr' | 'cbe' | 'awash' | 'chapa' | 'card' | 'cod'
      accountNumber: { type: String },
      senderPhone: { type: String },
      senderName: { type: String },
      transactionId: { type: String },
      receiptImage: { type: String }, // Base64 screenshot/receipt
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      email: { type: String },
      note: { type: String },
    },
    deliveryLocation: {
      useSensedLocation: { type: Boolean, default: false },
      sensedCoords: {
        latitude: { type: Number },
        longitude: { type: Number },
        accuracy: { type: Number },
        placeName: { type: String },
      },
      destinationAddress: { type: String },
      subCity: { type: String },
      landmark: { type: String },
    },
    paymentRef: { type: String },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
