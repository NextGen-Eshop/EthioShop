import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    senderUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    recipientUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null means broadcast or role-based
    },
    recipientRole: {
      type: String,
      enum: ['user', 'staff', 'admin', 'all'],
      default: null,
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
        'packing_slip_sent',
        'packing_slip_requested',
        'staff_message',
        'refund_processed',
        'refund_requested',
        'customer_reply',
        'escalation',
        'payment_method_published',
        'discount_published',
        'announcement',
        'welcome_discount',
        'low_stock',
        'out_of_stock',
        'new_user',
        'failed_payment',
        'system_config',
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
    deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
