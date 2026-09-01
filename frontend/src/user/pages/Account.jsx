import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  { id: 'profile', label: 'Profile Details', icon: <User className="h-4 w-4" /> },
];

export default function Account() {
  const navigate = useNavigate();
  const { user, signOut, isAuthenticated } = useAuthStore();
  const { items: wishlist, toggle } = useWishlistStore();
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedPackingSlip, setSelectedPackingSlip] = useState(null);
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
                <span className="truncate max-w-full">
                  {user?.firstName || user?.name?.split(' ')[0] || 'User'}
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
            orders.map((ord) => (
              <div
                key={ord._id}
                className="p-5 sm:p-6 rounded-3xl space-y-4"
                style={{
                  background: isDark ? '#111522' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b" style={{ borderColor: isDark ? '#252A3A' : '#F1F5F9' }}>
                  <div>
                    <span className="text-xs text-purple-400 font-mono font-bold">Order #{ord._id ? ord._id.toString().slice(-6).toUpperCase() : ord.id}</span>
                    <p className="text-[11px] text-slate-400">{new Date(ord.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider"
                      style={{
                        background: ord.status === 'delivered' ? 'rgba(16,185,129,0.15)' : ord.status === 'shipped' ? 'rgba(99,102,241,0.15)' : 'rgba(245,158,11,0.15)',
                        color: ord.status === 'delivered' ? '#10B981' : ord.status === 'shipped' ? '#6366F1' : '#F59E0B',
                      }}
                    >
                      {ord.status}
                    </span>

                    {/* View Packing Slip button for shipped / delivered orders */}
                    {(ord.status === 'shipped' || ord.status === 'delivered') && (
                      <button
                        onClick={() => setSelectedPackingSlip(ord)}
                        className="px-3 py-1 rounded-xl text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 hover:bg-purple-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Packing Slip</span>
                      </button>
                    )}

                    <span className="text-sm font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                      ETB {Number(ord.totalPrice || ord.totalAmount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Items in order */}
                <div className="space-y-2">
                  {ord.items?.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img src={it.image || it.product?.image} alt="" className="h-10 w-10 rounded-xl object-cover" />
                        <div>
                          <p className="font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{it.name || it.product?.name}</p>
                          <p className="text-[11px] text-slate-400">Qty: {it.quantity || it.qty || 1}</p>
                        </div>
                      </div>
                      <span className="font-mono">ETB {((it.price || 0) * (it.quantity || it.qty || 1)).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-[11px] text-slate-400 flex flex-wrap justify-between border-t" style={{ borderColor: isDark ? '#252A3A' : '#F1F5F9' }}>
                  <span>Delivery To: {ord.shippingAddress?.city || 'Addis Ababa'} - {ord.shippingAddress?.address || 'Standard Address'}</span>
                  <span>Payment: {ord.paymentMethodRef?.name || ord.paymentMethod || 'Bank Transfer'}</span>
                </div>
              </div>
            ))
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

      {/* 4. PROFILE DETAILS */}
      {activeTab === 'profile' && (
        <div
          className="p-6 sm:p-8 rounded-3xl max-w-xl"
          style={{ background: isDark ? '#111522' : '#FFFFFF', border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}
        >
          <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
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
