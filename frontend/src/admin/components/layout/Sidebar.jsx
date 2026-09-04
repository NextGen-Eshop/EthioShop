import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, UserCog, Package, Tag, Archive,
  ShoppingBag, CreditCard, BarChart3, Settings, User,
  LogOut, X, ChevronRight, Sparkles, Shield, Megaphone,
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useAdminStore } from '../../store/adminStore';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/admin/overview', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'People',
    items: [
      { to: '/admin/users', label: 'Users', icon: Users },
      { to: '/admin/staff', label: 'Staff', icon: UserCog },
      { to: '/admin/roles', label: 'Roles & Permissions', icon: Shield },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { to: '/admin/products', label: 'Products', icon: Package },
      { to: '/admin/categories', label: 'Categories', icon: Tag },
      { to: '/admin/inventory', label: 'Inventory', icon: Archive },
    ],
  },
  {
    label: 'Commerce & Comms',
    items: [
      { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
      { to: '/admin/payments', label: 'Payment Gateways', icon: CreditCard },
      { to: '/admin/promotions', label: 'Discounts & Deals', icon: Sparkles },
      { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/admin/analytics', label: 'Reports & Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/settings', label: 'Settings', icon: Settings },
      { to: '/admin/profile', label: 'My Profile', icon: User },
    ],
  },
];

export default function Sidebar({ isOpen, isCollapsed, onClose }) {
  const navigate = useNavigate();
  const { signOut, user } = useAuthStore();
  const { adminAvatar } = useAdminStore();

  const handleLogout = () => {
    signOut();
    onClose();
    navigate('/login');
  };

  const getInitial = (name) =>
    name ? name.trim().charAt(0).toUpperCase() : 'A';

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed inset-y-0 left-0 z-[70] flex h-screen flex-col bg-[#0c1120] border-r border-white/5 transition-all duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-[70px]' : 'md:w-64'}`}
      >
        {/* Brand */}
        <div className={`flex items-center justify-between px-5 py-5 border-b border-white/5 ${isCollapsed ? 'md:justify-center md:px-0' : ''}`}>
          <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'md:hidden' : ''}`}>
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-[#3857d6] to-indigo-400 shadow-lg shadow-indigo-500/25">
              <span className="font-black text-sm text-white font-mono">E</span>
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-amber-300" />
            </div>
            <div>
              <p className="font-extrabold text-white text-sm leading-none">EthioShop</p>
              <p className="text-[10px] text-slate-500 mt-0.5 font-semibold tracking-wider uppercase">Admin Panel</p>
            </div>
          </div>
          {isCollapsed && (
            <div className="hidden md:flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400">
              <span className="font-black text-sm text-white font-mono">E</span>
            </div>
          )}
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-500 hover:bg-white/5 hover:text-white transition md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-2">
              {!isCollapsed && (
                <p className="mb-1 px-3 text-[9px] font-black uppercase tracking-widest text-slate-600">
                  {group.label}
                </p>
              )}
              {group.items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  title={isCollapsed ? label : ''}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl text-xs font-semibold transition-all duration-200 my-0.5 ${
                      isCollapsed ? 'md:justify-center md:px-0 h-10 w-10 mx-auto' : 'px-3 py-2.5'
                    } ${
                      isActive
                        ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-white'} transition-colors`} />
                      <span className={`transition-all ${isCollapsed ? 'md:hidden' : 'inline'}`}>{label}</span>
                      {!isCollapsed && isActive && (
                        <ChevronRight className="ml-auto h-3 w-3 text-indigo-400" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom User + Logout */}
        <div className="border-t border-white/5 p-3 space-y-1">
          {!isCollapsed && user && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/3">
              <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 ring-2 ring-indigo-500/30">
                {adminAvatar ? (
                  <img src={adminAvatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-xs font-black select-none">
                    {getInitial(user.name)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user.name || 'Admin'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : ''}
            className={`flex w-full items-center gap-3 rounded-xl py-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400 ${
              isCollapsed ? 'md:justify-center md:px-0' : 'px-3'
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className={isCollapsed ? 'md:hidden' : ''}>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
