import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, PanelLeftClose, Bell, Check, Trash2, X } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../../store/authStore';

const notifColors = {
  out_of_stock: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  low_stock: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  pending_order: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  failed_payment: 'text-red-400 bg-red-500/10 border-red-500/20',
  new_user: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

export default function Header({ onMenuClick, onToggleCollapse, isCollapsed }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, markNotificationRead, markAllRead, deleteNotification, adminAvatar } = useAdminStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const unread = notifications.filter((n) => !n.read).length;
  const getInitial = (name) =>
    name ? name.trim().charAt(0).toUpperCase() : 'A';

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-40 h-16 flex items-center justify-between gap-4 px-4 sm:px-6 bg-[#f8fafc] border-b border-slate-200/80 transition-all duration-300"
      style={{ left: isCollapsed ? '70px' : undefined }}
    >
      {/* Left: Menu + Collapse */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <PanelLeftClose className={`h-5 w-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Right: Notifications + Avatar */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 shadow-xs transition-all"
          >
            <Bell className="h-4.5 w-4.5" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white px-1 ring-2 ring-white">
                {unread}
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 z-50 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-900">Notifications</span>
                    <div className="flex items-center gap-2">
                      {unread > 0 && (
                        <button onClick={markAllRead} className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800">
                          Mark all read
                        </button>
                      )}
                      <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-slate-700">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">No notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50 ${!n.read ? 'bg-indigo-50/40' : ''}`}
                        >
                          <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${!n.read ? 'bg-indigo-500' : 'bg-transparent'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-700 leading-relaxed">{n.message}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            {!n.read && (
                              <button onClick={() => markNotificationRead(n.id)} className="p-1 text-slate-300 hover:text-indigo-500">
                                <Check className="h-3 w-3" />
                              </button>
                            )}
                            <button onClick={() => deleteNotification(n.id)} className="p-1 text-slate-300 hover:text-rose-500">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Admin Avatar (no name, click to go to profile) */}
        <Link to="/admin/profile">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="h-9 w-9 rounded-full overflow-hidden ring-2 ring-indigo-500/30 cursor-pointer shadow-xs"
          >
            {adminAvatar ? (
              <img src={adminAvatar} alt="Admin" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-xs font-black select-none">
                {getInitial(user?.name)}
              </div>
            )}
          </motion.div>
        </Link>
      </div>
    </header>
  );
}
