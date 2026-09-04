import Notification from '../models/Notification.js';

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

    // Strict user data isolation:
    // A notification addressed to User A (recipientUser == User A) must NEVER appear for User B.
    // Each user must see ONLY their own notifications.
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
      // Regular customer/user: strictly isolated to their own userId only
      recipientCondition = {
        recipientUser: userId,
      };
    }

    const query = {
      $and: [
        recipientCondition,
        {
          $or: [
            { senderUser: { $ne: userId } },
            { senderUser: null },
            { senderUser: { $exists: false } },
          ],
        },
        {
          deletedBy: { $ne: userId },
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
