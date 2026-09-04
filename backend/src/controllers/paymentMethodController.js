import PaymentMethod from '../models/PaymentMethod.js';
import { sendSystemNotification } from './notificationController.js';

// ─── USER / PUBLIC ENDPOINT ───
// Get all approved and published payment methods for checkout
export const getPublicPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find({
      status: { $in: ['published', 'approved'] },
    }).sort({ displayOrder: 1, createdAt: 1 });

    res.json({
      success: true,
      count: paymentMethods.length,
      data: paymentMethods,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── ADMIN ENDPOINTS ───
// Get all payment methods with any status
export const getAllPaymentMethodsAdmin = async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find()
      .populate('configuredBy', 'firstName lastName email role')
      .populate('approvedBy', 'firstName lastName email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: paymentMethods.length,
      data: paymentMethods,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin creates payment method and sends to Staff
export const createPaymentMethodAdmin = async (req, res) => {
  try {
    const { name, type, accountNumber, accountName, phoneNumber, shortCode, instructions, guideSteps, logoEmoji, status } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Payment method name is required' });
    }

    const defaultSteps = [
      `Open your ${name || 'Banking/Wallet'} application.`,
      `Select Transfer / Pay and enter account number.`,
      `Verify recipient name matches EthioShop PLC.`,
      `Complete the transfer and attach transaction reference or receipt.`,
    ];

    const paymentMethod = new PaymentMethod({
      name,
      type: type || 'bank_transfer',
      accountNumber: accountNumber || '',
      accountName: accountName || 'EthioShop PLC',
      phoneNumber: phoneNumber || '',
      shortCode: shortCode || '',
      instructions: instructions || defaultSteps.map((s, i) => `${i + 1}. ${s}`).join('\n'),
      guideSteps: guideSteps && guideSteps.length > 0 ? guideSteps : defaultSteps,
      logoEmoji: logoEmoji || '🏦',
      status: status || 'sent_to_staff',
      configuredBy: undefined,
      approvedBy: status === 'published' ? req.user._id : undefined,
      statusHistory: [
        {
          status: status || 'sent_to_staff',
          changedBy: req.user._id,
          changedByName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Administrator',
          changedAt: new Date(),
          note: status === 'published' ? 'Published live on creation' : 'Created and queued for publication',
        },
      ],
    });

    const saved = await paymentMethod.save();

    // Notify Staff about new payment method assigned
    await sendSystemNotification({
      senderUser: req.user._id,
      recipientRole: 'staff',
      title: 'New Payment Method Assigned',
      message: `Admin configured "${name}" and sent to Staff for account details and publishing.`,
      type: 'system',
      link: '/staff/payments',
    });

    res.status(201).json({
      success: true,
      message: 'Payment method created and sent to Staff successfully',
      data: saved,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin updates payment method status / configuration
export const updatePaymentMethodAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentMethod = await PaymentMethod.findById(id);

    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    const {
      name,
      type,
      accountNumber,
      accountName,
      phoneNumber,
      shortCode,
      instructions,
      guideSteps,
      logoEmoji,
      status,
      rejectionReason,
      displayOrder,
    } = req.body;

    if (name) paymentMethod.name = name;
    if (type) paymentMethod.type = type;
    if (accountNumber !== undefined) paymentMethod.accountNumber = accountNumber;
    if (accountName !== undefined) paymentMethod.accountName = accountName;
    if (phoneNumber !== undefined) paymentMethod.phoneNumber = phoneNumber;
    if (shortCode !== undefined) paymentMethod.shortCode = shortCode;
    if (instructions !== undefined) paymentMethod.instructions = instructions;
    if (guideSteps !== undefined) paymentMethod.guideSteps = guideSteps;
    if (logoEmoji !== undefined) paymentMethod.logoEmoji = logoEmoji;
    if (displayOrder !== undefined) paymentMethod.displayOrder = displayOrder;

    if (status && status !== paymentMethod.status) {
      paymentMethod.status = status;
      if (status === 'approved' || status === 'published') {
        paymentMethod.approvedBy = req.user._id;
        paymentMethod.rejectionReason = '';
      } else if (status === 'rejected') {
        paymentMethod.rejectionReason = rejectionReason || 'Rejected by administrator';
      }

      paymentMethod.statusHistory = paymentMethod.statusHistory || [];
      paymentMethod.statusHistory.push({
        status,
        changedBy: req.user._id,
        changedByName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Administrator',
        changedAt: new Date(),
        note:
          status === 'published'
            ? 'Approved & published live for checkout'
            : status === 'disabled'
            ? 'Disabled and archived to payment method history'
            : status === 'pending_approval'
            ? 'Moved to pending approval'
            : `Status changed to ${status}`,
      });
    }

    const updated = await paymentMethod.save();
    res.json({
      success: true,
      message: 'Payment method updated successfully',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin deletes payment method
export const deletePaymentMethodAdmin = async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findById(req.params.id);
    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    await paymentMethod.deleteOne();
    res.json({ success: true, message: 'Payment method deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── STAFF ENDPOINTS ───
// Staff gets payment methods for configuration & publishing
export const getStaffPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find()
      .populate('configuredBy', 'firstName lastName email role')
      .populate('approvedBy', 'firstName lastName email role')
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      count: paymentMethods.length,
      data: paymentMethods,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Staff configures payment method with required details and publishes it
export const configurePaymentMethodStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountNumber, accountName, phoneNumber, shortCode, instructions, guideSteps, publishNow, status } = req.body;

    const paymentMethod = await PaymentMethod.findById(id);
    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    if (accountNumber !== undefined) paymentMethod.accountNumber = accountNumber;
    if (accountName !== undefined) paymentMethod.accountName = accountName;
    if (phoneNumber !== undefined) paymentMethod.phoneNumber = phoneNumber;
    if (shortCode !== undefined) paymentMethod.shortCode = shortCode;
    if (instructions !== undefined) paymentMethod.instructions = instructions;
    if (guideSteps !== undefined) paymentMethod.guideSteps = guideSteps;

    paymentMethod.configuredBy = req.user._id;

    if (publishNow) {
      paymentMethod.status = 'published';
      paymentMethod.statusHistory = paymentMethod.statusHistory || [];
      paymentMethod.statusHistory.push({
        status: 'published',
        changedBy: req.user._id,
        changedByName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Staff',
        changedAt: new Date(),
        note: 'Published live for users by Staff',
      });

      // Notify Admin that Staff published a payment method
      await sendSystemNotification({
        senderUser: req.user._id,
        recipientRole: 'admin',
        title: 'Payment Method Published',
        message: `Staff ${req.user.firstName || ''} ${req.user.lastName || ''} published payment method "${paymentMethod.name}".`,
        type: 'payment_method_published',
        link: '/admin/payments',
      });
    } else if (status && status !== paymentMethod.status) {
      paymentMethod.status = status;
      paymentMethod.statusHistory = paymentMethod.statusHistory || [];
      paymentMethod.statusHistory.push({
        status,
        changedBy: req.user._id,
        changedByName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Staff',
        changedAt: new Date(),
        note: status === 'disabled' ? 'Moved to history / archived by Staff' : `Status updated to ${status} by Staff`,
      });
    }

    const updated = await paymentMethod.save();
    res.json({
      success: true,
      message: publishNow
        ? `Payment method "${paymentMethod.name}" has been published and is now live for users.`
        : `Payment method details saved.`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
