import { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Search,
  Filter,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  CreditCard,
  User,
  MapPin,
  Phone,
  Mail,
  FileText,
  ArrowRight,
  Printer,
  RotateCcw,
  Send,
  PackageCheck,
  ChevronRight,
  Sparkles,
  Check,
  X,
  Loader2,
  Image,
  MessageSquare,
  DollarSign,
  Package,
} from 'lucide-react';
import { useStaffStore } from '../store/staffStore';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import CustomSelect from '../../components/ui/CustomSelect';
import PackingSlipModal from '../../components/orders/PackingSlipModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function normalizeOrder(o) {
  const rawId = o._id ? o._id.toString() : (o.id || '');
  const id = rawId ? (rawId.length === 24 ? rawId.slice(-6).toUpperCase() : rawId) : 'ORDER';
  const totalAmount = Number(o.totalPrice || o.totalAmount || 0);
  const fee = totalAmount * 0.02;
  const netPayout = totalAmount - fee;

  const customerName =
    o.shippingAddress?.fullName ||
    o.customer?.name ||
    (o.user ? `${o.user.firstName || ''} ${o.user.lastName || ''}`.trim() : '') ||
    'Customer';
  const customerPhone = o.shippingAddress?.phoneNumber || o.customer?.phone || '—';
  const customerEmail = o.user?.email || o.shippingAddress?.email || o.customer?.email || '—';
  const customerCity = o.shippingAddress?.city || o.customer?.city || 'Addis Ababa';
  const customerAddress = o.shippingAddress?.address || o.customer?.address || '—';
  const customerNotes = o.shippingAddress?.note || o.customer?.notes || '';

  const paymentMethodName =
    o.paymentMethodRef?.name ||
    o.paymentMethod ||
    o.paymentDetails?.provider ||
    o.chapaPayment?.method ||
    'Telebirr';

  const paymentRef =
    o.paymentDetails?.transactionId ||
    o.paymentId ||
    o.paymentRef ||
    o.chapaPayment?.reference ||
    `TXN-${rawId ? rawId.slice(-6).toUpperCase() : 'PENDING'}`;

  const items = (o.items || []).map((it, idx) => ({
    name: it.name || it.product?.name || `Item ${idx + 1}`,
    qty: Number(it.quantity || it.qty || 1),
    price: Number(it.price || 0),
    sku: it.product?.sku || it.sku || `SKU-${rawId ? rawId.slice(-4).toUpperCase() : idx}`,
    image: it.image || it.product?.image || '',
  }));

  const timeline = (o.statusHistory && o.statusHistory.length > 0)
    ? o.statusHistory.map((sh) => ({
        status: sh.status,
        time: sh.changedAt ? new Date(sh.changedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
        note: sh.note || `Status: ${sh.status}`,
      }))
    : (o.timeline || [
        {
          status: o.status || 'pending',
          time: o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
          note: `Order received and placed via ${paymentMethodName}`,
        },
      ]);

  return {
    ...o,
    id: rawId,
    _id: rawId,
    displayId: `#${id}`,
    customer: {
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
      city: customerCity,
      address: customerAddress,
      notes: customerNotes,
    },
    items,
    totalAmount,
    chapaPayment: {
      reference: paymentRef,
      method: paymentMethodName,
      status: o.isPaid ? 'Paid & Verified' : 'Pending Verification',
      paidAt: o.paidAt ? new Date(o.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (o.isPaid ? 'Paid' : 'Pending'),
      fee,
      netPayout,
    },
    status: o.status || 'pending',
    carrier: o.carrier || COMPANY_COURIER_NAME,
    trackingNumber: o.trackingNumber || '',
    cancellationReason: o.cancellationReason || '',
    createdAt: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Today',
    timeline,
    packingSlip: o.packingSlip || { isGenerated: false },
    deliveryLocation: o.deliveryLocation || {},
  };
}

export const COMPANY_COURIER_NAME = 'EthioShop Express Courier';

export function generateTrackingCode(order) {
  const rawId = order?._id ? order._id.toString() : (order?.id || '');
  const idSnippet = rawId.length >= 6 ? rawId.slice(-6).toUpperCase() : (rawId ? rawId.replace('#', '').toUpperCase() : 'ORDER');
  const randomSalt = Math.floor(1000 + Math.random() * 9000);
  return `ESHOP-${idSnippet}-${randomSalt}`;
}

const CANCELLATION_REASONS = [
  { value: 'Customer requested order change', label: 'Customer requested order change' },
  { value: 'Item damaged or unfulfillable', label: 'Item damaged or unfulfillable' },
  { value: 'Customer address unreachable', label: 'Customer address unreachable' },
  { value: 'Suspected fraudulent payment', label: 'Suspected fraudulent payment' },
  { value: 'Other staff operational reason', label: 'Other staff operational reason' },
];

const ORDER_FILTER_TABS = [
  {
    id: 'all',
    label: 'All Orders',
    icon: ShoppingBag,
    activeBg: 'bg-slate-900 text-white shadow-md shadow-slate-900/25 ring-2 ring-slate-900/30',
    inactiveBgLight: 'bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50',
    inactiveBgDark: 'bg-[#0f1222] text-slate-300 border-[#1b1f38] hover:border-white/20 hover:bg-white/[0.04]',
    badgeActive: 'bg-white/20 text-white',
    badgeInactive: 'bg-slate-700/30 text-slate-300',
  },
  {
    id: 'pending',
    label: 'Pending',
    icon: Clock,
    activeBg: 'bg-amber-500 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-500/30',
    inactiveBgLight: 'bg-white text-slate-700 border-slate-200/90 hover:border-amber-300 hover:bg-amber-50/50 hover:text-amber-800',
    inactiveBgDark: 'bg-[#0f1222] text-slate-300 border-[#1b1f38] hover:border-amber-500/40 hover:bg-amber-500/10',
    badgeActive: 'bg-white/20 text-white',
    badgeInactive: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  },
  {
    id: 'processing',
    label: 'Processing',
    icon: PackageCheck,
    activeBg: 'bg-purple-600 text-white shadow-md shadow-purple-500/25 ring-2 ring-purple-600/30',
    inactiveBgLight: 'bg-white text-slate-700 border-slate-200/90 hover:border-purple-300 hover:bg-purple-50/50 hover:text-purple-700',
    inactiveBgDark: 'bg-[#0f1222] text-slate-300 border-[#1b1f38] hover:border-purple-500/40 hover:bg-purple-500/10',
    badgeActive: 'bg-white/20 text-white',
    badgeInactive: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  },
  {
    id: 'shipped',
    label: 'Shipped',
    icon: Truck,
    activeBg: 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-600/30',
    inactiveBgLight: 'bg-white text-slate-700 border-slate-200/90 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700',
    inactiveBgDark: 'bg-[#0f1222] text-slate-300 border-[#1b1f38] hover:border-indigo-500/40 hover:bg-indigo-500/10',
    badgeActive: 'bg-white/20 text-white',
    badgeInactive: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
  },
  {
    id: 'delivered',
    label: 'Delivered',
    icon: CheckCircle2,
    activeBg: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-600/30',
    inactiveBgLight: 'bg-white text-slate-700 border-slate-200/90 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700',
    inactiveBgDark: 'bg-[#0f1222] text-slate-300 border-[#1b1f38] hover:border-emerald-500/40 hover:bg-emerald-500/10',
    badgeActive: 'bg-white/20 text-white',
    badgeInactive: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  },
  {
    id: 'cancelled',
    label: 'Cancelled',
    icon: XCircle,
    activeBg: 'bg-rose-600 text-white shadow-md shadow-rose-500/25 ring-2 ring-rose-600/30',
    inactiveBgLight: 'bg-white text-slate-700 border-slate-200/90 hover:border-rose-300 hover:bg-rose-50/50 hover:text-rose-700',
    inactiveBgDark: 'bg-[#0f1222] text-slate-300 border-[#1b1f38] hover:border-rose-500/40 hover:bg-rose-500/10',
    badgeActive: 'bg-white/20 text-white',
    badgeInactive: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
  },
];

export default function StaffOrders() {
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { orders: storeOrders, setOrders: setStoreOrders, updateOrderStatus } = useStaffStore();
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(
    searchParams.get('selected') || null
  );
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal States
  const [activeModal, setActiveModal] = useState(null); // 'ship' | 'cancel' | 'message' | 'refund'
  const [showPackingSlip, setShowPackingSlip] = useState(false);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const [carrierName, setCarrierName] = useState(COMPANY_COURIER_NAME);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [cancellationReason, setCancellationReason] = useState(
    'Customer requested order change'
  );
  const [staffMsg, setStaffMsg] = useState('');
  const [staffMsgRequiresAddress, setStaffMsgRequiresAddress] = useState(false);
  const [staffMsgLoading, setStaffMsgLoading] = useState(false);
  const [sendSlipLoading, setSendSlipLoading] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const token = user?.accessToken || useAuthStore.getState().user?.accessToken;
      const res = await fetch(`${API_URL}/api/staff/orders`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        const normalized = (json.data || []).map(normalizeOrder);
        setOrders(normalized);
        if (setStoreOrders) setStoreOrders(normalized);
        setSelectedOrderId((prev) => {
          if (prev && normalized.some((o) => o.id === prev)) return prev;
          const paramSelected = searchParams.get('selected');
          if (paramSelected && normalized.some((o) => o.id === paramSelected)) return paramSelected;
          return normalized[0]?.id || null;
        });
      }
    } catch (err) {
      console.error('Failed to load real staff orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user?.accessToken]);

  // Comprehensive multi-field filtering (Order ID, Customer, Phone, City, Product Name, SKU, Carrier, Tracking)
  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchSearch =
        !q ||
        (order.id && order.id.toLowerCase().includes(q)) ||
        (order.customer?.name && order.customer.name.toLowerCase().includes(q)) ||
        (order.customer?.phone && order.customer.phone.toLowerCase().includes(q)) ||
        (order.customer?.email && order.customer.email.toLowerCase().includes(q)) ||
        (order.customer?.city && order.customer.city.toLowerCase().includes(q)) ||
        (order.customer?.address && order.customer.address.toLowerCase().includes(q)) ||
        (order.carrier && order.carrier.toLowerCase().includes(q)) ||
        (order.trackingNumber && order.trackingNumber.toLowerCase().includes(q)) ||
        (order.chapaPayment?.method && order.chapaPayment.method.toLowerCase().includes(q)) ||
        (order.chapaPayment?.reference && order.chapaPayment.reference.toLowerCase().includes(q)) ||
        (order.items &&
          order.items.some(
            (item) =>
              (item.name && item.name.toLowerCase().includes(q)) ||
              (item.sku && item.sku.toLowerCase().includes(q))
          ));

      const matchStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  // Selected Order synced with filtered results
  const selectedOrder =
    filteredOrders.find((o) => o.id === selectedOrderId) || filteredOrders[0] || null;

  useEffect(() => {
    if (activeModal === 'ship' && selectedOrder) {
      if (!trackingNumber) {
        setTrackingNumber(selectedOrder.trackingNumber || generateTrackingCode(selectedOrder));
      }
    }
  }, [activeModal, selectedOrder]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return isDark ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200';
      case 'confirmed':
        return isDark ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing':
        return isDark ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-purple-50 text-purple-700 border-purple-200';
      case 'shipped':
        return isDark ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'delivered':
        return isDark ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled':
        return isDark ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleShipSubmit = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      alert('Please enter a carrier tracking number.');
      return;
    }
    const orderId = selectedOrder?._id || selectedOrder?.id;
    try {
      const token = user?.accessToken || useAuthStore.getState().user?.accessToken;
      const res = await fetch(`${API_URL}/api/staff/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          status: 'shipped',
          carrier: carrierName,
          trackingNumber: trackingNumber.trim(),
        }),
      });
      if (res.ok) {
        await loadOrders();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Failed to dispatch order:', err);
    }
    setActiveModal(null);
    setTrackingNumber('');
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    const orderId = selectedOrder?._id || selectedOrder?.id;
    try {
      const token = user?.accessToken || useAuthStore.getState().user?.accessToken;
      const res = await fetch(`${API_URL}/api/staff/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          status: 'cancelled',
          cancellationReason,
        }),
      });
      if (res.ok) {
        await loadOrders();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to cancel order');
      }
    } catch (err) {
      console.error('Failed to cancel order:', err);
    }
    setActiveModal(null);
  };

  const handleSimpleAdvance = async (nextStatus) => {
    const orderId = selectedOrder?._id || selectedOrder?.id;
    try {
      const token = user?.accessToken || useAuthStore.getState().user?.accessToken;
      const res = await fetch(`${API_URL}/api/staff/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });
      if (res.ok) {
        await loadOrders();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Failed to advance order status:', err);
    }
  };

  const handleOpenPackingSlip = async () => {
    setShowPackingSlip(true);
    if (selectedOrder) {
      const rawId = selectedOrder._id || selectedOrder.id;
      if (rawId && typeof rawId === 'string' && rawId.length === 24) {
        try {
          const token = user?.accessToken || useAuthStore.getState().user?.accessToken;
          const res = await fetch(`${API_URL}/api/staff/orders/${rawId}/generate-slip`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ notes: 'Generated by fulfillment staff' }),
          });
          if (res.ok) {
            await loadOrders();
          }
        } catch (err) {
          console.warn('Backend packing slip registration error:', err);
        }
      }
    }
  };

  const handleSendSlip = async () => {
    const rawId = selectedOrder?._id || selectedOrder?.id;
    if (!rawId || rawId.length !== 24) return;
    setSendSlipLoading(true);
    try {
      const token = user?.accessToken || useAuthStore.getState().user?.accessToken;
      const res = await fetch(`${API_URL}/api/staff/orders/${rawId}/send-slip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: 'include',
      });
      if (res.ok) {
        await loadOrders();
        alert('Packing slip sent to customer!');
      } else {
        const d = await res.json();
        alert(d.message || 'Failed to send slip');
      }
    } catch (err) {
      console.error('Failed to send packing slip:', err);
    } finally {
      setSendSlipLoading(false);
    }
  };

  const handleSendStaffMessage = async (e) => {
    e.preventDefault();
    if (!staffMsg.trim()) return;
    const rawId = selectedOrder?._id || selectedOrder?.id;
    if (!rawId || rawId.length !== 24) return;
    setStaffMsgLoading(true);
    try {
      const token = user?.accessToken || useAuthStore.getState().user?.accessToken;
      const res = await fetch(`${API_URL}/api/staff/orders/${rawId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: 'include',
        body: JSON.stringify({ message: staffMsg.trim(), requiresAddressUpdate: staffMsgRequiresAddress }),
      });
      if (res.ok) {
        setStaffMsg('');
        setStaffMsgRequiresAddress(false);
        setActiveModal(null);
        await loadOrders();
        alert('Message sent to customer!');
      } else {
        const d = await res.json();
        alert(d.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Failed to send staff message:', err);
    } finally {
      setStaffMsgLoading(false);
    }
  };

  const handleProcessRefund = async (e) => {
    e.preventDefault();
    if (!refundAmount || !refundReason.trim()) return;
    const rawId = selectedOrder?._id || selectedOrder?.id;
    if (!rawId || rawId.length !== 24) return;
    setRefundLoading(true);
    try {
      const token = user?.accessToken || useAuthStore.getState().user?.accessToken;
      const res = await fetch(`${API_URL}/api/staff/orders/${rawId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: 'include',
        body: JSON.stringify({ amount: refundAmount, reason: refundReason.trim() }),
      });
      if (res.ok) {
        setRefundAmount('');
        setRefundReason('');
        setActiveModal(null);
        await loadOrders();
        alert('Refund processed successfully!');
      } else {
        const d = await res.json();
        alert(d.message || 'Failed to process refund');
      }
    } catch (err) {
      console.error('Failed to process refund:', err);
    } finally {
      setRefundLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Order & Fulfillment Center</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isDark ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
            }`}>
              {orders.length} Total Orders
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Process incoming orders, verify customer locations, assign couriers, and track fulfillment lifecycles.
          </p>
        </div>
      </div>

      {/* ── Filter Tabs (own row) ── */}
      <div className="flex flex-wrap items-center gap-2">
        {ORDER_FILTER_TABS.map((tab) => {
          const Icon = tab.icon;
          const count =
            tab.id === 'all'
              ? orders.length
              : orders.filter((o) => o.status === tab.id).length;

          const isActive = statusFilter === tab.id;
          return (
            <motion.button
              key={tab.id}
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              onClick={() => setStatusFilter(tab.id)}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer border ${
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
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'opacity-70'}`} />
              <span>{tab.label}</span>
              {count > 0 && (
                <motion.span
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.15 }}
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black tracking-tight ${
                    isActive ? 'bg-white/25 text-white' : isDark ? 'bg-slate-800 text-slate-300 border border-slate-700/50' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {count}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* ── Search Bar ── */}
      <div className="relative w-64 ml-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orders..."
          className={`w-full h-9 pl-9 pr-8 rounded-full border text-xs focus:outline-none transition-all shadow-xs ${
            isDark
              ? 'bg-[#151828] border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500'
              : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-purple-600'
          }`}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* ── Two-Column Workflow ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Orders List (5 cols) */}
        <div className="lg:col-span-5 space-y-3 max-h-[850px] overflow-y-auto pr-1">
          {loading && orders.length === 0 ? (
            <div
              className={`panel p-8 text-center border space-y-2 rounded-2xl ${
                isDark ? 'bg-[#0f1222] border-[#1b1f38] text-slate-400' : 'bg-white border-slate-200/90 text-slate-500'
              }`}
            >
              <Loader2 className="h-7 w-7 animate-spin text-purple-500 mx-auto mb-2" />
              <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-700'}`}>Loading Real Orders...</p>
              <p className="text-[11px] text-slate-400">Fetching order and delivery data from database</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`panel p-8 text-center border space-y-2 rounded-2xl ${
                isDark ? 'bg-[#0f1222] border-[#1b1f38] text-slate-400' : 'bg-white border-slate-200/90 text-slate-500'
              }`}
            >
              <ShoppingBag className="h-8 w-8 text-slate-400 mx-auto" />
              <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-700'}`}>No orders matching criteria</p>
              <p className="text-[11px] text-slate-400">Try choosing a different status filter or clear search.</p>
            </motion.div>
          ) : (
            filteredOrders.map((order, idx) => {
              const isSelected = selectedOrder?.id === order.id;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`panel p-4 rounded-2xl transition-all cursor-pointer border ${
                    isSelected
                      ? 'border-purple-500 ring-3 ring-purple-500/20 shadow-md'
                      : isDark
                      ? 'bg-[#0f1222] border-[#1b1f38] hover:border-white/20 hover:shadow-xs'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-black text-purple-400">#{order.id.length === 24 ? order.id.slice(-6).toUpperCase() : order.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2 text-xs">
                    <div>
                      <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{order.customer.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {order.customer.phone} • {order.customer.city}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>ETB {order.totalAmount.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400">{order.createdAt}</p>
                    </div>
                  </div>

                  <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[11px] ${
                    isDark ? 'border-white/5 text-slate-400' : 'border-slate-100 text-slate-500'
                  }`}>
                    <span className="text-emerald-400 font-semibold">{order.chapaPayment.method}</span>
                    <span className="text-slate-400 flex items-center gap-1 font-medium">
                      <span>{order.items.length} items</span>
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Right: Interactive Order Lifecycle Drawer (7 cols) */}
        {selectedOrder ? (
          <motion.div
            key={selectedOrder.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 space-y-4"
          >
            {/* Header Card */}
            <div className={`panel p-5 border shadow-2xs rounded-2xl space-y-4 ${
              isDark ? 'bg-[#0f1222] border-[#1b1f38] text-white' : 'bg-white border-slate-200/90 text-slate-900'
            }`}>
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${
                isDark ? 'border-white/10' : 'border-slate-100'
              }`}>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>#{selectedOrder.id.length === 24 ? selectedOrder.id.slice(-6).toUpperCase() : selectedOrder.id}</h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(
                        selectedOrder.status
                      )}`}
                    >
                      {selectedOrder.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Placed on {selectedOrder.createdAt}</p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Message Customer */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setActiveModal('message')}
                    title="Message Customer"
                    className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shadow-2xs ${
                      isDark ? 'border-green-500/40 bg-green-500/15 text-green-300 hover:bg-green-500/25' : 'border-green-200 bg-green-50 hover:bg-green-100 text-green-700'
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                  </motion.button>

                  {/* Refund */}
                  {!selectedOrder.refundInfo?.isRefunded && (selectedOrder.isPaid || selectedOrder.status === 'delivered') && (
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => setActiveModal('refund')}
                      title="Process Refund"
                      className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shadow-2xs ${
                        isDark ? 'border-orange-500/40 bg-orange-500/15 text-orange-300 hover:bg-orange-500/25' : 'border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700'
                      }`}
                    >
                      <DollarSign className="h-3.5 w-3.5" />
                    </motion.button>
                  )}

                  {/* Send Slip */}
                  {selectedOrder.packingSlip?.isGenerated && !selectedOrder.packingSlip?.sentToCustomer && (
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={handleSendSlip}
                      disabled={sendSlipLoading}
                      title={sendSlipLoading ? 'Sending Slip...' : 'Send Slip to Customer'}
                      className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shadow-2xs ${
                        isDark ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25' : 'border-cyan-200 bg-cyan-50 hover:bg-cyan-100 text-cyan-700'
                      }`}
                    >
                      <Package className="h-3.5 w-3.5" />
                    </motion.button>
                  )}

                  {(selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered') && (
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={handleOpenPackingSlip}
                      title="Print Packing Slip"
                      className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shadow-2xs ${
                        isDark ? 'border-purple-500/40 bg-purple-500/15 text-purple-300 hover:bg-purple-500/25' : 'border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700'
                      }`}
                    >
                      <Printer className="h-3.5 w-3.5" />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* ── Interactive Order Lifecycle Stepper (4 steps) ── */}
              <div className={`p-4 rounded-2xl border space-y-3.5 ${
                isDark ? 'bg-[#14182c] border-[#1b1f38]' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    Fulfillment Lifecycle Stepper
                  </span>
                  <span className="text-[11px] text-slate-400">Progression</span>
                </div>

                {/* Progress Bars (strictly: pending -> processing -> shipped -> delivered) */}
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                  {['pending', 'processing', 'shipped', 'delivered'].map((step, idx) => {
                    const stepOrder = ['pending', 'processing', 'shipped', 'delivered'];
                    const currentIdx = stepOrder.indexOf(selectedOrder.status);
                    const isDone = currentIdx >= idx && selectedOrder.status !== 'cancelled';
                    const isCurrent = selectedOrder.status === step;

                    return (
                      <div key={step} className="flex flex-col items-center gap-1">
                        <div
                          className={`h-2 w-full rounded-full transition-all duration-300 ${
                            selectedOrder.status === 'cancelled'
                              ? 'bg-rose-500/50'
                              : isCurrent
                              ? 'bg-purple-500 shadow-xs'
                              : isDone
                              ? 'bg-emerald-500'
                              : isDark ? 'bg-slate-700' : 'bg-slate-200'
                          }`}
                        />
                        <span className={`capitalize ${isCurrent ? 'text-purple-400 font-black' : 'text-slate-400'}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Contextual Action Button Banner */}
                <div className={`pt-2 border-t flex flex-wrap items-center justify-between gap-2 ${
                  isDark ? 'border-white/10' : 'border-slate-200/60'
                }`}>
                  {selectedOrder.status === 'pending' && (
                    <>
                      <div className="flex items-center gap-2 text-xs text-amber-400">
                        <AlertTriangle className="h-4 w-4 text-amber-400" />
                        <span>Order newly received. Review & start preparing items.</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSimpleAdvance('processing')}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <PackageCheck className="h-3.5 w-3.5" />
                        <span>Start Processing & Prep</span>
                      </motion.button>
                    </>
                  )}

                  {selectedOrder.status === 'processing' && (
                    <>
                      <div className="flex items-center gap-2 text-xs text-purple-400">
                        <Truck className="h-4 w-4 text-purple-400" />
                        <span>Package ready. Dispatch order and enter courier tracking number.</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setCarrierName(COMPANY_COURIER_NAME);
                          setTrackingNumber(selectedOrder?.trackingNumber || generateTrackingCode(selectedOrder));
                          setActiveModal('ship');
                        }}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Dispatch & Add Tracking</span>
                      </motion.button>
                    </>
                  )}

                  {selectedOrder.status === 'shipped' && (
                    <>
                      <div className="flex items-center gap-2 text-xs text-emerald-400">
                        <Truck className="h-4 w-4 text-emerald-400" />
                        <span>In transit with {selectedOrder.carrier} (#{selectedOrder.trackingNumber}).</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSimpleAdvance('delivered')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Confirm Delivery & Release Payout</span>
                      </motion.button>
                    </>
                  )}

                  {selectedOrder.status === 'delivered' && (
                    <div className={`flex items-center justify-between w-full text-xs p-2.5 rounded-xl border ${
                      isDark ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span className="font-bold">
                          Fulfillment Complete. Payout ETB {selectedOrder.chapaPayment?.netPayout || (selectedOrder.totalAmount * 0.98).toLocaleString()} settled.
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400">✓ Completed</span>
                    </div>
                  )}

                  {selectedOrder.status === 'cancelled' && (
                    <div className={`flex items-center justify-between w-full text-xs p-2.5 rounded-xl border ${
                      isDark ? 'bg-rose-950/30 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-rose-400" />
                        <span>
                          <strong>Cancelled:</strong> {selectedOrder.cancellationReason || 'Stock restored to catalog.'}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                    <button
                      onClick={() => setActiveModal('cancel')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ml-auto cursor-pointer ${
                        isDark ? 'text-rose-400 hover:bg-rose-500/15' : 'text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* ── Order Items Breakdown ── */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Order Items</h3>
                <div className={`space-y-2 border rounded-xl p-3 ${
                  isDark ? 'bg-[#14182c] border-[#1b1f38]' : 'bg-slate-50/50 border-slate-100'
                }`}>
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div>
                        <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</p>
                        <p className="text-[10px] font-mono text-slate-400">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {item.qty} × ETB {item.price.toLocaleString()}
                        </p>
                        <p className="text-[11px] text-slate-400 font-semibold">
                          ETB {(item.qty * item.price).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className={`pt-2 border-t flex justify-between text-xs font-bold ${
                    isDark ? 'border-white/10 text-white' : 'border-slate-200 text-slate-900'
                  }`}>
                    <span>Total Order Amount</span>
                    <span className="text-sm font-black text-purple-400">
                      ETB {selectedOrder.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Customer Delivery Details ── */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Customer & Delivery Info</h3>
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl border text-xs ${
                  isDark ? 'bg-[#14182c] border-[#1b1f38]' : 'bg-white border-slate-200'
                }`}>
                  <div className="space-y-2">
                    <p className={`flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedOrder.customer.name}</span>
                    </p>
                    <p className={`flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <a href={`tel:${selectedOrder.customer.phone}`} className="text-purple-400 font-semibold hover:underline">
                        {selectedOrder.customer.phone}
                      </a>
                    </p>
                    <p className={`flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-400 truncate">{selectedOrder.customer.email}</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className={`flex items-start gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>{selectedOrder.customer.city}:</strong> {selectedOrder.customer.address}
                      </span>
                    </p>
                    {selectedOrder.deliveryLocation?.landmark && (
                      <p className={`text-[11px] pl-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        <strong>Landmark:</strong> {selectedOrder.deliveryLocation.landmark}
                      </p>
                    )}
                    {selectedOrder.deliveryLocation?.sensedCoords?.placeName && (
                      <p className={`text-[11px] pl-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                        <strong>GPS Sensed:</strong> {selectedOrder.deliveryLocation.sensedCoords.placeName}
                      </p>
                    )}
                    {selectedOrder.customer.notes && (
                      <p className={`flex items-start gap-2 p-1.5 rounded-lg text-[11px] ${
                        isDark ? 'bg-amber-950/30 text-amber-300' : 'bg-amber-50 text-amber-800'
                      }`}>
                        <FileText className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{selectedOrder.customer.notes}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Payment Breakdown ── */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Payment & Transaction Details</h3>
                <div className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                  isDark ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-emerald-50/60 border-emerald-200/80'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-900'}`}>Payment Gateway</span>
                    <span className={`font-bold px-2 py-0.5 rounded-md border ${
                      isDark ? 'bg-[#121526] text-emerald-300 border-emerald-500/40' : 'bg-white text-emerald-800 border-emerald-200'
                    }`}>
                      {selectedOrder.chapaPayment.method}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>Chapa Ref Number</span>
                    <span className={`font-mono font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{selectedOrder.chapaPayment.reference}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>Gateway Processing Fee (2%)</span>
                    <span>- ETB {selectedOrder.chapaPayment.fee?.toFixed(2)}</span>
                  </div>
                  <div className={`pt-1.5 border-t flex justify-between items-center font-bold ${
                    isDark ? 'border-emerald-500/20 text-white' : 'border-emerald-200 text-emerald-950'
                  }`}>
                    <span>Net Staff Payout</span>
                    <span className="text-sm font-black text-emerald-400">
                      ETB {selectedOrder.chapaPayment.netPayout?.toFixed(2)}
                    </span>
                  </div>
                </div>

              {/* ── Payment Screenshot/Proof ── */}
              {selectedOrder.paymentDetails?.receiptImage && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Payment Screenshot / Proof</h3>
                  <div className={`p-3 rounded-xl border ${
                    isDark ? 'bg-[#14182c] border-[#1b1f38]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="relative group cursor-pointer" onClick={() => setShowReceiptPreview(true)}>
                      <img
                        src={selectedOrder.paymentDetails.receiptImage}
                        alt="Payment receipt"
                        className="w-full max-h-48 object-contain rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all rounded-lg flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-bold flex items-center gap-1 transition-all">
                          <Image className="h-4 w-4" /> Click to expand
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Sender: <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>{selectedOrder.paymentDetails.senderName || '—'}</strong></span>
                      <span>Tx ID: <strong className={`font-mono ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{selectedOrder.paymentDetails.transactionId || '—'}</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Staff Messages to Customer ── */}
              {selectedOrder.staffMessages && selectedOrder.staffMessages.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Staff Messages to Customer</h3>
                  <div className="space-y-2">
                    {selectedOrder.staffMessages.map((msg, i) => (
                      <div key={i} className={`p-3 rounded-xl border text-xs ${
                        isDark ? 'bg-green-950/20 border-green-500/20 text-green-200' : 'bg-green-50 border-green-200 text-green-900'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold">{msg.senderName || 'Staff'}</span>
                          <span className="text-[10px] text-slate-400">{msg.sentAt ? new Date(msg.sentAt).toLocaleString() : ''}</span>
                        </div>
                        <p>{msg.message}</p>
                        {msg.requiresAddressUpdate && (
                          <span className={`mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700'
                          }`}>⚠️ Address update requested</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Refund Info ── */}
              {selectedOrder.refundInfo?.isRefunded && (
                <div className={`p-3 rounded-xl border text-xs ${
                  isDark ? 'bg-orange-950/20 border-orange-500/20 text-orange-200' : 'bg-orange-50 border-orange-200 text-orange-900'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span className="font-bold">Refund Processed</span>
                  </div>
                  <p>Amount: <strong>ETB {Number(selectedOrder.refundInfo.amount).toLocaleString()}</strong></p>
                  <p>Reason: {selectedOrder.refundInfo.reason}</p>
                  {selectedOrder.refundInfo.refundedAt && (
                    <p className="text-[10px] text-slate-400 mt-1">{new Date(selectedOrder.refundInfo.refundedAt).toLocaleString()}</p>
                  )}
                </div>
              )}

              {/* ── Packing Slip Status ── */}
              {selectedOrder.packingSlip?.isGenerated && (
                <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  selectedOrder.packingSlip.sentToCustomer
                    ? isDark ? 'bg-cyan-950/20 border-cyan-500/20 text-cyan-200' : 'bg-cyan-50 border-cyan-200 text-cyan-900'
                    : isDark ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <div className="flex items-center gap-2">
                    <Package className="h-3.5 w-3.5" />
                    <div>
                      <p className="font-bold">Packing Slip #{selectedOrder.packingSlip.slipNumber}</p>
                      {selectedOrder.packingSlip.requestedByCustomer && !selectedOrder.packingSlip.sentToCustomer && (
                        <p className="text-[10px] text-amber-400 font-bold">⚠️ Customer has requested this slip</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedOrder.packingSlip.sentToCustomer
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'bg-slate-500/20 text-slate-400'
                  }`}>
                    {selectedOrder.packingSlip.sentToCustomer ? '✓ Sent to Customer' : 'Not Sent Yet'}
                  </span>
                </div>
              )}              </div>

              {/* ── Order Timeline Logs ── */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Audit & Fulfillment Timeline</h3>
                <div className={`space-y-2 border-l-2 pl-3 ml-1 text-xs ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  {selectedOrder.timeline?.map((entry, idx) => (
                    <div key={idx} className="relative space-y-0.5">
                      <span className={`absolute -left-[19px] top-1 h-2.5 w-2.5 rounded-full bg-purple-500 ring-4 ${
                        isDark ? 'ring-[#0f1222]' : 'ring-white'
                      }`} />
                      <div className="flex items-center gap-2">
                        <span className={`font-bold capitalize ${isDark ? 'text-white' : 'text-slate-800'}`}>{entry.status}</span>
                        <span className="text-[10px] text-slate-400">{entry.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{entry.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </div>

      {/* ── Modal: Shipping & Tracking Dispatch (Custom Select) ── */}
      <AnimatePresence>
        {activeModal === 'ship' && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className={`panel w-full max-w-md p-6 shadow-2xl space-y-4 rounded-2xl border ${
                isDark ? 'bg-[#121526] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                <div className={`flex items-center justify-between pb-2 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                      <Truck className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Dispatch Order {selectedOrder.id}</h3>
                      <p className="text-xs text-slate-400">Provide shipping & courier details</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleShipSubmit} className="space-y-3.5 text-xs">
                  {/* Predefined Company Courier */}
                  <div>
                    <label className={`block font-bold mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      Carrier / Courier Name
                    </label>
                    <div className={`w-full h-11 px-3.5 rounded-xl border flex items-center justify-between ${
                      isDark
                        ? 'bg-[#181c33] border-white/10 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-900'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <div className="h-6 w-6 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0">
                          <Truck className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-semibold text-xs">{COMPANY_COURIER_NAME}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        isDark ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-purple-100 text-purple-700 border border-purple-200'
                      }`}>
                        Company Predefined
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        Tracking Number / Dispatch Code *
                      </label>
                      <button
                        type="button"
                        onClick={() => setTrackingNumber(generateTrackingCode(selectedOrder))}
                        className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold cursor-pointer transition-colors"
                        title="Generate a new system tracking code"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Regenerate</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. ESHOP-1049-5832"
                      className={`w-full h-10 px-3 rounded-xl border text-xs font-mono font-bold focus:outline-none ${
                        isDark
                          ? 'bg-[#181c33] border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500'
                          : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-purple-600'
                      }`}
                    />
                    <p className={`mt-1 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Auto-generated dispatch code. You can edit or enter an external tracking number if needed.
                    </p>
                  </div>

                  <div className={`p-3 rounded-xl text-[11px] leading-relaxed ${
                    isDark ? 'bg-purple-950/30 border border-purple-500/20 text-purple-200' : 'bg-indigo-50/70 text-indigo-900'
                  }`}>
                    ℹ️ Customer <strong>{selectedOrder.customer.name}</strong> will receive an SMS and email notification with this tracking code.
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className={`px-4 py-2 rounded-xl border font-bold cursor-pointer ${
                        isDark ? 'border-white/10 text-slate-300 hover:bg-white/10' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/25 cursor-pointer"
                    >
                      Confirm Dispatch
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Modal: Cancel Order & Restore Stock (Custom Select) ── */}
      <AnimatePresence>
        {activeModal === 'cancel' && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className={`panel w-full max-w-md p-6 shadow-2xl space-y-4 rounded-2xl border ${
                isDark ? 'bg-[#121526] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                <div className={`flex items-center justify-between pb-2 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                      isDark ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-50 text-rose-600'
                    }`}>
                      <RotateCcw className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Cancel Order {selectedOrder.id}</h3>
                      <p className="text-xs text-slate-400">Triggers automatic stock restoration</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleCancelSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className={`block font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Reason for Cancellation *</label>
                    <CustomSelect
                      value={cancellationReason}
                      onChange={setCancellationReason}
                      options={CANCELLATION_REASONS}
                    />
                  </div>

                  <div className={`p-3 rounded-xl text-[11px] leading-relaxed ${
                    isDark ? 'bg-amber-950/30 border border-amber-500/20 text-amber-200' : 'bg-amber-50 text-amber-900'
                  }`}>
                    ⚠️ Cancelling will immediately <strong>restore inventory counts</strong> for all {selectedOrder.items.length} items and issue an automated refund receipt to Chapa.
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className={`px-4 py-2 rounded-xl border font-bold cursor-pointer ${
                        isDark ? 'border-white/10 text-slate-300 hover:bg-white/10' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Keep Order
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-500/20 cursor-pointer"
                    >
                      Confirm Cancellation
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Modal: Message Customer ── */}
      <AnimatePresence>
        {activeModal === 'message' && selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className={`panel w-full max-w-md p-6 shadow-2xl space-y-4 rounded-2xl border ${
                isDark ? 'bg-[#121526] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                <div className={`flex items-center justify-between pb-2 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-green-600/20 text-green-400 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Message {selectedOrder.customer?.name}</h3>
                      <p className="text-xs text-slate-400">Send a note about order #{selectedOrder.id?.slice(-6)?.toUpperCase()}</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleSendStaffMessage} className="space-y-3.5 text-xs">
                  <div>
                    <label className={`block font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Message to Customer *</label>
                    <textarea
                      required
                      rows={4}
                      value={staffMsg}
                      onChange={(e) => setStaffMsg(e.target.value)}
                      placeholder="e.g. Unfortunately, we cannot deliver to the address you provided. Please update your delivery address..."
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none resize-none ${
                        isDark
                          ? 'bg-[#181c33] border-white/10 text-white placeholder:text-slate-500 focus:border-green-500'
                          : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-green-600'
                      }`}
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={staffMsgRequiresAddress}
                      onChange={(e) => setStaffMsgRequiresAddress(e.target.checked)}
                      className="rounded"
                    />
                    <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Customer needs to update delivery address</span>
                  </label>
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className={`px-4 py-2 rounded-xl border font-bold cursor-pointer ${
                        isDark ? 'border-white/10 text-slate-300 hover:bg-white/10' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={staffMsgLoading}
                      className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-md shadow-green-600/25 cursor-pointer disabled:opacity-60"
                    >
                      {staffMsgLoading ? 'Sending...' : 'Send Message'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Modal: Process Refund ── */}
      <AnimatePresence>
        {activeModal === 'refund' && selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className={`panel w-full max-w-md p-6 shadow-2xl space-y-4 rounded-2xl border ${
                isDark ? 'bg-[#121526] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                <div className={`flex items-center justify-between pb-2 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Process Refund</h3>
                      <p className="text-xs text-slate-400">Order #{selectedOrder.id?.slice(-6)?.toUpperCase()} · ETB {selectedOrder.totalAmount?.toLocaleString()}</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleProcessRefund} className="space-y-3.5 text-xs">
                  <div>
                    <label className={`block font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Refund Amount (ETB) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max={selectedOrder.totalAmount}
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder={`Max: ${selectedOrder.totalAmount}`}
                      className={`w-full h-10 px-3 rounded-xl border text-xs focus:outline-none ${
                        isDark
                          ? 'bg-[#181c33] border-white/10 text-white placeholder:text-slate-500 focus:border-orange-500'
                          : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-orange-600'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Refund Reason *</label>
                    <textarea
                      required
                      rows={3}
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      placeholder="Describe why this refund is being issued..."
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none resize-none ${
                        isDark
                          ? 'bg-[#181c33] border-white/10 text-white placeholder:text-slate-500 focus:border-orange-500'
                          : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-orange-600'
                      }`}
                    />
                  </div>
                  <div className={`p-3 rounded-xl text-[11px] leading-relaxed ${
                    isDark ? 'bg-amber-950/30 border border-amber-500/20 text-amber-200' : 'bg-amber-50 text-amber-900'
                  }`}>
                    ⚠️ Processing a refund will cancel the order and notify the customer. This action cannot be undone.
                  </div>
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className={`px-4 py-2 rounded-xl border font-bold cursor-pointer ${
                        isDark ? 'border-white/10 text-slate-300 hover:bg-white/10' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={refundLoading}
                      className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-md shadow-orange-600/25 cursor-pointer disabled:opacity-60"
                    >
                      {refundLoading ? 'Processing...' : 'Confirm Refund'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Receipt Image Preview Lightbox ── */}
      <AnimatePresence>
        {showReceiptPreview && selectedOrder?.paymentDetails?.receiptImage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReceiptPreview(false)}
              className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-2xl w-full"
              >
                <button
                  onClick={() => setShowReceiptPreview(false)}
                  className="absolute -top-10 right-0 text-white/70 hover:text-white p-2"
                >
                  <X className="h-6 w-6" />
                </button>
                <img
                  src={selectedOrder.paymentDetails.receiptImage}
                  alt="Payment receipt full view"
                  className="w-full rounded-2xl shadow-2xl"
                />
                <p className="text-center text-white/60 text-xs mt-3">
                  Payment Proof — {selectedOrder.customer?.name} · {selectedOrder.paymentDetails?.transactionId || 'No TX ID'}
                </p>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Official Packing Slip Modal */}
      {selectedOrder && (
        <PackingSlipModal
          order={selectedOrder}
          isOpen={showPackingSlip}
          onClose={() => setShowPackingSlip(false)}
          isDark={isDark}
        />
      )}
    </div>
  );
}
