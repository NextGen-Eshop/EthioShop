import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipientUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null means broadcast or role-based
    },
    recipientRole: {
      type: String,
      enum: ['user', 'staff', 'admin', 'all'],
      default: 'all',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'order_placed',
        'order_status',
        'order_cancelled',
        'packing_slip_ready',
        'payment_method_published',
        'discount_published',
        'announcement',
        'welcome_discount',
        'system',
      ],
      default: 'system',
    },
    link: {
      type: String,
      default: '',
    },
    orderId: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
