import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    // ─── STORE PROFILE ───
    storeName: {
      type: String,
      default: 'EthioShop',
      trim: true,
    },
    storeTagline: {
      type: String,
      default: "Ethiopia's Premium Online Store",
      trim: true,
    },
    storeDescription: {
      type: String,
      default:
        "EthioShop is Ethiopia's leading e-commerce platform featuring authentic handcrafted products, electronics, leather goods, and traditional apparel.",
      trim: true,
    },

    // ─── CONTACT & SUPPORT CHANNELS ───
    storeEmail: {
      type: String,
      default: 'hello@ethioshop.et',
      trim: true,
    },
    supportEmail: {
      type: String,
      default: 'support@ethioshop.et',
      trim: true,
    },
    storePhone: {
      type: String,
      default: '+251 11 234 5678',
      trim: true,
    },
    supportPhone: {
      type: String,
      default: '+251 11 900 0000',
      trim: true,
    },
    storeAddress: {
      type: String,
      default: 'Bole Atlas, Addis Ababa, Ethiopia',
      trim: true,
    },

    // ─── STORE TERMS & POLICIES ───
    returnPolicy: {
      type: String,
      default: '30-day hassle-free returns on all products except personalized or perishable items.',
      trim: true,
    },
    privacyPolicy: {
      type: String,
      default: 'We respect your privacy and handle your data in accordance with Ethiopian data protection laws.',
      trim: true,
    },
    termsConditions: {
      type: String,
      default: 'By using EthioShop, you agree to our terms and conditions of sale and service.',
      trim: true,
    },

    // ─── COMMERCE & OPERATIONS CONFIGURATION ───
    currency: {
      type: String,
      default: 'ETB',
      trim: true,
    },
    shippingFee: {
      type: Number,
      default: 150,
      min: 0,
    },
    freeShippingMin: {
      type: Number,
      default: 3000,
      min: 0,
    },
    taxRate: {
      type: Number,
      default: 15,
      min: 0,
      max: 100,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 1,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maintenanceMessage: {
      type: String,
      default: 'EthioShop is currently undergoing maintenance. We will be back shortly!',
      trim: true,
    },
    orderAcceptance: {
      type: Boolean,
      default: true,
    },

    // ─── AUTOMATED SYSTEM ALERTS PREFERENCES (ADMIN) ───
    notifyNewOrders: {
      type: Boolean,
      default: true,
    },
    notifyLowStock: {
      type: Boolean,
      default: true,
    },
    notifyFailedPayments: {
      type: Boolean,
      default: true,
    },
    notifyNewUsers: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Static method to always retrieve or initialize the single configuration document
settingSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;
