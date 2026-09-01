import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Shield,
  Package,
  Tag,
  Archive,
  ShoppingBag,
  CreditCard,
  BarChart3,
  Settings,
  User,
  LogOut,
  X,
  Menu,
  Search,
  ChevronDown,
  Zap,
  Sparkles,
  Megaphone,
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useThemeStore } from '../../../store/themeStore';
import { useAdminStore } from '../../store/adminStore';
import { useStaffStore } from '../../../staff/store/staffStore';
import ThemeToggle from '../../../components/ui/ThemeToggle';
import AdminFooter from './Footer';
import NotificationBell from '../../../components/notifications/NotificationBell';

const adminNavLinks = [
  { to: '/admin/overview', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users, badgeKey: 'users' },
  { to: '/admin/staff', label: 'Staff Team', icon: UserCog, badgeKey: 'staff' },
  { to: '/admin/roles', label: 'Roles & Permissions', icon: Shield },
  { to: '/admin/products', label: 'Products', icon: Package, badgeKey: 'products' },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
  { to: '/admin/inventory', label: 'Inventory', icon: Archive, badgeKey: 'lowStock' },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag, badgeKey: 'pendingOrders' },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard, accent: 'emerald' },
  { to: '/admin/promotions', label: 'Discounts & Deals', icon: Sparkles },
  { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/admin/analytics', label: 'Reports & Analytics', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/profile', label: 'Admin Profile', icon: User },
];

const menuContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
};

const menuItemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: -6, transition: { duration: 0.18 } },
};

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const { users, staff, adminAvatar, setAdminAvatar } = useAdminStore();
  const { products, orders } = useStaffStore();

  const [topMenuOpen, setTopMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);

  const fileInputRef = useRef(null);
  const searchRef = useRef(null);

  const lowStockCount = products.filter((p) => p.stock <= (p.lowStockThreshold || 5)).length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  const displayName = user?.name || 'Administrator';
  const avatarImage =
    adminAvatar ||
    user?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  const isActive = (path) => {
    if (path === '/admin/overview') {
      return location.pathname === '/admin/overview' || location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const badgeFor = (key) => {
    if (key === 'lowStock' && lowStockCount > 0) return lowStockCount;
    if (key === 'pendingOrders' && pendingOrdersCount > 0) return pendingOrdersCount;
    if (key === 'users') return users.length;
    if (key === 'staff') return staff.length;
    if (key === 'products') return products.length;
    return 0;
  };

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { products: [], orders: [], users: [] };
    return {
      products: products
        .filter((p) => p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q))
        .slice(0, 3),
      orders: orders
        .filter((o) => o.id.toLowerCase().includes(q) || o.customer?.name?.toLowerCase().includes(q))
        .slice(0, 3),
      users: users
        .filter((u) => u.name.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
        .slice(0, 3),
    };
  }, [searchQuery, products, orders, users]);

  const hasSearchHits =
    searchResults.products.length > 0 || searchResults.orders.length > 0 || searchResults.users.length > 0;

  useEffect(() => {
    setTopMenuOpen(false);
    setProfileOpen(false);
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
      setAdminAvatar(ev.target.result);
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
        setNotifOpen(false);
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
          background: isDark ? 'rgba(8, 10, 18, 0.92)' : 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderColor: isDark ? '#252A3A' : '#E2E8F0',
        }}
      >
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Brand Logo */}
          <Link to="/admin/overview" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
            <div
              className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl transition-transform group-hover:scale-105 shrink-0"
              style={{
                background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
                boxShadow: '0 0 20px rgba(236,72,153,0.40)',
              }}
            >
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-sm sm:text-base tracking-tight" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
                <span style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Ethio</span>
                <span className="text-gradient-brand">Shop</span>
              </span>
              <span className="text-[8px] sm:text-[9px] font-semibold tracking-[0.18em] uppercase mt-0.5 text-pink-400">
                Admin Control
              </span>
            </div>
          </Link>

          {/* Center: Search Bar (Desktop) */}
          <div className="relative flex-1 max-w-md hidden md:block" ref={searchRef} onClick={(e) => e.stopPropagation()}>
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
              onFocus={() => setSearchOpen(true)}
              placeholder="Search products, orders, users, SKU..."
              className="w-full h-10 pl-10 pr-4 rounded-2xl text-xs font-medium outline-none transition-all"
              style={{
                background: isDark ? '#111522' : '#FFFFFF',
                border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                color: isDark ? '#F8FAFC' : '#0F172A',
              }}
              onFocusCapture={(e) => {
                e.currentTarget.style.borderColor = '#EC4899';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(236,72,153,0.18)';
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
                      to="/admin/products"
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-colors"
                      style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                    >
                      <img src={p.image} alt="" className="h-8 w-8 rounded-lg object-cover bg-slate-800" />
                      <div className="min-w-0">
                        <p className="font-bold truncate">{p.name}</p>
                        <p className="text-[10px]" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                          {p.sku} · {p.stock} in stock
                        </p>
                      </div>
                    </Link>
                  ))}
                  {searchResults.orders.map((o) => (
                    <Link
                      key={o.id}
                      to="/admin/orders"
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-colors"
                      style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                    >
                      <ShoppingBag className="h-4 w-4 text-purple-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold truncate">{o.id} · {o.customer.name}</p>
                        <p className="text-[10px]" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                          {o.status} · ETB {o.totalAmount.toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                  {searchResults.users.map((u) => (
                    <Link
                      key={u.id}
                      to="/admin/users"
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-colors"
                      style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                    >
                      <Users className="h-4 w-4 text-pink-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold truncate">{u.name}</p>
                        <p className="text-[10px]" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{u.email}</p>
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
                background: mobileSearchVisible ? 'rgba(236,72,153,0.15)' : isDark ? '#111522' : '#FFFFFF',
                border: `1px solid ${mobileSearchVisible ? '#EC4899' : isDark ? '#252A3A' : '#E2E8F0'}`,
                color: mobileSearchVisible ? '#EC4899' : isDark ? '#94A3B8' : '#64748B',
              }}
              aria-label="Toggle Mobile Search"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Notification Bell (backend API) */}
            <NotificationBell isDark={isDark} />

            {/* Circular Profile Avatar Button */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setProfileOpen((v) => !v);
                  setNotifOpen(false);
                }}
                className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full cursor-pointer transition-all shrink-0"
                aria-label="Admin Profile"
                style={{
                  boxShadow: profileOpen ? '0 0 0 3px rgba(236,72,153,0.5)' : '0 0 0 2px rgba(236,72,153,0.3)',
                }}
              >
                <img src={avatarImage} alt="Admin" className="h-full w-full rounded-full object-cover" />
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
                      <img src={avatarImage} alt="Avatar" className="h-14 w-14 rounded-full object-cover ring-4 ring-pink-500/40 shadow-lg" />
                      <h4 className="text-sm font-black mt-2 truncate max-w-full" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                        {displayName}
                      </h4>
                      <p className="text-xs text-pink-400 font-semibold">Super Administrator</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-full">{user?.email || 'admin@ethioshop.et'}</p>
                    </div>
                    <div className="space-y-0.5 text-xs">
                      <Link
                        to="/admin/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors hover:bg-pink-500/10"
                        style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                      >
                        <User className="h-4 w-4 text-pink-400" />
                        <span>Admin Profile</span>
                      </Link>
                      <Link
                        to="/admin/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors hover:bg-pink-500/10"
                        style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                      >
                        <Settings className="h-4 w-4 text-purple-400" />
                        <span>System Settings</span>
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

            {/* ── TOP-RIGHT MENU BUTTON + COMPACT SLOW-STAGGER DROPDOWN ── */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <motion.button
                type="button"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => setTopMenuOpen((v) => !v)}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center cursor-pointer transition-all shrink-0"
                style={{
                  background: topMenuOpen
                    ? 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)'
                    : (isDark ? '#111522' : '#FFFFFF'),
                  border: `1px solid ${topMenuOpen ? 'transparent' : (isDark ? '#252A3A' : '#E2E8F0')}`,
                  boxShadow: topMenuOpen ? '0 0 16px rgba(236,72,153,0.5)' : 'none',
                  color: topMenuOpen ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B'),
                }}
                title={topMenuOpen ? 'Close Menu' : 'Open Admin Navigation Menu'}
                aria-label="Toggle Admin Navigation Menu"
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
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl shadow-2xl z-50 flex flex-col"
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
                        Admin Navigation
                      </p>
                    </div>

                    {/* Scrollable list area with slow staggered animations */}
                    <div className="overflow-y-auto flex-1 px-2 pb-2" style={{ scrollbarWidth: 'none' }}>
                      <motion.ul
                        variants={menuContainerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-0.5"
                      >
                        {adminNavLinks.map((item) => {
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
                                    ? (isDark ? 'rgba(236,72,153,0.12)' : 'rgba(236,72,153,0.07)')
                                    : 'transparent',
                                  borderLeft: active ? '2px solid rgba(236,72,153,0.8)' : '2px solid transparent',
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
                                      ? 'linear-gradient(135deg, #EC4899, #8B5CF6)'
                                      : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'),
                                    color: active
                                      ? '#FFF'
                                      : item.accent === 'emerald'
                                      ? '#10B981'
                                      : (isDark ? '#94A3B8' : '#64748B'),
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
                                    style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6)' }}
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
                            <span className="flex-1 text-xs font-semibold" style={{ color: isDark ? '#CBD5E1' : '#374151' }}>
                              Theme
                            </span>
                            <ThemeToggle />
                          </div>
                        </motion.li>

                        {/* Avatar / Profile row */}
                        <motion.li variants={menuItemVariants}>
                          <button
                            type="button"
                            onClick={() => {
                              setTopMenuOpen(false);
                              setTimeout(() => setProfileOpen(true), 80);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 cursor-pointer text-left"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = isDark ? 'rgba(236,72,153,0.08)' : 'rgba(236,72,153,0.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <div className="relative shrink-0">
                              <img src={avatarImage} alt="Avatar" className="h-7 w-7 rounded-full object-cover ring-2 ring-pink-500/40" />
                              <span className="absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full bg-emerald-400 ring-1 ring-[#0F1220]" />
                            </div>
                            <span className="flex-1 text-xs font-semibold" style={{ color: isDark ? '#CBD5E1' : '#374151' }}>
                              Profile
                            </span>
                            <ChevronDown className="h-3 w-3 opacity-40" style={{ color: isDark ? '#94A3B8' : '#64748B' }} />
                          </button>
                        </motion.li>

                        {/* Sign Out */}
                        <motion.li variants={menuItemVariants}>
                          <button
                            type="button"
                            onClick={() => {
                              setTopMenuOpen(false);
                              handleSignOut();
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 cursor-pointer text-left"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(244,63,94,0.08)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
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
                  placeholder="Search products, orders, users, SKU..."
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
                      to="/admin/products"
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
                      to="/admin/orders"
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
                  {searchResults.users.map((u) => (
                    <Link
                      key={u.id}
                      to="/admin/users"
                      onClick={() => setMobileSearchVisible(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs"
                    >
                      <Users className="h-4 w-4 text-pink-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold truncate" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.email}</p>
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
          MAIN ADMIN CONTENT
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
      <AdminFooter />
    </div>
  );
}
