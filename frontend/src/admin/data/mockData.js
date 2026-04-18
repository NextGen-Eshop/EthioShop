export const products = [
  {
    id: 1,
    name: 'Wireless Headphones',
    category: 'Electronics',
    price: 1200,
    originalPrice: 1450,
    stock: 12,
    image: 'https://via.placeholder.com/50',
    description: 'Noise-cancelling over-ear headphones with 30-hour battery life.',
    superDeal: true,
  },
  {
    id: 2,
    name: 'Smart Watch Pro',
    category: 'Wearables',
    price: 1850,
    originalPrice: 2100,
    stock: 7,
    image: 'https://via.placeholder.com/50',
    description: 'Fitness tracking smartwatch with heart rate and GPS monitoring.',
    superDeal: false,
  },
  {
    id: 3,
    name: 'Office Chair Elite',
    category: 'Furniture',
    price: 2640,
    originalPrice: 2890,
    stock: 0,
    image: 'https://via.placeholder.com/50',
    description: 'Ergonomic office chair designed for all-day comfort and support.',
    superDeal: false,
  },
  {
    id: 4,
    name: 'Portable Speaker',
    category: 'Audio',
    price: 980,
    originalPrice: 1190,
    stock: 24,
    image: 'https://via.placeholder.com/50',
    description: 'Compact Bluetooth speaker with deep bass and splash resistance.',
    superDeal: true,
  },
];

export const orders = [
  {
    id: 'ORD-001',
    customer: 'John Doe',
    phone: '+251 91 234 5678',
    city: 'Addis Ababa',
    total: 2400,
    status: 'pending',
  },
  {
    id: 'ORD-002',
    customer: 'Marta Bekele',
    phone: '+251 92 555 7890',
    city: 'Bahir Dar',
    total: 1850,
    status: 'paid',
  },
  {
    id: 'ORD-003',
    customer: 'Samuel Tadesse',
    phone: '+251 93 778 1122',
    city: 'Hawassa',
    total: 980,
    status: 'shipped',
  },
  {
    id: 'ORD-004',
    customer: 'Helen Yonas',
    phone: '+251 94 335 2244',
    city: 'Adama',
    total: 3150,
    status: 'delivered',
  },
];

export const users = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@test.com',
    role: 'admin',
  },
  {
    id: 2,
    name: 'Meron Abebe',
    email: 'meron@test.com',
    role: 'user',
  },
  {
    id: 3,
    name: 'Daniel Haile',
    email: 'daniel@test.com',
    role: 'user',
  },
];

export const productCategories = ['Electronics', 'Wearables', 'Furniture', 'Audio', 'Fashion', 'Home'];

export const orderStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

export const userRoles = ['admin', 'user'];
