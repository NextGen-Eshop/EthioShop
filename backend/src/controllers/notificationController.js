import Notification from '../models/Notification.js';

// Helper to create notifications internally from any controller
export const sendSystemNotification = async ({
  recipientUser = null,
  recipientRole = 'all',
  title,
  message,
  type = 'system',
  link = '',
  orderId = '',
}) => {
  try {
    const notification = new Notification({
      recipientUser,
      recipientRole,
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

    // Filter notifications matching recipientRole or recipientUser or 'all'
    const query = {
      $or: [
        { recipientUser: userId },
        { recipientRole: userRole },
        { recipientRole: 'all' },
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

// PUT /api/notifications/:id/read - Mark single notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
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

    await Notification.updateMany(
      {
        $or: [
          { recipientUser: userId },
          { recipientRole: userRole },
          { recipientRole: 'all' },
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
