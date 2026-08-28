import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, X } from 'lucide-react';
import { useStaffStore } from '../../staff/store/staffStore';
import { useThemeStore } from '../../store/themeStore';

const STATUSES = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const fmt = (n) => `ETB ${Number(n).toLocaleString()}`;

function OrderDetail({ order, onClose, onUpdate, isDark }) {
  const [status, setStatus] = useState(order.status);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto border"
        style={{
          background: isDark ? '#111522' : '#FFFFFF',
          borderColor: isDark ? '#252A3A' : '#E2E8F0',
        }}
      >
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
          <div>
            <h3 className="font-black text-sm" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              {order.id}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Placed on {order.date || 'Today'}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white cursor-pointer transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 space-y-5 text-xs">
          {/* Customer */}
          <div
            className="rounded-xl p-4 border"
            style={{
              background: isDark ? '#181c33' : '#F8FAFC',
              borderColor: isDark ? '#252A3A' : '#E2E8F0',
            }}
          >
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Customer Details</p>
            <p className="font-bold text-sm" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              {order.customer?.name || '—'}
            </p>
            <p className="mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{order.customer?.phone}</p>
            <p style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              {order.customer?.city}, {order.customer?.address}
            </p>
          </div>

          {/* Items */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
              Items ({order.items?.length || 0})
            </p>
            <div className={`divide-y ${isDark ? 'divide-[#252A3A]' : 'divide-slate-100'}`}>
              {(order.items || []).map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-semibold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{item.name}</p>
                    <p className="text-[11px] text-slate-400">Qty: {item.qty} × ETB {item.price?.toLocaleString()}</p>
                  </div>
                  <p className="font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                    ETB {((item.qty || 1) * (item.price || 0)).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-3 mt-2 border-t" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
              <p className="font-black text-sm" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Total Amount</p>
              <p className="font-black text-base text-pink-400">{fmt(order.totalAmount || 0)}</p>
            </div>
          </div>

          {/* Payment */}
          <div
            className="rounded-xl p-4 border"
            style={{
              background: isDark ? '#181c33' : '#F8FAFC',
              borderColor: isDark ? '#252A3A' : '#E2E8F0',
            }}
          >
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Payment Gateway</p>
            <p className="font-semibold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              {order.chapaPayment?.method || 'Chapa Payment Gateway'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Ref: {order.chapaPayment?.reference || '—'}</p>
          </div>

          {/* Status Update */}
          <div className="flex gap-3 pt-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex-1 h-10 px-3 rounded-xl border text-xs font-semibold focus:outline-none"
              style={{
                background: isDark ? '#181c33' : '#FFFFFF',
                borderColor: isDark ? '#252A3A' : '#E2E8F0',
                color: isDark ? '#F8FAFC' : '#0F172A',
              }}
            >
              {STATUSES.filter((s) => s !== 'all').map((s) => (
                <option key={s} value={s} style={{ background: isDark ? '#111522' : '#FFF' }}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                onUpdate(order.id, status);
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' }}
            >
              Update Status
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useStaffStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (!q ||
          o.id.toLowerCase().includes(q) ||
          (o.customer?.name || '').toLowerCase().includes(q) ||
          (o.customer?.city || '').toLowerCase().includes(q)) &&
        (statusFilter === 'all' || o.status === statusFilter)
    );
  }, [orders, search, statusFilter]);

  const counts = useMemo(
    () =>
      STATUSES.slice(1).reduce(
        (acc, s) => ({ ...acc, [s]: orders.filter((o) => o.status === s).length }),
        {}
      ),
    [orders]
  );

  const statusStyle = (s) => {
    switch (s) {
      case 'delivered':
        return isDark ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'shipped':
        return isDark ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'processing':
        return isDark ? 'bg-purple-500/15 text-purple-300 border-purple-500/30' : 'bg-purple-50 text-purple-700 border-purple-200';
      case 'confirmed':
        return isDark ? 'bg-blue-500/15 text-blue-300 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled':
        return isDark ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return isDark ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-md shrink-0"
          style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' }}
        >
          <ShoppingBag className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            Order Management
          </h1>
          <p className="text-xs mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
            {orders.length} total orders recorded
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => {
          const isActive = statusFilter === s;
          return (
            <motion.button
              key={s}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
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
                      boxShadow: '0 0 20px rgba(236, 72, 153, 0.45), 0 2px 10px rgba(244, 63, 94, 0.35)',
                    }
                  : undefined
              }
            >
              <span className="capitalize">{s === 'all' ? 'All Orders' : s}</span>
              {s !== 'all' && counts[s] > 0 && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/25 text-white' : isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {counts[s]}
                </span>
              )}
              {s === 'all' && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/25 text-white' : isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {orders.length}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orders by customer or ID..."
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
                {['Order ID', 'Customer', 'City', 'Items', 'Total', 'Payment', 'Status', 'Action'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#252A3A]' : 'divide-slate-100'}`}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400 text-xs">
                    No orders found
                  </td>
                </tr>
              ) : (
                filtered.map((o, i) => (
                  <tr
                    key={o.id}
                    className="transition-colors"
                    style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                  >
                    <td className="px-5 py-4 font-mono text-purple-400">{o.id}</td>
                    <td className="px-5 py-4 font-semibold">{o.customer?.name || '—'}</td>
                    <td className="px-5 py-4" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{o.customer?.city || '—'}</td>
                    <td className="px-5 py-4">{o.items?.length || 0} items</td>
                    <td className="px-5 py-4 font-bold">{fmt(o.totalAmount || 0)}</td>
                    <td className="px-5 py-4 text-slate-400">{o.chapaPayment?.method || 'Chapa'}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${statusStyle(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedOrder(o)}
                        className="px-3.5 py-1.5 rounded-xl text-white text-xs font-bold transition-all cursor-pointer"
                        style={{ background: isDark ? '#252A3A' : '#0F172A' }}
                      >
                        View
                      </motion.button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetail
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onUpdate={updateOrderStatus}
            isDark={isDark}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
