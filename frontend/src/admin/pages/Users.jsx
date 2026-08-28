import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users as UsersIcon, Plus, Search, X, Edit3, Trash2, UserCheck, UserX } from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { useThemeStore } from '../../store/themeStore';

const ROLES = ['user', 'admin'];

function StatusBadge({ status, isDark }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
        status === 'active'
          ? isDark
            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : isDark
          ? 'bg-slate-500/15 text-slate-400 border-slate-500/30'
          : 'bg-slate-100 text-slate-500 border-slate-200'
      }`}
    >
      {status}
    </span>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel, isDark }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
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
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-sm font-semibold text-white transition-colors shadow-md cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function UserModal({ user, onClose, onSave, isNew, isDark }) {
  const [form, setForm] = useState(
    user || { name: '', email: '', role: 'user', status: 'active', password: '' }
  );
  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border my-auto"
        style={{
          background: isDark ? '#111522' : '#FFFFFF',
          borderColor: isDark ? '#252A3A' : '#E2E8F0',
        }}
      >
        <div className="flex items-center justify-between mb-6 pb-3 border-b" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
          <h3 className="text-base font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            {isNew ? 'Add New User' : 'Edit User'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white cursor-pointer transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
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
                Role *
              </span>
              <select
                name="role"
                value={form.role}
                onChange={handle}
                className="w-full h-10 px-3 rounded-xl border text-xs font-semibold focus:outline-none transition-all"
                style={{
                  background: isDark ? '#181c33' : '#F8FAFC',
                  borderColor: isDark ? '#252A3A' : '#E2E8F0',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                }}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r} style={{ background: isDark ? '#111522' : '#FFF' }}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
          </div>
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
          {isNew && (
            <label className="block">
              <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                Password *
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
              {isNew ? 'Create User' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function UsersPage() {
  const { users, addUser, updateUser, deleteUser, toggleUserStatus } = useAdminStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter(
      (u) =>
        (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
        (roleFilter === 'all' || u.role === roleFilter) &&
        (statusFilter === 'all' || u.status === statusFilter)
    );
  }, [users, search, roleFilter, statusFilter]);

  const handleSave = (form) => {
    if (modal.type === 'add') addUser(form);
    else updateUser(modal.user.id, form);
    setModal(null);
  };

  const handleDelete = (u) => {
    setConfirm({
      message: `Delete user "${u.name}"? This action cannot be undone.`,
      onConfirm: () => {
        deleteUser(u.id);
        setConfirm(null);
      },
    });
  };

  const handleToggle = (u) => {
    setConfirm({
      message: `${u.status === 'active' ? 'Deactivate' : 'Activate'} user "${u.name}"?`,
      onConfirm: () => {
        toggleUserStatus(u.id);
        setConfirm(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-md shrink-0"
            style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' }}
          >
            <UsersIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              User Management
            </h1>
            <p className="text-xs mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              {users.length} registered customer accounts
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
          <Plus className="h-4 w-4" /> <span>Add User</span>
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
            placeholder="Search users by name, email..."
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
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border text-xs font-semibold focus:outline-none"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            borderColor: isDark ? '#252A3A' : '#E2E8F0',
            color: isDark ? '#F8FAFC' : '#0F172A',
          }}
        >
          <option value="all" style={{ background: isDark ? '#111522' : '#FFF' }}>All Roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r} style={{ background: isDark ? '#111522' : '#FFF' }}>
              {r}
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
          <option value="active" style={{ background: isDark ? '#111522' : '#FFF' }}>Active</option>
          <option value="inactive" style={{ background: isDark ? '#111522' : '#FFF' }}>Inactive</option>
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
          <table className="w-full text-xs min-w-[620px]">
            <thead style={{ background: isDark ? '#151928' : '#F8FAFC' }} className="border-b" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
              <tr>
                {['User', 'Email', 'Role', 'Orders', 'Joined', 'Status', 'Actions'].map((h) => (
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
                    No users found
                  </td>
                </tr>
              ) : (
                filtered.map((u, i) => (
                  <tr
                    key={u.id}
                    className="transition-colors"
                    style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 bg-slate-800 ring-1 ring-purple-500/30">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="h-full w-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[11px] font-bold text-white bg-gradient-to-tr from-pink-500 to-purple-600">
                              {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </div>
                          )}
                        </div>
                        <span className="font-semibold">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{u.email}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.role === 'admin'
                            ? isDark
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                            : isDark
                            ? 'bg-slate-500/15 text-slate-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold">{u.orders}</td>
                    <td className="px-5 py-4 text-slate-400">{u.joined}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={u.status} isDark={isDark} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setModal({ type: 'edit', user: u })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-pink-400 cursor-pointer transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleToggle(u)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            u.status === 'active' ? 'text-slate-400 hover:text-amber-400' : 'text-slate-400 hover:text-emerald-400'
                          }`}
                          title={u.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {u.status === 'active' ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(u)}
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

      {/* Modals */}
      <AnimatePresence>
        {modal && (
          <UserModal
            user={modal.user}
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
