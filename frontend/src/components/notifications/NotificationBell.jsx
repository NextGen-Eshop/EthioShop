import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Sparkles, Tag, ShoppingBag, AlertCircle, Info, X, Trash2, Package, MessageSquare, RotateCcw } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function NotificationBell({ isDark = false, className = '' }) {
  const navigate = useNavigate();
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

  const handleDeleteNotification = async (id, e) => {
    e?.stopPropagation();
    try {
      await fetch(`${API_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.accessToken}` },
        credentials: 'include',
      });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleNotificationClick = async (n) => {
    // 1. Mark as read immediately
    if (!n.isRead) {
      handleMarkAsRead(n._id);
    }
    // 2. Close dropdown
    setIsOpen(false);

    // 3. Navigate to appropriate destination
    const role = user?.role || 'user';
    const notifType = n.type || 'system';

    // Announcement notifications
    if (notifType === 'announcement') {
      if (role === 'admin') {
        navigate('/admin/announcements');
      } else if (role === 'staff') {
        const annId = n.orderId || (n.link && n.link.includes('id=') ? n.link.split('id=')[1] : '');
        navigate(`/staff/announcements${annId ? `?id=${annId}` : ''}`);
      } else {
        // User side -> Dedicated Announcements page
        if (n.link && n.link.startsWith('/announcements')) {
          navigate(n.link);
        } else if (n.orderId) {
          navigate(`/announcements?id=${n.orderId}`);
        } else {
          navigate('/announcements');
        }
      }
      return;
    }

    // Order-related notifications
    if (
      notifType.startsWith('order') ||
      notifType === 'packing_slip_ready' ||
      notifType === 'packing_slip_sent' ||
      notifType === 'packing_slip_requested' ||
      notifType === 'staff_message' ||
      notifType === 'refund_processed' ||
      n.orderId
    ) {
      if (role === 'admin') {
        navigate('/admin/orders');
      } else if (role === 'staff') {
        navigate('/staff/orders');
      } else {
        // User side -> My Orders with specific order highlighted
        const targetOrderId = n.orderId || '';
        navigate(`/account?tab=orders${targetOrderId ? `&orderId=${targetOrderId}` : ''}`);
      }
      return;
    }

    // Payment method notifications
    if (notifType === 'payment_method_published' || notifType.includes('payment')) {
      if (role === 'admin') navigate('/admin/payments');
      else if (role === 'staff') navigate('/staff/payments');
      else navigate('/checkout');
      return;
    }

    // Discount / Promotion notifications
    if (notifType === 'discount_published' || notifType === 'welcome_discount' || notifType.includes('discount')) {
      if (role === 'admin') navigate('/admin/promotions');
      else if (role === 'staff') navigate('/staff/promotions');
      else navigate('/products');
      return;
    }

    // Explicit link if present
    if (n.link) {
      navigate(n.link);
      return;
    }

    // Default fallback
    if (role === 'admin') navigate('/admin/overview');
    else if (role === 'staff') navigate('/staff/overview');
    else navigate('/account');
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
      case 'discount_published':
      case 'welcome_discount':
        return <Tag className="h-4 w-4 text-pink-400" />;
      case 'order_status':
      case 'order_placed':
      case 'order_cancelled':
        return <ShoppingBag className="h-4 w-4 text-purple-400" />;
      case 'packing_slip_ready':
      case 'packing_slip_sent':
      case 'packing_slip_requested':
        return <Package className="h-4 w-4 text-cyan-400" />;
      case 'staff_message':
        return <MessageSquare className="h-4 w-4 text-green-400" />;
      case 'refund_processed':
        return <RotateCcw className="h-4 w-4 text-orange-400" />;
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
                    onClick={() => handleNotificationClick(n)}
                    title="Click to view details"
                    className={`p-3.5 transition-all flex items-start gap-3 cursor-pointer select-none group ${
                      !n.isRead
                        ? isDark ? 'bg-purple-950/20 hover:bg-purple-950/40' : 'bg-purple-50/60 hover:bg-purple-100/60'
                        : isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-100/70'
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

                    <div className="flex flex-col items-center gap-1 shrink-0">
                      {!n.isRead && (
                        <span className="h-2 w-2 rounded-full bg-pink-500" />
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteNotification(n._id, e)}
                        title="Delete notification"
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
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
