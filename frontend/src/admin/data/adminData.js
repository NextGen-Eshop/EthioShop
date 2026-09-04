// ─── Admin Seed Data ──────────────────────────────────────────────
// Rich mock data for the Admin Panel

export const adminUsers = [
  {
    id: 'u-1', name: 'Meron Abebe', email: 'meron@ethioshop.et', role: 'user',
    status: 'active', orders: 7, joined: '2024-01-15', avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: 'u-2', name: 'Daniel Haile', email: 'daniel@ethioshop.et', role: 'user',
    status: 'active', orders: 3, joined: '2024-02-20', avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: 'u-3', name: 'Selam Tesfaye', email: 'selam@ethioshop.et', role: 'user',
    status: 'inactive', orders: 1, joined: '2024-03-05', avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    id: 'u-4', name: 'Biruk Mengistu', email: 'biruk@ethioshop.et', role: 'user',
    status: 'active', orders: 12, joined: '2024-04-10', avatar: 'https://i.pravatar.cc/150?img=4',
  },
  {
    id: 'u-5', name: 'Tigist Alemu', email: 'tigist@ethioshop.et', role: 'user',
    status: 'active', orders: 5, joined: '2024-05-18', avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    id: 'u-6', name: 'Yonas Bekele', email: 'yonas@ethioshop.et', role: 'user',
    status: 'inactive', orders: 0, joined: '2024-06-02', avatar: 'https://i.pravatar.cc/150?img=6',
  },
  {
    id: 'u-7', name: 'Hana Girma', email: 'hana@ethioshop.et', role: 'user',
    status: 'active', orders: 9, joined: '2024-07-14', avatar: 'https://i.pravatar.cc/150?img=7',
  },
  {
    id: 'u-8', name: 'Abel Tadesse', email: 'abel@ethioshop.et', role: 'user',
    status: 'active', orders: 2, joined: '2024-08-01', avatar: 'https://i.pravatar.cc/150?img=8',
  },
];

export const adminStaff = [
  {
    id: 's-1', name: 'Dawit Haile', email: 'dawit@ethioshop.et', role: 'staff',
    status: 'active', products: 6, joined: '2023-11-10', avatar: 'https://i.pravatar.cc/150?img=11',
    department: 'Inventory & Fulfillment',
  },
  {
    id: 's-2', name: 'Sara Kebede', email: 'sara@ethioshop.et', role: 'staff',
    status: 'active', products: 4, joined: '2024-01-05', avatar: 'https://i.pravatar.cc/150?img=12',
    department: 'Customer Orders',
  },
  {
    id: 's-3', name: 'Abebe Bikila', email: 'abebe@ethioshop.et', role: 'staff',
    status: 'inactive', products: 0, joined: '2024-03-15', avatar: 'https://i.pravatar.cc/150?img=13',
    department: 'Logistics',
  },
  {
    id: 's-4', name: 'Lidya Worku', email: 'lidya@ethioshop.et', role: 'staff',
    status: 'active', products: 8, joined: '2024-05-22', avatar: 'https://i.pravatar.cc/150?img=14',
    department: 'Product Catalog',
  },
];

export const adminCategories = [
  { id: 'cat-2', name: 'Leather Goods', slug: 'leather-goods', products: 2, color: '#7c3aed', description: 'Handcrafted Ethiopian leather products' },
  { id: 'cat-3', name: 'Traditional Apparel', slug: 'traditional-apparel', products: 2, color: '#0369a1', description: 'Habesha traditional clothing' },
  { id: 'cat-5', name: 'Home & Craft', slug: 'home-craft', products: 2, color: '#16a34a', description: 'Traditional home decor and crafts' },
  { id: 'cat-6', name: 'Electronics', slug: 'electronics', products: 2, color: '#2563eb', description: 'Consumer electronics and accessories' },
  { id: 'cat-7', name: 'Fashion', slug: 'fashion', products: 0, color: '#db2777', description: 'Modern fashion and accessories' },
];

