import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone,
  Plus,
  Send,
  Users,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  X,
  Search,
  Filter,
  Copy,
  Check,
  Radio,
  BellRing,
  Sparkles,
  ShieldCheck,
  User,
  Activity,
  History,
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

export default function AdminAnnouncements() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const [announcements, setAnnouncements] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Filters & Search for History
  const [searchQuery, setSearchQuery] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const [form, setForm] = useState({
    title: '',
    message: '',
    targetAudience: 'both', // 'both' | 'all_staff' | 'all_users' | 'individual_staff' | 'individual_user'
    targetStaffId: '',
    targetUserId: '',
    priority: 'normal',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [annRes, usrRes, stfRes] = await Promise.all([
        fetch(`${API_URL}/api/announcements`, {
          headers: { Authorization: `Bearer ${user?.accessToken}` },
          credentials: 'include',
        }),
        fetch(`${API_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${user?.accessToken}` },
          credentials: 'include',
        }),
        fetch(`${API_URL}/api/admin/staff`, {
          headers: { Authorization: `Bearer ${user?.accessToken}` },
          credentials: 'include',
        }),
      ]);

      if (annRes.ok) {
        const json = await annRes.json();
        setAnnouncements(json.data || []);
      }
      if (usrRes.ok) {
        const json = await usrRes.json();
        setUsersList(json.data || []);
      }
      if (stfRes.ok) {
        const json = await stfRes.json();
        setStaffList(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load announcements data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      setErrorMsg('Please enter both title and message.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        targetAudience: form.targetAudience,
        targetRecipientId:
          form.targetAudience === 'individual_staff'
            ? form.targetStaffId
            : form.targetAudience === 'individual_user'
            ? form.targetUserId
            : undefined,
        priority: form.priority,
      };

      const res = await fetch(`${API_URL}/api/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to dispatch announcement');

      setSuccessMsg('Announcement successfully published & dispatched to notifications!');
      setShowCreateModal(false);
      setForm({
        title: '',
        message: '',
        targetAudience: 'both',
        targetStaffId: '',
        targetUserId: '',
        priority: 'normal',
      });
      loadData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/announcements/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
        credentials: 'include',
      });

      if (res.ok) {
        setAnnouncements((prev) => prev.filter((a) => a._id !== id));
        setDeleteConfirmId(null);
        setSuccessMsg('Announcement removed from history.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Failed to delete announcement:', err);
    }
  };

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered History
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      // Audience filter
      if (audienceFilter !== 'all' && item.targetAudience !== audienceFilter) {
        return false;
      }
      // Priority filter
      if (priorityFilter !== 'all' && (item.priority || 'normal') !== priorityFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchMsg = item.message?.toLowerCase().includes(q);
        const matchTarget = item.targetRecipientName?.toLowerCase().includes(q);
        return matchTitle || matchMsg || matchTarget;
      }
      return true;
    });
  }, [announcements, audienceFilter, priorityFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = announcements.length;
    const both = announcements.filter((a) => a.targetAudience === 'both').length;
    const staff = announcements.filter((a) => a.targetAudience === 'all_staff' || a.targetAudience === 'individual_staff').length;
    const users = announcements.filter((a) => a.targetAudience === 'all_users' || a.targetAudience === 'individual_user').length;
    return { total, both, staff, users };
  }, [announcements]);

  const audienceBadge = (targetAudience, targetRecipientName) => {
    switch (targetAudience) {
      case 'all_staff':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
            <UserCheck className="h-3 w-3" /> All Staff
          </span>
        );
      case 'all_users':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
            <Users className="h-3 w-3" /> All Users
          </span>
        );
      case 'individual_staff':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Staff Direct
          </span>
        );
      case 'individual_user':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <User className="h-3 w-3" /> User Direct
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center gap-1">
            <Radio className="h-3 w-3" /> Both (Staff & Users)
          </span>
        );
    }
  };

  const priorityBadge = (priority) => {
    if (priority === 'urgent') {
      return <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase">Urgent</span>;
    }
    if (priority === 'high') {
      return <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">High</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-slate-500/20 text-slate-400 border border-slate-500/30 uppercase">Normal</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="h-11 w-11 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
            style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' }}
          >
            <Megaphone className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              Broadcast Announcements & History
            </h1>
            <p className="text-xs mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              Create, dispatch, and track live announcement history sent to staff, customers, or both.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-neon-primary px-4.5 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md self-start sm:self-auto rounded-xl"
        >
          <Plus className="h-4 w-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* 4 Summary Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div
          className="p-4 rounded-2xl border transition-all"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            borderColor: isDark ? '#252A3A' : '#E2E8F0',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Sent</span>
            <div className="h-7 w-7 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center">
              <History className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black mt-2" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            {stats.total}
          </p>
          <span className="text-[10px] text-slate-400">All-time dispatched</span>
        </div>

        <div
          className="p-4 rounded-2xl border transition-all"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            borderColor: isDark ? '#252A3A' : '#E2E8F0',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Broadcast (Both)</span>
            <div className="h-7 w-7 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Radio className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black mt-2" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            {stats.both}
          </p>
          <span className="text-[10px] text-slate-400">Staff & Users unified</span>
        </div>

        <div
          className="p-4 rounded-2xl border transition-all"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            borderColor: isDark ? '#252A3A' : '#E2E8F0',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Staff Targeted</span>
            <div className="h-7 w-7 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <UserCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black mt-2" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            {stats.staff}
          </p>
          <span className="text-[10px] text-slate-400">Team notices</span>
        </div>

        <div
          className="p-4 rounded-2xl border transition-all"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            borderColor: isDark ? '#252A3A' : '#E2E8F0',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">User Targeted</span>
            <div className="h-7 w-7 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black mt-2" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            {stats.users}
          </p>
          <span className="text-[10px] text-slate-400">Customer notices</span>
        </div>
      </div>

      {/* History Log & Filters Container */}
      <div
        className="rounded-3xl border p-4 sm:p-6 space-y-5"
        style={{
          background: isDark ? '#111522' : '#FFFFFF',
          borderColor: isDark ? '#252A3A' : '#E2E8F0',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-pink-400" />
            <h2 className="text-sm font-bold tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              Announcement History Log ({filteredAnnouncements.length})
            </h2>
          </div>

          {/* Search Bar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="search"
                placeholder="Search history by title or text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs outline-none transition-all"
                style={{
                  background: isDark ? '#171B2B' : '#F8FAFC',
                  border: `1px solid ${isDark ? '#252A3A' : '#CBD5E1'}`,
                  color: isDark ? '#F8FAFC' : '#0F172A',
                }}
              />
            </div>

            {/* Audience Filter Select */}
            <select
              value={audienceFilter}
              onChange={(e) => setAudienceFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs outline-none font-semibold cursor-pointer"
              style={{
                background: isDark ? '#171B2B' : '#F8FAFC',
                border: `1px solid ${isDark ? '#252A3A' : '#CBD5E1'}`,
                color: isDark ? '#F8FAFC' : '#0F172A',
              }}
            >
              <option value="all">All Audiences</option>
              <option value="both">Both (Staff & Users)</option>
              <option value="all_staff">All Staff</option>
              <option value="all_users">All Users</option>
              <option value="individual_staff">Individual Staff</option>
              <option value="individual_user">Individual User</option>
            </select>

            {/* Priority Filter Select */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs outline-none font-semibold cursor-pointer"
              style={{
                background: isDark ? '#171B2B' : '#F8FAFC',
                border: `1px solid ${isDark ? '#252A3A' : '#CBD5E1'}`,
                color: isDark ? '#F8FAFC' : '#0F172A',
              }}
            >
              <option value="all">All Priorities</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* History Items Feed */}
        <div className="space-y-3.5">
          {filteredAnnouncements.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
              <Megaphone className="h-9 w-9 mx-auto mb-2 text-slate-400 opacity-40" />
              <p className="text-xs font-bold text-slate-400">
                {searchQuery || audienceFilter !== 'all' || priorityFilter !== 'all'
                  ? 'No announcements match your search or filter criteria.'
                  : 'No announcements published yet. Click "New Announcement" above to broadcast!'}
              </p>
            </div>
          ) : (
            filteredAnnouncements.map((ann) => {
              const dateObj = new Date(ann.createdAt);
              const formattedDate = dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const formattedTime = dateObj.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={ann._id}
                  className="p-4 sm:p-5 rounded-2xl border transition-all hover:border-pink-500/40 space-y-3"
                  style={{
                    background: isDark ? '#171B2B' : '#F8FAFC',
                    borderColor: isDark ? '#252A3A' : '#E2E8F0',
                  }}
                >
                  {/* Top line: Audience, Priority, Timestamp, and Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {audienceBadge(ann.targetAudience, ann.targetRecipientName)}
                      {priorityBadge(ann.priority)}
                      {ann.targetRecipientName && (
                        <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded-lg bg-black/20">
                          To: <strong className="text-slate-200">{ann.targetRecipientName}</strong>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        <span title={`${formattedDate} at ${formattedTime}`}>{formatRelativeTime(ann.createdAt)}</span>
                        <span className="text-[10px] text-slate-500 hidden sm:inline">({formattedDate} {formattedTime})</span>
                      </div>

                      {/* Action buttons: Copy & Delete */}
                      <div className="flex items-center gap-1 pl-2 border-l" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
                        <button
                          onClick={() => handleCopyText(`${ann.title}\n\n${ann.message}`, ann._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-pink-400 cursor-pointer transition-colors"
                          title="Copy announcement text"
                        >
                          {copiedId === ann._id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(ann._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 cursor-pointer transition-colors"
                          title="Delete from history"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Title & Message */}
                  <div>
                    <h3 className="font-bold text-sm sm:text-base leading-snug" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                      {ann.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 whitespace-pre-wrap leading-relaxed">
                      {ann.message}
                    </p>
                  </div>

                  {/* Footer Meta Row */}
                  <div className="pt-2.5 border-t flex flex-wrap items-center justify-between text-[10px] text-slate-400 gap-2" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
                    <div className="flex items-center gap-2">
                      <span>Sender: <strong className="text-slate-300">{ann.createdBy?.firstName ? `${ann.createdBy.firstName} ${ann.createdBy.lastName || ''}` : 'Administrator'}</strong></span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                        Dispatched & Active
                      </span>
                    </div>

                    <span className="font-mono text-[9px] text-slate-500">ID: {ann._id}</span>
                  </div>

                  {/* Delete Confirmation Alert Bar */}
                  {deleteConfirmId === ann._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="text-rose-400 font-semibold">Are you sure you want to remove this announcement from history?</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDeleteAnnouncement(ann._id)}
                          className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold cursor-pointer hover:bg-rose-700"
                        >
                          Confirm Delete
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create Announcement Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg rounded-3xl p-6 shadow-2xl border"
              style={{
                background: isDark ? '#111522' : '#FFFFFF',
                borderColor: isDark ? '#252A3A' : '#E2E8F0',
              }}
            >
              <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                    <Megaphone className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                      Publish Announcement
                    </h3>
                    <p className="text-[10px] text-slate-400">Broadcasts instant in-app alerts and notifications</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="space-y-4 pt-4 text-xs">
                {errorMsg && (
                  <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 font-bold">
                    {errorMsg}
                  </p>
                )}

                <div>
                  <label className="block font-bold mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                    Announcement Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. System Maintenance, Special Holiday Discount, or Urgent Team Update"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl font-medium focus:outline-none"
                    style={{
                      background: isDark ? '#171B2B' : '#F8FAFC',
                      border: `1px solid ${isDark ? '#252A3A' : '#CBD5E1'}`,
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                      Target Audience *
                    </label>
                    <select
                      value={form.targetAudience}
                      onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl font-medium focus:outline-none"
                      style={{
                        background: isDark ? '#171B2B' : '#F8FAFC',
                        border: `1px solid ${isDark ? '#252A3A' : '#CBD5E1'}`,
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                    >
                      <option value="both">Both (Staff & Users)</option>
                      <option value="all_staff">All Staff Members</option>
                      <option value="all_users">All Customers / Users</option>
                      <option value="individual_staff">Individual Staff Member</option>
                      <option value="individual_user">Individual User / Customer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                      Priority Level
                    </label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl font-medium focus:outline-none"
                      style={{
                        background: isDark ? '#171B2B' : '#F8FAFC',
                        border: `1px solid ${isDark ? '#252A3A' : '#CBD5E1'}`,
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent Alert</option>
                    </select>
                  </div>
                </div>

                {/* Specific Staff Picker */}
                {form.targetAudience === 'individual_staff' && (
                  <div>
                    <label className="block font-bold mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                      Select Target Staff Member *
                    </label>
                    <select
                      required
                      value={form.targetStaffId}
                      onChange={(e) => setForm({ ...form, targetStaffId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl font-medium focus:outline-none"
                      style={{
                        background: isDark ? '#171B2B' : '#F8FAFC',
                        border: `1px solid ${isDark ? '#252A3A' : '#CBD5E1'}`,
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                    >
                      <option value="">-- Choose Staff Member --</option>
                      {staffList.map((s) => (
                        <option key={s._id || s.id} value={s._id || s.id}>
                          {s.name || `${s.firstName || ''} ${s.lastName || ''}`} ({s.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Specific User Picker */}
                {form.targetAudience === 'individual_user' && (
                  <div>
                    <label className="block font-bold mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                      Select Target Customer / User *
                    </label>
                    <select
                      required
                      value={form.targetUserId}
                      onChange={(e) => setForm({ ...form, targetUserId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl font-medium focus:outline-none"
                      style={{
                        background: isDark ? '#171B2B' : '#F8FAFC',
                        border: `1px solid ${isDark ? '#252A3A' : '#CBD5E1'}`,
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                    >
                      <option value="">-- Choose Customer --</option>
                      {usersList.map((u) => (
                        <option key={u._id || u.id} value={u._id || u.id}>
                          {u.name || `${u.firstName || ''} ${u.lastName || ''}`} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-bold mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                    Announcement Content *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write detailed announcement message here..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl font-medium focus:outline-none leading-relaxed"
                    style={{
                      background: isDark ? '#171B2B' : '#F8FAFC',
                      border: `1px solid ${isDark ? '#252A3A' : '#CBD5E1'}`,
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    }}
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 rounded-xl font-bold cursor-pointer"
                    style={{
                      background: isDark ? '#171B2B' : '#F1F5F9',
                      color: isDark ? '#94A3B8' : '#64748B',
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn-neon-primary px-6 py-2.5 font-bold flex items-center gap-1.5 cursor-pointer shadow-md rounded-xl"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Publish & Dispatch</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
