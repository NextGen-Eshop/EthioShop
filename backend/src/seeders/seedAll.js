import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';
import PaymentMethod from '../models/PaymentMethod.js';
import Promotion from '../models/Promotion.js';
import Order from '../models/Order.js';

dotenv.config();

const usersData = [
  {
    firstName: 'Admin',
    lastName: 'EthioShop',
    email: 'admin@ethioshop.com',
    passwordHash: 'Admin@123456',
    role: 'admin',
  },
  {
    firstName: 'Sara',
    lastName: 'Haile (Staff)',
    email: 'staff@ethioshop.com',
    passwordHash: 'Staff@123456',
    role: 'staff',
  },
  {
    firstName: 'Abebe',
    lastName: 'Bikila',
    email: 'user@ethioshop.com',
    passwordHash: 'User@123456',
    role: 'user',
  },
];

// Short 0.7s high-quality optimized looping video clips & smooth micro-animation video URLs
const SHORT_VIDEOS = {
  headphones: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-woman-putting-on-headphones-40014-small.mp4',
  smartwatch: 'https://assets.mixkit.co/videos/preview/mixkit-smartwatch-on-a-persons-wrist-40019-small.mp4',
  sneakers: 'https://assets.mixkit.co/videos/preview/mixkit-person-fastening-their-sneakers-40024-small.mp4',
  jacket: 'https://assets.mixkit.co/videos/preview/mixkit-woman-modeling-a-leather-jacket-40030-small.mp4',
  coffee: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-coffee-into-a-cup-40026-small.mp4',
  camera: 'https://assets.mixkit.co/videos/preview/mixkit-photographer-adjusting-a-camera-lens-40038-small.mp4',
};

