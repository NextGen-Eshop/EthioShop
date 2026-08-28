import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Plus, Search, X, Edit3, Trash2 } from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { useThemeStore } from '../../store/themeStore';

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

function CatModal({ cat, onClose, onSave, isNew, isDark }) {
  const [form, setForm] = useState(cat || { name: '', description: '', color: '#EC4899' });
  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="rounded-2xl p-6 max-w-sm w-full shadow-2xl border"
        style={{
          background: isDark ? '#111522' : '#FFFFFF',
          borderColor: isDark ? '#252A3A' : '#E2E8F0',
        }}
      >
        <div className="flex items-center justify-between mb-6 pb-3 border-b" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
          <h3 className="text-base font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            {isNew ? 'Add Category' : 'Edit Category'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white cursor-pointer transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4 text-xs">
          <label className="block">
            <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              Category Name *
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
              Description
            </span>
            <textarea
              name="description"
              value={form.description}
              onChange={handle}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none resize-none transition-all"
              style={{
                background: isDark ? '#181c33' : '#F8FAFC',
                borderColor: isDark ? '#252A3A' : '#E2E8F0',
                color: isDark ? '#F8FAFC' : '#0F172A',
              }}
            />
          </label>
          <label className="block">
            <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              Theme Accent Color
            </span>
            <div className="flex items-center gap-3">
              <input
                name="color"
                type="color"
                value={form.color}
                onChange={handle}
                className="h-10 w-14 rounded-xl border cursor-pointer"
                style={{
                  background: isDark ? '#181c33' : '#F8FAFC',
                  borderColor: isDark ? '#252A3A' : '#E2E8F0',
                }}
              />
              <span className="font-mono font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                {form.color}
              </span>
            </div>
          </label>
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
              {isNew ? 'Create' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function Categories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useAdminStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categories.filter(
      (c) => !q || c.name.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q)
    );
  }, [categories, search]);

  const handleSave = (form) => {
    if (modal.type === 'add') addCategory(form);
    else updateCategory(modal.cat.id, form);
    setModal(null);
  };

  const handleDelete = (c) =>
    setConfirm({
      message: `Delete category "${c.name}"? Products in this category will remain.`,
      onConfirm: () => {
        deleteCategory(c.id);
        setConfirm(null);
      },
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-md shrink-0"
            style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' }}
          >
            <Tag className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              Category Management
            </h1>
            <p className="text-xs mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              {categories.length} organized categories
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
          <Plus className="h-4 w-4" /> <span>Add Category</span>
        </motion.button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs">No categories found</div>
        ) : (
          filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -3 }}
              className="rounded-2xl p-5 shadow-xs border transition-all group"
              style={{
                background: isDark ? '#111522' : '#FFFFFF',
                borderColor: isDark ? '#252A3A' : '#E2E8F0',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-md shrink-0"
                  style={{
                    background: c.color || '#EC4899',
                    boxShadow: `0 4px 12px ${c.color || '#EC4899'}40`,
                  }}
                >
                  <Tag className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setModal({ type: 'edit', cat: c })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-pink-400 cursor-pointer transition-colors"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(c)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 cursor-pointer transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </motion.button>
                </div>
              </div>
              <p className="font-bold text-sm" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{c.name}</p>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.description || 'No description'}</p>
              <div className="mt-3 pt-3 border-t" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
                <span className="text-[11px] font-black text-slate-400">{c.products || 0} products</span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {modal && (
          <CatModal
            cat={modal.cat}
            isNew={modal.type === 'add'}
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