export const adminPayments = [
  {
    id: 'pay-1', reference: 'CHAPA-2025-00891', orderId: 'ORD-8941', customer: 'Dr. Dawit Haile',
    amount: 2210, method: 'Telebirr via Chapa', status: 'successful', date: '2025-08-15T10:42:00Z',
  },
  {
    id: 'pay-2', reference: 'CHAPA-2025-00880', orderId: 'ORD-8880', customer: 'Abebe Bikila Jr.',
    amount: 1700, method: 'CBE Birr', status: 'successful', date: '2025-08-15T09:10:00Z',
  },
  {
    id: 'pay-3', reference: 'CHAPA-2025-00790', orderId: 'ORD-7901', customer: 'Marta Bekele',
    amount: 1250, method: 'Chapa Card', status: 'pending', date: '2025-08-14T16:30:00Z',
  },
  {
    id: 'pay-4', reference: 'CHAPA-2025-00745', orderId: 'ORD-7450', customer: 'Samuel Tadesse',
    amount: 980, method: 'Telebirr via Chapa', status: 'failed', date: '2025-08-14T08:00:00Z',
  },
  {
    id: 'pay-5', reference: 'CHAPA-2025-00700', orderId: 'ORD-7001', customer: 'Helen Yonas',
    amount: 3150, method: 'CBE Birr', status: 'successful', date: '2025-08-13T11:22:00Z',
  },
  {
    id: 'pay-6', reference: 'CHAPA-2025-00680', orderId: 'ORD-6800', customer: 'Tigist Alemu',
    amount: 520, method: 'Amhara Bank', status: 'cancelled', date: '2025-08-12T14:15:00Z',
  },
];

export const adminNotifications = [
  { id: 'n-1', type: 'out_of_stock', message: '2 products are out of stock and need restocking.', time: '5m ago', read: false },
  { id: 'n-2', type: 'pending_order', message: '3 new orders are waiting for confirmation.', time: '15m ago', read: false },
  { id: 'n-3', type: 'failed_payment', message: 'Payment CHAPA-2025-00745 failed for ORD-7450.', time: '1h ago', read: false },
  { id: 'n-4', type: 'new_user', message: 'Abel Tadesse just registered as a new user.', time: '2h ago', read: true },
  { id: 'n-5', type: 'low_stock', message: '2 products have stock below threshold (Low Stock).', time: '3h ago', read: true },
  { id: 'n-6', type: 'new_user', message: 'Hana Girma just registered as a new user.', time: '1d ago', read: true },
];

export const adminSystemSettings = {
  storeName: 'EthioShop',
  storeTagline: 'Ethiopia\'s Premium Online Store',
  storeDescription: 'EthioShop is Ethiopia\'s leading e-commerce platform featuring authentic handcrafted products, technical equipment, leather goods, and traditional apparel.',
  storeEmail: 'hello@ethioshop.et',
  storePhone: '+251 11 234 5678',
  storeAddress: 'Bole Atlas, Addis Ababa, Ethiopia',
  supportEmail: 'support@ethioshop.et',
  supportPhone: '+251 11 900 0000',
  returnPolicy: '30-day hassle-free returns on all products except personalized or perishable items.',
  privacyPolicy: 'We respect your privacy and handle your data in accordance with Ethiopian data protection laws.',
  termsConditions: 'By using EthioShop, you agree to our terms and conditions of sale and service.',
  notifyNewOrders: true,
  notifyLowStock: true,
  notifyFailedPayments: true,
  notifyNewUsers: false,
};

export const salesChartData = [
  { month: 'Jan', revenue: 45000, orders: 38 },
  { month: 'Feb', revenue: 52000, orders: 45 },
  { month: 'Mar', revenue: 48000, orders: 41 },
  { month: 'Apr', revenue: 61000, orders: 55 },
  { month: 'May', revenue: 75000, orders: 68 },
  { month: 'Jun', revenue: 68000, orders: 60 },
  { month: 'Jul', revenue: 82000, orders: 74 },
  { month: 'Aug', revenue: 71000, orders: 63 },
  { month: 'Sep', revenue: 90000, orders: 82 },
  { month: 'Oct', revenue: 95000, orders: 88 },
  { month: 'Nov', revenue: 110000, orders: 99 },
  { month: 'Dec', revenue: 125000, orders: 115 },
];
