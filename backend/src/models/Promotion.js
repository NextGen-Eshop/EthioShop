import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    }, // e.g. "New Year Discount", "Meskel Holiday Promo"
    description: {
      type: String,
      default: '',
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    }, // e.g. 20 for 20%
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending_approval', 'approved', 'rejected', 'published', 'disabled', 'expired'],
      default: 'pending_approval',
      index: true,
    },
    proposedBy: {
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
  },
  { timestamps: true }
);

// Virtual helper to check if promotion is currently active
promotionSchema.virtual('isActiveNow').get(function () {
  const now = new Date();
  return this.status === 'approved' || this.status === 'published'
    ? now >= this.startDate && now <= this.endDate
    : false;
});

promotionSchema.set('toJSON', { virtuals: true });
promotionSchema.set('toObject', { virtuals: true });

const Promotion = mongoose.model('Promotion', promotionSchema);
export default Promotion;
