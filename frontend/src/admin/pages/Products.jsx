import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Search, X, Edit3, Trash2, MapPin, AlertTriangle, Loader2 } from 'lucide-react';
import { useStaffStore } from '../../staff/store/staffStore';
import { useAdminStore } from '../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const normalizeDbProduct = (p) => ({
  id: p._id || p.id,
  name: p.name,
  category: p.category,
  price: Number(p.price) || 0,
  originalPrice: Number(p.originalPrice) || Number(p.price) || 0,
  stock: Number(p.countInStock !== undefined ? p.countInStock : p.stock) || 0,
  sku: p.sku || `SKU-${(p._id || '').toString().slice(-4).toUpperCase() || 'ITEM'}`,
  image: p.image || (Array.isArray(p.images) && p.images[0]) || '',
  images: Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
  description: p.description || '',
  location: p.location || 'Warehouse Addis',
});

const LOW_THRESH = 5;

function StockBadge({ stock, isDark }) {
  if (stock === 0) {
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
          isDark ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}
      >
        Out of Stock
      </span>
    );
  }
  if (stock <= LOW_THRESH) {
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
          isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}
      >
        Low Stock ({stock})
      </span>
    );
  }
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
        isDark ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      }`}
    >
      In Stock ({stock})
    </span>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel, isDark }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className="rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 border"
        style={{
          background: isDark ? '#111522' : '#FFFFFF',
          borderColor: isDark ? '#252A3A' : '#E2E8F0',
        }}
      >
        <p className="text-sm font-semibold text-center" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors cursor-pointer"
            style={{
              borderColor: isDark ? '#252A3A' : '#E2E8F0',
              color: isDark ? '#94A3B8' : '#64748B',
              background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-sm font-semibold text-white cursor-pointer"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ProductModal({ product, onClose, onSave, isNew, categories, isDark }) {
  const [form, setForm] = useState(
    product || {
      name: '',
      category: categories[0]?.name || '',
      price: '',
      stock: '',
      description: '',
      location: '',
      image: '',
    }
  );
  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="rounded-2xl p-4 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl my-auto border"
        style={{
          background: isDark ? '#111522' : '#FFFFFF',
          borderColor: isDark ? '#252A3A' : '#E2E8F0',
        }}
      >
        <div className="flex items-center justify-between mb-6 pb-3 border-b" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
          <h3 className="text-base font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            {isNew ? 'Add Product' : 'Edit Product'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white cursor-pointer transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <label className="block col-span-2">
              <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                Product Name *
              </span>
              <input
                name="name"
                value={form.name}
                onChange={handle}
                required
                className="w-full h-10 px-3 rounded-xl border text-xs font-semibold focus:outline-none transition-all"
                style={{
                  background: isDark ? '#181c33' : '#F8FAFC',
                  borderColor: isDark ? '#252A3A' : '#E2E8F0',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                }}
              />
            </label>
            <label className="block">
              <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                Category *
              </span>
              <select
                name="category"
                value={form.category}
                onChange={handle}
                className="w-full h-10 px-3 rounded-xl border text-xs font-semibold focus:outline-none transition-all"
                style={{
                  background: isDark ? '#181c33' : '#F8FAFC',
                  borderColor: isDark ? '#252A3A' : '#E2E8F0',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                }}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name} style={{ background: isDark ? '#111522' : '#FFF' }}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                Price (ETB) *
              </span>
              <input
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handle}
                required
                className="w-full h-10 px-3 rounded-xl border text-xs font-semibold focus:outline-none transition-all"
                style={{
                  background: isDark ? '#181c33' : '#F8FAFC',
                  borderColor: isDark ? '#252A3A' : '#E2E8F0',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                }}
              />
            </label>
            <label className="block">
              <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                Stock Qty *
              </span>
              <input
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={handle}
                required
                className="w-full h-10 px-3 rounded-xl border text-xs font-semibold focus:outline-none transition-all"
                style={{
                  background: isDark ? '#181c33' : '#F8FAFC',
                  borderColor: isDark ? '#252A3A' : '#E2E8F0',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                }}
              />
            </label>
            <label className="block">
              <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                Location / Hub
              </span>
              <input
                name="location"
                value={form.location}
                onChange={handle}
                placeholder="e.g. Bole Hub · Shelf B2"
                className="w-full h-10 px-3 rounded-xl border text-xs font-semibold focus:outline-none transition-all"
                style={{
                  background: isDark ? '#181c33' : '#F8FAFC',
                  borderColor: isDark ? '#252A3A' : '#E2E8F0',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                }}
              />
            </label>
            <label className="block col-span-2">
              <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                Image URL
              </span>
              <input
                name="image"
                value={form.image}
                onChange={handle}
                placeholder="https://..."
                className="w-full h-10 px-3 rounded-xl border text-xs font-semibold focus:outline-none transition-all"
                style={{
                  background: isDark ? '#181c33' : '#F8FAFC',
                  borderColor: isDark ? '#252A3A' : '#E2E8F0',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                }}
              />
            </label>
            <label className="block col-span-2">
              <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                Description
              </span>
              <textarea
                name="description"
                value={form.description}
                onChange={handle}
                rows={3}
                className="w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none resize-none transition-all"
                style={{
                  background: isDark ? '#181c33' : '#F8FAFC',
                  borderColor: isDark ? '#252A3A' : '#E2E8F0',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                }}
              />
            </label>
          </div>
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border font-bold transition-colors cursor-pointer"
              style={{
                borderColor: isDark ? '#252A3A' : '#E2E8F0',
                color: isDark ? '#94A3B8' : '#64748B',
                background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-white font-bold transition-all shadow-md cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' }}
            >
              {isNew ? 'Add Product' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminProducts() {
  const { user: authUser } = useAuthStore();
  const { categories } = useAdminStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/products`, {
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
          // also sync to staffStore
          useStaffStore.setState({ products: normalized });
        }
      }
    } catch (err) {
      console.error('Failed to fetch real admin products:', err);
    } finally {
      setLoading(false);
    }
  }, [authUser?.accessToken]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(
      (p) =>
        (!q ||
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))) &&
        (catFilter === 'all' || p.category === catFilter) &&
        (statusFilter === 'all' ||
          (statusFilter === 'in_stock' && p.stock > LOW_THRESH) ||
          (statusFilter === 'low_stock' && p.stock > 0 && p.stock <= LOW_THRESH) ||
          (statusFilter === 'out_of_stock' && p.stock === 0))
    );
  }, [products, search, catFilter, statusFilter]);

  const handleSave = async (form) => {
    try {
      if (modal.type === 'add') {
        await fetch(`${API_URL}/api/admin/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authUser?.accessToken}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            name: form.name,
            category: form.category || 'electronics',
            price: Number(form.price),
            originalPrice: Number(form.originalPrice) || Number(form.price),
            countInStock: Number(form.stock),
            description: form.description,
            image: form.image,
            location: form.location,
          }),
        });
      } else {
        await fetch(`${API_URL}/api/admin/products/${modal.product.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authUser?.accessToken}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            name: form.name,
            category: form.category,
            price: Number(form.price),
            originalPrice: Number(form.originalPrice) || Number(form.price),
            countInStock: Number(form.stock),
            description: form.description,
            image: form.image,
            location: form.location,
          }),
        });
      }
      await fetchProducts();
    } catch (err) {
      console.error('Failed to save product:', err);
    } finally {
      setModal(null);
    }
  };

  const handleDelete = (p) =>
    setConfirm({
      message: `Delete "${p.name}"? This cannot be undone.`,
      onConfirm: async () => {
        try {
          await fetch(`${API_URL}/api/admin/products/${p.id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${authUser?.accessToken}`,
            },
            credentials: 'include',
          });
          await fetchProducts();
        } catch (err) {
          console.error('Failed to delete product:', err);
        } finally {
          setConfirm(null);
        }
      },
    });

  const outOfStock = products.filter((p) => p.stock === 0).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= LOW_THRESH).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-md shrink-0"
            style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' }}
          >
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              Product Catalog
            </h1>
            <p className="text-xs mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              {products.length} products · {outOfStock} out of stock · {lowStock} low stock
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setModal({ type: 'add' })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer transition-all self-start sm:self-auto"
          style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' }}
        >
          <Plus className="h-4 w-4" /> <span>Add Product</span>
        </motion.button>
      </div>

      {/* Alert */}
      {(outOfStock > 0 || lowStock > 0) && (
        <div
          className="flex items-center gap-3 p-4 rounded-2xl border"
          style={{
            background: isDark ? 'rgba(245,158,11,0.1)' : '#FFFBEB',
            borderColor: isDark ? 'rgba(245,158,11,0.3)' : '#FDE68A',
            color: isDark ? '#FDE68A' : '#92400E',
          }}
        >
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-xs">
            <strong>{outOfStock} out-of-stock</strong> and <strong>{lowStock} low-stock</strong> products require inventory replenishment.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title, SKU, category..."
            className="w-full h-10 pl-10 pr-8 rounded-xl border text-xs focus:outline-none transition-all"
            style={{
              background: isDark ? '#111522' : '#FFFFFF',
              borderColor: isDark ? '#252A3A' : '#E2E8F0',
              color: isDark ? '#F8FAFC' : '#0F172A',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border text-xs font-semibold focus:outline-none"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            borderColor: isDark ? '#252A3A' : '#E2E8F0',
            color: isDark ? '#F8FAFC' : '#0F172A',
          }}
        >
          <option value="all" style={{ background: isDark ? '#111522' : '#FFF' }}>All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name} style={{ background: isDark ? '#111522' : '#FFF' }}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border text-xs font-semibold focus:outline-none"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            borderColor: isDark ? '#252A3A' : '#E2E8F0',
            color: isDark ? '#F8FAFC' : '#0F172A',
          }}
        >
          <option value="all" style={{ background: isDark ? '#111522' : '#FFF' }}>All Status</option>
          <option value="in_stock" style={{ background: isDark ? '#111522' : '#FFF' }}>In Stock</option>
          <option value="low_stock" style={{ background: isDark ? '#111522' : '#FFF' }}>Low Stock</option>
          <option value="out_of_stock" style={{ background: isDark ? '#111522' : '#FFF' }}>Out of Stock</option>
        </select>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl shadow-xs overflow-hidden border"
        style={{
          background: isDark ? '#111522' : '#FFFFFF',
          borderColor: isDark ? '#252A3A' : '#E2E8F0',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[680px]">
            <thead style={{ background: isDark ? '#151928' : '#F8FAFC' }} className="border-b" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Location', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#252A3A]' : 'divide-slate-100'}`}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-xs">
                    No products found
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <tr
                    key={p.id}
                    className="transition-colors"
                    style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="h-full w-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-500">
                              <Package className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-xs leading-tight">{p.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{p.category}</td>
                    <td className="px-5 py-4 font-bold">ETB {p.price.toLocaleString()}</td>
                    <td className="px-5 py-4 font-semibold">{p.stock}</td>
                    <td className="px-5 py-4">
                      {p.location ? (
                        <div className="flex items-center gap-1 text-[10px]" style={{ color: isDark ? '#CBD5E1' : '#64748B' }}>
                          <MapPin className="h-3 w-3 text-pink-400 shrink-0" />
                          <span>{p.location}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StockBadge stock={p.stock} isDark={isDark} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setModal({ type: 'edit', product: p })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-pink-400 cursor-pointer transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 cursor-pointer transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <ProductModal
            product={modal.product}
            isNew={modal.type === 'add'}
            categories={categories}
            onClose={() => setModal(null)}
            onSave={handleSave}
            isDark={isDark}
          />
        )}
        {confirm && (
          <ConfirmDialog
            message={confirm.message}
            onConfirm={confirm.onConfirm}
            onCancel={() => setConfirm(null)}
            isDark={isDark}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
