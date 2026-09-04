import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Archive,
  Search,
  X,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Package,
  Loader2,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useStaffStore } from '../../staff/store/staffStore';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const LOW_THRESH = 5;

const normalizeDbProduct = (p) => ({
  id: p._id || p.id,
  name: p.name,
  category: p.category,
  price: Number(p.price) || 0,
  stock: Number(p.countInStock !== undefined ? p.countInStock : p.stock) || 0,
  sku: p.sku || `SKU-${(p._id || '').toString().slice(-4).toUpperCase() || 'ITEM'}`,
  image: p.image || (Array.isArray(p.images) && p.images[0]) || '',
  location: p.location || 'Warehouse Addis',
});

export default function Inventory() {
  const { user: authUser } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [adjusting, setAdjusting] = useState({});
  const [committingId, setCommittingId] = useState(null);

  const fetchInventory = useCallback(async () => {
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
          useStaffStore.setState({ products: normalized });
        }
      }
    } catch (err) {
      console.error('Failed to fetch real inventory:', err);
    } finally {
      setLoading(false);
    }
  }, [authUser?.accessToken]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const stats = useMemo(
    () => ({
      total: products.length,
      inStock: products.filter((p) => p.stock > LOW_THRESH).length,
      lowStock: products.filter((p) => p.stock > 0 && p.stock <= LOW_THRESH).length,
      outOfStock: products.filter((p) => p.stock === 0).length,
      totalItems: products.reduce((s, p) => s + p.stock, 0),
    }),
    [products]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(
      (p) =>
        (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) &&
        (filter === 'all' ||
          (filter === 'in_stock' && p.stock > LOW_THRESH) ||
          (filter === 'low_stock' && p.stock > 0 && p.stock <= LOW_THRESH) ||
          (filter === 'out_of_stock' && p.stock === 0))
    );
  }, [products, search, filter]);

  const handleAdjust = (id, delta) => {
    const p = products.find((pr) => pr.id === id);
    if (!p) return;
    const currentVal = adjusting[id] !== undefined ? Number(adjusting[id]) : p.stock;
    const newVal = Math.max(0, currentVal + delta);
    setAdjusting((a) => ({ ...a, [id]: newVal }));
  };

  const handleCommit = async (id) => {
    const p = products.find((pr) => pr.id === id);
    if (!p) return;
    const targetStock = adjusting[id] !== undefined ? adjusting[id] : p.stock;
    try {
      setCommittingId(id);
      await fetch(`${API_URL}/api/staff/products/${id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authUser?.accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ countInStock: targetStock }),
      });
      setProducts((prev) =>
        prev.map((pr) => (pr.id === id ? { ...pr, stock: targetStock } : pr))
      );
      useStaffStore.getState().updateStock?.(id, targetStock);
      setAdjusting((a) => {
        const n = { ...a };
        delete n[id];
        return n;
      });
    } catch (err) {
      console.error('Failed to commit stock update:', err);
    } finally {
      setCommittingId(null);
    }
  };

  const handleQuickSet = async (id, targetStock) => {
    const stockVal = Math.max(0, Number(targetStock) || 0);
    try {
      setCommittingId(id);
      await fetch(`${API_URL}/api/staff/products/${id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authUser?.accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ countInStock: stockVal }),
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, stock: stockVal } : p))
      );
      useStaffStore.getState().updateStock?.(id, stockVal);
      setAdjusting((a) => {
        const n = { ...a };
        delete n[id];
        return n;
      });
    } catch (err) {
      console.error('Failed to set stock:', err);
    } finally {
      setCommittingId(null);
    }
  };

  const statsCards = [
    { label: 'Total Products', value: stats.total, icon: Package, color: 'from-pink-500 to-purple-600 shadow-pink-500/20' },
    { label: 'In Stock', value: stats.inStock, icon: CheckCircle2, color: 'from-emerald-500 to-teal-600 shadow-emerald-500/20' },
    { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: 'from-amber-500 to-orange-600 shadow-amber-500/20' },
    { label: 'Out of Stock', value: stats.outOfStock, icon: X, color: 'from-rose-500 to-red-600 shadow-rose-500/20' },
  ];

  const filterTabs = [
    { id: 'all', label: 'All Stock' },
    { id: 'in_stock', label: 'In Stock' },
    { id: 'low_stock', label: 'Low Stock' },
    { id: 'out_of_stock', label: 'Out of Stock' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-md shrink-0"
          style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' }}
        >
          <Archive className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            Inventory Management
          </h1>
          <p className="text-xs mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
            Monitor and adjust stock quantities in real time
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statsCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              className="rounded-2xl p-4 shadow-xs border transition-all"
              style={{
                background: isDark ? '#111522' : '#FFFFFF',
                borderColor: isDark ? '#252A3A' : '#E2E8F0',
              }}
            >
              <div className={`h-8 w-8 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center shadow-md mb-3`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <p className="text-[11px] font-semibold" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{c.label}</p>
              <p className="text-2xl font-black mt-0.5" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{c.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Search & Filter Buttons (Aligned cleanly without orphan wrapping) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title or SKU..."
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

        {/* Filter Tab Buttons with counts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 shrink-0">
          {filterTabs.map((tab) => {
            const isActive = filter === tab.id;
            const count =
              tab.id === 'all'
                ? stats.total
                : tab.id === 'in_stock'
                ? stats.inStock
                : tab.id === 'low_stock'
                ? stats.lowStock
                : stats.outOfStock;

            return (
              <motion.button
                key={tab.id}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'text-white border-transparent shadow-md'
                    : isDark
                    ? 'bg-[#111522] text-slate-300 border-[#252A3A] hover:border-pink-500/40 hover:bg-pink-500/10'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-pink-300 hover:bg-pink-50/50 hover:text-pink-700 shadow-xs'
                }`}
                style={
                  isActive
                    ? {
                        background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
                        boxShadow: '0 0 16px rgba(236, 72, 153, 0.4)',
                      }
                    : undefined
                }
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : isDark
                      ? 'bg-white/10 text-slate-400'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </motion.button>
            );
          })}
        </div>
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
          <table className="w-full text-xs min-w-[780px]">
            <thead
              className="border-b"
              style={{
                background: isDark ? '#151928' : '#F8FAFC',
                borderColor: isDark ? '#252A3A' : '#E2E8F0',
              }}
            >
              <tr>
                <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-wider text-slate-400 min-w-[220px]">
                  Product
                </th>
                <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                  SKU
                </th>
                <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Category
                </th>
                <th className="px-5 py-3.5 text-center text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Current Stock
                </th>
                <th className="px-5 py-3.5 text-center text-[10px] font-black uppercase tracking-wider text-slate-400 min-w-[150px]">
                  Adjust Stock
                </th>
                <th className="px-5 py-3.5 text-center text-[10px] font-black uppercase tracking-wider text-slate-400 min-w-[120px]">
                  Status
                </th>
                <th className="px-5 py-3.5 text-center text-[10px] font-black uppercase tracking-wider text-slate-400 min-w-[190px]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#252A3A]' : 'divide-slate-100'}`}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-xs">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-pink-500" />
                        <span>Loading inventory records...</span>
                      </div>
                    ) : (
                      'No products found'
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const current = adjusting[p.id] !== undefined ? adjusting[p.id] : p.stock;
                  const isDirty = adjusting[p.id] !== undefined && adjusting[p.id] !== p.stock;
                  const isCommitting = committingId === p.id;

                  return (
                    <tr
                      key={p.id}
                      className="transition-colors"
                      style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                    >
                      {/* 1. Product */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-white/10">
                            {p.image ? (
                              <img
                                src={p.image}
                                alt=""
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-slate-500">
                                <Package className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <span className="font-semibold text-xs leading-snug">{p.name}</span>
                        </div>
                      </td>

                      {/* 2. SKU */}
                      <td className="px-5 py-4 text-[11px] font-mono font-bold text-purple-400">
                        {p.sku}
                      </td>

                      {/* 3. Category */}
                      <td className="px-5 py-4 capitalize" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                        {p.category}
                      </td>

                      {/* 4. Current Stock */}
                      <td className="px-5 py-4 text-center font-black text-sm">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-lg ${
                            p.stock === 0
                              ? isDark
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-rose-100 text-rose-800'
                              : p.stock <= LOW_THRESH
                              ? isDark
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-amber-100 text-amber-800'
                              : isDark
                              ? 'bg-slate-800 text-slate-200'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {p.stock}
                        </span>
                      </td>

                      {/* 5. Adjust Stock */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleAdjust(p.id, -1)}
                            className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                            style={{
                              background: isDark ? '#181c33' : '#F1F5F9',
                              color: isDark ? '#CBD5E1' : '#475569',
                            }}
                            title="Decrease stock by 1"
                          >
                            <Minus className="h-3 w-3" />
                          </motion.button>
                          <input
                            type="number"
                            min="0"
                            value={current}
                            onChange={(e) =>
                              setAdjusting((a) => ({
                                ...a,
                                [p.id]: Math.max(0, Number(e.target.value)),
                              }))
                            }
                            className={`w-14 h-7 text-center rounded-lg border text-xs font-black focus:outline-none transition-all ${
                              isDirty ? 'ring-2 ring-pink-500/40 border-pink-500' : ''
                            }`}
                            style={{
                              background: isDark ? '#181c33' : '#FFFFFF',
                              borderColor: isDirty ? '#EC4899' : isDark ? '#252A3A' : '#E2E8F0',
                              color: isDark ? '#F8FAFC' : '#0F172A',
                            }}
                          />
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleAdjust(p.id, 1)}
                            className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                            style={{
                              background: isDark ? '#181c33' : '#F1F5F9',
                              color: isDark ? '#CBD5E1' : '#475569',
                            }}
                            title="Increase stock by 1"
                          >
                            <Plus className="h-3 w-3" />
                          </motion.button>
                        </div>
                      </td>

                      {/* 6. Status Badge (Correctly placed under Status header) */}
                      <td className="px-5 py-4 text-center">
                        {p.stock === 0 ? (
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide ${
                              isDark
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            Out of Stock
                          </span>
                        ) : p.stock <= LOW_THRESH ? (
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide ${
                              isDark
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            Low Stock
                          </span>
                        ) : (
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide ${
                              isDark
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* 7. Action Column (Full interactive actions available for every row) */}
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isDirty ? (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handleCommit(p.id)}
                                disabled={isCommitting}
                                className="px-3 py-1.5 rounded-xl text-white text-xs font-black shadow-md cursor-pointer transition-all flex items-center gap-1 disabled:opacity-50"
                                style={{
                                  background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
                                }}
                                title="Save adjusted stock"
                              >
                                {isCommitting ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Check className="h-3.5 w-3.5" />
                                )}
                                <span>Save</span>
                              </motion.button>
                              <button
                                onClick={() =>
                                  setAdjusting((a) => {
                                    const n = { ...a };
                                    delete n[p.id];
                                    return n;
                                  })
                                }
                                className="p-1.5 rounded-xl border text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
                                style={{
                                  background: isDark ? '#181c33' : '#F8FAFC',
                                  borderColor: isDark ? '#252A3A' : '#E2E8F0',
                                }}
                                title="Cancel adjustment"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              {/* Quick Restock (+10) Action */}
                              <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => handleQuickSet(p.id, p.stock + 10)}
                                disabled={isCommitting}
                                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                                  isDark
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                    : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                }`}
                                title="Add 10 units to stock"
                              >
                                <Plus className="h-3 w-3" />
                                <span>+10</span>
                              </motion.button>

                              {/* Out of Stock Button / Restock Action (Correctly placed in Action column) */}
                              {p.stock > 0 ? (
                                <motion.button
                                  whileHover={{ scale: 1.04 }}
                                  whileTap={{ scale: 0.96 }}
                                  onClick={() => handleQuickSet(p.id, 0)}
                                  disabled={isCommitting}
                                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                                    isDark
                                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                                      : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                                  }`}
                                  title="Mark item as Out of Stock (0 units)"
                                >
                                  <span>Out of Stock</span>
                                </motion.button>
                              ) : (
                                <motion.button
                                  whileHover={{ scale: 1.04 }}
                                  whileTap={{ scale: 0.96 }}
                                  onClick={() => handleQuickSet(p.id, 20)}
                                  disabled={isCommitting}
                                  className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-purple-600 hover:bg-purple-500 text-white shadow-xs transition-all cursor-pointer flex items-center gap-1"
                                  title="Restock item with 20 units"
                                >
                                  <Plus className="h-3 w-3" />
                                  <span>Restock (20)</span>
                                </motion.button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
