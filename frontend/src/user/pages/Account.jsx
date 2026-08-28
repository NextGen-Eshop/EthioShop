import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Heart, User, LayoutDashboard, LogOut,
  CheckCircle, Clock, Truck, ShieldCheck, ArrowRight, Save
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';
import { useThemeStore } from '../../store/themeStore';
import Avatar from '../../components/ui/Avatar';

const mockOrders = [
  {
    id: 'ORD-2024-001',
    date: 'Apr 18, 2026',
    total: 2180,
    status: 'delivered',
    items: [{ name: 'Wireless Noise-Canceling Headphones', qty: 1, price: 1200 }, { name: 'Smart Power Bank 20000mAh', qty: 1, price: 980 }],
  },
  {
    id: 'ORD-2024-002',
    date: 'Apr 10, 2026',
    total: 1580,
    status: 'shipped',
    items: [{ name: 'Ergonomic Mechanical Keyboard', qty: 1, price: 1580 }],
  },
  {
    id: 'ORD-2024-003',
    date: 'Mar 28, 2026',
    total: 980,
    status: 'delivered',
    items: [{ name: 'Fast Wireless Charging Stand', qty: 1, price: 980 }],
  },
];

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
  const [profileForm, setProfileForm] = useState({
    name: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Customer',
    email: user?.email || '',
    phone: user?.phone || '+251 91 123 4567',
    address: user?.address || 'Bole, Addis Ababa, Ethiopia',
  });
  const [profileSaved, setProfileSaved] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="container-shell flex flex-col items-center justify-center py-32 text-center">
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 text-4xl"
          style={{ background: isDark ? '#111522' : '#FFFFFF', border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}
        >
          🔒
        </div>
        <h2 className="text-2xl font-black mb-2" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
          Sign in to view your profile
        </h2>
        <p className="text-sm mb-6 max-w-xs" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
          You need to be signed in to access your orders and account settings.
        </p>
        <Link to="/login?redirect=/account" className="btn-neon-primary px-8 py-3.5 text-sm inline-flex items-center gap-2">
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

  const totalSpent = mockOrders.reduce((s, o) => s + o.total, 0);

  return (
    <div style={{ background: isDark ? '#080A12' : '#F8FAFC', minHeight: '100vh' }} className="transition-colors duration-300">
      <div className="container-shell max-w-[1200px] mx-auto px-4 py-10">

        {/* Account Header */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl mb-8 shadow-xl"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
          }}
        >
          <div className="flex items-center gap-4">
            <Avatar
              src={user?.avatar}
              name={profileForm.name}
              size="lg"
              showBadge={true}
              badgeColor="bg-emerald-500"
            />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  {profileForm.name}
                </h1>
                {user?.role && user.role !== 'user' && (
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                    style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.3)' }}
                  >
                    {user.role}
                  </span>
                )}
              </div>
              <p className="text-xs mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{profileForm.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(user?.role === 'admin' || user?.role === 'staff') && (
              <Link
                to={user?.role === 'staff' ? '/staff/overview' : '/admin/overview'}
                className="btn-neon-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5"
              >
                <span>🛠️ {user?.role === 'staff' ? 'Staff Portal' : 'Admin Portal'}</span>
              </Link>
            )}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleSignOut}
              className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              style={{
                background: 'rgba(244,63,94,0.1)',
                color: '#F43F5E',
                border: '1px solid rgba(244,63,94,0.25)',
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </motion.button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-[240px_1fr] gap-8 items-start">
          {/* Navigation Sidebar */}
          <nav
            className="flex lg:flex-col gap-1.5 p-2 rounded-2xl overflow-x-auto no-scrollbar shadow-md"
            style={{
              background: isDark ? '#111522' : '#FFFFFF',
              border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
            }}
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className="relative flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer"
                style={{
                  color: activeTab === t.id ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B'),
                  background: activeTab === t.id ? 'linear-gradient(135deg,#8B5CF6,#EC4899)' : 'transparent',
                  boxShadow: activeTab === t.id ? '0 4px 15px rgba(139,92,246,0.35)' : 'none',
                }}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </nav>

          {/* Content Views */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* 1. OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Total Orders', val: mockOrders.length, desc: 'All time purchases' },
                    { label: 'Total Spent', val: `ETB ${totalSpent.toLocaleString()}`, desc: 'Completed transactions' },
                    { label: 'Wishlist Items', val: wishlist.length, desc: 'Saved products' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="p-5 rounded-2xl"
                      style={{
                        background: isDark ? '#111522' : '#FFFFFF',
                        border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                      }}
                    >
                      <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>{stat.label}</p>
                      <p className="text-2xl font-black text-gradient-brand mt-1">{stat.val}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{stat.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Recent Orders Preview */}
                <div
                  className="p-6 rounded-3xl shadow-xl"
                  style={{
                    background: isDark ? '#111522' : '#FFFFFF',
                    border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Recent Orders</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-purple-400 hover:underline cursor-pointer">
                      View all
                    </button>
                  </div>
                  <div className="space-y-3">
                    {mockOrders.slice(0, 2).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 rounded-xl"
                        style={{
                          background: isDark ? '#171B2B' : '#F8FAFC',
                          border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                        }}
                      >
                        <div>
                          <p className="text-xs font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{order.id}</p>
                          <p className="text-[10px]" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>{order.date} • {order.items.length} items</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-gradient-brand">ETB {order.total.toLocaleString()}</p>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500">{order.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. ORDERS */}
            {activeTab === 'orders' && (
              <div
                className="p-6 sm:p-8 rounded-3xl space-y-4 shadow-xl"
                style={{
                  background: isDark ? '#111522' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                }}
              >
                <h2 className="text-lg font-bold mb-4" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Order History</h2>
                {mockOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl space-y-3"
                    style={{
                      background: isDark ? '#171B2B' : '#F8FAFC',
                      border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                    }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3" style={{ borderBottom: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>
                      <div>
                        <span className="text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{order.id}</span>
                        <span className="text-xs ml-3" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>{order.date}</span>
                      </div>
                      <span
                        className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                        style={{
                          background: order.status === 'delivered' ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)',
                          color: order.status === 'delivered' ? '#22C55E' : '#3B82F6',
                        }}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-xs" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                          <span>{it.qty}x {it.name}</span>
                          <span className="font-semibold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>ETB {(it.price * it.qty).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 flex justify-between items-baseline" style={{ borderTop: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>
                      <span className="text-xs font-bold" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>Total</span>
                      <span className="text-sm font-black text-gradient-brand">ETB {order.total.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3. WISHLIST */}
            {activeTab === 'wishlist' && (
              <div
                className="p-6 sm:p-8 rounded-3xl shadow-xl"
                style={{
                  background: isDark ? '#111522' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                }}
              >
                <h2 className="text-lg font-bold mb-4" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  Saved Items ({wishlist.length})
                </h2>
                {wishlist.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 mx-auto mb-3 text-pink-400 opacity-60" />
                    <p className="text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Your wishlist is empty</p>
                    <p className="text-xs mt-1 mb-4" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Explore our catalog and tap the heart icon on any product.</p>
                    <Link to="/products" className="btn-neon-primary px-6 py-2.5 text-xs inline-block">
                      Browse Shop
                    </Link>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {wishlist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-2xl"
                        style={{
                          background: isDark ? '#171B2B' : '#F8FAFC',
                          border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                        }}
                      >
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <Link to={`/products/${item.id}`} className="text-xs font-bold line-clamp-1 hover:text-purple-400" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                            {item.name}
                          </Link>
                          <p className="text-xs font-black text-gradient-brand mt-1">ETB {item.price.toLocaleString()}</p>
                        </div>
                        <button onClick={() => toggle(item)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl cursor-pointer">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. PROFILE FORM */}
            {activeTab === 'profile' && (
              <div
                className="p-6 sm:p-8 rounded-3xl shadow-xl"
                style={{
                  background: isDark ? '#111522' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                }}
              >
                <h2 className="text-lg font-bold mb-4" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Profile Settings</h2>
                <form onSubmit={handleProfileSave} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none"
                      style={{
                        background: isDark ? '#171B2B' : '#F1F5F9',
                        border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Email Address</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      disabled
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium opacity-60 cursor-not-allowed"
                      style={{
                        background: isDark ? '#171B2B' : '#F1F5F9',
                        border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Phone Number</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none"
                      style={{
                        background: isDark ? '#171B2B' : '#F1F5F9',
                        border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Delivery Address</label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none"
                      style={{
                        background: isDark ? '#171B2B' : '#F1F5F9',
                        border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="btn-neon-primary px-6 py-3.5 text-xs font-bold flex items-center gap-2 mt-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </motion.button>
                  {profileSaved && (
                    <p className="text-xs text-emerald-500 font-bold mt-2">✓ Profile updated successfully!</p>
                  )}
                </form>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
