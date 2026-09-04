import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCog, Plus, Search, X, Edit3, Trash2, UserCheck, UserX } from 'lucide-react';
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
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function StaffModal({ member, onClose, onSave, isNew, isDark }) {
  const [form, setForm] = useState(
    member || { name: '', email: '', department: '', status: 'active', password: '' }
  );
  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border my-auto"
        style={{
          background: isDark ? '#111522' : '#FFFFFF',
          borderColor: isDark ? '#252A3A' : '#E2E8F0',
        }}
      >
        <div className="flex items-center justify-between mb-6 pb-3 border-b" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
          <h3 className="text-base font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            {isNew ? 'Add Staff Member' : 'Edit Staff Member'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white cursor-pointer transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4 text-xs">
          <label className="block">
            <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              Full Name *
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
              Email Address *
            </span>
            <input
              name="email"
              type="email"
              value={form.email}
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
              Department
            </span>
            <input
              name="department"
              value={form.department}
              onChange={handle}
              placeholder="e.g. Inventory & Fulfillment"
              className="w-full h-10 px-3 rounded-xl border text-xs font-semibold focus:outline-none transition-all"
              style={{
                background: isDark ? '#181c33' : '#F8FAFC',
                borderColor: isDark ? '#252A3A' : '#E2E8F0',
                color: isDark ? '#F8FAFC' : '#0F172A',
              }}
            />
          </label>
          {isNew && (
            <label className="block">
              <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                Temporary Password *
              </span>
              <input
                name="password"
                type="password"
                value={form.password}
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
          )}
          <label className="block">
            <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              Status
            </span>
            <select
              name="status"
              value={form.status}
              onChange={handle}
              className="w-full h-10 px-3 rounded-xl border text-xs font-semibold focus:outline-none transition-all"
              style={{
                background: isDark ? '#181c33' : '#F8FAFC',
                borderColor: isDark ? '#252A3A' : '#E2E8F0',
                color: isDark ? '#F8FAFC' : '#0F172A',
              }}
            >
              <option value="active" style={{ background: isDark ? '#111522' : '#FFF' }}>Active</option>
              <option value="inactive" style={{ background: isDark ? '#111522' : '#FFF' }}>Inactive</option>
            </select>
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
              {isNew ? 'Create Staff' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function StaffPage() {
  const { staff, addStaff, updateStaff, deleteStaff, toggleStaffStatus } = useAdminStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return staff.filter(
      (m) =>
        (!q ||
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          (m.department || '').toLowerCase().includes(q)) &&
        (statusFilter === 'all' || m.status === statusFilter)
    );
  }, [staff, search, statusFilter]);

  const handleSave = (form) => {
    if (modal.type === 'add') addStaff(form);
    else updateStaff(modal.member.id, form);
    setModal(null);
  };

  const handleDelete = (m) =>
    setConfirm({
      message: `Remove staff member "${m.name}"? This cannot be undone.`,
      onConfirm: () => {
        deleteStaff(m.id);
        setConfirm(null);
      },
    });

  const handleToggle = (m) =>
    setConfirm({
      message: `${m.status === 'active' ? 'Deactivate' : 'Activate'} staff member "${m.name}"?`,
      onConfirm: () => {
        toggleStaffStatus(m.id);
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
            <UserCog className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              Staff Management
            </h1>
            <p className="text-xs mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              {staff.length} staff members on duty
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
          <Plus className="h-4 w-4" /> <span>Add Staff</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff by name, email, department..."
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
          <option value="active" style={{ background: isDark ? '#111522' : '#FFF' }}>Active</option>
          <option value="inactive" style={{ background: isDark ? '#111522' : '#FFF' }}>Inactive</option>
        </select>
      </div>

      {/* Staff Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs">No staff members found</div>
        ) : (
          filtered.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -3 }}
              className="rounded-2xl p-5 shadow-xs border transition-all"
              style={{
                background: isDark ? '#111522' : '#FFFFFF',
                borderColor: isDark ? '#252A3A' : '#E2E8F0',
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-2xl overflow-hidden bg-slate-800 ring-2 ring-purple-500/30">
                  {m.avatar ? (
                    <img src={m.avatar} alt={m.name} className="h-full w-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-sm font-black text-white bg-gradient-to-tr from-pink-500 to-purple-600 select-none">
                      {(m.name ? m.name.trim().charAt(0) : 'S').toUpperCase()}
                    </div>
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    m.status === 'active'
                      ? isDark ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-500/10 text-slate-400'
                  }`}
                >
                  {m.status}
                </span>
              </div>
              <p className="font-bold text-sm" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{m.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{m.email}</p>
              {m.department && <p className="text-[11px] font-semibold text-pink-400 mt-1">{m.department}</p>}
              <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
                <p className="text-[10px] text-slate-400">Joined {m.joined}</p>
                <div className="flex items-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setModal({ type: 'edit', member: m })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-pink-400 cursor-pointer transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleToggle(m)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      m.status === 'active' ? 'text-slate-400 hover:text-amber-400' : 'text-slate-400 hover:text-emerald-400'
                    }`}
                    title={m.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    {m.status === 'active' ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(m)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 cursor-pointer transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {modal && (
          <StaffModal
            member={modal.member}
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