const productsData = [
  // ── ELECTRONICS ──
  {
    name: 'Apple MacBook Pro 16" (M3 Max 36GB / 1TB Space Black)',
    category: 'electronics',
    description: 'Pro workstation laptop powered by the revolutionary M3 Max chip with 14-core CPU and 30-core GPU. Liquid Retina XDR display with 1600 nits peak brightness and up to 22 hours battery life.',
    price: 285000,
    originalPrice: 310000,
    countInStock: 8,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&q=80',
    rating: 5.0,
    reviewsCount: 36,
    salesCount: 85,
    badge: 'Pro Silicon',
    isFeatured: true,
    isSuperDeal: true,
    features: ['Apple M3 Max 14-Core CPU', 'Liquid Retina XDR ProMotion 120Hz', '36GB Unified Fast RAM', 'Up to 22 Hours Battery Life'],
    specs: [
      { label: 'Screen', value: '16.2" Liquid Retina XDR 3456x2234' },
      { label: 'Memory', value: '36GB Unified Memory' },
      { label: 'Storage', value: '1TB Superfast NVMe SSD' },
    ],
  },
  {
    name: 'Apple iPhone 15 Pro Max (256GB Titanium)',
    category: 'electronics',
    description: 'Flagship iPhone with Aerospace-grade titanium design, A17 Pro chip with 6-core GPU, 48MP main camera system with 5x optical zoom, and Action button.',
    price: 145000,
    originalPrice: 160000,
    countInStock: 18,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
    rating: 4.9,
    reviewsCount: 42,
    salesCount: 120,
    badge: 'Best Seller',
    isFeatured: true,
    isSuperDeal: true,
    features: ['Aerospace Titanium Body', 'A17 Pro 3nm Silicon', '48MP 5x Optical Zoom', 'All-Day 29h Battery'],
    specs: [
      { label: 'Display', value: '6.7" Super Retina XDR OLED' },
      { label: 'Storage', value: '256GB NVMe' },
      { label: 'Weight', value: '221g' },
    ],
  },
  {
    name: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
    category: 'electronics',
    description: 'Industry-leading noise canceling with two processors and 8 microphones. Ultra-comfortable lightweight design with soft fit leather and 30-hour battery life.',
    price: 34000,
    originalPrice: 39000,
    countInStock: 15,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    shortVideoUrl: SHORT_VIDEOS.headphones,
    rating: 4.8,
    reviewsCount: 65,
    salesCount: 210,
    badge: 'Popular',
    isFeatured: true,
    isSuperDeal: true,
    features: ['Active Noise Cancellation', '30-Hour Battery Life', 'Multipoint Connection', 'High-Res Audio Wireless'],
    specs: [
      { label: 'Driver Unit', value: '30mm Carbon Fiber' },
      { label: 'Bluetooth', value: 'v5.2 LDAC' },
      { label: 'Weight', value: '250g' },
    ],
  },
  {
    name: 'Samsung Galaxy S24 Ultra 5G (512GB Titanium Gray)',
    category: 'electronics',
    description: 'Next-generation Galaxy AI phone featuring built-in S Pen stylus, 200MP Quad Telephoto Camera, Snapdragon 8 Gen 3 processor, and 6.8-inch Dynamic AMOLED 2X display.',
    price: 138000,
    originalPrice: 152000,
    countInStock: 14,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80',
    shortVideoUrl: SHORT_VIDEOS.smartwatch,
    rating: 4.8,
    reviewsCount: 38,
    salesCount: 95,
    badge: 'New',
    isFeatured: true,
    isSuperDeal: false,
    features: ['Galaxy AI Built-in', '200MP Nightography Camera', 'Embedded S-Pen', 'Corning Gorilla Armor Glass'],
    specs: [
      { label: 'Screen', value: '6.8" 120Hz AMOLED 2600 nits' },
      { label: 'Battery', value: '5000mAh 45W Fast Charge' },
    ],
  },
  {
    name: 'Apple Watch Ultra 2 (GPS + Cellular Titanium 49mm)',
    category: 'electronics',
    description: 'The ultimate sports and adventure watch. 49mm aerospace titanium case, precision dual-frequency GPS, up to 36 hours of battery life, and 3000-nit display.',
    price: 78000,
    originalPrice: 85000,
    countInStock: 8,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    shortVideoUrl: SHORT_VIDEOS.smartwatch,
    rating: 4.9,
    reviewsCount: 27,
    salesCount: 52,
    badge: 'Pro Gear',
    isFeatured: true,
    isSuperDeal: false,
    features: ['S9 SiP Chip with Double Tap', 'Dual-Frequency GPS', '100m Water Resistance', 'Depth Gauge & Oceanic+ App'],
    specs: [
      { label: 'Case Size', value: '49mm Titanium' },
      { label: 'Display Brightness', value: '3000 nits OLED' },
    ],
  },

  // ── FASHION ──
  {
    name: 'Habesha Traditional Handwoven Kemis (Modern Dress)',
    category: 'fashion',
    description: 'Handmade Ethiopian traditional pure cotton Habesha Kemis with intricate colorful Tibeb embroidery along the hem and neckline. Tailored for special occasions and weddings.',
    price: 18500,
    originalPrice: 22000,
    countInStock: 20,
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80',
    shortVideoUrl: SHORT_VIDEOS.jacket,
    rating: 4.9,
    reviewsCount: 56,
    salesCount: 180,
    badge: 'Handmade',
    isFeatured: true,
    isSuperDeal: true,
    features: ['100% Shemane Handwoven Cotton', 'Golden Thread Tibeb Pattern', 'Custom Fit Options', 'Includes Matching Netela Shawl'],
    specs: [
      { label: 'Material', value: 'Ethiopian Organic Cotton (Shema)' },
      { label: 'Care', value: 'Hand wash / Gentle dry clean' },
    ],
  },
  {
    name: 'Men Premium Ethiopian Leather Bomber Jacket',
    category: 'fashion',
    description: 'Mastercrafted from genuine Ethiopian highland sheepskin leather. Butter-soft texture, heavy-duty YKK brass zippers, quilted silk lining, and tailored athletic fit.',
    price: 14200,
    originalPrice: 16800,
    countInStock: 12,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
    shortVideoUrl: SHORT_VIDEOS.jacket,
    rating: 4.8,
    reviewsCount: 33,
    salesCount: 88,
    badge: 'Pure Leather',
    isFeatured: true,
    isSuperDeal: false,
    features: ['100% Genuine Highland Leather', 'Heavy-Duty Brass Hardware', 'Dual Interior Pockets', 'Ribbed Elastic Trim'],
    specs: [
      { label: 'Leather Type', value: 'Full Grain Ethiopian Sheepskin' },
      { label: 'Lining', value: 'Quilted Polyester & Silk' },
    ],
  },
  {
    name: 'Nike Air Max 270 React Running Shoes',
    category: 'fashion',
    description: 'Iconic sneaker merging Nike Air cushioning with soft React foam for exceptional all-day bounce and supreme street style aesthetics.',
    price: 9500,
    originalPrice: 11000,
    countInStock: 25,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    shortVideoUrl: SHORT_VIDEOS.sneakers,
    rating: 4.7,
    reviewsCount: 81,
    salesCount: 310,
    badge: 'Top Rated',
    isFeatured: false,
    isSuperDeal: true,
    features: ['Large 270 Max Air Unit', 'Nike React Foam Technology', 'Lightweight Layered Upper', 'Full Rubber Outsole'],
    specs: [
      { label: 'Weight', value: '310g' },
      { label: 'Colorway', value: 'Habanero Red / Black' },
    ],
  },

  // ── HOME & LIVING ──
  {
    name: 'Authentic Traditional Jebena Clay Coffee Ceremony Set',
    category: 'home',
    description: 'Complete 16-piece authentic Ethiopian coffee ceremony set including clay Jebena kettle, wooden Rekebot tray, hand-painted Cini cups, and Frankincense burner.',
    price: 6800,
    originalPrice: 8200,
    countInStock: 30,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
    shortVideoUrl: SHORT_VIDEOS.coffee,
    rating: 4.9,
    reviewsCount: 94,
    salesCount: 420,
    badge: 'Cultural Choice',
    isFeatured: true,
    isSuperDeal: true,
    features: ['Heat-Resistant Black Pottery Jebena', '6 Porcelain Cini Cups with Saucers', 'Carved Hardwood Rekebot Table', 'Girgira Clay Incense Burner'],
    specs: [
      { label: 'Pieces Included', value: '16 Pieces Complete Set' },
      { label: 'Origin', value: 'Handmade in Gojjam & Jimma' },
    ],
  },
  {
    name: 'DeLonghi Magnifica S Automatic Espresso & Coffee Maker',
    category: 'home',
    description: 'Bean-to-cup professional espresso machine with integrated burr grinder, manual milk frother for rich cappuccinos, and customizable aroma strength.',
    price: 62000,
    originalPrice: 69000,
    countInStock: 9,
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80',
    shortVideoUrl: SHORT_VIDEOS.coffee,
    rating: 4.8,
    reviewsCount: 22,
    salesCount: 45,
    badge: 'Pro Quality',
    isFeatured: false,
    isSuperDeal: false,
    features: ['15-Bar Pressure Pump', '13 Adjustable Grinder Settings', 'Twin Shot Brewing', 'Rapid Cappuccino System'],
    specs: [
      { label: 'Water Tank', value: '1.8 Liters' },
      { label: 'Bean Capacity', value: '250g' },
    ],
  },

  // ── BEAUTY & WELLNESS ──
  {
    name: 'Raw Ethiopian Shea Butter & Korerima Organic Hair Butter',
    category: 'beauty',
    description: '100% natural, cold-pressed unrefined organic butter infused with wild-harvested Ethiopian korerima and black seed oil for deep moisture and scalp nourishment.',
    price: 1650,
    originalPrice: 2000,
    countInStock: 65,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80',
    shortVideoUrl: SHORT_VIDEOS.sneakers,
    rating: 4.8,
    reviewsCount: 78,
    salesCount: 390,
    badge: 'Organic 100%',
    isFeatured: true,
    isSuperDeal: true,
    features: ['Chemical-Free Cold-Pressed', 'Enriched with Black Seed (Tikur Azmud)', 'Promotes Healthy Hair Growth', 'Deep Skin Hydration'],
    specs: [
      { label: 'Volume', value: '250ml Jar' },
      { label: 'Scent', value: 'Natural Herbal & Cardamom' },
    ],
  },
  {
    name: 'Dior Sauvage Eau de Parfum (100ml)',
    category: 'beauty',
    description: 'A powerful noble fragrance with radiant freshness from Reggio di Calabria Bergamot and the sensual woody amber trail of Ambroxan.',
    price: 16500,
    originalPrice: 18500,
    countInStock: 14,
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80',
    shortVideoUrl: SHORT_VIDEOS.jacket,
    rating: 4.9,
    reviewsCount: 47,
    salesCount: 160,
    badge: 'Luxury',
    isFeatured: false,
    isSuperDeal: false,
    features: ['Calabrian Bergamot', 'Papua New Guinean Vanilla Extract', 'Long-Lasting 12+ Hour Sillage', 'Refillable Spray Bottle'],
    specs: [
      { label: 'Concentration', value: 'Eau de Parfum' },
      { label: 'Volume', value: '100ml / 3.4 oz' },
    ],
  },

  // ── SPORTS & FITNESS ──
  {
    name: 'Garmin Forerunner 965 GPS Running Smartwatch',
    category: 'sports',
    description: 'Premium lightweight GPS running and triathlon smartwatch with bright 1.4" AMOLED touchscreen, built-in full-color mapping, and advanced training readiness metrics.',
    price: 54000,
    originalPrice: 59000,
    countInStock: 7,
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80',
    shortVideoUrl: SHORT_VIDEOS.smartwatch,
    rating: 4.9,
    reviewsCount: 19,
    salesCount: 42,
    badge: 'Marathon Pro',
    isFeatured: true,
    isSuperDeal: false,
    features: ['1.4" Brilliant AMOLED Display', 'Multi-Band GPS with SatIQ', 'Full-Color Topo Maps', 'Up to 23 Days Battery Life'],
    specs: [
      { label: 'Lens Material', value: 'Corning Gorilla Glass DX' },
      { label: 'Water Rating', value: '5 ATM' },
    ],
  },

  // ── BOOKS & STATIONERY ──
  {
    name: 'Fikir Eske Mekabir (ፍቅር እስከ መቃብር) - Deluxe Collector Edition',
    category: 'books',
    description: 'The monumental Ethiopian literary masterpiece by Haddis Alemayehu. Deluxe hardbound gold-embossed edition exploring the eternal love story of Bezabih and Seblewongel.',
    price: 1200,
    originalPrice: 1500,
    countInStock: 50,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80',
    shortVideoUrl: SHORT_VIDEOS.camera,
    rating: 5.0,
    reviewsCount: 120,
    salesCount: 650,
    badge: 'Masterpiece',
    isFeatured: true,
    isSuperDeal: true,
    features: ['Gold-Embossed Hardcover', 'Complete Unabridged Original Text', 'Foreword by Renowned Scholars', 'Archival Acid-Free Paper'],
    specs: [
      { label: 'Language', value: 'Amharic (አማርኛ)' },
      { label: 'Pages', value: '540 Pages Hardcover' },
    ],
  },
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is missing in .env');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    // 1. Seed Users
    console.log('Seeding Users...');
    const createdUsers = [];
    for (const u of usersData) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = await User.create(u);
        console.log(`Created user: ${u.email} (${u.role})`);
      } else {
        user.role = u.role;
        user.firstName = u.firstName;
        user.lastName = u.lastName;
        user.passwordHash = u.passwordHash;
        await user.save();
        console.log(`Updated user: ${u.email} (${u.role})`);
      }
      createdUsers.push(user);
    }

    const adminUser = createdUsers.find((u) => u.role === 'admin');
    const staffUser = createdUsers.find((u) => u.role === 'staff');

    // 2. Seed Products
    console.log('Seeding Products...');
    await Product.deleteMany({});
    const createdProducts = [];
    for (const p of productsData) {
      const prod = await Product.create({
        ...p,
        createdBy: adminUser._id,
        isActive: true,
      });
      createdProducts.push(prod);
    }
    console.log(`Successfully seeded ${createdProducts.length} real products.`);

    // 3. Seed Payment Methods (Admin created & Staff configured)
    console.log('Seeding Payment Methods...');
    await PaymentMethod.deleteMany({});
    const paymentMethodsData = [
      {
        name: 'Senke Bank',
        type: 'bank_transfer',
        accountNumber: '3000 8921 4455 10',
        accountName: 'EthioShop PLC (Senke Bank Account)',
        shortCode: 'SENKE-8921',
        instructions: 'Open your Senke Bank mobile app or visit any Senke Bank branch. Transfer the exact order total to Account 3000 8921 4455 10 and attach the reference/screenshot.',
        logoEmoji: '🏛️',
        status: 'published', // Approved & Published to users
        configuredBy: staffUser._id,
        approvedBy: adminUser._id,
        displayOrder: 1,
      },
      {
        name: 'Telebirr',
        type: 'mobile_wallet',
        accountNumber: '+251 911 234 567',
        accountName: 'EthioShop Enterprise (Telebirr Merchant)',
        shortCode: '987654',
        instructions: 'Open your Telebirr app or dial *127#. Choose "Pay Merchant" (Shortcode 987654) or send to 0911234567, complete payment and provide transaction ID.',
        logoEmoji: '📱',
        status: 'published', // Approved & Published
        configuredBy: staffUser._id,
        approvedBy: adminUser._id,
        displayOrder: 2,
      },
      {
        name: 'Commercial Bank of Ethiopia (CBE)',
        type: 'bank_transfer',
        accountNumber: '1000 4589 12345',
        accountName: 'EthioShop Trading PLC',
        shortCode: '',
        instructions: 'Transfer via CBE Mobile Banking or CBE Birr to Account 1000458912345. Verify account name is "EthioShop Trading PLC".',
        logoEmoji: '🏦',
        status: 'published', // Approved & Published
        configuredBy: staffUser._id,
        approvedBy: adminUser._id,
        displayOrder: 3,
      },
      {
        name: 'Awash Bank',
        type: 'bank_transfer',
        accountNumber: '0132 0891 2450 00',
        accountName: 'EthioShop E-Commerce Solutions',
        shortCode: '',
        instructions: 'Use Awash Birr or Awash Mobile App. Transfer to Account 0132 0891 2450 00 and upload the digital confirmation slip.',
        logoEmoji: '🏛️',
        status: 'published',
        configuredBy: staffUser._id,
        approvedBy: adminUser._id,
        displayOrder: 4,
      },
      {
        name: 'Bank of Abyssinia (BOA)',
        type: 'bank_transfer',
        accountNumber: '8765 4321 0987 11',
        accountName: 'EthioShop Solutions',
        shortCode: '',
        instructions: 'Transfer to BOA Account 87654321098711 via Apollo app or mobile banking.',
        logoEmoji: '💳',
        status: 'pending_approval', // Pending approval for demoing Staff/Admin approval workflow
        configuredBy: staffUser._id,
        displayOrder: 5,
      },
    ];

    const createdPaymentMethods = await PaymentMethod.insertMany(paymentMethodsData);
    console.log(`Seeded ${createdPaymentMethods.length} payment methods.`);

    // 4. Seed Promotions / Discounts
    console.log('Seeding Promotions...');
    await Promotion.deleteMany({});
    const now = new Date();
    const tenDaysLater = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const activePromoProducts = createdProducts.slice(0, 4).map((p) => p._id);
    const pendingPromoProducts = createdProducts.slice(4, 7).map((p) => p._id);

    const promotionsData = [
      {
        title: 'New Year Grand Festival Discount',
        description: 'Exclusive 20% discount celebration on flagship electronics and handcrafted traditional cultural items.',
        products: activePromoProducts,
        discountType: 'percentage',
        discountValue: 20,
        startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // Started 2 days ago
        endDate: tenDaysLater,
        status: 'published', // Approved and Published
        proposedBy: staffUser._id,
        approvedBy: adminUser._id,
      },
      {
        title: 'Weekend Spring Flash Promo',
        description: 'Proposed 15% discount on premium leather and fashion apparel submitted by Staff for review.',
        products: pendingPromoProducts,
        discountType: 'percentage',
        discountValue: 15,
        startDate: now,
        endDate: thirtyDaysLater,
        status: 'pending_approval', // Pending Admin approval
        proposedBy: staffUser._id,
      },
    ];

    const createdPromotions = await Promotion.insertMany(promotionsData);
    console.log(`Seeded ${createdPromotions.length} promotions.`);

    console.log('\n=========================================');
    console.log(' DATABASE SEEDING COMPLETED SUCCESSFULLY! ');
    console.log('=========================================');
    console.log('Test Accounts:');
    console.log(' Admin:  admin@ethioshop.com  / Admin@123456');
    console.log(' Staff:  staff@ethioshop.com  / Staff@123456');
    console.log(' User:   user@ethioshop.com   / User@123456');
    console.log('=========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
