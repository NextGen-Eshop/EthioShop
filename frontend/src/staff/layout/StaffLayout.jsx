import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  CreditCard,
  Settings,
  Bell,
  LogOut,
  User,
  X,
  Menu,
  Search,
  ChevronDown,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useStaffStore } from '../store/staffStore';
import ThemeToggle from '../../components/ui/ThemeToggle';
import StaffFooter from '../components/StaffFooter';

const staffNavLinks = [
  { to: '/staff/overview', label: 'Dashboard', icon: LayoutDashboard, badgeKey: null },
  { to: '/staff/products', label: 'Products & Inventory', icon: ShoppingBag, badgeKey: 'products' },
  { to: '/staff/orders', label: 'Orders & Delivery', icon: Package, badgeKey: 'pendingOrders' },
  { to: '/staff/payments', label: 'Chapa Payouts', icon: CreditCard, badgeKey: null, accent: 'emerald' },
  { to: '/staff/settings', label: 'Staff Settings', icon: Settings, badgeKey: null },
];

const menuContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.11, delayChildren: 0.06 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

const menuItemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: -6, transition: { duration: 0.18 } },
};

export default function StaffLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const { products, orders, staffAvatar, setStaffAvatar } = useStaffStore();

  const [topMenuOpen, setTopMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);

  const fileInputRef = useRef(null);
  const searchRef = useRef(null);

  const lowStockCount = products.filter((p) => p.stock <= (p.lowStockThreshold || 5)).length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'confirmed').length;

  const displayName =
    user?.name ||
    `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
    'Yehwala Obssi';

  const avatarImage =
    staffAvatar ||
    user?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  const isActive = (path) => {
    const basePath = path.split('?')[0];
    if (basePath === '/staff/overview') {
      return location.pathname === '/staff/overview' || location.pathname === '/staff';
    }
    return location.pathname === basePath && !path.includes('?new=1');
  };

  const badgeFor = (key) => {
    if (key === 'lowStock') return lowStockCount;
    if (key === 'pendingOrders') return pendingOrdersCount;
    if (key === 'products') return products.length;
    return 0;
  };

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { products: [], orders: [] };
    return {
      products: products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.sku?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q)
        )
        .slice(0, 4),
      orders: orders
        .filter(
          (o) =>
            o.id.toLowerCase().includes(q) ||
            o.customer?.name?.toLowerCase().includes(q)
        )
        .slice(0, 4),
    };
  }, [searchQuery, products, orders]);

  const hasSearchHits = searchResults.products.length > 0 || searchResults.orders.length > 0;

  useEffect(() => {
    setTopMenuOpen(false);
    setProfileOpen(false);
    setAlertsOpen(false);
    setSearchOpen(false);
    setMobileSearchVisible(false);
    setSearchQuery('');
  }, [location.pathname]);

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setStaffAvatar(ev.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div
      data-theme="storefront"
      data-mode={theme}
      className="min-h-screen flex flex-col font-sans antialiased transition-colors duration-300 relative w-full overflow-x-hidden"
      style={{
        background: isDark ? '#080A12' : '#F8FAFC',
        color: isDark ? '#F8FAFC' : '#0F172A',
      }}
      onClick={() => {
        setProfileOpen(false);
        setAlertsOpen(false);
        setSearchOpen(false);
        setTopMenuOpen(false);
      }}
    >
      {/* ══════════════════════════════════════════════════════
          TOP HEADER
         ══════════════════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-30 transition-colors duration-300 border-b w-full"
        style={{
          background: isDark ? 'rgba(8, 10, 18, 0.90)' : 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderColor: isDark ? '#252A3A' : '#E2E8F0',
        }}
      >
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Brand */}
          <Link to="/staff/overview" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
            <div
              className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl transition-transform group-hover:scale-105 shrink-0"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                boxShadow: '0 0 20px rgba(139,92,246,0.40)',
              }}
            >
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-sm sm:text-base tracking-tight" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
                <span style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Ethio</span>
                <span className="text-gradient-brand">Shop</span>
              </span>
              <span className="text-[8px] sm:text-[9px] font-semibold tracking-[0.18em] uppercase mt-0.5 text-purple-400">
                Staff Operations
              </span>
            </div>
          </Link>

          {/* Center: Search (Desktop) */}
          <div className="relative flex-1 max-w-md hidden md:block" ref={searchRef} onClick={(e) => e.stopPropagation()}>
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
              style={{ color: isDark ? '#64748B' : '#94A3B8' }}
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search products, orders, customers, SKU..."
              className="w-full h-10 pl-10 pr-4 rounded-2xl text-xs font-medium outline-none transition-all"
              style={{
                background: isDark ? '#111522' : '#FFFFFF',
                border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                color: isDark ? '#F8FAFC' : '#0F172A',
              }}
              onFocusCapture={(e) => {
                e.currentTarget.style.borderColor = '#8B5CF6';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.18)';
              }}
              onBlurCapture={(e) => {
                e.currentTarget.style.borderColor = isDark ? '#252A3A' : '#E2E8F0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />

            <AnimatePresence>
              {searchOpen && searchQuery.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute left-0 right-0 top-full mt-2 rounded-2xl p-2.5 shadow-2xl z-50 max-h-80 overflow-y-auto"
                  style={{
                    background: isDark ? '#111522' : '#FFFFFF',
                    border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                  }}
                >
                  {!hasSearchHits && (
                    <p className="text-xs px-3 py-3 text-center" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                      No results found for "{searchQuery}"
                    </p>
                  )}
                  {searchResults.products.map((p) => (
                    <Link
                      key={p.id}
                      to="/staff/products"
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-colors"
                      style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                    >
                      <img src={p.image} alt="" className="h-8 w-8 rounded-lg object-cover bg-slate-800" />
                      <div className="min-w-0">
                        <p className="font-bold truncate">{p.name}</p>
                        <p className="text-[10px]" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{p.sku} · {p.stock} in stock</p>
                      </div>
                    </Link>
                  ))}
                  {searchResults.orders.map((o) => (
                    <Link
                      key={o.id}
                      to={`/staff/orders?selected=${o.id}`}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-colors"
                      style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                    >
                      <Package className="h-4 w-4 text-purple-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold truncate">{o.id} · {o.customer.name}</p>
                        <p className="text-[10px]" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{o.status} · ETB {o.totalAmount.toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mobile Search Toggle */}
            <button
              type="button"
              onClick={() => setMobileSearchVisible((v) => !v)}
              className="md:hidden h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center cursor-pointer transition-all"
              style={{
                background: mobileSearchVisible ? 'rgba(139,92,246,0.15)' : isDark ? '#111522' : '#FFFFFF',
                border: `1px solid ${mobileSearchVisible ? '#8B5CF6' : isDark ? '#252A3A' : '#E2E8F0'}`,
                color: mobileSearchVisible ? '#8B5CF6' : isDark ? '#94A3B8' : '#64748B',
              }}
              aria-label="Toggle Mobile Search"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Notification Bell */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => { setAlertsOpen((v) => !v); setProfileOpen(false); }}
                className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center cursor-pointer transition-all"
                style={{
                  background: isDark ? '#111522' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                  color: isDark ? '#94A3B8' : '#64748B',
                }}
                aria-label="Notifications"
              >
                <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {(pendingOrdersCount + lowStockCount) > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 h-3.5 min-w-3.5 px-0.5 rounded-full text-white text-[8px] font-black flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6)' }}
                  >
                    {pendingOrdersCount + lowStockCount}
                  </span>
                )}
              </motion.button>

              <AnimatePresence>
                {alertsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.96 }}
                    className="absolute right-0 top-full mt-2 z-50 w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl p-4 shadow-2xl"
                    style={{
                      background: isDark ? '#111522' : '#FFFFFF',
                      border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                    }}
                  >
                    <div className="flex items-center justify-between pb-3 mb-3 border-b" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Notifications</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-400 font-bold">Alerts</span>
                      </div>
                      <button onClick={() => setAlertsOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="space-y-2 text-xs max-h-72 overflow-y-auto">
                      <Link
                        to="/staff/orders"
                        onClick={() => setAlertsOpen(false)}
                        className="flex items-start gap-3 p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 transition-colors"
                      >
                        <ShoppingBag className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{pendingOrdersCount} orders awaiting fulfillment</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Please review & assign courier delivery.</p>
                        </div>
                      </Link>
                      <Link
                        to="/staff/products?filter=low_stock"
                        onClick={() => setAlertsOpen(false)}
                        className="flex items-start gap-3 p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
                      >
                        <Zap className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{lowStockCount} low-stock inventory alerts</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Stock replenishment required.</p>
                        </div>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Circular Profile Avatar Button */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setProfileOpen((v) => !v); setAlertsOpen(false); }}
                className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full cursor-pointer transition-all shrink-0"
                aria-label="Staff Profile"
                style={{
                  boxShadow: profileOpen ? '0 0 0 3px rgba(139,92,246,0.5)' : '0 0 0 2px rgba(139,92,246,0.3)',
                }}
              >
                <img
                  src={avatarImage}
                  alt="Staff"
                  className="h-full w-full rounded-full object-cover"
                />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#080A12]" />
              </motion.button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.96 }}
                    className="absolute right-0 top-full mt-2 z-50 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl p-4 shadow-2xl"
                    style={{
                      background: isDark ? '#111522' : '#FFFFFF',
                      border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                    }}
                  >
                    <div className="text-center pb-3 mb-2 border-b flex flex-col items-center" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
                      <img
                        src={avatarImage}
                        alt="Avatar"
                        className="h-14 w-14 rounded-full object-cover ring-4 ring-purple-500/40 shadow-lg"
                      />
                      <h4 className="text-sm font-black mt-2 truncate max-w-full" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{displayName}</h4>
                      <p className="text-xs text-purple-400 font-semibold">Staff Member</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-full">{user?.email || 'yehwala.obssi@ethioshop.et'}</p>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2.5 px-3 py-1.5 rounded-xl btn-neon-secondary text-xs font-bold cursor-pointer"
                      >
                        Change Photo
                      </button>
                    </div>
                    <div className="space-y-0.5 text-xs">
                      <Link
                        to="/staff/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors hover:bg-purple-500/10"
                        style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                      >
                        <User className="h-4 w-4 text-purple-400" />
                        <span>Staff Settings</span>
                      </Link>
                      <Link
                        to="/staff/payments"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors hover:bg-purple-500/10"
                        style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                      >
                        <CreditCard className="h-4 w-4 text-emerald-400" />
                        <span>Chapa Payouts & Wallet</span>
                      </Link>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 font-bold transition-colors cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── MENU BUTTON + COMPACT DROPDOWN ── */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <motion.button
                type="button"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => setTopMenuOpen((v) => !v)}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center cursor-pointer transition-all shrink-0"
                style={{
                  background: topMenuOpen
                    ? 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
                    : (isDark ? '#111522' : '#FFFFFF'),
                  border: `1px solid ${topMenuOpen ? 'transparent' : (isDark ? '#252A3A' : '#E2E8F0')}`,
                  boxShadow: topMenuOpen ? '0 0 14px rgba(139,92,246,0.45)' : 'none',
                  color: topMenuOpen ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B'),
                }}
                title={topMenuOpen ? 'Close Menu' : 'Open Navigation Menu'}
                aria-label="Toggle Navigation Menu"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {topMenuOpen ? (
                    <motion.span
                      key="close"
                      initial={{ rotate: -45, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 45, opacity: 0 }}
                      transition={{ duration: 0.16 }}
                    >
                      <X className="h-4 w-4" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="open"
                      initial={{ rotate: 45, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -45, opacity: 0 }}
                      transition={{ duration: 0.16 }}
                    >
                      <Menu className="h-4 w-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* ── Compact dropdown anchored to button ── */}
              <AnimatePresence>
                {topMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl shadow-2xl z-50 flex flex-col"
                    style={{
                      background: isDark ? '#0F1220' : '#FFFFFF',
                      border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                      maxHeight: '80vh',
                    }}
                  >
                    {/* Sticky label header */}
                    <div className="px-3 pt-3 pb-1.5 shrink-0">
                      <p
                        className="text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: isDark ? '#475569' : '#9CA3AF' }}
                      >
                        Navigation
                      </p>
                    </div>

                    {/* Scrollable list area */}
                    <div className="overflow-y-auto flex-1 px-2 pb-2" style={{ scrollbarWidth: 'none' }}>
                      <motion.ul
                        variants={menuContainerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-0.5"
                      >
                        {staffNavLinks.map((item) => {
                          const Icon = item.icon;
                          const active = isActive(item.to);
                          const badge = badgeFor(item.badgeKey);
                          return (
                            <motion.li key={item.label} variants={menuItemVariants}>
                              <Link
                                to={item.to}
                                onClick={() => setTopMenuOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150"
                                style={{
                                  background: active
                                    ? (isDark ? 'rgba(139,92,246,0.09)' : 'rgba(139,92,246,0.06)')
                                    : 'transparent',
                                  borderLeft: active ? '2px solid rgba(139,92,246,0.7)' : '2px solid transparent',
                                }}
                                onMouseEnter={(e) => {
                                  if (!active) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
                                }}
                                onMouseLeave={(e) => {
                                  if (!active) e.currentTarget.style.background = 'transparent';
                                }}
                              >
                                <span
                                  className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                                  style={{
                                    background: active
                                      ? 'linear-gradient(135deg,#8B5CF6,#EC4899)'
                                      : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'),
                                    color: active ? '#FFF' : item.accent === 'emerald' ? '#10B981' : (isDark ? '#94A3B8' : '#64748B'),
                                  }}
                                >
                                  <Icon className="h-3.5 w-3.5" />
                                </span>
                                <span
                                  className="flex-1 text-xs font-semibold truncate"
                                  style={{ color: active ? (isDark ? '#F8FAFC' : '#0F172A') : (isDark ? '#CBD5E1' : '#374151') }}
                                >
                                  {item.label}
                                </span>
                                {badge > 0 && (
                                  <span
                                    className="text-[9px] font-black px-1.5 py-0.5 rounded-full text-white shrink-0"
                                    style={{ background: 'linear-gradient(135deg,#EC4899,#8B5CF6)' }}
                                  >
                                    {badge}
                                  </span>
                                )}
                              </Link>
                            </motion.li>
                          );
                        })}

                        {/* Separator */}
                        <motion.li variants={menuItemVariants}>
                          <div className="my-1.5 h-px" style={{ background: isDark ? '#1E2235' : '#E9ECF0' }} />
                        </motion.li>

                        {/* Theme toggle */}
                        <motion.li variants={menuItemVariants}>
                          <div
                            className="flex items-center gap-3 px-3 py-2 rounded-xl"
                            style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                          >
                            <span
                              className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                              style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' }}
                            >
                              <Zap className="h-3.5 w-3.5 text-amber-400" />
                            </span>
                            <span className="flex-1 text-xs font-semibold" style={{ color: isDark ? '#CBD5E1' : '#374151' }}>Theme</span>
                            <ThemeToggle />
                          </div>
                        </motion.li>

                        {/* Avatar / Profile row */}
                        <motion.li variants={menuItemVariants}>
                          <button
                            type="button"
                            onClick={() => { setTopMenuOpen(false); setTimeout(() => setProfileOpen(true), 80); }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 cursor-pointer text-left"
                            onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.05)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            <div className="relative shrink-0">
                              <img src={avatarImage} alt="Avatar" className="h-7 w-7 rounded-full object-cover ring-2 ring-purple-500/40" />
                              <span className="absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full bg-emerald-400 ring-1 ring-[#0F1220]" />
                            </div>
                            <span className="flex-1 text-xs font-semibold" style={{ color: isDark ? '#CBD5E1' : '#374151' }}>Profile</span>
                            <ChevronDown className="h-3 w-3 opacity-40" style={{ color: isDark ? '#94A3B8' : '#64748B' }} />
                          </button>
                        </motion.li>

                        {/* Sign Out */}
                        <motion.li variants={menuItemVariants}>
                          <button
                            type="button"
                            onClick={() => { setTopMenuOpen(false); handleSignOut(); }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 cursor-pointer text-left"
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(244,63,94,0.08)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            <span
                              className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                              style={{ background: 'rgba(244,63,94,0.12)', color: '#F43F5E' }}
                            >
                              <LogOut className="h-3.5 w-3.5" />
                            </span>
                            <span className="flex-1 text-xs font-semibold text-rose-400">Sign Out</span>
                          </button>
                        </motion.li>
                      </motion.ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar Expansion */}
        <AnimatePresence>
          {mobileSearchVisible && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t px-3 py-2.5 overflow-hidden"
              style={{
                borderColor: isDark ? '#252A3A' : '#E2E8F0',
                background: isDark ? '#080A12' : '#FFFFFF',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                  style={{ color: isDark ? '#64748B' : '#94A3B8' }}
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  placeholder="Search products, orders, customers..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl text-xs font-medium outline-none"
                  style={{
                    background: isDark ? '#111522' : '#F8FAFC',
                    border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                    color: isDark ? '#F8FAFC' : '#0F172A',
                  }}
                  autoFocus
                />
              </div>

              {searchOpen && searchQuery.trim() && (
                <div
                  className="mt-2 rounded-xl p-2 shadow-xl max-h-60 overflow-y-auto border"
                  style={{
                    background: isDark ? '#111522' : '#FFFFFF',
                    borderColor: isDark ? '#252A3A' : '#E2E8F0',
                  }}
                >
                  {!hasSearchHits && (
                    <p className="text-xs px-3 py-2 text-center text-slate-400">No results found for "{searchQuery}"</p>
                  )}
                  {searchResults.products.map((p) => (
                    <Link
                      key={p.id}
                      to="/staff/products"
                      onClick={() => setMobileSearchVisible(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs"
                    >
                      <img src={p.image} alt="" className="h-7 w-7 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="font-bold truncate" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.sku} · {p.stock} in stock</p>
                      </div>
                    </Link>
                  ))}
                  {searchResults.orders.map((o) => (
                    <Link
                      key={o.id}
                      to={`/staff/orders?selected=${o.id}`}
                      onClick={() => setMobileSearchVisible(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs"
                    >
                      <ShoppingBag className="h-4 w-4 text-purple-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold truncate" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{o.id} · {o.customer.name}</p>
                        <p className="text-[10px] text-slate-400">{o.status} · ETB {o.totalAmount.toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ══════════════════════════════════════════════════════
          MAIN CONTENT
         ══════════════════════════════════════════════════════ */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <StaffFooter />
    </div>
  );
}
