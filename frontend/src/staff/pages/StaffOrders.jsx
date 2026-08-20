import { useState, useMemo, useRef } from 'react';
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
} from 'lucide-react';
import { useStaffStore } from '../store/staffStore';
import CustomSelect from '../../components/ui/CustomSelect';

const CARRIER_OPTIONS = [
  { value: 'EthioPost Express', label: 'EthioPost Express (National Carrier)' },
  { value: 'Swift Addis Courier', label: 'Swift Addis Courier (Same-Day Delivery)' },
  { value: 'DHL Express Ethiopia', label: 'DHL Express Ethiopia' },
  { value: 'Gedam Regional Logistics', label: 'Gedam Regional Logistics' },
  { value: 'In-house Staff Delivery', label: 'In-house Direct Staff Delivery' },
];

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
    inactiveBg: 'bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50',
    badgeActive: 'bg-white/20 text-white',
    badgeInactive: 'bg-slate-100 text-slate-700',
  },
  {
    id: 'pending',
    label: 'Pending',
    icon: Clock,
    activeBg: 'bg-amber-500 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-500/30',
    inactiveBg: 'bg-white text-slate-700 border-slate-200/90 hover:border-amber-300 hover:bg-amber-50/50 hover:text-amber-800',
    badgeActive: 'bg-white/20 text-white',
    badgeInactive: 'bg-amber-50 text-amber-800 border border-amber-200',
  },
  {
    id: 'confirmed',
    label: 'Confirmed',
    icon: Check,
    activeBg: 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-600/30',
    inactiveBg: 'bg-white text-slate-700 border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700',
    badgeActive: 'bg-white/20 text-white',
    badgeInactive: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
  {
    id: 'processing',
    label: 'Processing',
    icon: PackageCheck,
    activeBg: 'bg-purple-600 text-white shadow-md shadow-purple-500/25 ring-2 ring-purple-600/30',
    inactiveBg: 'bg-white text-slate-700 border-slate-200/90 hover:border-purple-300 hover:bg-purple-50/50 hover:text-purple-700',
    badgeActive: 'bg-white/20 text-white',
    badgeInactive: 'bg-purple-50 text-purple-700 border border-purple-200',
  },
  {
    id: 'shipped',
    label: 'Shipped',
    icon: Truck,
    activeBg: 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-600/30',
    inactiveBg: 'bg-white text-slate-700 border-slate-200/90 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700',
    badgeActive: 'bg-white/20 text-white',
    badgeInactive: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  },
  {
    id: 'delivered',
    label: 'Delivered',
    icon: CheckCircle2,
    activeBg: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-600/30',
    inactiveBg: 'bg-white text-slate-700 border-slate-200/90 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700',
    badgeActive: 'bg-white/20 text-white',
    badgeInactive: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  {
    id: 'cancelled',
    label: 'Cancelled',
    icon: XCircle,
    activeBg: 'bg-rose-600 text-white shadow-md shadow-rose-500/25 ring-2 ring-rose-600/30',
    inactiveBg: 'bg-white text-slate-700 border-slate-200/90 hover:border-rose-300 hover:bg-rose-50/50 hover:text-rose-700',
    badgeActive: 'bg-white/20 text-white',
    badgeInactive: 'bg-rose-50 text-rose-700 border border-rose-200',
  },
];

export default function StaffOrders() {
  const [searchParams] = useSearchParams();
  const { orders, updateOrderStatus } = useStaffStore();

  const [selectedOrderId, setSelectedOrderId] = useState(
    searchParams.get('selected') || orders[0]?.id || null
  );
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal States
  const [activeModal, setActiveModal] = useState(null); // 'ship' | 'cancel'
  const [carrierName, setCarrierName] = useState('EthioPost Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [cancellationReason, setCancellationReason] = useState(
    'Customer requested order change'
  );

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'shipped':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleShipSubmit = (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      alert('Please enter a carrier tracking number.');
      return;
    }
    updateOrderStatus(selectedOrder.id, 'shipped', {
      carrier: carrierName,
      trackingNumber: trackingNumber.trim(),
    });
    setActiveModal(null);
    setTrackingNumber('');
  };

  const handleCancelSubmit = (e) => {
    e.preventDefault();
    updateOrderStatus(selectedOrder.id, 'cancelled', {
      cancellationReason,
    });
    setActiveModal(null);
  };

  const handleSimpleAdvance = (nextStatus) => {
    updateOrderStatus(selectedOrder.id, nextStatus);
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Order & Fulfillment Center</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {orders.length} Total Orders
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
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
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs border ${
                isActive ? tab.activeBg : tab.inactiveBg
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'opacity-70'}`} />
              <span>{tab.label}</span>
              {count > 0 && (
                <motion.span
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.15 }}
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black tracking-tight ${
                    isActive ? tab.badgeActive : tab.badgeInactive
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
          className="w-full h-9 pl-9 pr-8 rounded-full border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#3857d6] focus:ring-2 focus:ring-[#3857d6]/10 focus:outline-none transition-all shadow-xs"
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
          {filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="panel p-8 text-center bg-white border border-slate-200/90 text-slate-500 space-y-2 rounded-2xl"
            >
              <ShoppingBag className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No orders matching criteria</p>
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
                  className={`panel p-4 bg-white rounded-2xl transition-all cursor-pointer border ${
                    isSelected
                      ? 'border-[#3857d6] ring-3 ring-[#3857d6]/10 shadow-md'
                      : 'border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-black text-indigo-700">{order.id}</span>
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
                      <p className="font-bold text-slate-900">{order.customer.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {order.customer.phone} • {order.customer.city}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">ETB {order.totalAmount.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400">{order.createdAt}</p>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="text-emerald-700 font-semibold">{order.chapaPayment.method}</span>
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
            <div className="panel p-5 bg-white border border-slate-200/90 shadow-2xs rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900">{selectedOrder.id}</h2>
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

                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.print()}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print Packing Slip</span>
                  </motion.button>
                </div>
              </div>

              {/* ── Interactive Order Lifecycle Stepper ── */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Fulfillment Lifecycle Stepper
                  </span>
                  <span className="text-[11px] text-slate-400">Step Progression</span>
                </div>

                {/* Progress Bars */}
                <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-bold">
                  {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((step, idx) => {
                    const stepOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
                    const currentIdx = stepOrder.indexOf(selectedOrder.status);
                    const isDone = currentIdx >= idx && selectedOrder.status !== 'cancelled';
                    const isCurrent = selectedOrder.status === step;

                    return (
                      <div key={step} className="flex flex-col items-center gap-1">
                        <div
                          className={`h-2 w-full rounded-full transition-all duration-300 ${
                            selectedOrder.status === 'cancelled'
                              ? 'bg-rose-200'
                              : isCurrent
                              ? 'bg-[#3857d6] shadow-xs'
                              : isDone
                              ? 'bg-emerald-500'
                              : 'bg-slate-200'
                          }`}
                        />
                        <span className={`capitalize ${isCurrent ? 'text-[#3857d6] font-black' : 'text-slate-400'}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Contextual Action Button Banner */}
                <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
                  {selectedOrder.status === 'pending' && (
                    <>
                      <div className="flex items-center gap-2 text-xs text-amber-800">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span>Order newly received. Verify customer details and confirm.</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSimpleAdvance('confirmed')}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                      >
                        ✓ Confirm Order & Lock Stock
                      </motion.button>
                    </>
                  )}

                  {selectedOrder.status === 'confirmed' && (
                    <>
                      <div className="flex items-center gap-2 text-xs text-blue-800">
                        <PackageCheck className="h-4 w-4 text-blue-500" />
                        <span>Order confirmed. Ready for internal packaging & assembly.</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSimpleAdvance('processing')}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                      >
                        ⚡ Start Packaging & Prep
                      </motion.button>
                    </>
                  )}

                  {selectedOrder.status === 'processing' && (
                    <>
                      <div className="flex items-center gap-2 text-xs text-purple-800">
                        <Truck className="h-4 w-4 text-purple-500" />
                        <span>Package ready. Dispatch order and enter courier tracking number.</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveModal('ship')}
                        className="px-4 py-2 rounded-xl bg-[#3857d6] hover:bg-[#2b44ac] text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Dispatch & Add Tracking</span>
                      </motion.button>
                    </>
                  )}

                  {selectedOrder.status === 'shipped' && (
                    <>
                      <div className="flex items-center gap-2 text-xs text-indigo-800">
                        <Truck className="h-4 w-4 text-indigo-500" />
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
                    <div className="flex items-center justify-between w-full text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="font-bold">
                          Fulfillment Complete. Payout ETB {selectedOrder.chapaPayment.netPayout} settled.
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600">✓ Completed</span>
                    </div>
                  )}

                  {selectedOrder.status === 'cancelled' && (
                    <div className="flex items-center justify-between w-full text-xs text-rose-800 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-rose-600" />
                        <span>
                          <strong>Cancelled:</strong> {selectedOrder.cancellationReason || 'Stock restored to catalog.'}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                    <button
                      onClick={() => setActiveModal('cancel')}
                      className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors ml-auto cursor-pointer"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* ── Order Items Breakdown ── */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Order Items</h3>
                <div className="space-y-2 border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-[10px] font-mono text-slate-400">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">
                          {item.qty} × ETB {item.price.toLocaleString()}
                        </p>
                        <p className="text-[11px] text-slate-500 font-semibold">
                          ETB {(item.qty * item.price).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-bold text-slate-900">
                    <span>Total Order Amount</span>
                    <span className="text-sm font-black text-indigo-700">
                      ETB {selectedOrder.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Customer Delivery Details ── */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Customer & Delivery Info</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-white border border-slate-200 text-xs">
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-slate-700">
                      <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="font-bold text-slate-900">{selectedOrder.customer.name}</span>
                    </p>
                    <p className="flex items-center gap-2 text-slate-700">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <a href={`tel:${selectedOrder.customer.phone}`} className="text-indigo-600 font-semibold hover:underline">
                        {selectedOrder.customer.phone}
                      </a>
                    </p>
                    <p className="flex items-center gap-2 text-slate-700">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-600 truncate">{selectedOrder.customer.email}</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="flex items-start gap-2 text-slate-700">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>{selectedOrder.customer.city}:</strong> {selectedOrder.customer.address}
                      </span>
                    </p>
                    {selectedOrder.customer.notes && (
                      <p className="flex items-start gap-2 text-amber-800 bg-amber-50 p-1.5 rounded-lg text-[11px]">
                        <FileText className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{selectedOrder.customer.notes}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Chapa Payment Breakdown ── */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Chapa Transaction Details</h3>
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-emerald-900">Payment Gateway</span>
                    <span className="font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                      {selectedOrder.chapaPayment.method}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-600">
                    <span>Chapa Ref Number</span>
                    <span className="font-mono font-bold text-slate-800">{selectedOrder.chapaPayment.reference}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-600">
                    <span>Gateway Processing Fee (2%)</span>
                    <span>- ETB {selectedOrder.chapaPayment.fee?.toFixed(2)}</span>
                  </div>
                  <div className="pt-1.5 border-t border-emerald-200 flex justify-between items-center font-bold text-emerald-950">
                    <span>Net Staff Payout</span>
                    <span className="text-sm font-black text-emerald-700">
                      ETB {selectedOrder.chapaPayment.netPayout?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Order Timeline Logs ── */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Audit & Fulfillment Timeline</h3>
                <div className="space-y-2 border-l-2 border-slate-200 pl-3 ml-1 text-xs">
                  {selectedOrder.timeline?.map((entry, idx) => (
                    <div key={idx} className="relative space-y-0.5">
                      <span className="absolute -left-[19px] top-1 h-2.5 w-2.5 rounded-full bg-[#3857d6] ring-4 ring-white" />
                      <div className="flex items-center gap-2">
                        <span className="font-bold capitalize text-slate-800">{entry.status}</span>
                        <span className="text-[10px] text-slate-400">{entry.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{entry.note}</p>
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
              <div className="panel bg-white w-full max-w-md p-6 shadow-2xl space-y-4 rounded-2xl">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Truck className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Dispatch Order {selectedOrder.id}</h3>
                      <p className="text-xs text-slate-500">Provide shipping & courier details</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleShipSubmit} className="space-y-3.5 text-xs">
                  {/* Custom Animated Select for Carrier */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Carrier / Courier Name *</label>
                    <CustomSelect
                      value={carrierName}
                      onChange={setCarrierName}
                      options={CARRIER_OPTIONS}
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tracking Number / Dispatch Code *</label>
                    <input
                      type="text"
                      required
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. EP-889021 or SWF-AA-402"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="p-3 bg-indigo-50/70 rounded-xl text-indigo-900 text-[11px] leading-relaxed">
                    ℹ️ Customer <strong>{selectedOrder.customer.name}</strong> will receive an SMS and email notification with this tracking code.
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#3857d6] hover:bg-[#2b44ac] text-white font-bold shadow-md shadow-indigo-500/20 cursor-pointer"
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
              <div className="panel bg-white w-full max-w-md p-6 shadow-2xl space-y-4 rounded-2xl">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <RotateCcw className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Cancel Order {selectedOrder.id}</h3>
                      <p className="text-xs text-slate-500">Triggers automatic stock restoration</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleCancelSubmit} className="space-y-3.5 text-xs">
                  {/* Custom Animated Select for Cancellation Reason */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Reason for Cancellation *</label>
                    <CustomSelect
                      value={cancellationReason}
                      onChange={setCancellationReason}
                      options={CANCELLATION_REASONS}
                    />
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl text-amber-900 text-[11px] leading-relaxed">
                    ⚠️ Cancelling will immediately <strong>restore inventory counts</strong> for all {selectedOrder.items.length} items and issue an automated refund receipt to Chapa.
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
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
    </div>
  );
}
