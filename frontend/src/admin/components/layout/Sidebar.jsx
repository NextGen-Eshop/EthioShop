import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';

const navItems = [
  { to: '/admin/overview', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/products', label: 'Products', icon: 'inventory_2' },
  { to: '/admin/orders', label: 'Orders', icon: 'local_shipping' },
  { to: '/admin/analytics', label: 'Analytics', icon: 'bar_chart' },
  { to: '/admin/users', label: 'Customers', icon: 'group' },
  { to: '/admin/settings', label: 'Settings', icon: 'settings' },
];

export default function Sidebar({ isOpen, isCollapsed, onClose }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-[70] flex h-screen flex-col bg-gradient-to-b from-indigo-950 via-indigo-950 to-slate-950 transition-all duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}
      >
        {/* Brand */}
        <div className={`flex items-center justify-between px-5 py-6 ${isCollapsed ? 'md:px-3' : ''}`}>
          <div className={`flex items-center gap-2.5 overflow-hidden transition-all ${isCollapsed ? 'md:justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xs shadow-md shadow-indigo-500/30 shrink-0">
              E
            </div>
            <div className={`transition-all ${isCollapsed ? 'md:hidden' : ''}`}>
              <h1 className="text-base font-extrabold text-white tracking-tight">
                Ethio<span className="text-indigo-400">Shop</span>
              </h1>
              <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-400/60">Admin Panel</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-indigo-400 transition hover:bg-white/10 md:hidden">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-1 flex-col gap-1 px-3 mt-2">
          <p className={`text-[9px] font-bold text-indigo-500/50 uppercase tracking-widest mb-2 ${isCollapsed ? 'md:hidden' : 'px-3'}`}>Navigation</p>
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-600/30'
                    : 'text-indigo-300/70 hover:bg-white/5 hover:text-white'
                } ${isCollapsed ? 'md:justify-center md:px-0 h-10 w-10 mx-auto' : 'px-4 py-2.5'}`
              }
              title={isCollapsed ? label : ''}
            >
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
              <span className={`text-sm font-medium transition-all ${isCollapsed ? 'md:hidden' : 'inline'}`}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Storefront link */}
        <div className={`px-3 mb-3 ${isCollapsed ? 'md:px-1' : ''}`}>
          <NavLink
            to="/home"
            className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-indigo-300/60 hover:bg-white/5 hover:text-white transition-all ${isCollapsed ? 'md:justify-center md:px-0 h-10 w-10 mx-auto' : ''}`}
            title="View Storefront"
          >
            <span className="material-symbols-outlined text-[20px]">storefront</span>
            <span className={`text-sm font-medium ${isCollapsed ? 'md:hidden' : ''}`}>View Store</span>
          </NavLink>
        </div>

        {/* User Profile + Logout */}
        <div className={`border-t border-white/5 px-3 py-4 ${isCollapsed ? 'md:px-1' : ''}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3 px-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-indigo-400/60 truncate">{user?.email || 'admin@ethioshop.com'}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 py-2 text-xs font-medium text-indigo-400/60 transition-colors hover:text-red-400 w-full rounded-xl hover:bg-white/5 ${isCollapsed ? 'md:justify-center md:px-0 h-10 w-10 mx-auto' : 'px-4'}`}
            title={isCollapsed ? 'Log out' : ''}
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span className={isCollapsed ? 'md:hidden' : ''}>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
