import { useState, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  CreditCard,
  Settings,
  Bell,
  LogOut,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  User,
  ShieldCheck,
  Camera,
  Trash2,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useStaffStore } from '../store/staffStore';
import StaffFooter from '../components/StaffFooter';
import Avatar from '../../components/ui/Avatar';

// 4 core staff nav links — Chapa Payouts is accessed via the profile menu
const staffNavLinks = [
  { to: '/staff/overview', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/staff/products', label: 'My Products', icon: Package, badgeKey: 'lowStock' },
  { to: '/staff/orders', label: 'Orders & Delivery', icon: ShoppingBag, badgeKey: 'pendingOrders' },
  { to: '/staff/settings', label: 'Settings', icon: Settings },
];

export default function StaffLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { products, orders, staffAvatar, setStaffAvatar } = useStaffStore();

  const [profileOpen, setProfileOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const fileInputRef = useRef(null);

  const lowStockCount = products.filter((p) => p.stock <= (p.lowStockThreshold || 5)).length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'confirmed').length;

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  const isActive = (path) =>
    location.pathname === path ||
    (path !== '/staff/overview' && location.pathname.startsWith(path));

  const displayName =
    user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Staff Member';

  // Active avatar image priority: staffAvatar from store -> user.avatar -> null (fallback initials)
  const avatarImage = staffAvatar || user?.avatar || null;

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setStaffAvatar(ev.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAvatarRemove = (e) => {
    e.stopPropagation();
    setStaffAvatar(null);
  };

  return (
    <div
      className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans antialiased"
      onClick={() => {
        setProfileOpen(false);
        setAlertsOpen(false);
      }}
    >
      {/* ── Sticky Glassmorphic Top Navigation Bar (Desktops & Tablets) ── */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between gap-4">

          {/* ── Brand Logo & Portal Scope ── */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/staff/overview" className="flex items-center gap-2.5 group">
              <motion.div
                whileHover={{ scale: 1.06, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#312e81] via-[#3857d6] to-[#4f46e5] text-white shadow-md shadow-indigo-500/20"
              >
                <span className="font-black text-sm font-mono">S</span>
                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-amber-300" />
              </motion.div>
              <div className="hidden sm:flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 leading-none">EthioShop</span>
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Staff Hub
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-400 mt-0.5">Inventory & Order Operations</span>
              </div>
            </Link>
          </div>

          {/* ── Desktop Nav Links ── */}
          <nav className="hidden md:flex items-center gap-1">
            {staffNavLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              const badgeCount =
                link.badgeKey === 'lowStock'
                  ? lowStockCount
                  : link.badgeKey === 'pendingOrders'
                  ? pendingOrdersCount
                  : 0;

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ease-in-out ${
                    active
                      ? 'bg-indigo-50 text-[#3857d6] font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 hover:shadow-2xs'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 transition-colors duration-200 ${active ? 'text-[#3857d6]' : 'text-slate-400'}`}
                  />
                  <span>{link.label}</span>
                  {badgeCount > 0 && (
                    <motion.span
                      initial={{ scale: 0.7 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white shadow-xs"
                    >
                      {badgeCount}
                    </motion.span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Right Actions (Alerts Bell & Avatar Only - Name is inside Profile ONLY) ── */}
          <div className="flex items-center gap-3">

            {/* Quick Operational Alerts Bell */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
                onClick={() => {
                  setAlertsOpen((v) => !v);
                  setProfileOpen(false);
                }}
                className="relative flex h-9.5 w-9.5 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                title="Operational Notifications"
                aria-label="Operational Notifications"
              >
                <Bell className="h-4.5 w-4.5 text-slate-500" />
                {(lowStockCount > 0 || pendingOrdersCount > 0) && (
                  <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                )}
              </motion.button>

              <AnimatePresence>
                {alertsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: "easeInOut" }}
                    className="absolute right-0 top-full mt-2 z-50 w-76 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xl shadow-slate-900/10"
                  >
                    <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100">
                      <h4 className="text-xs font-bold text-slate-900">Operational Alerts</h4>
                      <button
                        onClick={() => setAlertsOpen(false)}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5 rounded"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      {pendingOrdersCount > 0 && (
                        <Link
                          to="/staff/orders"
                          onClick={() => setAlertsOpen(false)}
                          className="flex items-start gap-2.5 p-2.5 rounded-xl bg-indigo-50/80 hover:bg-indigo-100/80 text-indigo-900 transition-colors duration-200"
                        >
                          <ShoppingBag className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">{pendingOrdersCount} orders awaiting fulfillment</p>
                            <p className="text-[11px] text-indigo-700/80 mt-0.5">Click to verify & process dispatch.</p>
                          </div>
                        </Link>
                      )}

                      {lowStockCount > 0 && (
                        <Link
                          to="/staff/products?filter=low_stock"
                          onClick={() => setAlertsOpen(false)}
                          className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50/80 hover:bg-amber-100/80 text-amber-900 transition-colors duration-200"
                        >
                          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">{lowStockCount} items low or out of stock</p>
                            <p className="text-[11px] text-amber-700/80 mt-0.5">Replenish stock to maintain sales.</p>
                          </div>
                        </Link>
                      )}

                      {pendingOrdersCount === 0 && lowStockCount === 0 && (
                        <p className="text-center py-5 text-slate-400 text-xs font-medium">
                          ✨ All operations running smoothly! No urgent alerts.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Circular Profile Trigger Button (Avatar ONLY, NO Name on Nav) ── */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
                onClick={() => {
                  setProfileOpen((v) => !v);
                  setAlertsOpen(false);
                }}
                className="relative flex items-center justify-center p-0.5 rounded-full border-2 border-slate-200/90 hover:border-[#3857d6] bg-white shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer"
                title="Staff Profile & Settings"
                aria-label="Staff Profile"
              >
                {/* Strictly Circular Avatar ONLY */}
                <Avatar
                  src={avatarImage}
                  name={displayName}
                  size="sm"
                  showBadge={true}
                  badgeColor="bg-emerald-500"
                />
              </motion.button>

              {/* ── Profile Dropdown: Name & Personal Info Displayed HERE ONLY ── */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: "easeInOut" }}
                    className="absolute right-0 top-full mt-2 z-50 w-76 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xl shadow-slate-900/10"
                  >
                    {/* Profile Header with Name, Email, Scope & Circular Avatar Upload */}
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-indigo-50/50 rounded-xl mb-1.5 border border-slate-100 text-center flex flex-col items-center">
                      {/* Circular Avatar with Camera Upload Icon */}
                      <div className="relative group mb-2.5">
                        <Avatar
                          src={avatarImage}
                          name={displayName}
                          size="lg"
                          editable={true}
                          onImageChange={(data) => setStaffAvatar(data)}
                        />
                      </div>

                      {/* Staff Member's Name & Personal Information (Displayed in Profile ONLY) */}
                      <h3 className="text-sm font-black text-slate-900 truncate w-full">{displayName}</h3>
                      <p className="text-xs text-slate-500 truncate w-full mt-0.5">{user?.email || 'staff@ethioshop.et'}</p>

                      <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                        <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Staff Member · Operations</span>
                      </div>

                      {/* Photo Upload & Remove Buttons */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                      <div className="mt-3 flex items-center gap-2 w-full">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer"
                        >
                          <Camera className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Change Photo</span>
                        </button>
                        {staffAvatar && (
                          <button
                            type="button"
                            onClick={handleAvatarRemove}
                            className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                            title="Remove custom photo"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Navigation Items in Profile */}
                    <div className="space-y-0.5 text-xs">
                      <Link
                        to="/staff/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 rounded-xl font-semibold transition-colors duration-150"
                      >
                        <User className="h-4 w-4 text-slate-400" />
                        <span>Profile & Store Settings</span>
                      </Link>

                      <Link
                        to="/staff/payments"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 rounded-xl font-semibold transition-colors duration-150"
                      >
                        <CreditCard className="h-4 w-4 text-emerald-600" />
                        <span>Chapa Payout Setup</span>
                      </Link>
                    </div>

                    <div className="my-1.5 border-t border-slate-100" />

                    {/* Sign Out Button */}
                    <motion.button
                      whileHover={{ backgroundColor: '#fff1f2' }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-rose-600 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 text-rose-500" />
                      <span>Sign Out from Hub</span>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Work Area ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12">
        <Outlet />
      </main>

      {/* ── Fully Responsive Common Staff Footer (Visible on both Mobile & Desktop) ── */}
      <div className="pb-20 md:pb-0">
        <StaffFooter />
      </div>

      {/* ── Thumb-Friendly Bottom Navigation Bar (Mobile Devices) ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200/90 bg-white/95 backdrop-blur-xl px-2 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] md:hidden">
        {staffNavLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.to);
          const badgeCount =
            link.badgeKey === 'lowStock'
              ? lowStockCount
              : link.badgeKey === 'pendingOrders'
              ? pendingOrdersCount
              : 0;

          return (
            <Link
              key={link.to}
              to={link.to}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                active ? 'text-[#3857d6] font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="staffBottomNavTab"
                  className="absolute inset-0 rounded-xl bg-indigo-50/80"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <div className="relative z-10">
                <Icon className={`h-5 w-5 ${active ? 'text-[#3857d6]' : 'text-slate-400'}`} />
                {badgeCount > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white shadow-xs ring-1 ring-white">
                    {badgeCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 z-10">
                {link.label.split(' ')[0]}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
