import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Building2,
  Smartphone,
  Trash2,
  Check,
  X,
  Edit,
  Send,
  Loader2,
  Power
} from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminPayments() {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const isDark = theme === 'dark';

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New method form
  const [newMethod, setNewMethod] = useState({
    name: '',
    type: 'bank_transfer',
    accountNumber: '',
    phoneNumber: '',
    accountName: 'EthioShop PLC',
    instructions: '',
    logoEmoji: '🏦',
    status: 'sent_to_staff',
  });

  const loadMethods = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/payment-methods`, {
        headers: { Authorization: `Bearer ${user?.accessToken}` },
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        setPaymentMethods(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load admin payment methods:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMethods();
  }, []);

  const handleCreateMethod = async (e) => {
    e.preventDefault();
    if (!newMethod.name.trim()) {
      setErrorMsg('Payment method name is required.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/payment-methods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          ...newMethod,
          status: 'sent_to_staff',
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create payment method');

      setSuccessMsg(`Payment method "${newMethod.name}" created and sent to Staff!`);
      setShowAddModal(false);
      setNewMethod({
        name: '',
        type: 'bank_transfer',
        accountNumber: '',
        phoneNumber: '',
        accountName: 'EthioShop PLC',
        instructions: '',
        logoEmoji: '🏦',
        status: 'sent_to_staff',
      });
      loadMethods();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/payment-methods/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      setSuccessMsg(`Status updated to ${status}`);
      loadMethods();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteMethod = async (id) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/payment-methods/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.accessToken}` },
        credentials: 'include',
      });
      if (res.ok) {
        setSuccessMsg('Payment method deleted.');
        loadMethods();
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-purple-400">
            Admin Payment Governance
          </span>
          <h1 className="text-2xl font-black mt-0.5" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            Payment Method Management & Approval
          </h1>
          <p className="text-xs mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
            Manage supported payment gateways (Senke Bank, Telebirr, CBE, Awash) and approve Staff configurations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-neon-primary px-5 py-3 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <Plus className="h-4 w-4" />
          <span>Add Payment Method</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── PAYMENT METHODS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto" />
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className="col-span-full p-8 text-center rounded-3xl" style={{ background: isDark ? '#111522' : '#FFFFFF' }}>
            <p className="text-sm font-bold">No payment methods found.</p>
          </div>
        ) : (
          paymentMethods.map((m) => {
            const isPublished = m.status === 'published' || m.status === 'approved';
            const isPending = m.status === 'pending_approval';

            return (
              <div
                key={m._id}
                className="p-6 rounded-3xl space-y-4 relative overflow-hidden"
                style={{
                  background: isDark ? '#111522' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{m.logoEmoji || '🏦'}</span>
                    <div>
                      <h3 className="text-base font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                        {m.name}
                      </h3>
                      <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider">
                        {m.type?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                    style={{
                      background: isPublished
                        ? 'rgba(16,185,129,0.15)'
                        : isPending
                        ? 'rgba(245,158,11,0.15)'
                        : 'rgba(239,68,68,0.15)',
                      color: isPublished ? '#10B981' : isPending ? '#F59E0B' : '#EF4444',
                    }}
                  >
                    {m.status.replace('_', ' ')}
                  </span>
                </div>

                <div
                  className="p-3 rounded-2xl text-xs space-y-1"
                  style={{ background: isDark ? '#171B2B' : '#F8FAFC' }}
                >
                  <div className="flex justify-between">
                    <span className="text-slate-400">Account #:</span>
                    <span className="font-mono font-bold">{m.accountNumber || 'Pending Configuration'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Account Name:</span>
                    <span>{m.accountName}</span>
                  </div>
                  {m.configuredBy && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Configured By:</span>
                      <span className="text-purple-400 font-bold">{m.configuredBy.firstName} (Staff)</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{m.instructions || 'No instructions provided.'}</p>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between border-t" style={{ borderColor: isDark ? '#252A3A' : '#F1F5F9' }}>
                  <button
                    onClick={() => handleDeleteMethod(m._id)}
                    className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <button
                        onClick={() => handleUpdateStatus(m._id, 'approved')}
                        className="btn-neon-primary px-3.5 py-1.5 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {isPublished ? (
                      <button
                        onClick={() => handleUpdateStatus(m._id, 'disabled')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 bg-slate-800/40 hover:bg-slate-800 cursor-pointer"
                      >
                        Disable
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(m._id, 'published')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 cursor-pointer"
                      >
                        Publish to Users
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── ADD PAYMENT METHOD MODAL ── */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg p-6 sm:p-8 rounded-3xl space-y-4"
              style={{
                background: isDark ? '#111522' : '#FFFFFF',
                border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  Add Payment Method (e.g. Senke Bank)
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleCreateMethod} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                    Payment Method Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senke Bank"
                    value={newMethod.name}
                    onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium focus:outline-none"
                    style={{
                      background: isDark ? '#171B2B' : '#F8FAFC',
                      border: `1px solid ${isDark ? '#252A3A' : '#CBD5E1'}`,
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    }}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                      Type
                    </label>
                    <select
                      value={newMethod.type}
                      onChange={(e) => setNewMethod({ ...newMethod, type: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium focus:outline-none cursor-pointer"
                      style={{
                        background: isDark ? '#171B2B' : '#F8FAFC',
                        border: `1px solid ${isDark ? '#252A3A' : '#CBD5E1'}`,
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                    >
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="mobile_wallet">Mobile Wallet</option>
                      <option value="card">Card Payment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                      Logo Emoji
                    </label>
                    <input
                      type="text"
                      value={newMethod.logoEmoji}
                      onChange={(e) => setNewMethod({ ...newMethod, logoEmoji: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium text-center focus:outline-none"
                      style={{
                        background: isDark ? '#171B2B' : '#F8FAFC',
                        border: `1px solid ${isDark ? '#252A3A' : '#CBD5E1'}`,
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                    Phone / Merchant Number (Optional - Staff can configure)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +251 911 00 00 00"
                    value={newMethod.phoneNumber}
                    onChange={(e) => setNewMethod({ ...newMethod, phoneNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium focus:outline-none"
                    style={{
                      background: isDark ? '#171B2B' : '#F8FAFC',
                      border: `1px solid ${isDark ? '#252A3A' : '#CBD5E1'}`,
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                    Initial Account Number (Optional - Staff can configure)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3000 8921 4455 10"
                    value={newMethod.accountNumber}
                    onChange={(e) => setNewMethod({ ...newMethod, accountNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium focus:outline-none"
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
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold"
                    style={{ background: isDark ? '#171B2B' : '#F1F5F9', color: isDark ? '#94A3B8' : '#64748B' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-neon-primary px-6 py-2.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send to Staff</span>
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
