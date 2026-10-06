import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search, X, Heart, ShoppingCart, Menu,
  ArrowRight, Zap, Star
} from 'lucide-react';
import { useWishlistStore } from '../../store/wishlistStore';
import { categories } from '../../data/products';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useThemeStore } from '../../store/themeStore';
import ThemeToggle from '../../components/ui/ThemeToggle';
import Avatar from '../../components/ui/Avatar';
import NotificationBell from '../../components/notifications/NotificationBell';
import AuthPromptModal from '../../components/auth/AuthPromptModal';
import { useAuthPromptStore } from '../../store/authPromptStore';
import { useSettingsStore } from '../../store/settingsStore';
import { AlertTriangle } from 'lucide-react';

const navLinks = [
  { to: '/home', label: 'Home' },
  { to: '/products', label: 'Shop' },
  { to: '/support', label: 'Support' },
];

/* ── Wishlist Panel (Dark / Light Dynamic) ── */
function WishlistPanel({ onClose }) {
  const { items, toggle } = useWishlistStore();
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  return (
    <>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
      />
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col shadow-2xl"
        style={{
          background: isDark ? '#111522' : '#FFFFFF',
          borderLeft: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                background: 'rgba(236,72,153,0.15)',
                boxShadow: '0 0 15px rgba(236,72,153,0.25)',
              }}
            >
              <Heart className="h-4.5 w-4.5 fill-pink-500 text-pink-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                Saved Items
              </h2>
              <p className="text-xs" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer"
            style={{ color: isDark ? '#94A3B8' : '#64748B' }}
          >
            <X className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Items */}
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center py-12">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-2xl"
                style={{
                  background: 'rgba(236,72,153,0.08)',
                  border: '1px solid rgba(236,72,153,0.2)',
                }}
              >
                <Heart className="h-9 w-9" style={{ color: '#EC4899', opacity: 0.5 }} />
              </div>
              <p className="text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                Your wishlist is empty
              </p>
              <p className="text-xs leading-relaxed max-w-xs" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                Save your favorite products by tapping the heart icon on any product card.
              </p>
            </div>
          ) : (
            items.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ x: 3 }}
                className="flex items-center gap-3 rounded-xl p-3 transition-all"
                style={{
                  background: isDark ? '#171B2B' : '#F8FAFC',
                  border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                }}
              >
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-14 w-14 rounded-xl object-cover"
                  style={{ background: isDark ? '#252A3A' : '#E2E8F0' }}
                />
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/products/${p.id}`}
                    onClick={onClose}
                    className="line-clamp-1 text-sm font-semibold transition-colors"
                    style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                  >
                    {p.name}
                  </Link>
                  <p className="mt-1 text-sm font-bold text-gradient-brand">
                    ETB {p.price?.toLocaleString()}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer"
                  style={{ color: '#F43F5E' }}
                  onClick={() => toggle(p)}
                  title="Remove"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </motion.div>
            ))
          )}
        </div>
      </motion.aside>
    </>
  );
}

/* ── Brand Logo ── */
function Logo({ isDark }) {
  return (
    <Link to="/home" className="flex items-center gap-2.5 shrink-0 group">
      <div
        className="relative flex h-10 w-10 items-center justify-center rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
          boxShadow: '0 0 20px rgba(139,92,246,0.40)',
        }}
      >
        <Zap className="h-5 w-5 text-white" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-black text-base tracking-tight" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
          <span style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Ethio</span>
          <span className="text-gradient-brand">Shop</span>
        </span>
        <span className="text-[9px] font-semibold tracking-[0.22em] uppercase mt-0.5" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
          Premium Store
        </span>
      </div>
    </Link>
  );
}

export default function StorefrontLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [wishlistOpen, setWishlistOpen] = useState(false);

  const { items } = useWishlistStore();
  const { isAuthenticated, user, signOut } = useAuthStore();
  const totalItems = useCartStore((state) => state.totalItems);
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const isActive = (to) => location.pathname === to;
  const isSearchVisible =
    location.pathname === '/home' ||
    location.pathname === '/' ||
    location.pathname === '/products';

  const onSearch = (event) => {
    event?.preventDefault();
    if (!search.trim()) return;
    navigate(`/products?q=${encodeURIComponent(search.trim())}`);
    setSearch('');
    setMobileOpen(false);
  };

  const handleTagClick = (tag) => navigate(`/products?q=${encodeURIComponent(tag)}`);

  const userRole = (user?.role || '').toLowerCase().trim();
  const displayName = user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Account';
  const openAuthPrompt = useAuthPromptStore((state) => state.openAuthPrompt);

  const portalPath = userRole === 'admin' ? '/admin/overview' : userRole === 'staff' ? '/staff/overview' : '/account';
  const portalLabel = userRole === 'admin' ? 'Admin Portal' : userRole === 'staff' ? 'Staff Portal' : 'My Account';

  const handleWishlistClick = () => {
    if (!isAuthenticated) {
      openAuthPrompt({
        message: 'Please login or signup to proceed',
        redirectUrl: location.pathname + location.search,
      });
      return;
    }
    if (userRole !== 'user') {
      openAuthPrompt({
        message: 'Saved items and favorites are reserved for customer accounts only.',
        redirectUrl: portalPath,
      });
      return;
    }
    setWishlistOpen(true);
  };

  const handleCartClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      openAuthPrompt({
        message: 'Please login or signup to proceed',
        redirectUrl: '/cart',
      });
      return;
    }
    if (userRole !== 'user') {
      e.preventDefault();
      openAuthPrompt({
        message: 'Shopping cart is reserved for customer accounts only.',
        redirectUrl: portalPath,
      });
      return;
    }
  };

  const { settings, fetchSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings?.storeName) {
      document.title = `${settings.storeName} — ${settings.storeTagline || "Ethiopia's Premium Online Store"}`;
    }
  }, [settings?.storeName, settings?.storeTagline]);

  return (
    <div
      data-theme="storefront"
      data-mode={theme}
      className={`flex min-h-screen flex-col transition-colors duration-300`}
      style={{
        background: isDark ? '#080A12' : '#F8FAFC',
        color: isDark ? '#F8FAFC' : '#0F172A',
      }}
    >
      {/* ── Operational System Notices (Maintenance / Order Acceptance) ── */}
      {settings.maintenanceMode && (
        <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-purple-600 text-white text-xs font-bold py-2.5 px-4 text-center flex items-center justify-center gap-2 shadow-md z-40">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{settings.maintenanceMessage || 'EthioShop is currently undergoing maintenance. We will be back shortly!'}</span>
        </div>
      )}
      {!settings.maintenanceMode && settings.orderAcceptance === false && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold py-1.5 px-4 text-center z-40">
          Notice: Order placement is temporarily paused by store administration. Product browsing remains active.
        </div>
      )}

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-30 transition-all duration-300"
        style={{
          background: isDark ? 'rgba(8,10,18,0.85)' : 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
        }}
      >
        <div className="container-shell flex h-16 items-center justify-between gap-4">
          <Logo isDark={isDark} />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="group relative py-1.5"
                >
                  <motion.span
                    whileHover={{ y: -1.5 }}
                    whileTap={{ scale: 0.96 }}
                    className="inline-block text-sm font-semibold transition-colors duration-200"
                    style={{
                      color: active
                        ? (isDark ? '#F8FAFC' : '#0F172A')
                        : (isDark ? '#94A3B8' : '#64748B'),
                    }}
                  >
                    {link.label}
                  </motion.span>
                  {active ? (
                    <motion.div
                      layoutId="activeNavLine"
                      className="absolute -bottom-0.5 left-0 right-0 h-[2.5px] rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #8B5CF6, #EC4899)',
                        boxShadow: '0 0 8px rgba(139,92,246,0.6)',
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  ) : (
                    <span
                      className="absolute -bottom-0.5 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full transition-all duration-250 ease-out group-hover:w-full"
                      style={{ background: 'rgba(139,92,246,0.5)' }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* 🌙 / ☀️ Dark & Light Mode Switcher — desktop */}
            <div className="hidden md:flex">
              <ThemeToggle />
            </div>

            {/* Wishlist */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleWishlistClick}
              className="relative flex h-10 w-10 items-center justify-center rounded-full transition-all cursor-pointer"
              style={{
                background: isDark ? '#111522' : '#FFFFFF',
                border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
              }}
              title="Saved items"
            >
              <Heart
                className="h-4.5 w-4.5 transition-colors duration-200"
                style={{
                  color: items.length > 0 ? '#EC4899' : (isDark ? '#94A3B8' : '#64748B'),
                  fill: items.length > 0 ? '#EC4899' : 'none',
                }}
              />
              {items.length > 0 && userRole === 'user' && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[9px] font-black text-white"
                  style={{
                    background: 'linear-gradient(135deg,#EC4899,#8B5CF6)',
                    boxShadow: '0 0 10px rgba(236,72,153,0.5)',
                  }}
                >
                  {items.length}
                </motion.span>
              )}
            </motion.button>

            {/* Cart */}
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
              <Link
                to="/cart"
                onClick={handleCartClick}
                className="relative flex h-10 w-10 items-center justify-center rounded-full transition-all"
                style={{
                  background: isDark ? '#111522' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                  boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
                }}
                title="Shopping cart"
              >
                <ShoppingCart
                  className="h-4.5 w-4.5 transition-colors duration-200"
                  style={{
                    color: totalItems() > 0 ? '#8B5CF6' : (isDark ? '#94A3B8' : '#64748B'),
                  }}
                />
                {totalItems() > 0 && userRole === 'user' && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[9px] font-black text-white"
                    style={{
                      background: 'linear-gradient(135deg,#8B5CF6,#EC4899)',
                      boxShadow: '0 0 10px rgba(139,92,246,0.5)',
                    }}
                  >
                    {totalItems()}
                  </motion.span>
                )}
              </Link>
            </motion.div>

            {/* Notification Bell (authenticated users only) */}
            {isAuthenticated && (
              <NotificationBell isDark={isDark} className="shrink-0" />
            )}

            {/* Profile / Sign In */}
            {isAuthenticated ? (
              <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                <Link
                  to={portalPath}
                  className="relative flex items-center justify-center rounded-full p-0.5 transition-all"
                  style={{
                    border: `2px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                  }}
                  title={`${displayName} - ${portalLabel}`}
                >
                  <Avatar src={user?.avatar} name={displayName} size="sm" showBadge={false} />
                </Link>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/login"
                  className="btn-neon-primary flex items-center h-9 px-4.5 text-xs font-bold"
                >
                  Sign In
                </Link>
              </motion.div>
            )}

            {/* Mobile menu toggle */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setMobileOpen((v) => !v)}
              className="flex md:hidden h-10 w-10 items-center justify-center rounded-full transition-colors cursor-pointer"
              style={{
                background: isDark ? '#111522' : '#FFFFFF',
                border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                color: isDark ? '#94A3B8' : '#64748B',
              }}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden"
              style={{
                borderTop: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                background: isDark ? '#111522' : '#FFFFFF',
              }}
            >
              <div className="container-shell space-y-2 py-4">
                {/* Appearance toggle row */}
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-2xl"
                  style={{
                    background: isDark ? '#171B2B' : '#F8FAFC',
                    border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{isDark ? '🌙' : '☀️'}</span>
                    <div>
                      <p className="text-xs font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                        {isDark ? 'Dark Mode' : 'Light Mode'}
                      </p>
                      <p className="text-[10px]" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
                        Tap to switch appearance
                      </p>
                    </div>
                  </div>
                  <ThemeToggle showLabel={true} />
                </div>

                <div className="my-1" style={{ borderTop: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }} />

                <div className="grid gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
                      style={{
                        color: isActive(link.to) ? '#8B5CF6' : (isDark ? '#94A3B8' : '#64748B'),
                        background: isActive(link.to) ? 'rgba(139,92,246,0.1)' : 'transparent',
                      }}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="my-1" style={{ borderTop: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }} />
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.id}`}
                      className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm transition-colors"
                      style={{ color: isDark ? '#94A3B8' : '#64748B' }}
                      onClick={() => setMobileOpen(false)}
                    >
                      <span>{cat.icon}</span>
                      <span className="font-medium">{cat.name}</span>
                    </Link>
                  ))}
                </div>
                <div className="pt-2 flex gap-2">
                  {isAuthenticated ? (
                    <>
                      <Link
                        to={portalPath}
                        onClick={() => setMobileOpen(false)}
                        className="btn-neon-secondary flex-1 py-2.5 text-center text-xs rounded-xl"
                      >
                        {portalLabel}
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setMobileOpen(false);
                          navigate('/home');
                        }}
                        className="flex-1 py-2.5 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        style={{
                          background: 'rgba(244,63,94,0.12)',
                          color: '#F43F5E',
                          border: '1px solid rgba(244,63,94,0.3)',
                        }}
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setMobileOpen(false)}
                        className="btn-neon-primary flex-1 py-2.5 text-center text-xs rounded-xl"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileOpen(false)}
                        className="btn-neon-secondary flex-1 py-2.5 text-center text-xs rounded-xl"
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Search Section ── */}
      <AnimatePresence>
        {isSearchVisible && (
          <motion.section
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="py-4 transition-colors duration-300"
            style={{
              borderBottom: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
              background: isDark ? 'rgba(17,21,34,0.6)' : 'rgba(241,245,249,0.7)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="container-shell max-w-3xl">
              <form onSubmit={onSearch} className="relative">
                <div
                  className="relative flex items-center rounded-2xl p-1.5 transition-all duration-300"
                  style={{
                    background: isDark ? '#111522' : '#FFFFFF',
                    border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                    boxShadow: isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.05)',
                  }}
                >
                  <div className="flex h-10 w-10 items-center justify-center pl-2" style={{ color: '#8B5CF6' }}>
                    <Search className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search electronics, phones, laptops, equipment..."
                    className="w-full h-11 pl-2 pr-24 bg-transparent text-sm font-medium focus:outline-none"
                    style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="p-1.5 mr-2 rounded-full transition-all cursor-pointer"
                      style={{ color: isDark ? '#64748B' : '#94A3B8' }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="btn-neon-primary h-10 px-5 text-xs flex items-center gap-1.5 shrink-0"
                  >
                    <span>Search</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </motion.button>
                </div>
              </form>

            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Page Content with Smooth Fade In / Fade Out Transitions ── */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Footer ── */}
      <footer
        className="transition-colors duration-300"
        style={{
          background: isDark ? '#0D0F1C' : '#F1F5F9',
          borderTop: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
        }}
      >
        <div className="container-shell grid gap-8 py-12 md:grid-cols-4">
          <div className="md:col-span-2 space-y-3">
            <Logo isDark={isDark} />
            <p className="max-w-md text-xs leading-relaxed" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              {settings.storeDescription || 'Premium e-commerce for Ethiopian shoppers. Discover electronics, phones, tablets, laptops, and lifestyle products with fast, trusted delivery nationwide.'}
            </p>
            {settings.storeAddress && (
              <p className="text-[11px] font-medium" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
                📍 {settings.storeAddress} {settings.storePhone ? `• 📞 ${settings.storePhone}` : ''}
              </p>
            )}
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              Shop
            </h4>
            <div className="space-y-2 text-xs">
              {categories.slice(0, 5).map((c) => (
                <Link
                  key={c.id}
                  to={`/products?category=${c.id}`}
                  className="block transition-colors"
                  style={{ color: isDark ? '#94A3B8' : '#64748B' }}
                >
                  {c.icon} {c.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              Company
            </h4>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Privacy Policy', to: '/privacy' },
                { label: 'Terms of Service', to: '/terms' },
                { label: 'Support Center', to: '/support' },
                { label: 'Contact Us', to: '/contact' },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="block transition-colors"
                  style={{ color: isDark ? '#94A3B8' : '#64748B' }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }} className="py-4">
          <div className="container-shell flex flex-col sm:flex-row items-center justify-between gap-2 text-xs" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
            <p>© {new Date().getFullYear()} {settings.storeName || 'EthioShop'}. All rights reserved.</p>
            <div className="flex items-center gap-1.5">
              <Star className="h-3 w-3" style={{ color: '#8B5CF6' }} />
              <span className="font-semibold" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Made in Ethiopia 🇪🇹</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Wishlist drawer */}
      <AnimatePresence>
        {wishlistOpen && <WishlistPanel onClose={() => setWishlistOpen(false)} />}
      </AnimatePresence>

      {/* Global Auth Requirement Prompt */}
      <AuthPromptModal />
    </div>
  );
}
