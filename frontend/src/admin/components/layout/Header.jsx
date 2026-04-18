import { HiBars3BottomLeft } from 'react-icons/hi2';

export default function Header({ onMenuClick, onToggleCollapse, isCollapsed }) {
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
          EthioShop
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">
            search
          </span>
          <input
            className="w-48 xl:w-64 rounded-xl border-none bg-slate-100 py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Quick search..."
            type="text"
          />
        </div>

        <button className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        <div className="h-10 w-10 overflow-hidden rounded-full border border-outline-variant/20 shadow-sm transition-transform hover:scale-105 cursor-pointer">
          <img
            alt="Profile"
            className="h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"
          />
        </div>
      </div>
    </header>
  );
}
