import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Search, X, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { useThemeStore } from '../../store/themeStore';

const fmt = (n) => `ETB ${Number(n).toLocaleString()}`;

const statusIcon = {
  successful: CheckCircle2,
  pending: Clock,
  failed: XCircle,
  cancelled: X,
};

export default function Payments() {
  const { payments } = useAdminStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const stats = useMemo(
    () => ({
      total: payments.reduce((s, p) => s + (p.status === 'successful' ? p.amount : 0), 0),
      successful: payments.filter((p) => p.status === 'successful').length,
      pending: payments.filter((p) => p.status === 'pending').length,
      failed: payments.filter((p) => p.status === 'failed').length,
    }),
    [payments]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payments.filter(
      (p) =>
        (!q ||
          p.reference.toLowerCase().includes(q) ||
          p.customer.toLowerCase().includes(q) ||
          p.orderId.toLowerCase().includes(q)) &&
        (statusFilter === 'all' || p.status === statusFilter)
    );
  }, [payments, search, statusFilter]);

  const statCards = [
    { label: 'Total Revenue', value: fmt(stats.total), color: 'from-emerald-500 to-teal-600 shadow-emerald-500/20', icon: CreditCard },
    { label: 'Successful', value: stats.successful, color: 'from-blue-500 to-indigo-600 shadow-blue-500/20', icon: CheckCircle2 },
    { label: 'Pending', value: stats.pending, color: 'from-amber-500 to-orange-600 shadow-amber-500/20', icon: Clock },
    { label: 'Failed', value: stats.failed, color: 'from-rose-500 to-red-600 shadow-rose-500/20', icon: XCircle },
  ];

  const statusStyle = (status) => {
    switch (status) {
      case 'successful':
        return isDark ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
        return isDark ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200';
      case 'failed':
        return isDark ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return isDark ? 'bg-slate-500/15 text-slate-400 border-slate-500/30' : 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-md shrink-0"
          style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' }}
        >
          <CreditCard className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            Payment Transactions
          </h1>
          <p className="text-xs mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
            Chapa payment gateway transactions and settlement overview
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((c, i) => {
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
              <p className="text-xl font-black mt-0.5" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{c.value}</p>
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
            placeholder="Search by reference, order ID, customer name..."
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
        {['all', 'successful', 'pending', 'failed', 'cancelled'].map((s) => {
          const isActive = statusFilter === s;
          return (
            <motion.button
              key={s}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all capitalize cursor-pointer ${
                isActive
                  ? 'text-white border-transparent'
                  : isDark
                  ? 'bg-[#111522] text-slate-300 border-[#252A3A] hover:border-pink-500/40 hover:bg-pink-500/10'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-pink-300 hover:bg-pink-50/40 hover:text-pink-700'
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
              {s === 'all' ? 'All Payments' : s}
            </motion.button>
          );
        })}
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
                {['Reference', 'Order ID', 'Customer', 'Amount', 'Method', 'Status', 'Date'].map((h) => (
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
                    No payments found
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => {
                  const Icon = statusIcon[p.status] || CreditCard;
                  return (
                    <tr
                      key={p.id}
                      className="transition-colors"
                      style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                    >
                      <td className="px-5 py-4 font-mono text-[10px] text-pink-400">{p.reference}</td>
                      <td className="px-5 py-4 font-mono text-purple-400">{p.orderId}</td>
                      <td className="px-5 py-4 font-semibold">{p.customer}</td>
                      <td className="px-5 py-4 font-bold">{fmt(p.amount)}</td>
                      <td className="px-5 py-4" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{p.method}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusStyle(p.status)}`}>
                          <Icon className="h-3 w-3" />
                          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400">{new Date(p.date).toLocaleDateString()}</td>
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
