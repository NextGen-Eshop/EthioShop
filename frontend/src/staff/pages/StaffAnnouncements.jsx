import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone,
  Sparkles,
  ShieldAlert,
  AlertCircle,
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  Bell,
  User,
  Info,
  Loader2,
  ChevronDown,
  ChevronUp,
  Pin,
  CheckCheck,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function StaffAnnouncements() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const [searchParams] = useSearchParams();
  const targetId = searchParams.get('id');

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [acknowledgedIds, setAcknowledgedIds] = useState(new Set());
  const itemRefs = useRef({});

  const loadAnnouncements = async () => {
    if (!user?.accessToken) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/announcements/my`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        setAnnouncements(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load staff announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, [user?.accessToken]);

  // Scroll to targeted announcement if id param is present
  useEffect(() => {
    if (!loading && targetId && itemRefs.current[targetId]) {
      setExpandedIds((prev) => new Set([...prev, targetId]));
      setTimeout(() => {
        itemRefs.current[targetId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 300);
    }
  }, [loading, targetId, announcements]);

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAcknowledge = (id) => {
    setAcknowledgedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return announcements.filter((a) => {
      const matchSearch =
        !q ||
        a.title?.toLowerCase().includes(q) ||
        a.message?.toLowerCase().includes(q) ||
        a.targetRecipientName?.toLowerCase().includes(q);

      const matchPriority =
        priorityFilter === 'all' ||
        (priorityFilter === 'urgent' && (a.priority === 'urgent' || a.priority === 'high')) ||
        (priorityFilter === 'important' && a.priority === 'important') ||
        (priorityFilter === 'direct' && a.targetRecipient);

      return matchSearch && matchPriority;
    });
  }, [announcements, search, priorityFilter]);

  const urgentCount = announcements.filter((a) => a.priority === 'urgent' || a.priority === 'high').length;
  const directCount = announcements.filter((a) => a.targetRecipient).length;

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="h-3 w-3" />
            <span>High Priority</span>
          </span>
        );
      case 'important':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertCircle className="h-3 w-3" />
            <span>Important</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <Sparkles className="h-3 w-3" />
            <span>Staff Directive</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Staff Bulletins & Announcements
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isDark
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
              }`}
            >
              {announcements.length} Total Notices
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Official operational updates, policy memos, and directives published by EthioShop Administration.
          </p>
        </div>
      </div>

      {/* ── Metric Highlights ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="p-4 rounded-2xl border"
          style={{
            background: isDark ? '#0f1222' : '#FFFFFF',
            borderColor: isDark ? '#1b1f38' : '#E2E8F0',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Total Bulletins</span>
            <Megaphone className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black mt-2" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            {announcements.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Active directives on file</p>
        </div>

        <div
          className="p-4 rounded-2xl border"
          style={{
            background: isDark ? '#0f1222' : '#FFFFFF',
            borderColor: isDark ? '#1b1f38' : '#E2E8F0',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400">Urgent Notices</span>
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black mt-2 text-rose-400">
            {urgentCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Requires prompt operational attention</p>
        </div>

        <div
          className="p-4 rounded-2xl border"
          style={{
            background: isDark ? '#0f1222' : '#FFFFFF',
            borderColor: isDark ? '#1b1f38' : '#E2E8F0',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400">Direct Directives</span>
            <Pin className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black mt-2 text-cyan-400">
            {directCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Directly assigned to you</p>
        </div>
      </div>

      {/* ── Search and Filters ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'all', label: 'All Notices', count: announcements.length },
            { id: 'urgent', label: 'Urgent', count: urgentCount },
            { id: 'important', label: 'Important', count: announcements.filter((a) => a.priority === 'important').length },
            { id: 'direct', label: 'Direct to Me', count: directCount },
          ].map((tab) => {
            const active = priorityFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setPriorityFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  active
                    ? 'text-white border-transparent'
                    : isDark
                    ? 'bg-[#0f1222] text-slate-300 border-[#1b1f38] hover:border-purple-500/40'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                }`}
                style={
                  active
                    ? {
                        background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                        boxShadow: '0 0 15px rgba(139, 92, 246, 0.35)',
                      }
                    : undefined
                }
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      active
                        ? 'bg-white/20 text-white'
                        : isDark
                        ? 'bg-slate-800 text-slate-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bulletins..."
            className={`w-full h-9 pl-9 pr-3 rounded-full border text-xs focus:outline-none transition-all ${
              isDark
                ? 'bg-[#151828] border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500'
                : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-purple-600'
            }`}
          />
        </div>
      </div>

      {/* ── Bulletins Feed ── */}
      <div className="space-y-4">
        {loading ? (
          <div
            className="p-12 text-center rounded-3xl border space-y-2"
            style={{
              background: isDark ? '#0f1222' : '#FFFFFF',
              borderColor: isDark ? '#1b1f38' : '#E2E8F0',
            }}
          >
            <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto" />
            <p className="text-xs font-bold" style={{ color: isDark ? '#FFFFFF' : '#0F172A' }}>
              Loading Staff Bulletins...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="p-12 text-center rounded-3xl border space-y-2"
            style={{
              background: isDark ? '#0f1222' : '#FFFFFF',
              borderColor: isDark ? '#1b1f38' : '#E2E8F0',
            }}
          >
            <Megaphone className="h-10 w-10 text-slate-400 mx-auto mb-2 opacity-50" />
            <h3 className="text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              No announcements match your filter
            </h3>
            <p className="text-xs text-slate-400">
              Check back later for newly published administration bulletins.
            </p>
          </div>
        ) : (
          filtered.map((item, idx) => {
            const isTargeted = targetId === item._id;
            const isExpanded = expandedIds.has(item._id) || isTargeted;
            const isAcknowledged = acknowledgedIds.has(item._id);
            const isDirect = Boolean(item.targetRecipient);

            return (
              <motion.div
                key={item._id}
                ref={(el) => (itemRefs.current[item._id] = el)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                  isTargeted ? 'ring-2 ring-purple-500 shadow-xl shadow-purple-500/20' : ''
                }`}
                style={{
                  background: isDark ? '#0f1222' : '#FFFFFF',
                  borderColor: isTargeted ? '#8B5CF6' : isDark ? '#1b1f38' : '#E2E8F0',
                }}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b" style={{ borderColor: isDark ? '#1E2333' : '#F1F5F9' }}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getPriorityBadge(item.priority)}

                      {isDirect ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                          Direct to You
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-400">
                          Staff Directive
                        </span>
                      )}

                      {isTargeted && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500 text-white animate-pulse">
                          Highlighted
                        </span>
                      )}
                    </div>

                    <h2 className="text-base sm:text-lg font-black mt-1" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                      {item.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 self-start sm:self-auto">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="h-3 w-3" />
                      <span>{formatRelativeTime(item.createdAt)}</span>
                    </span>
                    <span className="text-[10px]">•</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="pt-3.5 space-y-3">
                  <div
                    className={`text-xs leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}
                    style={{ color: isDark ? '#CBD5E1' : '#334155' }}
                  >
                    <p className="whitespace-pre-line">{item.message}</p>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-xs border-t" style={{ borderColor: isDark ? '#1E2333' : '#F1F5F9' }}>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleExpand(item._id)}
                        className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>{isExpanded ? 'Show less' : 'Read full bulletin'}</span>
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleAcknowledge(item._id)}
                        className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                          isAcknowledged
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : isDark
                            ? 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-white'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                        <span>{isAcknowledged ? 'Acknowledged' : 'Acknowledge Notice'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
