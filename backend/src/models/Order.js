import mongoose from 'mongoose';

const orderSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
        name: { type: String },
        image: { type: String },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, default: 0.0 },
    discountAmount: { type: Number, default: 0.0 },
    deliveryFee: { type: Number, default: 0.0 },
    deliveryType: { type: String, enum: ['free', 'paid'], default: 'free' },
    totalPrice: { type: Number, required: true, default: 0.0 },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    cancellationReason: { type: String, default: '' },
    carrier: { type: String, default: 'EthioShop Express Courier' },
    trackingNumber: { type: String, default: '' },
    handledByStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    statusHistory: [
      {
        status: { type: String },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: { type: String },
      },
    ],
    paymentId: { type: String },
    paymentMethod: { type: String, default: 'telebirr' },
    paymentMethodRef: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentMethod' },
    paymentDetails: {
      provider: { type: String }, // e.g. 'telebirr' | 'cbe' | 'awash' | 'senke' | 'chapa' | 'cod'
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
      phoneNumber: { type: String, required: true }, // Ethiopian phone number standard
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
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    packingSlip: {
      isGenerated: { type: Boolean, default: false },
      generatedAt: { type: Date },
      generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      slipNumber: { type: String, default: '' },
      notes: { type: String, default: '' },
      sentToCustomer: { type: Boolean, default: false },
      sentAt: { type: Date },
      requestedByCustomer: { type: Boolean, default: false },
      requestedAt: { type: Date },
    },
    staffMessages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        senderName: { type: String, default: 'Fulfillment Staff' },
        message: { type: String, required: true },
        sentAt: { type: Date, default: Date.now },
        requiresAddressUpdate: { type: Boolean, default: false },
      },
    ],
    refundInfo: {
      isRefunded: { type: Boolean, default: false },
      amount: { type: Number, default: 0 },
      reason: { type: String, default: '' },
      refundedAt: { type: Date },
      processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
