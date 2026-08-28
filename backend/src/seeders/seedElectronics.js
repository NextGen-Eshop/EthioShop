import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

const electronicsProducts = [
  // ── PHONES ──
  {
    name: 'Apple iPhone 15 Pro Max (256GB Titanium)',
    category: 'electronics',
    description: 'Flagship iPhone with Aerospace-grade titanium design, A17 Pro chip with 6-core GPU, 48MP main camera system with 5x telephoto optical zoom, Action button, and all-day battery life.',
    price: 145000,
    originalPrice: 160000,
    countInStock: 18,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
    rating: 4.9,
    reviewsCount: 42,
    salesCount: 120,
    isSuperDeal: true,
    isActive: true,
  },
  {
    name: 'Samsung Galaxy S24 Ultra 5G (512GB Titanium Gray)',
    category: 'electronics',
    description: 'Next-generation Galaxy AI phone featuring built-in S Pen stylus, 200MP Quad Telephoto Camera, Snapdragon 8 Gen 3 processor, and 6.8-inch Dynamic AMOLED 2X flat display.',
    price: 138000,
    originalPrice: 152000,
    countInStock: 14,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80',
    rating: 4.8,
    reviewsCount: 38,
    salesCount: 95,
    isSuperDeal: false,
    isActive: true,
  },
  {
    name: 'Google Pixel 8 Pro (128GB Obsidian)',
    category: 'electronics',
    description: 'Engineered by Google with the Tensor G3 chip, advanced computational AI photography, 50MP triple rear camera system with Macro Focus, and 24+ hour adaptive battery.',
    price: 98000,
    originalPrice: 110000,
    countInStock: 10,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80',
    rating: 4.7,
    reviewsCount: 29,
    salesCount: 64,
    isSuperDeal: true,
    isActive: true,
  },
  {
    name: 'Xiaomi Redmi Note 13 Pro+ 5G (256GB Midnight Black)',
    category: 'electronics',
    description: 'High-performance smartphone with 200MP OIS camera, 1.5K 120Hz curved AMOLED display, MediaTek Dimensity 7200-Ultra, and 120W HyperCharge (0 to 100% in 19 mins).',
    price: 46000,
    originalPrice: 52000,
    countInStock: 25,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
    rating: 4.6,
    reviewsCount: 54,
    salesCount: 140,
    isSuperDeal: false,
    isActive: true,
  },

  // ── TABLETS ──
  {
    name: 'Apple iPad Pro 12.9-inch (M2 Chip, 256GB Wi-Fi Space Gray)',
    category: 'electronics',
    description: 'Pro-grade tablet with Liquid Retina XDR display with ProMotion 120Hz and True Tone, Apple M2 8-core CPU and 10-core GPU, Apple Pencil 2 hover support, and Thunderbolt port.',
    price: 125000,
    originalPrice: 139000,
    countInStock: 8,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80',
    rating: 4.9,
    reviewsCount: 31,
    salesCount: 52,
    isSuperDeal: true,
    isActive: true,
  },
  {
    name: 'Samsung Galaxy Tab S9 Ultra (14.6" Dynamic AMOLED 2X)',
    category: 'electronics',
    description: 'Massive 14.6-inch flagship Android tablet with Snapdragon 8 Gen 2, included S Pen with low latency, IP68 water & dust resistance, quad AKG speakers, and Samsung DeX desktop mode.',
    price: 118000,
    originalPrice: 132000,
    countInStock: 6,
    image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80',
    rating: 4.8,
    reviewsCount: 22,
    salesCount: 40,
    isSuperDeal: false,
    isActive: true,
  },
  {
    name: 'Apple iPad Air (5th Gen, M1 Chip, 64GB Blue)',
    category: 'electronics',
    description: 'Versatile and lightweight 10.9-inch Liquid Retina tablet powered by Apple M1 chip, 12MP Ultra Wide front camera with Center Stage, and Touch ID built into top button.',
    price: 68000,
    originalPrice: 75000,
    countInStock: 16,
    image: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800&q=80',
    rating: 4.7,
    reviewsCount: 45,
    salesCount: 88,
    isSuperDeal: false,
    isActive: true,
  },

  // ── PCs & LAPTOPS ──
  {
    name: 'Apple MacBook Pro 16" (M3 Max Chip, 36GB RAM, 1TB SSD Space Black)',
    category: 'electronics',
    description: 'Ultimate powerhouse workstation laptop with 16-core CPU, 40-core GPU, Liquid Retina XDR display (1600 nits peak brightness), 22-hour battery life, and complete pro port connectivity.',
    price: 345000,
    originalPrice: 375000,
    countInStock: 5,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
    rating: 5.0,
    reviewsCount: 19,
    salesCount: 28,
    isSuperDeal: false,
    isActive: true,
  },
  {
    name: 'Dell XPS 15 OLED (Intel Core i9 13th Gen, 32GB RAM, RTX 4070, 1TB SSD)',
    category: 'electronics',
    description: 'Premium creator laptop with 3.5K 15.6-inch OLED InfinityEdge touchscreen, NVIDIA GeForce RTX 4070 graphics, CNC machined aluminum chassis, and quad-speaker studio sound.',
    price: 265000,
    originalPrice: 289000,
    countInStock: 7,
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80',
    rating: 4.8,
    reviewsCount: 27,
    salesCount: 45,
    isSuperDeal: true,
    isActive: true,
  },
  {
    name: 'Lenovo Legion Pro 7 Gaming Laptop (AMD Ryzen 9 7945HX, RTX 4080, 32GB RAM)',
    category: 'electronics',
    description: 'Elite gaming rig with 16-inch WQXGA 240Hz IPS display with 500 nits, Coldfront 5.0 vapor chamber cooling, Legion TrueStrike RGB keyboard, and 1TB NVMe Gen4 SSD.',
    price: 240000,
    originalPrice: 265000,
    countInStock: 4,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80',
    rating: 4.9,
    reviewsCount: 35,
    salesCount: 60,
    isSuperDeal: false,
    isActive: true,
  },
  {
    name: 'Apple MacBook Air 15" (M2 Chip, 16GB Unified RAM, 512GB SSD Starlight)',
    category: 'electronics',
    description: 'Impossibly thin 11.5mm design with spacious 15.3-inch Liquid Retina display, fanless silent operation, 1080p FaceTime HD camera, MagSafe 3 charging, and 18-hour battery.',
    price: 155000,
    originalPrice: 172000,
    countInStock: 11,
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80',
    rating: 4.8,
    reviewsCount: 49,
    salesCount: 110,
    isSuperDeal: true,
    isActive: true,
  },

  // ── WEARABLES & AUDIO & ACCESSORIES ──
  {
    name: 'Apple Watch Ultra 2 (49mm Titanium, GPS + Cellular Ocean Band)',
    category: 'electronics',
    description: 'The most rugged and capable Apple Watch for endurance athletes, outdoor adventurers, and water sports with S9 SiP chip, 3000-nit display, precision dual-frequency GPS, and 72-hour Low Power mode.',
    price: 88000,
    originalPrice: 98000,
    countInStock: 12,
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80',
    rating: 4.9,
    reviewsCount: 36,
    salesCount: 75,
    isSuperDeal: false,
    isActive: true,
  },
  {
    name: 'Sony WH-1000XM5 Wireless Industry-Leading Noise-Canceling Headphones',
    category: 'electronics',
    description: 'Two processors and 8 microphones for unprecedented noise canceling, Auto NC Optimizer, 30-hour battery life with quick charging, crystal clear hands-free calling, and multipoint connection.',
    price: 42000,
    originalPrice: 48000,
    countInStock: 20,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    rating: 4.8,
    reviewsCount: 68,
    salesCount: 155,
    isSuperDeal: true,
    isActive: true,
  },
  {
    name: 'Apple AirPods Pro (2nd Generation with USB-C MagSafe Case)',
    category: 'electronics',
    description: 'Active Noise Cancellation up to 2x more than predecessor, Adaptive Audio, Transparency mode, Personalized Spatial Audio with dynamic head tracking, and dust, sweat, and water resistance.',
    price: 28500,
    originalPrice: 32000,
    countInStock: 30,
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=80',
    rating: 4.8,
    reviewsCount: 82,
    salesCount: 210,
    isSuperDeal: false,
    isActive: true,
  },
  {
    name: 'Anker Prime 20,000mAh 200W High-Speed Power Bank',
    category: 'electronics',
    description: 'Ultra-compact 3-port power bank with 200W total output, smart digital display showing power/charging times, 100W rapid recharge, and active temp monitoring for laptops and phones.',
    price: 13500,
    originalPrice: 16000,
    countInStock: 35,
    image: 'https://images.unsplash.com/photo-1609592424075-ef6c69420bf7?w=800&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1609592424075-ef6c69420bf7?w=800&q=80',
    rating: 4.7,
    reviewsCount: 40,
    salesCount: 98,
    isSuperDeal: false,
    isActive: true,
  },
];

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI is missing in environment variables');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected successfully.');

    for (const item of electronicsProducts) {
      const exists = await Product.findOne({ name: item.name });
      if (exists) {
        await Product.updateOne({ name: item.name }, { $set: item });
        console.log(`Updated: ${item.name}`);
      } else {
        await Product.create(item);
        console.log(`Created: ${item.name}`);
      }
    }

    console.log(`\nAll ${electronicsProducts.length} Electronics products successfully seeded into MongoDB!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err.message);
    process.exit(1);
  }
}

seed();
