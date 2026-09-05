import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Heart,
  User,
  LayoutDashboard,
  LogOut,
  CheckCircle,
  Clock,
  Truck,
  ShieldCheck,
  ArrowRight,
  Save,
  Loader2,
  Camera,
  FileText,
  Settings,
  Megaphone,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MessageSquare,
  RotateCcw,
  ShieldAlert,
  Send,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';
import { useThemeStore } from '../../store/themeStore';
import ProfileImageModal from '../../components/profile/ProfileImageModal';
import PackingSlipModal from '../../components/orders/PackingSlipModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const tabs = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'orders', label: 'My Orders', icon: <Package className="h-4 w-4" /> },
  { id: 'wishlist', label: 'Wishlist', icon: <Heart className="h-4 w-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
];

export default function Account() {
  const navigate = useNavigate();
  const { user, signOut, isAuthenticated } = useAuthStore();
  const { items: wishlist, toggle } = useWishlistStore();
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const targetOrderId = searchParams.get('orderId');

  const [activeTab, setActiveTab] = useState(
    requestedTab === 'settings' || requestedTab === 'profile'
      ? 'settings'
      : requestedTab === 'orders'
      ? 'orders'
      : 'overview'
  );
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedPackingSlip, setSelectedPackingSlip] = useState(null);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newSubCity, setNewSubCity] = useState('Addis Ababa');
  const [newLandmark, setNewLandmark] = useState('');
  const [requestSlipLoading, setRequestSlipLoading] = useState(false);
  const [updateAddressLoading, setUpdateAddressLoading] = useState(false);
  // ── New workflow state ──
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundRequestLoading, setRefundRequestLoading] = useState(false);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [escalateLoading, setEscalateLoading] = useState(false);
  const [showEscalateForm, setShowEscalateForm] = useState(false);
  const orderRefs = useRef({});

  useEffect(() => {
    if (requestedTab === 'settings' || requestedTab === 'profile') {
      setActiveTab('settings');
    } else if (requestedTab === 'orders') {
      setActiveTab('orders');
    }
  }, [requestedTab]);

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address: 'Addis Ababa, Ethiopia',
  });
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    async function fetchUserOrders() {
      if (!user?.accessToken) return;
      try {
        setLoadingOrders(true);
        const res = await fetch(`${API_URL}/api/user/orders/my`, {
          headers: { Authorization: `Bearer ${user.accessToken}` },
          credentials: 'include',
        });
        if (res.ok) {
          const json = await res.json();
          setOrders(json.data || []);
        }
      } catch (err) {
        console.error('Failed to load user orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    }

    if (isAuthenticated) {
      fetchUserOrders();
    }
  }, [isAuthenticated, user?.accessToken]);

  // Scroll to targeted order and open modal if orderId query param exists
  useEffect(() => {
    if (!loadingOrders && targetOrderId && orders.length > 0) {
      const match = orders.find((o) => o._id === targetOrderId);
      if (match) {
        setSelectedDetailOrder(match);
      }
      setTimeout(() => {
        orderRefs.current[targetOrderId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 300);
    }
  }, [loadingOrders, targetOrderId, orders]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 text-3xl"
          style={{ background: isDark ? '#111522' : '#FFFFFF', border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}
        >
          🔒
        </div>
        <h2 className="text-2xl font-black mb-2" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
          Sign in to view your profile
        </h2>
        <p className="text-xs sm:text-sm mb-6 max-w-xs" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
          You need to be signed in to access your orders and account settings.
        </p>
        <Link to="/login?redirect=/account" className="btn-neon-primary px-8 py-3.5 text-xs inline-flex items-center gap-2">
          <span>Sign In</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const handleSignOut = () => {
    signOut();
    navigate('/home');
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  // ── Reply to staff message ──
  const handleSendReply = async (orderId, isRefundRequest = false) => {
    const text = replyText.trim();
    if (!text) return;
    setReplyLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/orders/${orderId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.accessToken}` },
        body: JSON.stringify({ message: text, isRefundRequest }),
      });
      if (res.ok) {
        const json = await res.json();
        const updated = json.data;
        setReplyText('');
        setSelectedDetailOrder((prev) => ({ ...prev, userReplies: updated?.userReplies || prev.userReplies }));
        setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, userReplies: updated?.userReplies || o.userReplies } : o));
        alert('Your reply has been sent to the staff.');
      } else {
        const d = await res.json();
        alert(d.message || 'Failed to send reply');
      }
    } catch (err) {
      console.error('Reply error:', err);
    } finally {
      setReplyLoading(false);
    }
  };

  // ── Request refund ──
  const handleRequestRefund = async (orderId) => {
    const reason = refundReason.trim();
    if (!reason) return;
    setRefundRequestLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/orders/${orderId}/refund-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.accessToken}` },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        const json = await res.json();
        const updated = json.data;
        setRefundReason('');
        setShowRefundForm(false);
        setSelectedDetailOrder((prev) => ({ ...prev, userReplies: updated?.userReplies || prev.userReplies }));
        setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, userReplies: updated?.userReplies || o.userReplies } : o));
        alert('Refund request submitted. Staff and admin have been notified.');
      } else {
        const d = await res.json();
        alert(d.message || 'Failed to submit refund request');
      }
    } catch (err) {
      console.error('Refund request error:', err);
    } finally {
      setRefundRequestLoading(false);
    }
  };

  // ── Escalate to admin ──
  const handleEscalate = async (orderId) => {
    const reason = escalationReason.trim();
    if (!reason) return;
    setEscalateLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/orders/${orderId}/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.accessToken}` },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        const json = await res.json();
        const updated = json.data;
        setEscalationReason('');
        setShowEscalateForm(false);
        setSelectedDetailOrder((prev) => ({ ...prev, escalation: updated?.escalation || prev.escalation }));
        setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, escalation: updated?.escalation || o.escalation } : o));
        alert('Issue escalated to Admin. Admin will review and contact you shortly.');
      } else {
        const d = await res.json();
        alert(d.message || 'Failed to escalate');
      }
    } catch (err) {
      console.error('Escalate error:', err);
    } finally {
      setEscalateLoading(false);
    }
  };

  const totalSpent = orders.reduce((s, o) => s + (o.totalPrice || 0), 0);


  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* ── USER HERO HEADER ── */}
      <div
        className="p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-6"
        style={{
          background: isDark ? '#111522' : '#FFFFFF',
          border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
        }}
      >
        <div className="flex items-center gap-4">
          {/* Avatar with Camera Hover Overlay */}
          <div className="relative group cursor-pointer" onClick={() => setProfileModalOpen(true)}>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-xs font-black text-white overflow-hidden shadow-md text-center px-1"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black uppercase select-none">
                  {(user?.firstName || user?.name || 'U').trim().charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Hover Camera Icon */}
            <div
              className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              title="Manage Profile Photo"
            >
              <Camera className="w-5 h-5 text-white drop-shadow-md" />
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-xs text-purple-400 font-bold capitalize">{user?.role || 'Customer'} Account</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="px-5 py-2.5 rounded-2xl text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* ── TABS ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
              style={{
                background: active
                  ? 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
                  : isDark ? '#111522' : '#FFFFFF',
                color: active ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B',
                border: `1px solid ${active ? 'transparent' : isDark ? '#252A3A' : '#E2E8F0'}`,
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB CONTENT ── */}
      {/* 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl" style={{ background: isDark ? '#111522' : '#FFFFFF', border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>
              <p className="text-xs text-slate-400 font-bold">Total Orders</p>
              <p className="text-2xl font-black mt-1" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{orders.length}</p>
            </div>
            <div className="p-5 rounded-2xl" style={{ background: isDark ? '#111522' : '#FFFFFF', border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>
              <p className="text-xs text-slate-400 font-bold">Wishlist Items</p>
              <p className="text-2xl font-black mt-1 text-pink-400">{wishlist.length}</p>
            </div>
            <div className="p-5 rounded-2xl" style={{ background: isDark ? '#111522' : '#FFFFFF', border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>
              <p className="text-xs text-slate-400 font-bold">Total Spent</p>
              <p className="text-2xl font-black mt-1 text-purple-400">ETB {totalSpent.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto" />
              <p className="text-xs text-slate-400 mt-2 font-medium">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center rounded-3xl" style={{ background: isDark ? '#111522' : '#FFFFFF', border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>
              <Package className="h-10 w-10 text-slate-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>No orders placed yet</h3>
              <p className="text-xs text-slate-400 mt-1">Browse our real collection to make your first purchase.</p>
              <Link to="/products" className="btn-neon-primary px-5 py-2.5 text-xs font-bold inline-block mt-4">
                Shop Now
              </Link>
            </div>
          ) : (
            <>
              {/* Square / Card-based Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.map((ord) => {
                  const isHighlighted = targetOrderId === ord._id;
                  const firstItem = ord.items?.[0];
                  const hasStaffMsg = ord.staffMessages && ord.staffMessages.length > 0;
                  const needsAddress = ord.staffMessages?.some((m) => m.requiresAddressUpdate);
                  const isDelivered = ord.status === 'delivered';
                  const isShipped = ord.status === 'shipped';
                  const isCancelled = ord.status === 'cancelled';

                  return (
                    <motion.div
                      key={ord._id}
                      ref={(el) => (orderRefs.current[ord._id] = el)}
                      whileHover={{ y: -3, scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        setSelectedDetailOrder(ord);
                        // Reset workflow state for the newly opened order
                        setReplyText('');
                        setRefundReason('');
                        setShowRefundForm(false);
                        setEscalationReason('');
                        setShowEscalateForm(false);
                      }}

                      className={`p-5 rounded-3xl cursor-pointer transition-all flex flex-col justify-between aspect-square sm:aspect-auto sm:min-h-[260px] ${
                        isHighlighted ? 'ring-2 ring-purple-500 shadow-xl shadow-purple-500/20' : ''
                      }`}
                      style={{
                        background: isDark ? '#111522' : '#FFFFFF',
                        border: `1px solid ${isHighlighted ? '#8B5CF6' : (isDark ? '#252A3A' : '#E2E8F0')}`,
                      }}
                    >
                      {/* Card Top */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-xs text-purple-400 font-mono font-bold">
                            #{ord._id ? ord._id.toString().slice(-6).toUpperCase() : ord.id}
                          </span>
                          <span
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                            style={{
                              background: isDelivered ? 'rgba(16,185,129,0.15)' : isShipped ? 'rgba(99,102,241,0.15)' : isCancelled ? 'rgba(244,63,94,0.15)' : 'rgba(245,158,11,0.15)',
                              color: isDelivered ? '#10B981' : isShipped ? '#6366F1' : isCancelled ? '#F43F5E' : '#F59E0B',
                            }}
                          >
                            {ord.status}
                          </span>
                        </div>

                        {/* Thumbnail & Items Info */}
                        <div className="flex items-center gap-3 mb-3">
                          {firstItem?.image || firstItem?.product?.image ? (
                            <img
                              src={firstItem.image || firstItem.product?.image}
                              alt=""
                              className="w-14 h-14 rounded-2xl object-cover border"
                              style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}
                            />
                          ) : (
                            <div
                              className="w-14 h-14 rounded-2xl flex items-center justify-center border"
                              style={{ background: isDark ? '#171B2B' : '#F8FAFC', borderColor: isDark ? '#252A3A' : '#E2E8F0' }}
                            >
                              <Package className="w-6 h-6 text-slate-400" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold truncate" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                              {firstItem?.name || firstItem?.product?.name || 'Order Items'}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {ord.items?.length || 1} item{(ord.items?.length || 1) > 1 ? 's' : ''}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Badges / Alerts */}
                        <div className="space-y-1 mb-2">
                          {needsAddress && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">
                              ⚠️ Address Update Requested
                            </span>
                          )}
                          {hasStaffMsg && !needsAddress && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-green-500/15 text-green-400 border border-green-500/25">
                              💬 Staff Message
                            </span>
                          )}
                          {ord.packingSlip?.sentToCustomer && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/25">
                              📄 Packing Slip Ready
                            </span>
                          )}
                          {ord.refundInfo?.isRefunded && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/25">
                              ↺ Refund Processed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Bottom */}
                      <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: isDark ? '#252A3A' : '#F1F5F9' }}>
                        <span className="text-sm font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                          ETB {Number(ord.totalPrice || ord.totalAmount || 0).toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-purple-400 flex items-center gap-1 hover:underline">
                          <span>Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* ── INTERACTIVE ORDER DETAIL MODAL ── */}
              <AnimatePresence>
                {selectedDetailOrder && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedDetailOrder(null)}
                      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
                    >
                      <div
                        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5"
                        style={{
                          background: isDark ? '#111522' : '#FFFFFF',
                          border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                        }}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: isDark ? '#252A3A' : '#F1F5F9' }}>
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="text-base sm:text-lg font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                                Order #{selectedDetailOrder._id ? selectedDetailOrder._id.toString().slice(-6).toUpperCase() : selectedDetailOrder.id}
                              </h2>
                              <span
                                className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                                style={{
                                  background: selectedDetailOrder.status === 'delivered' ? 'rgba(16,185,129,0.15)' : selectedDetailOrder.status === 'shipped' ? 'rgba(99,102,241,0.15)' : selectedDetailOrder.status === 'cancelled' ? 'rgba(244,63,94,0.15)' : 'rgba(245,158,11,0.15)',
                                  color: selectedDetailOrder.status === 'delivered' ? '#10B981' : selectedDetailOrder.status === 'shipped' ? '#6366F1' : selectedDetailOrder.status === 'cancelled' ? '#F43F5E' : '#F59E0B',
                                }}
                              >
                                {selectedDetailOrder.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Placed on {new Date(selectedDetailOrder.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => setSelectedDetailOrder(null)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Order Progress Stepper */}
                        <div
                          className="p-4 rounded-2xl space-y-3"
                          style={{
                            background: isDark ? '#171B2B' : '#F8FAFC',
                            border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                          }}
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-400 uppercase tracking-wider">
                              Fulfillment Stepper
                            </span>
                            {selectedDetailOrder.carrier && (selectedDetailOrder.status === 'shipped' || selectedDetailOrder.status === 'delivered') && (
                              <span className="text-purple-400 font-mono font-bold">
                                {selectedDetailOrder.carrier}: {selectedDetailOrder.trackingNumber || 'Tracking active'}
                              </span>
                            )}
                          </div>

                          {selectedDetailOrder.status === 'cancelled' ? (
                            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-2 text-xs">
                              <XCircle className="h-4 w-4 shrink-0" />
                              <span>Order was cancelled. {selectedDetailOrder.cancellationReason ? `Reason: "${selectedDetailOrder.cancellationReason}"` : ''}</span>
                            </div>
                          ) : (
                            <div className="grid grid-cols-4 gap-2">
                              {[
                                { id: 'pending', label: 'Placed' },
                                { id: 'processing', label: 'Processing' },
                                { id: 'shipped', label: 'Shipped' },
                                { id: 'delivered', label: 'Delivered' },
                              ].map((step, sIdx) => {
                                const stepOrder = ['pending', 'processing', 'shipped', 'delivered'];
                                const curIdx = stepOrder.indexOf(selectedDetailOrder.status);
                                const isDone = curIdx >= sIdx;
                                const isCurrent = selectedDetailOrder.status === step.id;

                                return (
                                  <div key={step.id} className="space-y-1 text-center">
                                    <div
                                      className="h-1.5 w-full rounded-full transition-all duration-300"
                                      style={{
                                        background: isCurrent ? '#8B5CF6' : isDone ? '#10B981' : (isDark ? '#252A3A' : '#E2E8F0'),
                                      }}
                                    />
                                    <p
                                      className={`text-[10px] font-bold ${
                                        isCurrent ? 'text-purple-400' : isDone ? 'text-emerald-400' : 'text-slate-400'
                                      }`}
                                    >
                                      {step.label}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Staff Messages to Customer & Destination Update Action */}
                        {selectedDetailOrder.staffMessages && selectedDetailOrder.staffMessages.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Messages from Staff</h4>
                            {selectedDetailOrder.staffMessages.map((msg, i) => (
                              <div
                                key={i}
                                className="p-3.5 rounded-2xl border text-xs space-y-2"
                                style={{
                                  background: isDark ? 'rgba(34,197,94,0.06)' : '#F0FDF4',
                                  borderColor: isDark ? 'rgba(34,197,94,0.2)' : '#BBF7D0',
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold" style={{ color: isDark ? '#86EFAC' : '#166534' }}>
                                    {msg.senderName || 'Staff Member'}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {msg.sentAt ? new Date(msg.sentAt).toLocaleString() : ''}
                                  </span>
                                </div>
                                <p style={{ color: isDark ? '#BBF7D0' : '#14532D' }}>{msg.message}</p>
                                {msg.requiresAddressUpdate && (
                                  <div className="pt-1 flex items-center justify-between flex-wrap gap-2">
                                    <span className="text-[10px] font-bold text-amber-500">
                                      ⚠️ Please provide an updated delivery address
                                    </span>
                                    {['pending', 'processing'].includes(selectedDetailOrder.status) && (
                                      <button
                                        onClick={() => {
                                          setNewAddress(selectedDetailOrder.shippingAddress?.address || selectedDetailOrder.deliveryLocation?.destinationAddress || '');
                                          setNewSubCity(selectedDetailOrder.deliveryLocation?.subCity || selectedDetailOrder.shippingAddress?.city || 'Addis Ababa');
                                          setNewLandmark(selectedDetailOrder.deliveryLocation?.landmark || '');
                                          setShowAddressModal(true);
                                        }}
                                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] cursor-pointer shadow-xs"
                                      >
                                        Update Delivery Address
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Delivery Slip Section */}
                        <div
                          className="p-3.5 rounded-2xl border text-xs flex items-center justify-between flex-wrap gap-3"
                          style={{
                            background: isDark ? '#171B2B' : '#F8FAFC',
                            borderColor: isDark ? '#252A3A' : '#E2E8F0',
                          }}
                        >
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                            <div>
                              <p className="font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                                Official Delivery & Packing Slip
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {selectedDetailOrder.packingSlip?.sentToCustomer
                                  ? 'Slip prepared and sent by fulfillment staff'
                                  : selectedDetailOrder.packingSlip?.requestedByCustomer
                                  ? 'Slip requested. Staff will dispatch shortly.'
                                  : (selectedDetailOrder.status === 'shipped' || selectedDetailOrder.status === 'delivered')
                                  ? 'Slip pending staff send. You may request it.'
                                  : 'Available once order is shipped'}
                              </p>
                            </div>
                          </div>

                          {selectedDetailOrder.packingSlip?.sentToCustomer ? (
                            <button
                              onClick={() => setSelectedPackingSlip(selectedDetailOrder)}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/25 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>View & Download Slip</span>
                            </button>
                          ) : (selectedDetailOrder.status === 'shipped' || selectedDetailOrder.status === 'delivered') ? (
                            selectedDetailOrder.packingSlip?.requestedByCustomer ? (
                              <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                Slip Requested • Pending Staff Send
                              </span>
                            ) : (
                              <button
                                onClick={async () => {
                                  try {
                                    setRequestSlipLoading(true);
                                    const res = await fetch(`${API_URL}/api/user/orders/${selectedDetailOrder._id}/request-slip`, {
                                      method: 'POST',
                                      headers: { Authorization: `Bearer ${user.accessToken}` },
                                      credentials: 'include',
                                    });
                                    if (res.ok) {
                                      alert('Packing slip requested from staff!');
                                      setSelectedDetailOrder((prev) => ({
                                        ...prev,
                                        packingSlip: { ...(prev.packingSlip || {}), requestedByCustomer: true },
                                      }));
                                      setOrders((prev) =>
                                        prev.map((o) =>
                                          o._id === selectedDetailOrder._id
                                            ? { ...o, packingSlip: { ...(o.packingSlip || {}), requestedByCustomer: true } }
                                            : o
                                        )
                                      );
                                    }
                                  } catch (err) {
                                    console.error('Request slip error:', err);
                                  } finally {
                                    setRequestSlipLoading(false);
                                  }
                                }}
                                disabled={requestSlipLoading}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 hover:bg-purple-500/25 transition-all cursor-pointer disabled:opacity-60"
                              >
                                {requestSlipLoading ? 'Requesting...' : 'Request Slip from Staff'}
                              </button>
                            )
                          ) : null}
                        </div>

                        {/* Items in order */}
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Order Items</h4>
                          <div className="space-y-2">
                            {selectedDetailOrder.items?.map((it, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-xs p-2.5 rounded-xl border"
                                style={{
                                  background: isDark ? '#171B2B' : '#F8FAFC',
                                  borderColor: isDark ? '#252A3A' : '#E2E8F0',
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <img
                                    src={it.image || it.product?.image}
                                    alt=""
                                    className="h-10 w-10 rounded-xl object-cover"
                                  />
                                  <div>
                                    <p className="font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                                      {it.name || it.product?.name}
                                    </p>
                                    <p className="text-[11px] text-slate-400">Qty: {it.quantity || it.qty || 1}</p>
                                  </div>
                                </div>
                                <span className="font-mono font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                                  ETB {((it.price || 0) * (it.quantity || it.qty || 1)).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Delivery Destination & Payment Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div
                            className="p-3.5 rounded-2xl border space-y-1.5"
                            style={{
                              background: isDark ? '#171B2B' : '#F8FAFC',
                              borderColor: isDark ? '#252A3A' : '#E2E8F0',
                            }}
                          >
                            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">
                              Delivery Destination
                            </span>
                            <p className="font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                              {selectedDetailOrder.shippingAddress?.fullName || user?.firstName}
                            </p>
                            <p className="text-slate-400">
                              {selectedDetailOrder.shippingAddress?.city || selectedDetailOrder.deliveryLocation?.subCity || 'Addis Ababa'} · {selectedDetailOrder.shippingAddress?.address || selectedDetailOrder.deliveryLocation?.destinationAddress || 'Standard delivery'}
                            </p>
                            {selectedDetailOrder.deliveryLocation?.landmark && (
                              <p className="text-[11px] text-slate-400">
                                <strong>Landmark:</strong> {selectedDetailOrder.deliveryLocation.landmark}
                              </p>
                            )}
                            {selectedDetailOrder.deliveryLocation?.sensedCoords?.placeName && (
                              <p className="text-[11px] text-purple-400 font-semibold">
                                <strong>GPS Location:</strong> {selectedDetailOrder.deliveryLocation.sensedCoords.placeName}
                              </p>
                            )}
                          </div>

                          <div
                            className="p-3.5 rounded-2xl border space-y-1.5"
                            style={{
                              background: isDark ? '#171B2B' : '#F8FAFC',
                              borderColor: isDark ? '#252A3A' : '#E2E8F0',
                            }}
                          >
                            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">
                              Payment Summary
                            </span>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Method:</span>
                              <span className="font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                                {selectedDetailOrder.paymentMethodRef?.name || selectedDetailOrder.paymentMethod || 'Bank Transfer'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Status:</span>
                              <span className="font-bold text-emerald-400">
                                {selectedDetailOrder.isPaid ? 'Paid' : 'Pending Verification'}
                              </span>
                            </div>
                            <div className="flex justify-between pt-1 border-t" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
                              <span className="font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Total:</span>
                              <span className="font-black text-purple-400">
                                ETB {Number(selectedDetailOrder.totalPrice || selectedDetailOrder.totalAmount || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Refund Information Banner if applicable */}
                        {selectedDetailOrder.refundInfo?.isRefunded && (
                          <div
                            className="p-3.5 rounded-2xl border text-xs space-y-1"
                            style={{
                              background: isDark ? 'rgba(249,115,22,0.08)' : '#FFF7ED',
                              borderColor: isDark ? 'rgba(249,115,22,0.25)' : '#FED7AA',
                            }}
                          >
                            <p className="font-bold" style={{ color: isDark ? '#FDBA74' : '#9A3412' }}>
                              Refund Issued
                            </p>
                            <p style={{ color: isDark ? '#FED7AA' : '#7C2D12' }}>
                              Amount: <strong>ETB {Number(selectedDetailOrder.refundInfo.amount).toLocaleString()}</strong> · Reason: {selectedDetailOrder.refundInfo.reason}
                            </p>
                          </div>
                        )}

                        {/* ── User Replies (conversation history) ── */}
                        {selectedDetailOrder.userReplies && selectedDetailOrder.userReplies.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Replies to Staff</h4>
                            {selectedDetailOrder.userReplies.map((reply, i) => (
                              <div
                                key={i}
                                className="p-3.5 rounded-2xl border text-xs space-y-1"
                                style={{
                                  background: isDark ? 'rgba(139,92,246,0.07)' : '#FAF5FF',
                                  borderColor: isDark ? 'rgba(139,92,246,0.25)' : '#DDD6FE',
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold" style={{ color: isDark ? '#C4B5FD' : '#5B21B6' }}>
                                    {reply.senderName || 'You'}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {reply.isRefundRequest && (
                                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-orange-500/15 text-orange-400 border border-orange-500/25">
                                        Refund Request
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
                        )}

                        {/* ── Escalation Status Banner ── */}
                        {selectedDetailOrder.escalation?.isEscalated && (
                          <div
                            className="p-3.5 rounded-2xl border text-xs space-y-1 flex items-start gap-2"
                            style={{
                              background: isDark ? 'rgba(239,68,68,0.07)' : '#FFF1F2',
                              borderColor: isDark ? 'rgba(239,68,68,0.25)' : '#FECDD3',
                            }}
                          >
                            <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold" style={{ color: isDark ? '#FCA5A5' : '#9F1239' }}>
                                Escalated to Admin
                              </p>
                              <p style={{ color: isDark ? '#FCA5A5' : '#881337' }}>
                                Reason: {selectedDetailOrder.escalation.reason}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Admin has been notified and will review your case.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* ── Reply Box (shown only when staff requested address update and order is active) ── */}
                        {selectedDetailOrder.staffMessages?.some((m) => m.requiresAddressUpdate) &&
                          !['delivered', 'cancelled'].includes(selectedDetailOrder.status) && (
                          <div
                            className="p-4 rounded-2xl border space-y-3 text-xs"
                            style={{
                              background: isDark ? 'rgba(34,197,94,0.05)' : '#F0FDF4',
                              borderColor: isDark ? 'rgba(34,197,94,0.2)' : '#BBF7D0',
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-green-400 shrink-0" />
                              <span className="font-bold" style={{ color: isDark ? '#86EFAC' : '#166534' }}>
                                Reply to Staff
                              </span>
                              <span className="text-[10px] text-slate-400">(e.g. "I can't update the address, please refund")</span>
                            </div>
                            <textarea
                              rows={3}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Type your reply to the staff's message..."
                              className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none resize-none"
                              style={{
                                background: isDark ? '#171B2B' : '#FFFFFF',
                                borderColor: isDark ? '#252A3A' : '#D1FAE5',
                                color: isDark ? '#F8FAFC' : '#0F172A',
                              }}
                            />
                            <div className="flex justify-end gap-2">
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                disabled={replyLoading || !replyText.trim()}
                                onClick={() => handleSendReply(selectedDetailOrder._id, false)}
                                className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                                style={{ background: 'rgba(34,197,94,0.15)', color: isDark ? '#86EFAC' : '#166534', border: '1px solid rgba(34,197,94,0.3)' }}
                              >
                                {replyLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                                Send Reply
                              </motion.button>
                            </div>
                          </div>
                        )}

                        {/* ── Request Refund Section ── */}
                        {!selectedDetailOrder.refundInfo?.isRefunded && selectedDetailOrder.status !== 'cancelled' && (
                          <div
                            className="p-4 rounded-2xl border space-y-3 text-xs"
                            style={{
                              background: isDark ? 'rgba(249,115,22,0.05)' : '#FFF7ED',
                              borderColor: isDark ? 'rgba(249,115,22,0.2)' : '#FED7AA',
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <RotateCcw className="h-4 w-4 text-orange-400 shrink-0" />
                                <span className="font-bold" style={{ color: isDark ? '#FDBA74' : '#9A3412' }}>
                                  Request a Refund
                                </span>
                              </div>
                              {!showRefundForm && (
                                <button
                                  onClick={() => { setShowRefundForm(true); setShowEscalateForm(false); }}
                                  className="px-3 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-all"
                                  style={{ background: 'rgba(249,115,22,0.15)', color: isDark ? '#FDBA74' : '#9A3412', border: '1px solid rgba(249,115,22,0.3)' }}
                                >
                                  Request Refund
                                </button>
                              )}
                            </div>

                            {!showRefundForm && (
                              <p style={{ color: isDark ? '#FED7AA' : '#7C2D12' }}>
                                If you have a serious issue with this order, you can request a refund. Staff or admin will review and process it.
                              </p>
                            )}

                            <AnimatePresence>
                              {showRefundForm && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="space-y-3 overflow-hidden"
                                >
                                  <textarea
                                    rows={3}
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    placeholder="Explain why you are requesting a refund (e.g. I cannot provide a new delivery address and cannot receive the order)..."
                                    className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none resize-none"
                                    style={{
                                      background: isDark ? '#171B2B' : '#FFFFFF',
                                      borderColor: isDark ? '#252A3A' : '#FED7AA',
                                      color: isDark ? '#F8FAFC' : '#0F172A',
                                    }}
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => { setShowRefundForm(false); setRefundReason(''); }}
                                      className="px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer"
                                      style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0', color: isDark ? '#94A3B8' : '#64748B' }}
                                    >
                                      Cancel
                                    </button>
                                    <motion.button
                                      whileHover={{ scale: 1.03 }}
                                      whileTap={{ scale: 0.97 }}
                                      disabled={refundRequestLoading || !refundReason.trim()}
                                      onClick={() => handleRequestRefund(selectedDetailOrder._id)}
                                      className="px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                                      style={{ background: 'linear-gradient(135deg,#F97316,#EF4444)', color: '#FFFFFF' }}
                                    >
                                      {refundRequestLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                                      Submit Refund Request
                                    </motion.button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        {/* ── Escalate to Admin Section ── */}
                        {!selectedDetailOrder.escalation?.isEscalated &&
                          !['delivered'].includes(selectedDetailOrder.status) && (
                          <div
                            className="p-4 rounded-2xl border space-y-3 text-xs"
                            style={{
                              background: isDark ? 'rgba(239,68,68,0.05)' : '#FFF1F2',
                              borderColor: isDark ? 'rgba(239,68,68,0.2)' : '#FECDD3',
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
                                <span className="font-bold" style={{ color: isDark ? '#FCA5A5' : '#9F1239' }}>
                                  Escalate to Admin
                                </span>
                              </div>
                              {!showEscalateForm && (
                                <button
                                  onClick={() => { setShowEscalateForm(true); setShowRefundForm(false); }}
                                  className="px-3 py-1 rounded-xl text-[11px] font-bold cursor-pointer"
                                  style={{ background: 'rgba(239,68,68,0.15)', color: isDark ? '#FCA5A5' : '#9F1239', border: '1px solid rgba(239,68,68,0.3)' }}
                                >
                                  Escalate Issue
                                </button>
                              )}
                            </div>

                            {!showEscalateForm && (
                              <p style={{ color: isDark ? '#FCA5A5' : '#881337' }}>
                                If the issue cannot be resolved with staff, you can escalate directly to Admin. Admin will review the full order history, messages, and your reason.
                              </p>
                            )}

                            <AnimatePresence>
                              {showEscalateForm && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="space-y-3 overflow-hidden"
                                >
                                  <textarea
                                    rows={3}
                                    value={escalationReason}
                                    onChange={(e) => setEscalationReason(e.target.value)}
                                    placeholder="Describe why you are escalating this issue to admin (e.g. Staff requested address update but I cannot comply and need a refund, but staff is not responding)..."
                                    className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none resize-none"
                                    style={{
                                      background: isDark ? '#171B2B' : '#FFFFFF',
                                      borderColor: isDark ? '#252A3A' : '#FECDD3',
                                      color: isDark ? '#F8FAFC' : '#0F172A',
                                    }}
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => { setShowEscalateForm(false); setEscalationReason(''); }}
                                      className="px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer"
                                      style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0', color: isDark ? '#94A3B8' : '#64748B' }}
                                    >
                                      Cancel
                                    </button>
                                    <motion.button
                                      whileHover={{ scale: 1.03 }}
                                      whileTap={{ scale: 0.97 }}
                                      disabled={escalateLoading || !escalationReason.trim()}
                                      onClick={() => handleEscalate(selectedDetailOrder._id)}
                                      className="px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                                      style={{ background: 'linear-gradient(135deg,#EF4444,#DC2626)', color: '#FFFFFF' }}
                                    >
                                      {escalateLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                                      Escalate to Admin
                                    </motion.button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>


              {/* ── UPDATE ADDRESS MODAL ── */}
              <AnimatePresence>
                {showAddressModal && selectedDetailOrder && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowAddressModal(false)}
                      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                    >
                      <div
                        className="w-full max-w-md p-6 rounded-3xl space-y-4"
                        style={{
                          background: isDark ? '#111522' : '#FFFFFF',
                          border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                        }}
                      >
                        <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: isDark ? '#252A3A' : '#F1F5F9' }}>
                          <h3 className="text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                            Update Delivery Destination
                          </h3>
                          <button onClick={() => setShowAddressModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                            ✕
                          </button>
                        </div>
                        <div className="space-y-3 text-xs">
                          <div>
                            <label className="block font-bold mb-1 text-slate-400">Sub-City / Area *</label>
                            <input
                              type="text"
                              value={newSubCity}
                              onChange={(e) => setNewSubCity(e.target.value)}
                              placeholder="e.g. Bole, Kirkos, Yeka"
                              className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none"
                              style={{
                                background: isDark ? '#171B2B' : '#F8FAFC',
                                borderColor: isDark ? '#252A3A' : '#E2E8F0',
                                color: isDark ? '#F8FAFC' : '#0F172A',
                              }}
                            />
                          </div>
                          <div>
                            <label className="block font-bold mb-1 text-slate-400">Street Address / Destination *</label>
                            <input
                              type="text"
                              value={newAddress}
                              onChange={(e) => setNewAddress(e.target.value)}
                              placeholder="e.g. Near Edna Mall, House #402"
                              className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none"
                              style={{
                                background: isDark ? '#171B2B' : '#F8FAFC',
                                borderColor: isDark ? '#252A3A' : '#E2E8F0',
                                color: isDark ? '#F8FAFC' : '#0F172A',
                              }}
                            />
                          </div>
                          <div>
                            <label className="block font-bold mb-1 text-slate-400">Prominent Landmark (Optional)</label>
                            <input
                              type="text"
                              value={newLandmark}
                              onChange={(e) => setNewLandmark(e.target.value)}
                              placeholder="e.g. Opposite Commercial Bank"
                              className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none"
                              style={{
                                background: isDark ? '#171B2B' : '#F8FAFC',
                                borderColor: isDark ? '#252A3A' : '#E2E8F0',
                                color: isDark ? '#F8FAFC' : '#0F172A',
                              }}
                            />
                          </div>
                          <div className="pt-2 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setShowAddressModal(false)}
                              className="px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer"
                              style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0', color: isDark ? '#94A3B8' : '#64748B' }}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={updateAddressLoading || !newAddress.trim()}
                              onClick={async () => {
                                try {
                                  setUpdateAddressLoading(true);
                                  const res = await fetch(`${API_URL}/api/user/orders/${selectedDetailOrder._id}/destination`, {
                                    method: 'PUT',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      Authorization: `Bearer ${user.accessToken}`,
                                    },
                                    credentials: 'include',
                                    body: JSON.stringify({
                                      destinationAddress: newAddress.trim(),
                                      subCity: newSubCity.trim(),
                                      landmark: newLandmark.trim(),
                                    }),
                                  });
                                  if (res.ok) {
                                    alert('Delivery destination updated! Fulfillment staff has been notified.');
                                    setShowAddressModal(false);
                                    setSelectedDetailOrder((prev) => ({
                                      ...prev,
                                      shippingAddress: { ...prev.shippingAddress, address: newAddress.trim(), city: newSubCity.trim() },
                                      deliveryLocation: { ...prev.deliveryLocation, destinationAddress: newAddress.trim(), subCity: newSubCity.trim(), landmark: newLandmark.trim() },
                                    }));
                                    setOrders((prev) =>
                                      prev.map((o) =>
                                        o._id === selectedDetailOrder._id
                                          ? {
                                              ...o,
                                              shippingAddress: { ...o.shippingAddress, address: newAddress.trim(), city: newSubCity.trim() },
                                              deliveryLocation: { ...o.deliveryLocation, destinationAddress: newAddress.trim(), subCity: newSubCity.trim(), landmark: newLandmark.trim() },
                                            }
                                          : o
                                      )
                                    );
                                  } else {
                                    const d = await res.json();
                                    alert(d.message || 'Failed to update address');
                                  }
                                } catch (err) {
                                  console.error('Update address error:', err);
                                } finally {
                                  setUpdateAddressLoading(false);
                                }
                              }}
                              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/25 cursor-pointer disabled:opacity-60"
                            >
                              {updateAddressLoading ? 'Updating...' : 'Save & Notify Staff'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      )}

      {/* 3. WISHLIST */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlist.length === 0 ? (
            <div className="p-12 text-center rounded-3xl" style={{ background: isDark ? '#111522' : '#FFFFFF', border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>
              <Heart className="h-10 w-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Your Wishlist is Empty</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl flex items-center justify-between gap-3"
                  style={{ background: isDark ? '#111522' : '#FFFFFF', border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}
                >
                  <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{item.name}</p>
                    <p className="text-xs font-black text-purple-400">ETB {Number(item.price).toLocaleString()}</p>
                  </div>
                  <button onClick={() => toggle(item)} className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 cursor-pointer">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. SETTINGS & PROFILE */}
      {(activeTab === 'settings' || activeTab === 'profile') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card A: Profile Details Form */}
            <div
              className="p-6 sm:p-8 rounded-3xl lg:col-span-2 space-y-4"
              style={{ background: isDark ? '#111522' : '#FFFFFF', border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}
            >
              <div>
                <h2 className="text-base font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  Account & Profile Details
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage your personal name, contact details, and account preferences.
                </p>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>First Name</label>
                    <input
                      type="text"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl font-medium focus:outline-none"
                      style={{ background: isDark ? '#171B2B' : '#F8FAFC', border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`, color: isDark ? '#F8FAFC' : '#0F172A' }}
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Last Name</label>
                    <input
                      type="text"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl font-medium focus:outline-none"
                      style={{ background: isDark ? '#171B2B' : '#F8FAFC', border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`, color: isDark ? '#F8FAFC' : '#0F172A' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Email</label>
                  <input
                    type="email"
                    disabled
                    value={profileForm.email}
                    className="w-full px-3.5 py-2.5 rounded-xl font-medium opacity-60"
                    style={{ background: isDark ? '#171B2B' : '#F8FAFC', border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`, color: isDark ? '#F8FAFC' : '#0F172A' }}
                  />
                </div>

                <button type="submit" className="btn-neon-primary px-6 py-3 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md mt-4">
                  <Save className="h-3.5 w-3.5" />
                  <span>{profileSaved ? 'Profile Saved!' : 'Save Details'}</span>
                </button>
              </form>
            </div>

            {/* Card B: Admin Announcements Entry */}
            <div
              className="p-6 sm:p-8 rounded-3xl space-y-4 flex flex-col justify-between"
              style={{ background: isDark ? '#111522' : '#FFFFFF', border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}
            >
              <div className="space-y-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}
                >
                  <Megaphone className="h-6 w-6" />
                </div>
                <h3 className="text-base font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  Admin Announcements
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  Read official announcements, storewide notices, and updates published by EthioShop Administration.
                </p>
              </div>

              <Link
                to="/announcements"
                className="btn-neon-primary w-full py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md mt-4"
              >
                <span>View Announcements</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── PROFILE IMAGE MANAGEMENT MODAL ── */}
      <ProfileImageModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        currentAvatar={user?.avatar}
        isDark={isDark}
      />

      {/* ── OFFICIAL PACKING SLIP MODAL (FOR SHIPPED/DELIVERED ORDERS) ── */}
      {selectedPackingSlip && (
        <PackingSlipModal
          order={selectedPackingSlip}
          isOpen={!!selectedPackingSlip}
          onClose={() => setSelectedPackingSlip(null)}
          isDark={isDark}
        />
      )}
    </div>
  );
}
