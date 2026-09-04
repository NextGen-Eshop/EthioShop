import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import PaymentMethod from '../models/PaymentMethod.js';
import Promotion from '../models/Promotion.js';

dotenv.config();

// 1. Existing User-page products from frontend/src/data/products.js
const userPageProducts = [
  {
    name: 'Wireless Noise-Cancelling Headphones',
    category: 'electronics',
    price: 1200,
    originalPrice: 1450,
    rating: 4.8,
    reviewsCount: 124,
    countInStock: 12,
    badge: 'Best Seller',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
    ],
    description: 'Premium noise-cancelling over-ear headphones with 30-hour battery life, deep bass, and crystal-clear audio. Perfect for music lovers and professionals.',
    features: ['Active Noise Cancellation', '30-Hour Battery', 'Bluetooth 5.2', 'Built-in Microphone', 'Foldable Design'],
    specs: [
      { label: 'Driver Size', value: '40mm' },
      { label: 'Frequency', value: '20Hz - 20kHz' },
      { label: 'Battery', value: '30 hours' },
      { label: 'Weight', value: '250g' },
    ],
    shippingFee: 150,
    isFreeShipping: false,
  },
  {
    name: 'Smart Watch Pro Max',
    category: 'electronics',
    price: 1850,
    originalPrice: 2100,
    rating: 4.6,
    reviewsCount: 89,
    countInStock: 7,
    badge: 'New',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=800&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80',
    ],
    description: 'Advanced fitness tracking smartwatch with heart rate monitoring, GPS, SpO2, and a stunning AMOLED display. Stay connected in style.',
    features: ['Heart Rate Monitor', 'GPS Tracking', 'SpO2 Sensor', 'AMOLED Display', 'Water Resistant IP68'],
    specs: [
      { label: 'Display', value: '1.4" AMOLED' },
      { label: 'Battery', value: '7 days' },
      { label: 'Water Rating', value: 'IP68' },
      { label: 'Weight', value: '45g' },
    ],
    shippingFee: 150,
    isFreeShipping: false,
  },
  {
    name: 'Premium Leather Backpack',
    category: 'fashion',
    price: 2640,
    originalPrice: 2890,
    rating: 4.9,
    reviewsCount: 56,
    countInStock: 5,
    badge: 'Limited',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
      'https://images.unsplash.com/photo-1622560480654-996b3d12fb35?w=800&q=80',
    ],
    description: 'Handcrafted genuine leather backpack with padded laptop compartment. Timeless design meets modern functionality for the urban professional.',
    features: ['Genuine Leather', 'Laptop Compartment', 'Multiple Pockets', 'YKK Zippers', 'Adjustable Straps'],
    specs: [
      { label: 'Material', value: 'Full-grain Leather' },
      { label: 'Capacity', value: '25L' },
      { label: 'Laptop Size', value: 'Up to 15.6"' },
      { label: 'Weight', value: '1.2kg' },
    ],
    shippingFee: 0,
    isFreeShipping: true,
  },
  {
    name: 'Portable Bluetooth Speaker',
    category: 'electronics',
    price: 980,
    originalPrice: 1190,
    rating: 4.5,
    reviewsCount: 203,
    countInStock: 24,
    badge: 'Hot Deal',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80',
    ],
    description: '360-degree immersive sound with punchy bass, IPX7 waterproof rating, and 20 hours of playtime. Take your music anywhere.',
    features: ['360° Sound', 'IPX7 Waterproof', '20-Hour Battery', 'PartyBoost Mode', 'Compact Design'],
    specs: [
      { label: 'Output Power', value: '20W' },
      { label: 'Battery', value: '4800mAh (20 hrs)' },
      { label: 'Bluetooth', value: '5.1' },
      { label: 'Weight', value: '540g' },
    ],
    shippingFee: 150,
    isFreeShipping: false,
  },
  {
    name: 'Minimalist Desk Lamp',
    category: 'home',
    price: 750,
    originalPrice: 890,
    rating: 4.7,
    reviewsCount: 45,
    countInStock: 18,
    badge: '',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80',
    ],
    description: 'Modern LED desk lamp with adjustable color temperatures, touch brightness control, and built-in wireless charging pad for your devices.',
    features: ['Touch Control', '3 Color Modes', 'Wireless Charging', 'Eye-Care LED', 'Aluminum Body'],
    specs: [
      { label: 'Power', value: '12W LED' },
      { label: 'Color Temp', value: '3000K - 6000K' },
      { label: 'Wireless Output', value: '10W Max' },
      { label: 'Material', value: 'Anodized Aluminum' },
    ],
    shippingFee: 150,
    isFreeShipping: false,
  },
  {
    name: 'Running Shoes Ultra',
    category: 'sports',
    price: 1580,
    originalPrice: 1850,
    rating: 4.8,
    reviewsCount: 167,
    countInStock: 15,
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80',
    ],
    description: 'Ultra-lightweight performance running shoes with responsive foam cushioning, breathable mesh upper, and durable grip outsole.',
    features: ['Responsive Cushioning', 'Breathable Mesh', 'Anti-Slip Sole', 'Lightweight Design', 'Reflective Accents'],
    specs: [
      { label: 'Weight', value: '230g (Size 42)' },
      { label: 'Drop', value: '8mm' },
      { label: 'Closure', value: 'Lace-up' },
      { label: 'Upper', value: 'Engineered Mesh' },
    ],
    shippingFee: 150,
    isFreeShipping: false,
  },
  {
    name: 'Organic Face Serum',
    category: 'beauty',
    price: 650,
    originalPrice: 780,
    rating: 4.9,
    reviewsCount: 98,
    countInStock: 30,
    badge: 'Natural',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
      'https://images.unsplash.com/photo-1608248597359-07f23a9d20c7?w=800&q=80',
    ],
    description: 'Pure vitamin C & hyaluronic acid serum. Brightens skin, reduces fine lines, and delivers deep 24-hour hydration. 100% cruelty-free.',
    features: ['100% Organic', 'Vitamin C + Hyaluronic', 'Anti-Aging Formula', 'Cruelty Free', 'Dermatologist Tested'],
    specs: [
      { label: 'Volume', value: '30ml / 1 fl oz' },
      { label: 'Skin Type', value: 'All skin types' },
      { label: 'Key Ingredients', value: 'Vitamin C, HA, Vitamin E' },
      { label: 'Origin', value: 'Made in Ethiopia' },
    ],
    shippingFee: 150,
    isFreeShipping: false,
  },
  {
    name: 'Ceramic Coffee Set',
    category: 'home',
    price: 1100,
    originalPrice: 1300,
    rating: 4.7,
    reviewsCount: 72,
    countInStock: 8,
    badge: 'Handmade',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&q=80',
    ],
    description: 'Artisanal handcrafted ceramic coffee pot and 6 matching cups. Traditional Ethiopian design crafted by master potters with natural glazes.',
    features: ['Handcrafted Clay', 'Includes 6 Cups + Pot', 'Natural Mineral Glaze', 'Traditional Pattern', 'Heat Resistant'],
    specs: [
      { label: 'Pieces', value: '7 (1 Pot + 6 Cups)' },
      { label: 'Pot Capacity', value: '800ml' },
      { label: 'Material', value: 'Earthenware Clay' },
      { label: 'Crafted In', value: 'Addis Ababa' },
    ],
    shippingFee: 150,
    isFreeShipping: false,
  },
  {
    name: 'Apple iPad Pro 12.9" M2 (256GB Wi-Fi Space Gray)',
    category: 'electronics',
    price: 125000,
    originalPrice: 135000,
    rating: 4.9,
    reviewsCount: 54,
    countInStock: 6,
    badge: 'Apple M2',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80',
    ],
    description: '12.9-inch Liquid Retina XDR display with ProMotion, Apple M2 chip, 12MP Wide and 10MP Ultra Wide back cameras, LiDAR Scanner.',
    features: ['Apple M2 Chip', 'Liquid Retina XDR Display', 'ProMotion 120Hz', 'Thunderbolt Port', 'Apple Pencil Hover'],
    specs: [
      { label: 'Screen', value: '12.9" Liquid Retina XDR' },
      { label: 'Storage', value: '256GB' },
      { label: 'Chip', value: 'Apple M2 8-core CPU' },
    ],
    shippingFee: 0,
    isFreeShipping: true,
  },
  {
    name: 'Dell XPS 15 OLED (Core i9 13th Gen, 32GB RAM, RTX 4070)',
    category: 'electronics',
    price: 265000,
    originalPrice: 285000,
    rating: 4.8,
    reviewsCount: 29,
    countInStock: 4,
    badge: 'Creator Beast',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80',
    ],
    description: '15.6" 3.5K OLED InfinityEdge touch display, Intel Core i9-13900H, 32GB DDR5, 1TB SSD, NVIDIA GeForce RTX 4070 8GB GDDR6.',
    features: ['3.5K OLED Touch Display', 'Intel Core i9-13900H', 'NVIDIA RTX 4070 GPU', 'CNC Machined Aluminum'],
    specs: [
      { label: 'Display', value: '15.6" 3.5K (3456x2160) OLED' },
      { label: 'Memory', value: '32GB DDR5 4800MHz' },
      { label: 'Storage', value: '1TB PCIe NVMe SSD' },
    ],
    shippingFee: 0,
    isFreeShipping: true,
  },
];

