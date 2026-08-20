import { Link } from 'react-router-dom';
import { HiBars3BottomLeft } from 'react-icons/hi2';
import { useAuthStore } from '../../../store/authStore';

export default function Header({ onMenuClick, onToggleCollapse, isCollapsed }) {
  const { user } = useAuthStore();

  const userInitial = user?.firstName?.[0] || user?.name?.[0] || 'A';
  const displayName = user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Admin';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 flex h-20 items-center justify-between border-b border-outline-variant/5 bg-white px-4 md:px-8 transition-all duration-300 ${isCollapsed ? 'md:left-20' : 'md:left-64'}`}>
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-50 md:hidden"
        >
          <HiBars3BottomLeft className="h-6 w-6" />
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-50 hover:text-slate-900 md:flex"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <span className="material-symbols-outlined transition-transform duration-300" style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            menu_open
          </span>
        </button>

        <h2 className="font-headline text-xl font-bold tracking-tight text-slate-900">
          EthioShop <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 capitalize">{user?.role || 'Admin'}</span>
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* User Info & Avatar */}
        <div
          className="flex items-center gap-2 pl-2"
          title={`${displayName} (${user?.role || 'Admin'})`}
        >
          {user?.avatar ? (
            <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-200 shadow-xs">
              <img
                alt={displayName}
                className="h-full w-full object-cover"
                src={user.avatar}
              />
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3857d6] text-white font-bold text-sm shadow-xs">
              {userInitial.toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
