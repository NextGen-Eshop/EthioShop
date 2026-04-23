import { useAuthStore } from '../../../store/authStore';

export default function Header({ onMenuClick, onToggleCollapse, isCollapsed }) {
  const user = useAuthStore((s) => s.user);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-xl px-4 md:px-8 transition-all duration-300 ${isCollapsed ? 'md:left-20' : 'md:left-64'}`}>
      <div className="flex items-center gap-3">
        {/* Mobile Menu Toggle */}
        <button type="button" onClick={onMenuClick} className="rounded-xl p-2 text-gray-500 transition hover:bg-indigo-50 hover:text-indigo-600 md:hidden">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
        </button>

        {/* Desktop Collapse Toggle */}
        <button type="button" onClick={onToggleCollapse}
          className="hidden h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-indigo-50 hover:text-indigo-600 md:flex"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}>
          <span className="material-symbols-outlined text-xl transition-transform duration-300" style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}>menu_open</span>
        </button>

        <div className="hidden sm:block">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">
            Ethio<span className="text-indigo-600">Shop</span> <span className="text-gray-400 font-normal text-sm">Admin</span>
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden sm:block">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input className="w-48 xl:w-64 rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder-gray-400" placeholder="Search..." type="text" />
        </div>

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600">
          <span className="material-symbols-outlined text-xl">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
          <div className="h-8 w-8 overflow-hidden rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="hidden lg:block">
            <p className="text-xs font-semibold text-gray-900">{user?.name || 'Admin'}</p>
            <p className="text-[10px] text-gray-400">{user?.role === 'privileged' ? 'Administrator' : 'User'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
