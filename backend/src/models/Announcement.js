import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    targetAudience: {
      type: String,
      enum: ['individual_staff', 'individual_user', 'both', 'all_staff', 'all_users', 'broadcast'],
      required: true,
      default: 'both',
    },
    targetRecipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // For individual staff or individual user
    },
    targetRecipientName: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['normal', 'high', 'urgent'],
      default: 'normal',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