// 2. Existing Staff-page products from frontend/src/staff/data/staffData.js
const staffPageProducts = [
  {
    name: 'Digital Precision Multimeter & Diagnostic Kit',
    category: 'Electronics',
    price: 3450,
    originalPrice: 3800,
    countInStock: 18,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80',
    description: 'High-accuracy digital multimeter with true RMS auto-ranging and temperature probe for electrical diagnostic workflows.',
    rating: 4.9,
    reviewsCount: 65,
    shippingFee: 150,
    isFreeShipping: false,
  },
  {
    name: 'Handcrafted Menelik Leather Messenger Bag',
    category: 'Leather Goods',
    price: 3450,
    originalPrice: 3800,
    countInStock: 4,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
    description: '100% full-grain Ethiopian calfskin leather bag tailored by Addis artisans with brass hardware.',
    rating: 4.8,
    reviewsCount: 38,
    shippingFee: 0,
    isFreeShipping: true,
  },
  {
    name: 'Traditional Habesha Kemis Handwoven Dress',
    category: 'Traditional Apparel',
    price: 4900,
    originalPrice: 5500,
    countInStock: 2,
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80',
    description: 'Pure organic Shemma cotton woven with intricate Tilet patterns on collar and hemline.',
    rating: 5.0,
    reviewsCount: 42,
    shippingFee: 0,
    isFreeShipping: true,
  },
  {
    name: 'Laser Distance Meter & Optical Rangefinder (100m)',
    category: 'Electronics',
    price: 4800,
    originalPrice: 5400,
    countInStock: 0,
    image: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?w=600&q=80',
    description: 'Professional handheld 100-meter laser distance meter with ±1.5mm precision and multi-unit calculation for engineering and surveying.',
    rating: 4.7,
    reviewsCount: 19,
    shippingFee: 150,
    isFreeShipping: false,
  },
  {
    name: 'Traditional Clay Jebena Coffee Pot',
    category: 'Home & Craft',
    price: 850,
    originalPrice: 950,
    countInStock: 9,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80',
    description: 'Black clay handcrafted coffee brewing pot designed for traditional Ethiopian Buna ceremonies.',
    rating: 4.8,
    reviewsCount: 51,
    shippingFee: 150,
    isFreeShipping: false,
  },
  {
    name: 'Addis Minimalist Leather Cardholder',
    category: 'Leather Goods',
    price: 720,
    originalPrice: 850,
    countInStock: 0,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80',
    description: 'Sleek 4-slot pocket cardholder made with vegetable-tanned Ethiopian leather.',
    rating: 4.6,
    reviewsCount: 27,
    shippingFee: 150,
    isFreeShipping: false,
  },
];

