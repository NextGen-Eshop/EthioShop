// Unified product categories used across User, Staff, and Admin portals
// Category IDs must match the values stored in MongoDB product documents

export const CATEGORIES = [
  { id: 'all', label: 'All Categories', icon: '🏪' },
  { id: 'electronics', label: 'Electronics', icon: '📱' },
  { id: 'fashion', label: 'Fashion', icon: '👗' },
  { id: 'home', label: 'Home & Living', icon: '🏠' },
  { id: 'beauty', label: 'Beauty & Personal Care', icon: '💄' },
  { id: 'sports', label: 'Sports & Outdoors', icon: '⚽' },
  { id: 'books', label: 'Books & Education', icon: '📚' },
  { id: 'traditional-apparel', label: 'Traditional Apparel', icon: '🧵' },
  { id: 'leather-goods', label: 'Leather Goods', icon: '👜' },
  { id: 'home-craft', label: 'Home Craft', icon: '🎨' },
];

// Category IDs only (for dropdowns and filters)
export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

// Lookup by id
export const getCategoryLabel = (id) => {
  const found = CATEGORIES.find((c) => c.id === id);
  return found ? found.label : id;
};

export const getCategoryIcon = (id) => {
  const found = CATEGORIES.find((c) => c.id === id);
  return found ? found.icon : '🏷️';
};

export default CATEGORIES;
