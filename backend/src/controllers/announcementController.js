import Announcement from '../models/Announcement.js';
import User from '../models/User.js';
import { sendSystemNotification } from './notificationController.js';

// Admin creates an announcement
export const createAnnouncementAdmin = async (req, res) => {
  try {
    const { title, message, targetAudience, targetRecipientId, priority } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    let targetRecipientName = '';
    let targetRecipient = null;

    if (targetRecipientId) {
      const recipientUser = await User.findById(targetRecipientId);
      if (recipientUser) {
        targetRecipient = recipientUser._id;
        targetRecipientName = `${recipientUser.firstName} ${recipientUser.lastName} (${recipientUser.email})`;
      }
    }

    const announcement = new Announcement({
      title,
      message,
      targetAudience: targetAudience || 'both',
      targetRecipient,
      targetRecipientName,
      priority: priority || 'normal',
      createdBy: req.user._id,
    });

    await announcement.save();

    // Trigger in-app notifications according to targetAudience
    const senderUser = req.user._id;
    const announcementLink = `/announcements?id=${announcement._id}`;

    if (targetAudience === 'individual_staff' || targetAudience === 'individual_user') {
      if (targetRecipient) {
        await sendSystemNotification({
          senderUser,
          recipientUser: targetRecipient,
          title: `Announcement: ${title}`,
          message,
          type: 'announcement',
          link: targetAudience === 'individual_staff' ? '/staff/overview' : announcementLink,
        });
      }
    } else if (targetAudience === 'all_staff') {
      await sendSystemNotification({
        senderUser,
        recipientRole: 'staff',
        title: `Staff Announcement: ${title}`,
        message,
        type: 'announcement',
        link: '/staff/overview',
      });
    } else if (targetAudience === 'all_users') {
      await sendSystemNotification({
        senderUser,
        recipientRole: 'user',
        title: `Important Update: ${title}`,
        message,
        type: 'announcement',
        link: announcementLink,
      });
    } else {
      // 'both' / broadcast to both Staff and Users
      await sendSystemNotification({
        senderUser,
        recipientRole: 'all',
        title: `Announcement: ${title}`,
        message,
        type: 'announcement',
        link: announcementLink,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Announcement created and dispatched successfully',
      data: announcement,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin gets all announcements
export const getAllAnnouncementsAdmin = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('createdBy', 'firstName lastName email')
      .populate('targetRecipient', 'firstName lastName email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// User/Staff gets active announcements relevant to them
export const getMyAnnouncements = async (req, res) => {
  try {
    const userRole = req.user?.role || 'user';
    const userId = req.user?._id || req.user?.id;

    const query = {
      isActive: true,
      $or: [
        { targetRecipient: userId },
        { targetAudience: 'both' },
        { targetAudience: 'broadcast' },
        { targetAudience: userRole === 'staff' ? 'all_staff' : 'all_users' },
      ],
    };

    const announcements = await Announcement.find(query).sort({ createdAt: -1 }).limit(20);

    res.json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin deletes an announcement
export const deleteAnnouncementAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    await announcement.deleteOne();
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
