import Promotion from '../models/Promotion.js';
import Product from '../models/Product.js';
import { sendSystemNotification } from './notificationController.js';

// ─── USER / PUBLIC ENDPOINT ───
// Get all currently active, approved/published promotions
export const getActivePromotions = async (req, res) => {
  try {
    const now = new Date();
    // Auto mark expired promotions
    await Promotion.updateMany(
      {
        endDate: { $lt: now },
        status: { $in: ['approved', 'published'] },
      },
      { status: 'expired' }
    );

    const promotions = await Promotion.find({
      status: { $in: ['approved', 'published'] },
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .populate('products', 'name price originalPrice image countInStock category rating')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: promotions.length,
      data: promotions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── STAFF ENDPOINTS ───
// Staff creates a discount proposal for Admin approval
export const createDiscountProposalStaff = async (req, res) => {
  try {
    const { title, description, products, discountType, discountValue, startDate, endDate } = req.body;

    if (!title || !discountValue || !startDate || !endDate) {
      return res.status(400).json({ message: 'Title, discount value, start date, and end date are required' });
    }

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const promotion = new Promotion({
      title,
      description: description || '',
      products: Array.isArray(products) ? products : [],
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: 'pending_approval', // Always requires Admin approval
      proposedBy: req.user.id,
    });

    const saved = await promotion.save();
    const populated = await Promotion.findById(saved._id)
      .populate('products', 'name price image')
      .populate('proposedBy', 'firstName lastName email');

    // Notify Admin about discount proposal
    await sendSystemNotification({
      recipientRole: 'admin',
      title: 'New Discount Proposal Submitted',
      message: `Staff ${req.user.firstName || 'Staff'} submitted discount proposal "${title}" (${discountValue}% OFF).`,
      type: 'system',
      link: '/admin/promotions',
    });

    res.status(201).json({
      success: true,
      message: 'Discount proposal submitted for Admin approval',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Staff gets all discount proposals
export const getStaffPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find()
      .populate('products', 'name price image')
      .populate('proposedBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: promotions.length,
      data: promotions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── ADMIN ENDPOINTS ───
// Admin gets all discount proposals
export const getAllPromotionsAdmin = async (req, res) => {
  try {
    const promotions = await Promotion.find()
      .populate('products', 'name price image originalPrice')
      .populate('proposedBy', 'firstName lastName email role')
      .populate('approvedBy', 'firstName lastName email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: promotions.length,
      data: promotions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin reviews discount proposal (Approve, Reject, Modify, Publish)
export const reviewPromotionAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, title, description, products, discountType, discountValue, startDate, endDate } = req.body;

    const promotion = await Promotion.findById(id);
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    if (title) promotion.title = title;
    if (description !== undefined) promotion.description = description;
    if (products) promotion.products = products;
    if (discountType) promotion.discountType = discountType;
    if (discountValue !== undefined) promotion.discountValue = Number(discountValue);
    if (startDate) promotion.startDate = new Date(startDate);
    if (endDate) promotion.endDate = new Date(endDate);

    if (status) {
      promotion.status = status;
      if (status === 'approved' || status === 'published') {
        promotion.approvedBy = req.user.id;
        promotion.rejectionReason = '';

        // If approved or published, update product originalPrice and price if not already
        if (promotion.products && promotion.products.length > 0) {
          const discountPct = promotion.discountValue / 100;
          for (const prodId of promotion.products) {
            const product = await Product.findById(prodId);
            if (product) {
              if (!product.originalPrice || product.originalPrice <= product.price) {
                product.originalPrice = product.price;
              }
              const discounted = Math.round(product.originalPrice * (1 - discountPct));
              product.price = discounted;
              product.badge = `${promotion.discountValue}% OFF`;
              product.isSuperDeal = true;
              await product.save();
            }
          }
        }
        // Notify Users about new discount
        await sendSystemNotification({
          recipientRole: 'user',
          title: `New Discount: ${promotion.title}!`,
          message: `Special promotion live now: Enjoy ${promotion.discountValue}% discount on selected items!`,
          type: 'discount_published',
          link: '/products',
        });
      } else if (status === 'rejected') {
        promotion.rejectionReason = rejectionReason || 'Proposal rejected by Admin';
      }
    }

    const updated = await promotion.save();
    const populated = await Promotion.findById(updated._id)
      .populate('products', 'name price originalPrice image')
      .populate('proposedBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: `Promotion proposal ${status}`,
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin deletes a promotion
export const deletePromotionAdmin = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    await promotion.deleteOne();
    res.json({ success: true, message: 'Promotion deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
