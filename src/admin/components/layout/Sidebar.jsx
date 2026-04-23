import { NavLink, useNavigate } from 'react-router-dom';
import { HiXMark } from 'react-icons/hi2';

const navItems = [
  { to: '/admin/overview', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/products', label: 'Product', icon: 'inventory_2' },
  { to: '/admin/orders', label: 'Orders', icon: 'shopping_cart' },
  { to: '/admin/analytics', label: 'Analytics', icon: 'bar_chart' },
  { to: '/admin/users', label: 'Customers', icon: 'group' },
  { to: '/admin/settings', label: 'Settings', icon: 'settings' },
];

export default function Sidebar({ isOpen, isCollapsed, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onClose();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm transition-opacity md:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-[70] flex h-screen flex-col bg-slate-950 p-6 transition-all duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}
      >
        <div className={`mb-10 flex items-center justify-between ${isCollapsed ? 'md:px-0' : 'px-2'}`}>
          <div className="overflow-hidden">
            <h1 className={`font-headline text-xl font-extrabold text-white transition-all ${isCollapsed ? 'md:opacity-0' : 'opacity-100'}`}>
              EthioShop
            </h1>
            <p className={`text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-all ${isCollapsed ? 'md:opacity-0' : 'opacity-100'}`}>
              Merchant Hub
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 md:hidden"
          >
            <HiXMark className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 ${
                  isActive
                    ? 'bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:bg-white/10 hover:text-white hover:shadow-md'
                } ${isCollapsed ? 'md:justify-center md:px-0 h-10 w-10 mx-auto' : 'px-4 py-3'}`
              }
              title={isCollapsed ? label : ''}
            >
              <span className="material-symbols-outlined text-xl transition-transform group-hover:scale-110">{icon}</span>
              <span className={`font-body text-sm transition-all ${isCollapsed ? 'md:hidden' : 'inline'}`}>
                {label}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-1 pt-6 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className={`flex items-center gap-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:text-rose-500 ${isCollapsed ? 'md:justify-center md:px-0' : 'px-4'}`}
            title={isCollapsed ? 'Log out' : ''}
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span className={isCollapsed ? 'md:hidden' : ''}>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