// 3. Existing Payment Methods
const existingPaymentMethods = [
  {
    name: 'Telebirr',
    type: 'mobile_wallet',
    accountNumber: '+251 91 123 4567',
    accountHolder: 'EthioShop E-Commerce PLC',
    instructions: 'Send money to our official Telebirr merchant number. Input order ID in the reference note.',
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Telebirr_logo.png',
    isActive: true,
    isDefault: true,
  },
  {
    name: 'Commercial Bank of Ethiopia (CBE)',
    type: 'bank_transfer',
    accountNumber: '1000234567891',
    accountHolder: 'EthioShop E-Commerce PLC',
    instructions: 'Transfer via CBE Mobile Banking or in-branch deposit. Use your order ID as payment reason.',
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Commercial_Bank_of_Ethiopia_logo.png',
    isActive: true,
    isDefault: false,
  },
  {
    name: 'Awash Bank',
    type: 'bank_transfer',
    accountNumber: '01304567891200',
    accountHolder: 'EthioShop E-Commerce PLC',
    instructions: 'Transfer to our Awash Bank account and enter your order number in description.',
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Awash_Bank_logo.png',
    isActive: true,
    isDefault: false,
  },
  {
    name: 'Bank of Abyssinia (BOA)',
    type: 'bank_transfer',
    accountNumber: '89123456',
    accountHolder: 'EthioShop E-Commerce PLC',
    instructions: 'Transfer using BOA mobile app or ATM transfer. Reference order ID.',
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Bank_of_Abyssinia_logo.png',
    isActive: true,
    isDefault: false,
  },
  {
    name: 'Chapa (Cards / Wallets)',
    type: 'chapa',
    accountNumber: 'CHAPA-MERCHANT-01',
    accountName: 'EthioShop Store',
    instructions: 'Pay directly via Visa, MasterCard, or Ethiopian digital wallets through Chapa secure checkout.',
    iconUrl: 'https://chapa.co/favicon.ico',
    status: 'published',
  },
  {
    name: 'Cash on Delivery (COD)',
    type: 'cash_on_delivery',
    accountNumber: 'COD-ADDIS',
    accountName: 'Courier Hand-to-Hand',
    instructions: 'Pay cash or local mobile transfer to courier upon package inspection at your delivery address.',
    iconUrl: '',
    status: 'published',
  },
];

