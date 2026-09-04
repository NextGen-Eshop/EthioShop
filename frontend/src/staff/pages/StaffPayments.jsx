import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  Building2,
  Smartphone,
  Save,
  AlertCircle,
  Loader2,
  Check,
  Edit3,
  Search,
  History,
  Copy,
  X,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function StaffPayments() {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const isDark = theme === 'dark';

  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Status Tabs and Filters
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'published' | 'pending' | 'history'
  const [search, setSearch] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [editingMethod, setEditingMethod] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // Configuration Form Data
  const [formData, setFormData] = useState({
    accountNumber: '',
    phoneNumber: '',
    accountName: '',
    shortCode: '',
    instructions: '',
  });

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/staff/payment-methods`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        setMethods(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load staff payment methods:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const handleSelectToEdit = (method, e) => {
    e?.stopPropagation();
    setEditingMethod(method);
    setFormData({
      accountNumber: method.accountNumber || '',
      phoneNumber: method.phoneNumber || '',
      accountName: method.accountName || 'EthioShop PLC',
      shortCode: method.shortCode || '',
      instructions: method.instructions || '',
    });
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleSaveAndPublish = async (publishNow = false) => {
    if (!editingMethod) return;

    setSavingId(editingMethod._id);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_URL}/api/staff/payment-methods/${editingMethod._id}/configure`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          publishNow,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to update payment method');
      }

      setSuccessMsg(
        publishNow
          ? `Published "${editingMethod.name}" live for all users!`
          : `Saved "${editingMethod.name}" configuration.`
      );

      if (selectedMethod && selectedMethod._id === editingMethod._id) {
        setSelectedMethod(json.data || { ...selectedMethod, ...formData, status: publishNow ? 'published' : selectedMethod.status });
      }

      setEditingMethod(null);
      loadPaymentMethods();
    } catch (err) {
      setErrorMsg(err.message || 'Error configuring payment method');
    } finally {
      setSavingId(null);
    }
  };

  const handleUpdateStatus = async (id, status, e) => {
    e?.stopPropagation();
    try {
      const res = await fetch(`${API_URL}/api/staff/payment-methods/${id}/configure`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ status, publishNow: status === 'published' }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update status');

      setSuccessMsg(`Status updated to "${status.replace('_', ' ')}"`);
      if (selectedMethod && selectedMethod._id === id) {
        setSelectedMethod(json.data || { ...selectedMethod, status });
      }
      loadPaymentMethods();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusCategory = (status) => {
    if (status === 'published' || status === 'approved') return 'published';
    if (status === 'sent_to_staff' || status === 'pending_approval' || status === 'draft') return 'pending';
    return 'history';
  };

  const publishedCount = methods.filter((m) => getStatusCategory(m.status) === 'published').length;
  const pendingCount = methods.filter((m) => getStatusCategory(m.status) === 'pending').length;
  const historyCount = methods.filter((m) => getStatusCategory(m.status) === 'history').length;

  const filteredMethods = useMemo(() => {
    const q = search.trim().toLowerCase();
    return methods.filter((m) => {
      const cat = getStatusCategory(m.status);
      const matchTab = activeTab === 'all' || activeTab === cat;
      const matchSearch =
        !q ||
        m.name?.toLowerCase().includes(q) ||
        m.accountNumber?.toLowerCase().includes(q) ||
        m.accountName?.toLowerCase().includes(q) ||
        m.type?.toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [methods, activeTab, search]);

  const renderStatusBadge = (status) => {
    const cat = getStatusCategory(status);
    if (cat === 'published') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="h-3 w-3" />
          <span>Approved & Published</span>
        </span>
      );
    }
    if (cat === 'pending') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <Clock className="h-3 w-3" />
          <span>Waiting for Publication</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 bg-slate-500/15 text-slate-400 border border-slate-500/30">
        <History className="h-3 w-3" />
        <span>History / Archived</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-purple-400">
            Staff Operations Portal
          </span>
          <h1 className="text-2xl font-black mt-0.5" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            Payment Methods Management
          </h1>
          <p className="text-xs mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
            Configure merchant credentials, publish verified payment gateways, and track historical payment channels.
          </p>
        </div>
      </div>

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-white cursor-pointer">✕</button>
        </motion.div>
      )}

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-400 hover:text-white cursor-pointer">✕</button>
        </motion.div>
      )}

      {/* ── STATUS TABS & SEARCH BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'all', label: 'All Methods', count: methods.length },
            { id: 'published', label: 'Approved / Live', count: publishedCount, color: '#10B981' },
            { id: 'pending', label: 'Waiting Publication', count: pendingCount, color: '#F59E0B' },
            { id: 'history', label: 'History / Archived', count: historyCount, color: '#94A3B8' },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
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
                      active ? 'bg-white/25 text-white' : isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payment methods..."
            className={`w-full h-9 pl-9 pr-3 rounded-full border text-xs focus:outline-none transition-all ${
              isDark
                ? 'bg-[#151828] border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500'
                : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-purple-600'
            }`}
          />
        </div>
      </div>

      {/* ── SQUARE / CARD-BASED PAYMENT METHODS GRID (SAME UI AS ADMIN) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto" />
            <p className="text-xs text-slate-400 mt-2 font-medium">Loading payment methods...</p>
          </div>
        ) : filteredMethods.length === 0 ? (
          <div
            className="col-span-full p-12 text-center rounded-3xl border space-y-2"
            style={{
              background: isDark ? '#111522' : '#FFFFFF',
              borderColor: isDark ? '#252A3A' : '#E2E8F0',
            }}
          >
            <CreditCard className="h-10 w-10 text-slate-400 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              No payment methods found in this status
            </p>
            <p className="text-xs text-slate-400">Try selecting a different filter tab.</p>
          </div>
        ) : (
          filteredMethods.map((m) => {
            const cat = getStatusCategory(m.status);

            return (
              <motion.div
                key={m._id}
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedMethod(m)}
                className="p-6 rounded-3xl cursor-pointer transition-all flex flex-col justify-between aspect-square sm:aspect-auto sm:min-h-[260px] border shadow-xs"
                style={{
                  background: isDark ? '#111522' : '#FFFFFF',
                  borderColor: isDark ? '#252A3A' : '#E2E8F0',
                }}
              >
                {/* Top Section */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-3xl">{m.logoEmoji || '🏦'}</span>
                    {renderStatusBadge(m.status)}
                  </div>

                  <div>
                    <h3 className="text-base font-black truncate" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                      {m.name}
                    </h3>
                    <p className="text-xs text-purple-400 font-semibold uppercase tracking-wider mt-0.5">
                      {m.type?.replace('_', ' ')}
                    </p>
                  </div>

                  <div
                    className="mt-3 p-3 rounded-2xl text-xs space-y-1 border"
                    style={{
                      background: isDark ? '#171B2B' : '#F8FAFC',
                      borderColor: isDark ? '#252A3A' : '#E2E8F0',
                    }}
                  >
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account #:</span>
                      <span className="font-mono font-bold truncate max-w-[130px]" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                        {m.accountNumber || 'Pending Configuration'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Name:</span>
                      <span className="truncate max-w-[130px] font-medium">{m.accountName || 'EthioShop PLC'}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="pt-3 border-t flex items-center justify-between mt-3 text-xs" style={{ borderColor: isDark ? '#252A3A' : '#F1F5F9' }}>
                  <button
                    onClick={(e) => handleSelectToEdit(m, e)}
                    className="text-slate-400 hover:text-purple-400 flex items-center gap-1 font-bold cursor-pointer transition-colors"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Configure</span>
                  </button>

                  <span className="text-purple-400 font-bold flex items-center gap-1 hover:underline">
                    <span>View Details</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* ── CLICKABLE PAYMENT METHOD DETAIL MODAL ── */}
      <AnimatePresence>
        {selectedMethod && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMethod(null)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            >
              <div
                className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 border"
                style={{
                  background: isDark ? '#111522' : '#FFFFFF',
                  borderColor: isDark ? '#252A3A' : '#E2E8F0',
                }}
              >
                {/* Modal Header */}
                <div className="flex items-start justify-between pb-3 border-b" style={{ borderColor: isDark ? '#252A3A' : '#F1F5F9' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                      {selectedMethod.logoEmoji || '🏦'}
                    </span>
                    <div>
                      <h2 className="text-lg font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                        {selectedMethod.name}
                      </h2>
                      <p className="text-xs text-purple-400 font-semibold uppercase tracking-wider">
                        {selectedMethod.type?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderStatusBadge(selectedMethod.status)}
                    <button
                      onClick={() => setSelectedMethod(null)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Account & Gateway Details */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment Channel Details</h4>
                  <div
                    className="p-4 rounded-2xl border space-y-2 text-xs"
                    style={{
                      background: isDark ? '#171B2B' : '#F8FAFC',
                      borderColor: isDark ? '#252A3A' : '#E2E8F0',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Account / Merchant Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                          {selectedMethod.accountNumber || 'Pending Configuration'}
                        </span>
                        {selectedMethod.accountNumber && (
                          <button
                            onClick={() => copyToClipboard(selectedMethod.accountNumber, 'acc')}
                            className="p-1 rounded text-purple-400 hover:bg-purple-500/10 cursor-pointer"
                            title="Copy Account Number"
                          >
                            {copiedField === 'acc' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Beneficiary Account Name:</span>
                      <span className="font-semibold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                        {selectedMethod.accountName || 'EthioShop PLC'}
                      </span>
                    </div>

                    {selectedMethod.phoneNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Mobile Wallet Phone:</span>
                        <span className="font-mono font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                          {selectedMethod.phoneNumber}
                        </span>
                      </div>
                    )}

                    {selectedMethod.shortCode && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Till / Short Code:</span>
                        <span className="font-mono font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                          {selectedMethod.shortCode}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Transfer Guidance</h4>
                  <div
                    className="p-3.5 rounded-2xl border text-xs leading-relaxed"
                    style={{
                      background: isDark ? '#171B2B' : '#F8FAFC',
                      borderColor: isDark ? '#252A3A' : '#E2E8F0',
                      color: isDark ? '#CBD5E1' : '#334155',
                    }}
                  >
                    <p className="whitespace-pre-line">{selectedMethod.instructions || 'No special transfer instructions specified.'}</p>
                  </div>
                </div>

                {/* Traceable Status History Audit Timeline */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <History className="h-3.5 w-3.5 text-purple-400" />
                    <span>Traceable Status History</span>
                  </h4>
                  <div
                    className="p-3.5 rounded-2xl border space-y-2 text-xs max-h-40 overflow-y-auto"
                    style={{
                      background: isDark ? '#171B2B' : '#F8FAFC',
                      borderColor: isDark ? '#252A3A' : '#E2E8F0',
                    }}
                  >
                    {selectedMethod.statusHistory && selectedMethod.statusHistory.length > 0 ? (
                      selectedMethod.statusHistory.map((sh, idx) => (
                        <div key={idx} className="flex items-start justify-between gap-2 pb-1.5 border-b last:border-0 last:pb-0" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
                          <div>
                            <span className="font-bold capitalize text-purple-400">{sh.status.replace('_', ' ')}</span>
                            <p className="text-[11px] text-slate-400">{sh.note || `Status updated by ${sh.changedByName || 'Staff/Admin'}`}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {sh.changedAt ? new Date(sh.changedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Earlier'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-[11px] text-slate-400">
                        <p>Registered on {new Date(selectedMethod.createdAt).toLocaleString()}</p>
                        <p className="mt-0.5">Current Status: <strong className="capitalize">{selectedMethod.status.replace('_', ' ')}</strong></p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Action Controls */}
                <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-2" style={{ borderColor: isDark ? '#252A3A' : '#F1F5F9' }}>
                  <button
                    onClick={() => {
                      const m = selectedMethod;
                      setSelectedMethod(null);
                      handleSelectToEdit(m);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-purple-400 bg-purple-500/10 border border-purple-500/25 hover:bg-purple-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Configure Details</span>
                  </button>

                  <div className="flex items-center gap-2 ml-auto">
                    {getStatusCategory(selectedMethod.status) === 'pending' && (
                      <button
                        onClick={(e) => handleUpdateStatus(selectedMethod._id, 'published', e)}
                        className="btn-neon-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Publish Live to Users</span>
                      </button>
                    )}

                    {getStatusCategory(selectedMethod.status) === 'published' && (
                      <button
                        onClick={(e) => handleUpdateStatus(selectedMethod._id, 'disabled', e)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <History className="h-3.5 w-3.5" />
                        <span>Move to History (Disable)</span>
                      </button>
                    )}

                    {getStatusCategory(selectedMethod.status) === 'history' && (
                      <button
                        onClick={(e) => handleUpdateStatus(selectedMethod._id, 'published', e)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Re-Publish Live</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── EDIT / CONFIGURE PAYMENT METHOD MODAL ── */}
      <AnimatePresence>
        {editingMethod && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingMethod(null)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            >
              <div
                className="w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border"
                style={{
                  background: isDark ? '#111522' : '#FFFFFF',
                  borderColor: isDark ? '#252A3A' : '#E2E8F0',
                }}
              >
                <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: isDark ? '#252A3A' : '#F1F5F9' }}>
                  <div className="flex items-center gap-2">
                    <Edit3 className="h-5 w-5 text-purple-400" />
                    <div>
                      <h3 className="text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                        Configure {editingMethod.name}
                      </h3>
                      <p className="text-[11px] text-slate-400">Enter merchant details for customer payments</p>
                    </div>
                  </div>
                  <button onClick={() => setEditingMethod(null)} className="text-slate-400 hover:text-white cursor-pointer">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold mb-1 text-slate-400">Account / Merchant Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. 1000 4589 12345"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none"
                      style={{
                        background: isDark ? '#171B2B' : '#F8FAFC',
                        borderColor: isDark ? '#252A3A' : '#CBD5E1',
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-400">Beneficiary Account Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. EthioShop Trading PLC"
                      value={formData.accountName}
                      onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none"
                      style={{
                        background: isDark ? '#171B2B' : '#F8FAFC',
                        borderColor: isDark ? '#252A3A' : '#CBD5E1',
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-400">Phone / Mobile Wallet Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +251 911 234 567"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none"
                      style={{
                        background: isDark ? '#171B2B' : '#F8FAFC',
                        borderColor: isDark ? '#252A3A' : '#CBD5E1',
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-400">Short Code / Till Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 589201"
                      value={formData.shortCode}
                      onChange={(e) => setFormData({ ...formData, shortCode: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none"
                      style={{
                        background: isDark ? '#171B2B' : '#F8FAFC',
                        borderColor: isDark ? '#252A3A' : '#CBD5E1',
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-400">Instructions for Customers</label>
                    <textarea
                      rows={3}
                      placeholder="Instructions shown on checkout page..."
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none resize-none"
                      style={{
                        background: isDark ? '#171B2B' : '#F8FAFC',
                        borderColor: isDark ? '#252A3A' : '#CBD5E1',
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2 border-t" style={{ borderColor: isDark ? '#252A3A' : '#F1F5F9' }}>
                    <button
                      type="button"
                      onClick={() => setEditingMethod(null)}
                      className="px-3.5 py-2 rounded-xl border font-bold cursor-pointer text-xs"
                      style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0', color: isDark ? '#94A3B8' : '#64748B' }}
                    >
                      Cancel
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={savingId === editingMethod._id}
                        onClick={() => handleSaveAndPublish(false)}
                        className="px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-colors"
                        style={{
                          borderColor: isDark ? '#252A3A' : '#CBD5E1',
                          background: isDark ? '#171B2B' : '#F8FAFC',
                          color: isDark ? '#F8FAFC' : '#0F172A',
                        }}
                      >
                        Save Draft
                      </button>

                      <button
                        type="button"
                        disabled={savingId === editingMethod._id}
                        onClick={() => handleSaveAndPublish(true)}
                        className="btn-neon-primary px-4 py-2 text-xs font-bold cursor-pointer shadow-md flex items-center gap-1.5"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>{savingId === editingMethod._id ? 'Publishing...' : 'Save & Publish Live'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
