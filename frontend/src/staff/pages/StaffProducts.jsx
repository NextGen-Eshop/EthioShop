import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Plus,
  Search,
  X,
  Check,
  AlertTriangle,
  Edit2,
  Trash2,
  Upload,
  Link as LinkIcon,
  ImageIcon,
  MapPin,
  Tag,
  DollarSign,
  Layers,
  Sparkles,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { useStaffStore } from '../store/staffStore';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import CustomSelect from '../../components/ui/CustomSelect';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const normalizeDbProduct = (p) => ({
  id: p._id || p.id,
  name: p.name,
  category: p.category,
  price: Number(p.price) || 0,
  originalPrice: Number(p.originalPrice) || Number(p.price) || 0,
  stock: Number(p.countInStock !== undefined ? p.countInStock : p.stock) || 0,
  lowStockThreshold: 5,
  sku: p.sku || `SKU-${(p._id || '').toString().slice(-4).toUpperCase() || 'ITEM'}`,
  image: p.image || (Array.isArray(p.images) && p.images[0]) || '',
  description: p.description || '',
  location: p.location || 'Warehouse Addis',
  status: Number(p.countInStock !== undefined ? p.countInStock : p.stock) > 0 ? 'active' : 'out_of_stock',
});

const STATUS_TABS = [
  {
    id: 'all',
    label: 'All Products',
    icon: Package,
    color: 'indigo',
    activeBg: 'bg-[#3857d6] text-white shadow-md shadow-indigo-500/25 ring-2 ring-[#3857d6]/30',
    inactiveBg: 'bg-white text-slate-700 border-slate-200/90 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700',
    badgeActive: 'bg-white/20 text-white',
    badgeInactive: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
  },
  {
    id: 'in_stock',
    label: 'In Stock',
    icon: CheckCircle2,
    color: 'emerald',
    activeBg: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-600/30',
    inactiveBg: 'bg-white text-slate-700 border-slate-200/90 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700',
    badgeActive: 'bg-white/20 text-white',
    badgeInactive: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  {
    id: 'low_stock',
    label: 'Low Stock',
    icon: AlertTriangle,
    color: 'amber',
    activeBg: 'bg-amber-500 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-500/30',
    inactiveBg: 'bg-white text-slate-700 border-slate-200/90 hover:border-amber-300 hover:bg-amber-50/50 hover:text-amber-700',
    badgeActive: 'bg-white/20 text-white',
    badgeInactive: 'bg-amber-50 text-amber-800 border border-amber-200',
  },
  {
    id: 'out_of_stock',
    label: 'Out of Stock',
    icon: XCircle,
    color: 'rose',
    activeBg: 'bg-rose-600 text-white shadow-md shadow-rose-500/25 ring-2 ring-rose-600/30',
    inactiveBg: 'bg-white text-slate-700 border-slate-200/90 hover:border-rose-300 hover:bg-rose-50/50 hover:text-rose-700',
    badgeActive: 'bg-white/20 text-white',
    badgeInactive: 'bg-rose-50 text-rose-700 border border-rose-200',
  },
];

// Image input component supporting both local file upload and URL with preview
function ProductImageInput({ imageUrl, setImageUrl }) {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  const [inputMode, setInputMode] = useState('file'); // 'file' | 'url'
  const fileInputRef = useRef(null);
  const [previewError, setPreviewError] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageUrl(ev.target.result);
      setPreviewError(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-3">
      {/* Mode Switcher */}
      <div className={`flex items-center gap-1 p-1 rounded-xl w-fit ${
        isDark ? 'bg-[#151828]' : 'bg-slate-100'
      }`}>
        {[
          { id: 'file', label: 'Upload Local File', icon: Upload },
          { id: 'url', label: 'Image URL', icon: LinkIcon },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setInputMode(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              inputMode === id
                ? isDark
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-purple-600 shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="h-3 w-3" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Mode 1: Local File Drag & Drop / Upload */}
      {inputMode === 'file' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <motion.div
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group ${
              isDark
                ? 'border-white/15 hover:border-purple-500 bg-[#161a30] hover:bg-[#1b203d]'
                : 'border-slate-300 hover:border-purple-600 bg-slate-50 hover:bg-purple-50/30'
            }`}
          >
            <div className={`p-2 rounded-xl shadow-2xs group-hover:scale-105 transition-transform ${
              isDark ? 'bg-[#1e2344] text-purple-400' : 'bg-white text-purple-600'
            }`}>
              <Upload className="h-5 w-5" />
            </div>
            <span className={`text-xs font-bold transition-colors ${
              isDark ? 'text-slate-200 group-hover:text-purple-300' : 'text-slate-700 group-hover:text-purple-600'
            }`}>
              Click to browse product photo from computer
            </span>
            <span className="text-[10px] text-slate-400">PNG, JPG, WebP · Max 5MB</span>
          </motion.div>
        </div>
      )}

      {/* Mode 2: URL Input */}
      {inputMode === 'url' && (
        <div className="relative">
          <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="url"
            value={imageUrl && !imageUrl.startsWith('data:') ? imageUrl : ''}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setPreviewError(false);
            }}
            placeholder="https://images.unsplash.com/photo-..."
            className={`w-full h-10 pl-10 pr-3.5 rounded-xl border text-xs font-mono focus:outline-none transition-all ${
              isDark
                ? 'bg-[#181c33] border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500'
                : 'border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-purple-600'
            }`}
          />
        </div>
      )}

      {/* Live Image Preview Banner */}
      <AnimatePresence>
        {imageUrl && !previewError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs"
          >
            <img
              src={imageUrl}
              alt="Product preview"
              className="w-full h-40 object-cover"
              onError={() => setPreviewError(true)}
            />
            <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-between text-white">
              <span className="text-[11px] font-bold flex items-center gap-1">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                Image Preview Ready
              </span>
              <button
                type="button"
                onClick={() => {
                  setImageUrl('');
                  setPreviewError(false);
                }}
                className="px-2 py-1 rounded-lg bg-black/50 hover:bg-black/80 text-[11px] font-bold backdrop-blur-xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                <span>Remove</span>
              </button>
            </div>
          </motion.div>
        )}

        {imageUrl && previewError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Image could not be loaded from provided URL.</span>
            </div>
            <button
              type="button"
              onClick={() => setImageUrl('')}
              className="text-rose-700 hover:underline text-[11px] font-bold"
            >
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function StaffProducts() {
  const [searchParams] = useSearchParams();
  const { user: authUser } = useAuthStore();
  const { categories } = useStaffStore();
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get('filter') === 'low_stock' ? 'low_stock' : 'all'
  );

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(searchParams.get('new') === '1');
  const [editingProduct, setEditingProduct] = useState(null);

  // Quick inline stock editing
  const [quickStockId, setQuickStockId] = useState(null);
  const [quickStockValue, setQuickStockValue] = useState(0);

  // Form State
  const initialForm = {
    name: '',
    category: categories[0] || 'Electronics',
    price: '',
    originalPrice: '',
    stock: '',
    lowStockThreshold: '5',
    sku: '',
    image: '',
    description: '',
    location: '',
  };

  const [formData, setFormData] = useState(initialForm);

  const updateField = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));

  const fetchStaffProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/staff/products`, {
        headers: {
          Authorization: `Bearer ${authUser?.accessToken}`,
        },
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const normalized = json.data.map(normalizeDbProduct);
          setProducts(normalized);
          useStaffStore.setState({ products: normalized });
        }
      }
    } catch (err) {
      console.error('Failed to fetch real staff products:', err);
    } finally {
      setLoading(false);
    }
  }, [authUser?.accessToken]);

  useEffect(() => {
    fetchStaffProducts();
  }, [fetchStaffProducts]);

  // Computed counts
  const lowStockCount = products.filter(
    (p) => p.stock <= (p.lowStockThreshold || 5) && p.stock > 0
  ).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchSearch =
        !q ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q));

      const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;

      let matchStatus = true;
      if (statusFilter === 'in_stock') matchStatus = p.stock > (p.lowStockThreshold || 5);
      if (statusFilter === 'low_stock') matchStatus = p.stock <= (p.lowStockThreshold || 5) && p.stock > 0;
      if (statusFilter === 'out_of_stock') matchStatus = p.stock === 0;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const openAddModal = () => {
    setFormData({
      ...initialForm,
      sku: `SKU-${Date.now().toString().slice(-4)}`,
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice || '',
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold || 5,
      sku: product.sku,
      image: product.image,
      description: product.description || '',
      location: product.location || '',
    });
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingProduct(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || formData.stock === '') {
      alert('Please fill in product name, price, and stock count.');
      return;
    }

    try {
      if (editingProduct) {
        await Promise.all([
          fetch(`${API_URL}/api/staff/products/${editingProduct.id}/stock`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authUser?.accessToken}`,
            },
            credentials: 'include',
            body: JSON.stringify({
              countInStock: Number(formData.stock),
              price: Number(formData.price),
              originalPrice: Number(formData.originalPrice) || Number(formData.price),
            }),
          }),
          fetch(`${API_URL}/api/admin/products/${editingProduct.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authUser?.accessToken}`,
            },
            credentials: 'include',
            body: JSON.stringify({
              name: formData.name,
              category: formData.category,
              description: formData.description,
              image: formData.image || editingProduct.image,
              location: formData.location,
              countInStock: Number(formData.stock),
              price: Number(formData.price),
            }),
          }),
        ]);
      } else {
        await fetch(`${API_URL}/api/admin/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authUser?.accessToken}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            name: formData.name,
            category: formData.category || 'electronics',
            price: Number(formData.price),
            originalPrice: Number(formData.originalPrice) || Number(formData.price),
            countInStock: Number(formData.stock),
            description: formData.description,
            image: formData.image,
            location: formData.location,
          }),
        });
      }
      await fetchStaffProducts();
    } catch (err) {
      console.error('Failed to save staff product:', err);
    } finally {
      closeModal();
    }
  };

  const handleQuickStockSave = async (id, val) => {
    try {
      const count = Math.max(0, Number(val) || 0);
      await fetch(`${API_URL}/api/staff/products/${id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authUser?.accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ countInStock: count }),
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, stock: count, status: count > 0 ? 'active' : 'out_of_stock' } : p
        )
      );
      useStaffStore.getState().updateStock?.(id, count);
    } catch (err) {
      console.error('Failed to update stock:', err);
    } finally {
      setQuickStockId(null);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (confirm(`Delete "${name}"? This action cannot be undone.`)) {
      try {
        await fetch(`${API_URL}/api/admin/products/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${authUser?.accessToken}`,
          },
          credentials: 'include',
        });
        await fetchStaffProducts();
      } catch (err) {
        console.error('Failed to delete product:', err);
      }
    }
  };

  const categoryFilterOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map((c) => ({ value: c, label: c })),
  ];

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Staff Product Inventory</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isDark ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
            }`}>
              {products.length} Products Cataloged
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage your personal inventory, upload product images, set storage warehouse locations, and adjust prices.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openAddModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Product</span>
        </motion.button>
      </div>

      {/* ── Filter Tabs & Search Controls ── */}
      <div className="space-y-3">
        {/* Status Filter Tabs with Rich Color Themes, Icons, and Easing Animations */}
        <div className="flex flex-wrap items-center gap-2.5">
          {STATUS_TABS.map((tab) => {
            const Icon = tab.icon;
            const count =
              tab.id === 'all'
                ? products.length
                : tab.id === 'in_stock'
                ? products.filter((p) => p.stock > (p.lowStockThreshold || 5)).length
                : tab.id === 'low_stock'
                ? lowStockCount
                : outOfStockCount;

            const isActive = statusFilter === tab.id;

            return (
              <motion.button
                key={tab.id}
                whileHover={{ y: -2, scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                onClick={() => setStatusFilter(tab.id)}
                className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer border ${
                  isActive
                    ? 'text-white border-transparent'
                    : isDark
                    ? 'bg-[#0f1222] text-slate-300 border-[#1b1f38] hover:border-pink-500/40 hover:bg-pink-500/10 hover:text-pink-200'
                    : 'bg-white text-slate-700 border-slate-200/90 hover:border-pink-300 hover:bg-pink-50/50 hover:text-pink-700'
                }`}
                style={
                  isActive
                    ? {
                        background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
                        boxShadow: '0 0 20px rgba(236, 72, 153, 0.45), 0 2px 10px rgba(244, 63, 94, 0.35)',
                      }
                    : undefined
                }
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'opacity-70'}`} />
                <span>{tab.label}</span>
                <motion.span
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.15 }}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-black tracking-tight ${
                    isActive ? 'bg-white/25 text-white' : isDark ? 'bg-slate-800 text-slate-300 border border-slate-700/50' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {count}
                </motion.span>
              </motion.button>
            );
          })}
        </div>

        {/* Search & Category — compact right-aligned row */}
        <div className="flex items-center gap-2 justify-end">
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className={`w-full h-9 pl-9 pr-8 rounded-full border text-xs focus:outline-none transition-all shadow-xs ${
                isDark
                  ? 'bg-[#151828] border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500'
                  : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-purple-600'
              }`}
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="w-44">
            <CustomSelect value={categoryFilter} onChange={setCategoryFilter} options={categoryFilterOptions} />
          </div>
        </div>
      </div>

      {/* ── Products Table ── */}
      <div className={`rounded-2xl overflow-hidden border shadow-xs ${
        isDark ? 'bg-[#0f1222] border-[#1b1f38]' : 'bg-white border-slate-200/90'
      }`}>
        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-12 text-center space-y-3"
          >
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mx-auto ${
              isDark ? 'bg-[#151828] text-slate-400' : 'bg-slate-100 text-slate-400'
            }`}>
              <Package className="h-7 w-7" />
            </div>
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>No matching products found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search criteria or create a new product for your catalog.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-xs hover:bg-purple-700 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Product</span>
            </motion.button>
          </motion.div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                isDark ? 'bg-[#14182c] border-[#1b1f38] text-slate-400' : 'bg-slate-50/90 border-slate-100 text-slate-400'
              }`}>
                <tr>
                  <th className="px-4 py-3.5">Product</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Storage Location</th>
                  <th className="px-4 py-3.5">Price</th>
                  <th className="px-4 py-3.5">Stock</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-[#1b1f38]' : 'divide-slate-100'}`}>
                {filteredProducts.map((product, idx) => {
                  const isOut = product.stock === 0;
                  const isLow = product.stock <= (product.lowStockThreshold || 5) && !isOut;

                  return (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className={`group transition-colors ${
                        isOut
                          ? isDark ? 'bg-rose-950/20 hover:bg-rose-950/30' : 'bg-rose-50/30 hover:bg-rose-50/60'
                          : isLow
                          ? isDark ? 'bg-amber-950/20 hover:bg-amber-950/30' : 'bg-amber-50/25 hover:bg-amber-50/50'
                          : isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Product Title & Image */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`h-12 w-12 rounded-xl overflow-hidden shrink-0 border ${
                            isDark ? 'bg-[#151828] border-white/10' : 'bg-slate-100 border-slate-100'
                          }`}>
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="min-w-0 max-w-[190px]">
                            <p className={`font-bold truncate leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>{product.name}</p>
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5">{product.sku}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ${
                          isDark ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {product.category}
                        </span>
                      </td>

                      {/* Storage Location */}
                      <td className="px-4 py-3.5">
                        {product.location ? (
                          <div className={`flex items-center gap-1.5 max-w-[150px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            <MapPin className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                            <span className="truncate text-[11px] font-semibold">{product.location}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">—</span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3.5">
                        <p className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>ETB {product.price.toLocaleString()}</p>
                        {product.originalPrice > product.price && (
                          <p className="text-[10px] text-slate-400 line-through">
                            ETB {product.originalPrice.toLocaleString()}
                          </p>
                        )}
                      </td>

                      {/* Stock with Quick Inline Update */}
                      <td className="px-4 py-3.5">
                        {quickStockId === product.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={quickStockValue}
                              onChange={(e) => setQuickStockValue(e.target.value)}
                              className="w-16 h-7 text-xs text-center border border-purple-500 rounded-lg bg-slate-800 text-white font-bold focus:outline-none"
                              min="0"
                              autoFocus
                            />
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                handleQuickStockSave(product.id, quickStockValue);
                              }}
                              className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 cursor-pointer shadow-2xs"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setQuickStockId(null)}
                              className="h-7 w-7 rounded-lg bg-slate-700 text-slate-300 flex items-center justify-center hover:bg-slate-600 cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                            </motion.button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-black ${
                                isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : isDark ? 'text-slate-200' : 'text-slate-800'
                              }`}
                            >
                              {product.stock} units
                            </span>
                            <button
                              onClick={() => {
                                setQuickStockId(product.id);
                                setQuickStockValue(product.stock);
                              }}
                              className={`px-1.5 py-0.5 text-[10px] font-bold rounded border transition-colors opacity-0 group-hover:opacity-100 cursor-pointer ${
                                isDark
                                  ? 'text-purple-300 bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/30'
                                  : 'text-indigo-600 bg-indigo-50 border-indigo-100 hover:bg-indigo-100'
                              }`}
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {isOut ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isDark ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                            Low Stock (≤{product.lowStockThreshold || 5})
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isDark ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                            Available
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openEditModal(product)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              isDark ? 'border-white/10 text-slate-300 hover:text-purple-400 hover:bg-white/10' : 'border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
                            }`}
                            title="Edit Product"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              isDark ? 'border-white/10 text-slate-300 hover:text-rose-400 hover:bg-rose-500/20' : 'border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title="Delete Product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Product Modal ── */}
      <AnimatePresence>
        {(isAddModalOpen || editingProduct) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            >
              <div
                className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border ${
                  isDark ? 'bg-[#121526] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className={`flex items-center justify-between p-5 border-b ${
                  isDark ? 'border-white/10 bg-[#16192e]' : 'border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/30'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                      <Package className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {editingProduct ? 'Edit Catalog Product' : 'Add New Staff Product'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {editingProduct ? 'Update product info & inventory' : 'Assign product to your staff catalog'}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={closeModal}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleFormSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                  {/* 1. Product Name */}
                  <div>
                    <label className={`block font-bold mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Product Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="e.g. Digital Precision Multimeter & Diagnostic Kit"
                      className={`w-full h-10 px-3.5 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${
                        isDark
                          ? 'bg-[#181c33] border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500'
                          : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-purple-600'
                      }`}
                    />
                  </div>

                  {/* 2. Category & SKU */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <CustomSelect
                        label="Category *"
                        value={formData.category}
                        onChange={(v) => updateField('category', v)}
                        options={categories}
                      />
                    </div>
                    <div>
                      <label className={`block font-bold mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>SKU / Code</label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => updateField('sku', e.target.value)}
                        placeholder="YRG-500"
                        className={`w-full h-10 px-3.5 rounded-xl border text-xs font-mono focus:outline-none transition-all ${
                          isDark
                            ? 'bg-[#181c33] border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500'
                            : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-purple-600'
                        }`}
                      />
                    </div>
                  </div>

                  {/* 3. Pricing */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block font-bold mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Selling Price (ETB) *</label>
                      <input
                        type="number"
                        required
                        value={formData.price}
                        onChange={(e) => updateField('price', e.target.value)}
                        placeholder="680"
                        min="1"
                        className={`w-full h-10 px-3.5 rounded-xl border text-xs font-bold focus:outline-none transition-all ${
                          isDark
                            ? 'bg-[#181c33] border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500'
                            : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-purple-600'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block font-bold mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Original / MSRP Price (ETB)</label>
                      <input
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => updateField('originalPrice', e.target.value)}
                        placeholder="750"
                        className={`w-full h-10 px-3.5 rounded-xl border text-xs focus:outline-none transition-all ${
                          isDark
                            ? 'bg-[#181c33] border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500'
                            : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-purple-600'
                        }`}
                      />
                    </div>
                  </div>

                  {/* 4. Stock Count & Threshold */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block font-bold mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Stock Quantity *</label>
                      <input
                        type="number"
                        required
                        value={formData.stock}
                        onChange={(e) => updateField('stock', e.target.value)}
                        placeholder="25"
                        min="0"
                        className={`w-full h-10 px-3.5 rounded-xl border text-xs font-bold focus:outline-none transition-all ${
                          isDark
                            ? 'bg-[#181c33] border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500'
                            : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-purple-600'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block font-bold mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Low-Stock Alert Level</label>
                      <input
                        type="number"
                        value={formData.lowStockThreshold}
                        onChange={(e) => updateField('lowStockThreshold', e.target.value)}
                        placeholder="5"
                        min="1"
                        className={`w-full h-10 px-3.5 rounded-xl border text-xs focus:outline-none transition-all ${
                          isDark
                            ? 'bg-[#181c33] border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500'
                            : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-purple-600'
                        }`}
                      />
                    </div>
                  </div>

                  {/* 5. Product Location / Place */}
                  <div>
                    <label className={`block font-bold mb-1.5 flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      <MapPin className="h-3.5 w-3.5 text-purple-400" />
                      <span>Product Location / Storage Place</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => updateField('location', e.target.value)}
                      placeholder="e.g. Addis Ababa Warehouse · Section B, Shelf 4"
                      className={`w-full h-10 px-3.5 rounded-xl border text-xs font-medium focus:outline-none transition-all ${
                        isDark
                          ? 'bg-[#181c33] border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500'
                          : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-purple-600'
                      }`}
                    />
                  </div>

                  {/* 6. Product Image */}
                  <div>
                    <label className={`block font-bold mb-1.5 flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      <ImageIcon className="h-3.5 w-3.5 text-purple-400" />
                      <span>Product Image (File Upload or URL)</span>
                    </label>
                    <ProductImageInput
                      imageUrl={formData.image}
                      setImageUrl={(v) => updateField('image', v)}
                    />
                  </div>

                  {/* 7. Description */}
                  <div>
                    <label className={`block font-bold mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Product Description</label>
                    <textarea
                      rows="3"
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="Specialty notes, craftsmanship, materials, dimensions..."
                      className={`w-full p-3 rounded-xl border text-xs focus:outline-none transition-all resize-none ${
                        isDark
                          ? 'bg-[#181c33] border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500'
                          : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-purple-600'
                      }`}
                    />
                  </div>

                  {/* Modal Actions */}
                  <div className={`flex justify-end gap-2 pt-3 border-t sticky bottom-0 pb-1 ${
                    isDark ? 'border-white/10 bg-[#121526]' : 'border-slate-100 bg-white'
                  }`}>
                    <button
                      type="button"
                      onClick={closeModal}
                      className={`px-4 py-2.5 rounded-xl border font-bold transition-colors cursor-pointer ${
                        isDark ? 'border-white/10 text-slate-300 hover:bg-white/10' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/25 transition-colors cursor-pointer"
                    >
                      {editingProduct ? 'Save Changes' : 'Create Product'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