async function syncMissingData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for data check & sync.');

    // ── Check & Sync User Page Products ──
    console.log('\n--- Checking User Page Products ---');
    for (const prod of userPageProducts) {
      const existing = await Product.findOne({ name: prod.name });
      if (existing) {
        console.log(`[EXISTS] Product already in DB: "${prod.name}" (ID: ${existing._id})`);
      } else {
        const created = await Product.create({
          ...prod,
          category: prod.category.toLowerCase(),
          isActive: true,
        });
        console.log(`[SAVED] Saved missing User product: "${prod.name}" (ID: ${created._id})`);
      }
    }

    // ── Check & Sync Staff Page Products ──
    console.log('\n--- Checking Staff Page Products ---');
    for (const prod of staffPageProducts) {
      const existing = await Product.findOne({ name: prod.name });
      if (existing) {
        console.log(`[EXISTS] Staff product already in DB: "${prod.name}" (ID: ${existing._id})`);
      } else {
        const created = await Product.create({
          ...prod,
          category: prod.category.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-'),
          isActive: true,
        });
        console.log(`[SAVED] Saved missing Staff product: "${prod.name}" (ID: ${created._id})`);
      }
    }

    // ── Check & Sync Payment Methods ──
    console.log('\n--- Checking Payment Methods ---');
    for (const pm of existingPaymentMethods) {
      const existing = await PaymentMethod.findOne({
        $or: [{ name: pm.name }, { type: pm.type, accountNumber: pm.accountNumber }],
      });
      if (existing) {
        console.log(`[EXISTS] Payment Method already in DB: "${pm.name}" (ID: ${existing._id})`);
      } else {
        const created = await PaymentMethod.create(pm);
        console.log(`[SAVED] Saved missing Payment Method: "${pm.name}" (ID: ${created._id})`);
      }
    }

    console.log('\n--- Sync Finished Successfully ---');
    console.log('Total Products now in DB:', await Product.countDocuments());
    console.log('Total Payment Methods now in DB:', await PaymentMethod.countDocuments());

    process.exit(0);
  } catch (err) {
    console.error('Error during data sync:', err);
    process.exit(1);
  }
}

syncMissingData();
