import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, X, ShieldAlert, CheckCircle2, Clock, PackageCheck, Truck, XCircle, User, MapPin, Phone, CreditCard, Loader2 } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const STATUSES = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const fmt = (n) => `ETB ${Number(n).toLocaleString()}`;

function OrderDetail({ order, onClose, isDark }) {
  const getStatusBadge = (s) => {
    switch (s) {
      case 'delivered':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'shipped':
        return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
      case 'processing':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'cancelled':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="rounded-3xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto border"
        style={{
          background: isDark ? '#111522' : '#FFFFFF',
          borderColor: isDark ? '#252A3A' : '#E2E8F0',
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-black text-base" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                Order #{order._id ? order._id.toString().slice(-6).toUpperCase() : order.id}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(order.status)}`}>
                {order.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : order.date || 'Today'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white cursor-pointer transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* Admin Monitoring Notice Banner */}
          <div
            className="p-3.5 rounded-2xl border flex items-center gap-2.5"
            style={{
              background: isDark ? 'rgba(139,92,246,0.08)' : '#F5F3FF',
              borderColor: isDark ? 'rgba(139,92,246,0.2)' : '#DDD6FE',
              color: '#8B5CF6',
            }}
          >
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <p className="text-[11px] font-medium leading-tight">
              <strong>Admin Governance View:</strong> Order fulfillment and progression are managed exclusively by Staff operations.
            </p>
          </div>

          {/* Cancellation Reason (If Cancelled) */}
          {order.status === 'cancelled' && (
            <div
              className="p-4 rounded-2xl border"
              style={{
                background: isDark ? 'rgba(244,63,94,0.1)' : '#FFF1F2',
                borderColor: isDark ? 'rgba(244,63,94,0.3)' : '#FECDD3',
                color: '#F43F5E',
              }}
            >
              <div className="flex items-center gap-2 font-bold mb-1">
                <XCircle className="h-4 w-4 shrink-0" />
                <span className="text-xs uppercase tracking-wider">Cancellation Reason:</span>
              </div>
              <p className="text-xs font-semibold pl-6">
                "{order.cancellationReason || 'Stock restored to inventory by Staff.'}"
              </p>
            </div>
          )}

          {/* Customer Details */}
          <div
            className="rounded-2xl p-4 border space-y-2"
            style={{
              background: isDark ? '#171B2B' : '#F8FAFC',
              borderColor: isDark ? '#252A3A' : '#E2E8F0',
            }}
          >
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Customer & Shipping Info</p>
            <div className="grid sm:grid-cols-2 gap-2 pt-1">
              <div>
                <p className="font-bold text-sm" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  {order.shippingAddress?.fullName || order.customer?.name || (order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : 'Customer')}
                </p>
                <p className="text-slate-400 mt-0.5">{order.shippingAddress?.phoneNumber || order.customer?.phone || '—'}</p>
                <p className="text-slate-400">{order.user?.email || order.shippingAddress?.email || order.customer?.email || '—'}</p>
              </div>
              <div>
                <p className="font-semibold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  {order.shippingAddress?.city || order.customer?.city || 'Addis Ababa'}
                </p>
                <p className="text-slate-400">{order.shippingAddress?.address || order.customer?.address || '—'}</p>
                {order.carrier && (
                  <p className="text-purple-400 font-semibold mt-1">
                    Carrier: {order.carrier} {order.trackingNumber ? `(#${order.trackingNumber})` : ''}
                  </p>
                )}
                {order.deliveryLocation?.landmark && (
                  <p className="text-slate-400 mt-0.5">
                    <span className="font-semibold">Landmark:</span> {order.deliveryLocation.landmark}
                  </p>
                )}
                {order.deliveryLocation?.sensedCoords?.placeName && (
                  <p className="text-purple-400 font-semibold mt-0.5">
                    <span className="text-slate-400 font-normal">GPS Sensed:</span> {order.deliveryLocation.sensedCoords.placeName}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
              Order Items ({order.items?.length || 0})
            </p>
            <div className={`divide-y ${isDark ? 'divide-[#252A3A]' : 'divide-slate-100'}`}>
              {(order.items || []).map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-slate-700/50" />
                    )}
                    <div>
                      <p className="font-semibold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                        {item.name || item.product?.name || 'Product'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Qty: {item.quantity || item.qty || 1} × ETB {(item.price || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                    ETB {(((item.quantity || item.qty || 1) * (item.price || 0))).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-3 mt-2 border-t" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
              <div>
                <p className="font-black text-sm" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Total Amount</p>
                <p className="text-[10px] text-slate-400">
                  {order.deliveryFee > 0 ? `Includes ETB ${order.deliveryFee} shipping` : 'Shipping Free'}
                </p>
              </div>
              <p className="font-black text-lg text-purple-400">
                {fmt(order.totalPrice || order.totalAmount || 0)}
              </p>
            </div>
          </div>

          {/* Payment Details */}
          <div
            className="rounded-2xl p-4 border space-y-2"
            style={{
              background: isDark ? '#171B2B' : '#F8FAFC',
              borderColor: isDark ? '#252A3A' : '#E2E8F0',
            }}
          >
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Payment Details</p>
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                {order.paymentMethodRef?.name || order.paymentMethod || order.chapaPayment?.method || 'Bank Transfer'}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {order.paymentDetails?.transactionId || order.chapaPayment?.reference || 'Pending Ref'}
              </span>
            </div>
            {order.paymentDetails?.senderName && (
              <p className="text-xs text-slate-400">
                Sender: <span className="font-semibold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{order.paymentDetails.senderName}</span>
                {order.paymentDetails.senderPhone && ` · ${order.paymentDetails.senderPhone}`}
              </p>
            )}
            {/* Payment Screenshot */}
            {order.paymentDetails?.receiptImage && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Payment Screenshot</p>
                <img
                  src={order.paymentDetails.receiptImage}
                  alt="Payment proof"
                  className="w-full max-h-56 object-contain rounded-xl border"
                  style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}
                />
              </div>
            )}
          </div>

          {/* Staff Messages */}
          {order.staffMessages && order.staffMessages.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Staff Messages to Customer</p>
              <div className="space-y-2">
                {order.staffMessages.map((msg, i) => (
                  <div key={i} className="rounded-xl p-3 border text-xs"
                    style={{ background: isDark ? 'rgba(34,197,94,0.07)' : '#F0FDF4', borderColor: isDark ? 'rgba(34,197,94,0.2)' : '#BBF7D0' }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold" style={{ color: isDark ? '#86EFAC' : '#166534' }}>{msg.senderName || 'Staff'}</span>
                      <span className="text-[10px] text-slate-400">{msg.sentAt ? new Date(msg.sentAt).toLocaleString() : ''}</span>
                    </div>
                    <p style={{ color: isDark ? '#BBF7D0' : '#14532D' }}>{msg.message}</p>
                    {msg.requiresAddressUpdate && (
                      <span className="mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded"
                        style={{ background: isDark ? 'rgba(245,158,11,0.15)' : '#FEF3C7', color: '#D97706' }}>
                        ⚠️ Address update requested
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Replies */}
          {order.userReplies && order.userReplies.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Customer Replies</p>
              <div className="space-y-2">
                {order.userReplies.map((reply, i) => (
                  <div key={i} className="rounded-xl p-3 border text-xs"
                    style={{ background: isDark ? 'rgba(139,92,246,0.08)' : '#FAF5FF', borderColor: isDark ? 'rgba(139,92,246,0.25)' : '#DDD6FE' }}
                  >
                    <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                      <span className="font-bold" style={{ color: isDark ? '#C4B5FD' : '#5B21B6' }}>
                        {reply.senderName || 'Customer'}
                      </span>
                      <div className="flex items-center gap-2">
                        {reply.isRefundRequest && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded"
                            style={{ background: isDark ? 'rgba(249,115,22,0.15)' : '#FEF3C7', color: '#D97706' }}>
                            💸 Refund Request
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {reply.sentAt ? new Date(reply.sentAt).toLocaleString() : ''}
                        </span>
                      </div>
                    </div>
                    <p style={{ color: isDark ? '#DDD6FE' : '#3B0764' }}>{reply.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Escalation Alert */}
          {order.escalation?.isEscalated && (
            <div className="rounded-xl p-3 border text-xs"
              style={{ background: isDark ? 'rgba(239,68,68,0.08)' : '#FFF1F2', borderColor: isDark ? 'rgba(239,68,68,0.3)' : '#FECDD3' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">⚠️</span>
                <span className="font-bold" style={{ color: isDark ? '#FCA5A5' : '#9F1239' }}>Escalated to Admin</span>
                {order.escalation.escalatedAt && (
                  <span className="text-[10px] text-slate-400 ml-auto">
                    {new Date(order.escalation.escalatedAt).toLocaleString()}
                  </span>
                )}
              </div>
              <p style={{ color: isDark ? '#FCA5A5' : '#881337' }}>
                Reason: {order.escalation.reason}
              </p>
              <p className="text-[10px] mt-1" style={{ color: isDark ? '#FDA4AF' : '#BE123C' }}>
                Customer is waiting for admin review. Please take action.
              </p>
            </div>
          )}

          {/* Refund Info */}
          {order.refundInfo?.isRefunded && (
            <div className="rounded-xl p-3 border text-xs"
              style={{ background: isDark ? 'rgba(249,115,22,0.08)' : '#FFF7ED', borderColor: isDark ? 'rgba(249,115,22,0.25)' : '#FED7AA' }}
            >
              <p className="font-bold mb-1" style={{ color: isDark ? '#FDBA74' : '#9A3412' }}>Refund Processed</p>
              <p style={{ color: isDark ? '#FED7AA' : '#7C2D12' }}>
                Amount: <strong>ETB {Number(order.refundInfo.amount).toLocaleString()}</strong> · {order.refundInfo.reason}
              </p>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}


export default function AdminOrders() {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const isDark = theme === 'dark';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const token = user?.accessToken || useAuthStore.getState().user?.accessToken;
      const res = await fetch(`${API_URL}/api/admin/orders`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        setOrders(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user?.accessToken]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const orderIdStr = o._id ? o._id.toString().toLowerCase() : (o.id || '').toLowerCase();
      const customerName = o.shippingAddress?.fullName || o.customer?.name || (o.user ? `${o.user.firstName || ''} ${o.user.lastName || ''}`.trim() : '');
      const city = o.shippingAddress?.city || o.customer?.city || '';

      return (
        (!q ||
          orderIdStr.includes(q) ||
          customerName.toLowerCase().includes(q) ||
          city.toLowerCase().includes(q)) &&
        (statusFilter === 'all' || o.status === statusFilter)
      );
    });
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
            Order Management & Monitoring
          </h1>
          <p className="text-xs mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
            {orders.length} total orders recorded • Governance & Audit Overview
          </p>
        </div>
      </div>

      {/* Status Filter Tabs (strictly without Confirmed) */}
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
              {s !== 'all' && (counts[s] || 0) > 0 && (
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
            <thead style={{ background: isDark ? '#151928' : '#F8FAFC', borderColor: isDark ? '#252A3A' : '#E2E8F0' }} className="border-b">
              <tr>
                {['Order ID', 'Customer', 'City', 'Items', 'Total', 'Payment', 'Status', 'Action'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#252A3A]' : 'divide-slate-100'}`}>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400 text-xs">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-500 mb-2" />
                    <span>Loading orders...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400 text-xs">
                    No orders found
                  </td>
                </tr>
              ) : (
                filtered.map((o) => {
                  const orderCode = o._id ? o._id.toString().slice(-6).toUpperCase() : o.id;
                  const custName = o.shippingAddress?.fullName || o.customer?.name || (o.user ? `${o.user.firstName || ''} ${o.user.lastName || ''}`.trim() : 'Customer');
                  const custCity = o.shippingAddress?.city || o.customer?.city || 'Addis Ababa';
                  const total = o.totalPrice || o.totalAmount || 0;
                  const payMethod = o.paymentMethodRef?.name || o.paymentMethod || o.chapaPayment?.method || 'Telebirr';

                  return (
                    <tr
                      key={o._id || o.id}
                      className="transition-colors"
                      style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                    >
                      <td className="px-5 py-4 font-mono text-purple-400 font-bold">#{orderCode}</td>
                      <td className="px-5 py-4 font-semibold">{custName}</td>
                      <td className="px-5 py-4" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{custCity}</td>
                      <td className="px-5 py-4">{o.items?.length || 0} items</td>
                      <td className="px-5 py-4 font-bold">{fmt(total)}</td>
                      <td className="px-5 py-4 text-slate-400">{payMethod}</td>
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
                  );
                })
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
            isDark={isDark}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
