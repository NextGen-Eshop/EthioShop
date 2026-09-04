import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Megaphone,
  Calendar,
  Clock,
  AlertCircle,
  Bell,
  ArrowLeft,
  CheckCircle2,
  Tag,
  ShieldAlert,
  Info,
  Loader2,
} from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Announcements() {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  const { user, isAuthenticated } = useAuthStore();
  const [searchParams] = useSearchParams();
  const targetId = searchParams.get('id');

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemRefs = useRef({});

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        setLoading(true);
        setError(null);
        const headers = user?.accessToken
          ? { Authorization: `Bearer ${user.accessToken}` }
          : {};

        const res = await fetch(`${API_URL}/api/announcements/my`, {
          headers,
          credentials: 'include',
        });

        if (res.ok) {
          const json = await res.json();
          setAnnouncements(json.data || []);
        } else {
          // If public/guest, try to display active announcements or empty
          setAnnouncements([]);
        }
      } catch (err) {
        console.error('Failed to load announcements:', err);
        setError('Unable to load announcements at this time. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchAnnouncements();
  }, [user?.accessToken]);

  // Scroll to targeted announcement if specified in URL query
  useEffect(() => {
    if (!loading && targetId && itemRefs.current[targetId]) {
      setTimeout(() => {
        itemRefs.current[targetId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 300);
    }
  }, [loading, targetId, announcements]);

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return (
          <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1 bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="h-3 w-3" />
            <span>High Priority</span>
          </span>
        );
      case 'important':
        return (
          <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1 bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertCircle className="h-3 w-3" />
            <span>Important</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1 bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <Sparkles className="h-3 w-3" />
            <span>Official Update</span>
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-10 space-y-8"
    >
      {/* ── Breadcrumb & Navigation Back ── */}
      <div className="flex items-center justify-between">
        <Link
          to="/account?tab=settings"
          className="inline-flex items-center gap-2 text-xs font-bold transition-colors cursor-pointer group"
          style={{ color: isDark ? '#94A3B8' : '#64748B' }}
        >
          <div
            className="p-2 rounded-xl transition-all group-hover:-translate-x-0.5"
            style={{
              background: isDark ? '#111522' : '#FFFFFF',
              border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
            }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </div>
          <span className="group-hover:text-purple-400 transition-colors">
            Back to Account Settings
          </span>
        </Link>

        <span
          className="text-xs font-mono font-bold px-3 py-1 rounded-full"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
            color: '#8B5CF6',
          }}
        >
          {announcements.length} {announcements.length === 1 ? 'Announcement' : 'Announcements'}
        </span>
      </div>

      {/* ── Hero Banner ── */}
      <div
        className="p-6 sm:p-8 rounded-3xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #111522 0%, #171B2B 100%)'
            : 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
          border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md text-white"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              boxShadow: '0 0 25px rgba(139,92,246,0.3)',
            }}
          >
            <Megaphone className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h1
              className="text-2xl sm:text-3xl font-black tracking-tight"
              style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
            >
              Admin <span className="text-gradient-brand">Announcements</span>
            </h1>
            <p
              className="text-xs sm:text-sm max-w-xl leading-relaxed"
              style={{ color: isDark ? '#94A3B8' : '#64748B' }}
            >
              Official platform updates, holiday delivery schedules, maintenance notices, and important alerts from EthioShop Administration.
            </p>
          </div>
        </div>
      </div>

      {/* ── Content List ── */}
      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading announcements...</p>
        </div>
      ) : error ? (
        <div
          className="p-8 rounded-3xl text-center space-y-3"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
          }}
        >
          <AlertCircle className="h-8 w-8 text-rose-400 mx-auto" />
          <p className="text-sm font-bold text-rose-400">{error}</p>
        </div>
      ) : announcements.length === 0 ? (
        <div
          className="p-16 text-center rounded-3xl space-y-4"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-slate-400 opacity-60"
            style={{ background: isDark ? '#171B2B' : '#F1F5F9' }}
          >
            <Bell className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3
              className="text-base font-bold"
              style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
            >
              No active announcements
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are currently no new broadcast updates or alerts from the administrators. Check back later for upcoming promotions and news.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {announcements.map((item, index) => {
              const isTargeted = targetId === item._id;

              return (
                <motion.article
                  key={item._id}
                  ref={(el) => (itemRefs.current[item._id] = el)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`p-6 sm:p-7 rounded-3xl transition-all space-y-4 relative ${
                    isTargeted
                      ? 'ring-2 ring-purple-500 shadow-2xl shadow-purple-500/20'
                      : ''
                  }`}
                  style={{
                    background: isTargeted
                      ? isDark
                        ? '#141829'
                        : '#FAF5FF'
                      : isDark
                      ? '#111522'
                      : '#FFFFFF',
                    border: `1px solid ${
                      isTargeted
                        ? '#8B5CF6'
                        : isDark
                        ? '#252A3A'
                        : '#E2E8F0'
                    }`,
                  }}
                >
                  {/* Top Bar: Badges & Timestamp */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b" style={{ borderColor: isDark ? '#252A3A' : '#F1F5F9' }}>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(item.priority)}
                      {item.targetAudience && (
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize"
                          style={{
                            background: isDark ? '#171B2B' : '#F1F5F9',
                            color: isDark ? '#94A3B8' : '#64748B',
                          }}
                        >
                          {item.targetAudience === 'both' ? 'Storewide Announcement' : item.targetAudience.replace('_', ' ')}
                        </span>
                      )}
                    </div>

                    <div
                      className="flex items-center gap-3 text-[11px] text-slate-400"
                    >
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Announcement Title & Body */}
                  <div className="space-y-2">
                    <h2
                      className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2"
                      style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                    >
                      {item.title}
                    </h2>
                    <p
                      className="text-xs sm:text-sm leading-relaxed whitespace-pre-line"
                      style={{ color: isDark ? '#CBD5E1' : '#334155' }}
                    >
                      {item.message}
                    </p>
                  </div>

                  {/* Footer Meta */}
                  <div
                    className="pt-3 flex items-center justify-between text-[11px] text-slate-400 border-t"
                    style={{ borderColor: isDark ? '#252A3A' : '#F1F5F9' }}
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      Verified EthioShop Administration Notice
                    </span>
                    {isTargeted && (
                      <span className="text-purple-400 font-bold animate-pulse">
                        ● Direct Linked
                      </span>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
