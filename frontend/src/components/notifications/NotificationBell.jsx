import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Sparkles, Tag, ShoppingBag, AlertCircle, Info, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function NotificationBell({ isDark = false, className = '' }) {
  const { user, isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const loadNotifications = async () => {
    if (!user?.accessToken) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.accessToken) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000); // 30s polling
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user?.accessToken]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user?.accessToken}` },
        credentials: 'include',
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user?.accessToken}` },
        credentials: 'include',
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type) => {
    switch (type) {
      case 'discount':
      case 'welcome':
      case 'promotion':
        return <Tag className="h-4 w-4 text-pink-400" />;
      case 'order_status':
      case 'order':
        return <ShoppingBag className="h-4 w-4 text-purple-400" />;
      case 'announcement':
        return <Sparkles className="h-4 w-4 text-amber-400" />;
      default:
        return <Info className="h-4 w-4 text-indigo-400" />;
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-center"
        style={{
          background: isDark ? '#111522' : '#FFFFFF',
          borderColor: isDark ? '#252A3A' : '#E2E8F0',
          color: isDark ? '#CBD5E1' : '#475569',
        }}
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-pink-500 text-[10px] font-black text-white shadow-md animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl shadow-2xl border overflow-hidden z-[100]"
            style={{
              background: isDark ? '#111522' : '#FFFFFF',
              borderColor: isDark ? '#252A3A' : '#E2E8F0',
            }}
          >
            {/* Header */}
            <div
              className="p-4 flex items-center justify-between border-b"
              style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-pink-500/20 text-pink-400">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto divide-y" style={{ borderColor: isDark ? '#1E2333' : '#F1F5F9' }}>
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <Bell className="h-6 w-6 mx-auto mb-2 opacity-40" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={(e) => !n.isRead && handleMarkAsRead(n._id, e)}
                    className={`p-3.5 transition-colors flex items-start gap-3 cursor-pointer ${
                      !n.isRead
                        ? isDark ? 'bg-purple-950/20 hover:bg-purple-950/30' : 'bg-purple-50/50 hover:bg-purple-50'
                        : isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className="p-2 rounded-xl shrink-0 mt-0.5 shadow-2xs"
                      style={{
                        background: isDark ? '#171B2B' : '#F1F5F9',
                      }}
                    >
                      {getIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className={`text-xs font-bold truncate ${
                            !n.isRead ? (isDark ? 'text-white' : 'text-slate-900') : 'text-slate-400'
                          }`}
                        >
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                        {n.message}
                      </p>
                    </div>

                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-pink-500 shrink-0 mt-2" />
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
