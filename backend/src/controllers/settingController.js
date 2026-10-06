import Setting from '../models/Setting.js';
import { sendSystemNotification } from './notificationController.js';

// GET /api/settings - Public storefront settings
export const getPublicSettings = async (req, res) => {
  try {
    const settings = await Setting.getSettings();
    res.json({
      success: true,
      data: {
        storeName: settings.storeName,
        storeTagline: settings.storeTagline,
        storeDescription: settings.storeDescription,
        storeEmail: settings.storeEmail,
        supportEmail: settings.supportEmail,
        storePhone: settings.storePhone,
        supportPhone: settings.supportPhone,
        storeAddress: settings.storeAddress,
        returnPolicy: settings.returnPolicy,
        privacyPolicy: settings.privacyPolicy,
        termsConditions: settings.termsConditions,
        currency: settings.currency,
        shippingFee: settings.shippingFee,
        freeShippingMin: settings.freeShippingMin,
        taxRate: settings.taxRate,
        maintenanceMode: settings.maintenanceMode,
        maintenanceMessage: settings.maintenanceMessage,
        orderAcceptance: settings.orderAcceptance,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/settings - Full system settings for administrator
export const getAdminSettings = async (req, res) => {
  try {
    const settings = await Setting.getSettings();
    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/settings - Update system settings (Admin only)
export const updateAdminSettings = async (req, res) => {
  try {
    let settings = await Setting.getSettings();

    const allowedFields = [
      'storeName',
      'storeTagline',
      'storeDescription',
      'storeEmail',
      'supportEmail',
      'storePhone',
      'supportPhone',
      'storeAddress',
      'returnPolicy',
      'privacyPolicy',
      'termsConditions',
      'currency',
      'shippingFee',
      'freeShippingMin',
      'taxRate',
      'lowStockThreshold',
      'maintenanceMode',
      'maintenanceMessage',
      'orderAcceptance',
      'notifyNewOrders',
      'notifyLowStock',
      'notifyFailedPayments',
      'notifyNewUsers',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    const updated = await settings.save();

    // Log admin system configuration change
    try {
      await sendSystemNotification({
        senderUser: req.user?._id,
        recipientRole: 'admin',
        title: 'System Settings Updated',
        message: `Administrator ${req.user?.firstName || 'Admin'} updated system configurations.`,
        type: 'system_config',
        link: '/admin/settings',
      });
    } catch (_) {
      // Non-fatal notification failure
    }

    res.json({
      success: true,
      message: 'System settings updated successfully',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
