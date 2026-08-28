import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Archive, Search, X, Plus, Minus, AlertTriangle, CheckCircle2, Package } from 'lucide-react';
import { useStaffStore } from '../../staff/store/staffStore';
import { useThemeStore } from '../../store/themeStore';

const LOW_THRESH = 5;

export default function Inventory() {
  const { products, updateStock } = useStaffStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [adjusting, setAdjusting] = useState({});

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
    const newVal = Math.max(0, (adjusting[id] !== undefined ? Number(adjusting[id]) : p.stock) + delta);
    setAdjusting((a) => ({ ...a, [id]: newVal }));
  };

  const handleCommit = (id) => {
    if (adjusting[id] !== undefined) {
      updateStock(id, adjusting[id]);
      setAdjusting((a) => {
        const n = { ...a };
        delete n[id];
        return n;
      });
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

      {/* Stats */}
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

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
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
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((tab) => {
            const isActive = filter === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isActive
                    ? 'text-white border-transparent'
                    : isDark
                    ? 'bg-[#111522] text-slate-300 border-[#252A3A] hover:border-pink-500/40 hover:bg-pink-500/10'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-pink-300 hover:bg-pink-50/50 hover:text-pink-700'
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
                {tab.label}
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
          <table className="w-full text-xs min-w-[640px]">
            <thead style={{ background: isDark ? '#151928' : '#F8FAFC' }} className="border-b" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
              <tr>
                {['Product', 'SKU', 'Category', 'Current Stock', 'Adjust Stock', 'Status', 'Action'].map((h) => (
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
                filtered.map((p, i) => {
                  const current = adjusting[p.id] !== undefined ? adjusting[p.id] : p.stock;
                  const isDirty = adjusting[p.id] !== undefined && adjusting[p.id] !== p.stock;
                  return (
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
                          <span className="font-semibold text-xs">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[10px] font-mono text-purple-400">{p.sku}</td>
                      <td className="px-5 py-4" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{p.category}</td>
                      <td className="px-5 py-4 font-black text-base">{p.stock}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleAdjust(p.id, -1)}
                            className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                            style={{
                              background: isDark ? '#181c33' : '#F1F5F9',
                              color: isDark ? '#CBD5E1' : '#475569',
                            }}
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
                            className="w-16 h-7 text-center rounded-lg border text-xs font-bold focus:outline-none"
                            style={{
                              background: isDark ? '#181c33' : '#FFFFFF',
                              borderColor: isDark ? '#252A3A' : '#E2E8F0',
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
                          >
                            <Plus className="h-3 w-3" />
                          </motion.button>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {p.stock === 0 ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isDark ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                            Out of Stock
                          </span>
                        ) : p.stock <= LOW_THRESH ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                            Low Stock
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isDark ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <AnimatePresence>
                          {isDirty && (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0 }}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleCommit(p.id)}
                              className="px-3.5 py-1.5 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                              style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' }}
                            >
                              Save
                            </motion.button>
                          )}
                        </AnimatePresence>
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
