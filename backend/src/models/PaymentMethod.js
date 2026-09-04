import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    }, // e.g. "Senke Bank", "Telebirr", "Commercial Bank of Ethiopia (CBE)", "Awash Bank"
    type: {
      type: String,
      enum: ['bank_transfer', 'mobile_wallet', 'card', 'cash_on_delivery', 'chapa', 'other'],
      default: 'bank_transfer',
    },
    accountNumber: {
      type: String,
      default: '',
      trim: true,
    },
    accountName: {
      type: String,
      default: 'EthioShop PLC',
      trim: true,
    },
    shortCode: {
      type: String,
      default: '',
      trim: true,
    },
    phoneNumber: {
      type: String,
      default: '',
      trim: true,
    },
    instructions: {
      type: String,
      default: '',
    },
    guideSteps: {
      type: [String],
      default: [],
    },
    logoEmoji: {
      type: String,
      default: '🏦',
    },
    iconUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'sent_to_staff', 'pending_approval', 'approved', 'published', 'rejected', 'disabled'],
      default: 'sent_to_staff',
      index: true,
    },
    configuredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changedByName: { type: String, default: 'System' },
        changedAt: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);
export default PaymentMethod;
