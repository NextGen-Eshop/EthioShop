import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import Setting from '../models/Setting.js';

// Helper to create notifications internally from any controller
export const sendSystemNotification = async ({
  senderUser = null,
  recipientUser = null,
  recipientRole = null,
  title,
  message,
  type = 'system',
  link = '',
  orderId = '',
}) => {
  try {
    // ─── RULE 1: PREVENT SELF-NOTIFICATIONS ───
    // A notification must never be sent to the person who triggered or sent it.
    if (
      senderUser &&
      recipientUser &&
      senderUser.toString().trim() === recipientUser.toString().trim()
    ) {
      return null;
    }

    // ─── RULE 2: RESPECT ADMIN SYSTEM CONFIGURATION ALERT PREFERENCES ───
    // If this notification is targeted at the administrator, check if the alert type is enabled.
    if (recipientRole === 'admin') {
      try {
        const settings = await Setting.getSettings();
        if (type === 'order_placed' && settings.notifyNewOrders === false) {
          return null; // Silenced by admin configuration
        }
        if ((type === 'low_stock' || type === 'out_of_stock') && settings.notifyLowStock === false) {
          return null; // Silenced by admin configuration
        }
        if (type === 'failed_payment' && settings.notifyFailedPayments === false) {
          return null; // Silenced by admin configuration
        }
        if (type === 'new_user' && settings.notifyNewUsers === false) {
          return null; // Silenced by admin configuration
        }
      } catch (err) {
        // Fallback gracefully if settings cannot be read
      }
    }

    // Strict isolation: if recipientUser is specified, recipientRole must be null
    // so this notification is never treated as a broadcast and is isolated exclusively to recipientUser.
    const finalRole = recipientUser ? null : (recipientRole || null);
    const notification = new Notification({
      senderUser,
      recipientUser,
      recipientRole: finalRole,
      title,
      message,
      type,
      link,
      orderId,
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// GET /api/notifications - Get notifications for logged-in user (User, Staff, Admin)
export const getMyNotifications = async (req, res) => {
  try {
    const userRole = req.user?.role || 'user';
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const userObjectId = mongoose.isValidObjectId(userId)
      ? new mongoose.Types.ObjectId(userId.toString())
      : userId;
    const userMatch = [userObjectId, userId.toString()];

    // Strict user data isolation:
    // A notification addressed to User A (recipientUser == User A) must NEVER appear for User B.
    // Each user must see ONLY their own notifications.
    // Strict role-based isolation:
    // Ensure each role only receives notifications appropriate to their responsibilities
    let recipientCondition;
    if (userRole === 'admin') {
      recipientCondition = {
        $or: [
          { recipientUser: { $in: userMatch } },
          { recipientUser: null, recipientRole: { $in: ['admin', 'all'] } },
        ],
      };
    } else if (userRole === 'staff') {
      // Staff members receive order fulfillment, packing, stock restock alerts, and announcements.
      // Staff must NOT receive sensitive admin-only system configuration or user management alerts.
      recipientCondition = {
        $or: [
          { recipientUser: { $in: userMatch } },
          {
            recipientUser: null,
            recipientRole: { $in: ['staff', 'all'] },
            type: { $nin: ['system_config', 'new_user'] },
          },
        ],
      };
    } else {
      // Regular customer/user: strictly receives their own user-specific notifications or shopper announcements/discounts.
      // Customers must NEVER see staff or admin operational alerts.
      recipientCondition = {
        $or: [
          { recipientUser: { $in: userMatch } },
          {
            recipientUser: null,
            recipientRole: { $in: ['user', 'all'] },
            type: {
              $in: [
                'order_placed',
                'order_status',
                'order_cancelled',
                'packing_slip_ready',
                'packing_slip_sent',
                'staff_message',
                'refund_processed',
                'announcement',
                'welcome_discount',
                'discount_published',
                'payment_method_published',
                'customer_reply',
                'system',
              ],
            },
          },
        ],
      };
    }

    // Never deliver notifications triggered/sent by the user themselves
    const query = {
      $and: [
        recipientCondition,
        {
          $or: [
            { senderUser: { $nin: userMatch } },
            { senderUser: null },
            { senderUser: { $exists: false } },
          ],
        },
        {
          deletedBy: { $nin: userMatch },
        },
      ],
    };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/notifications/:id - Delete notification for the current user
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;
    const userRole = req.user?.role || 'user';

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Strict isolation: verify ownership if addressed to a specific user
    if (notification.recipientUser && notification.recipientUser.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied: not your notification' });
    }

    // If role-based without recipientUser, regular users cannot access staff/admin notifications
    if (!notification.recipientUser && notification.recipientRole && notification.recipientRole !== 'all' && notification.recipientRole !== userRole && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Add user to deletedBy array so it's hidden from them
    await Notification.findByIdAndUpdate(id, {
      $addToSet: { deletedBy: userId },
    });

    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/notifications/:id/read - Mark single notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;
    const userRole = req.user?.role || 'user';
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Strict isolation: verify ownership if addressed to a specific user
    if (notification.recipientUser && notification.recipientUser.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied: not your notification' });
    }

    // If role-based without recipientUser, verify role
    if (!notification.recipientUser && notification.recipientRole && notification.recipientRole !== 'all' && notification.recipientRole !== userRole && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ success: true, message: 'Notification marked as read', data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/notifications/read-all - Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userRole = req.user?.role || 'user';
    const userId = req.user?._id || req.user?.id;

    let recipientCondition;
    if (userRole === 'admin') {
      recipientCondition = {
        $or: [
          { recipientUser: userId },
          { recipientUser: null, recipientRole: { $in: ['admin', 'all'] } },
        ],
      };
    } else if (userRole === 'staff') {
      recipientCondition = {
        $or: [
          { recipientUser: userId },
          { recipientUser: null, recipientRole: { $in: ['staff', 'all'] } },
        ],
      };
    } else {
      recipientCondition = {
        recipientUser: userId,
      };
    }

    await Notification.updateMany(
      {
        $and: [
          recipientCondition,
          {
            $or: [
              { senderUser: { $ne: userId } },
              { senderUser: null },
              { senderUser: { $exists: false } },
            ],
          },
        ],
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
