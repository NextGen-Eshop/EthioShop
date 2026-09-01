import { useState, useEffect } from 'react';
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
  Edit3
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

  // Selected payment method editing state
  const [editingMethod, setEditingMethod] = useState(null);
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

  const handleSelectToEdit = (method) => {
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
          : `Saved "${editingMethod.name}" draft details.`
      );

      setEditingMethod(null);
      loadPaymentMethods();
    } catch (err) {
      setErrorMsg(err.message || 'Error configuring payment method');
    } finally {
      setSavingId(null);
    }
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
            Payment Methods Configuration
          </h1>
          <p className="text-xs mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
            Configure bank accounts, mobile wallets (Senke, Telebirr, CBE, Awash) and submit for Admin approval.
          </p>
        </div>
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

      {/* ── PAYMENT METHODS LIST & EDITOR ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Method Cards */}
        <div className="lg:col-span-7 space-y-4">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto" />
            </div>
          ) : methods.length === 0 ? (
            <div className="p-8 text-center rounded-3xl" style={{ background: isDark ? '#111522' : '#FFFFFF' }}>
              <p className="text-sm font-bold">No payment methods found.</p>
            </div>
          ) : (
            methods.map((method) => {
              const isSelected = editingMethod?._id === method._id;
              const isPublished = method.status === 'published' || method.status === 'approved';
              const isPending = method.status === 'pending_approval';

              return (
                <div
                  key={method._id}
                  onClick={() => handleSelectToEdit(method)}
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-purple-500 bg-purple-500/10 shadow-lg'
                      : isDark ? 'border-slate-800 bg-[#111522] hover:border-slate-700' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{method.logoEmoji || '🏛️'}</span>
                      <div>
                        <h3 className="text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                          {method.name}
                        </h3>
                        <p className="text-xs text-purple-400">{method.accountName || 'EthioShop PLC'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                        style={{
                          background: isPublished
                            ? 'rgba(16,185,129,0.15)'
                            : isPending
                            ? 'rgba(245,158,11,0.15)'
                            : 'rgba(148,163,184,0.15)',
                          color: isPublished ? '#10B981' : isPending ? '#F59E0B' : '#94A3B8',
                        }}
                      >
                        {method.status.replace('_', ' ')}
                      </span>
                      <Edit3 className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t text-xs flex justify-between items-center" style={{ borderColor: isDark ? '#252A3A' : '#F1F5F9' }}>
                    <span className="text-slate-400">Account Number:</span>
                    <span className="font-mono font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                      {method.accountNumber || 'Not configured'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Configuration Form */}
        <div className="lg:col-span-5">
          <div
            className="p-6 rounded-3xl sticky top-6 space-y-4"
            style={{
              background: isDark ? '#111522' : '#FFFFFF',
              border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
            }}
          >
            <h3 className="text-base font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              {editingMethod ? `Configure ${editingMethod.name}` : 'Select a Payment Method to Configure'}
            </h3>

            {editingMethod ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                    Account / Merchant Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1000 4589 12345 or Account #"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
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
                    Phone / Mobile Wallet Number (Required for Telebirr/Wallets)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +251 911 234 567"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
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
                    Beneficiary Account Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EthioShop Trading PLC"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
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
                    Transfer Instructions for Customer
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Step-by-step numbered guide shown to customers at checkout..."
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium focus:outline-none"
                    style={{
                      background: isDark ? '#171B2B' : '#F8FAFC',
                      border: `1px solid ${isDark ? '#252A3A' : '#CBD5E1'}`,
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    }}
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => handleSaveAndPublish(false)}
                    disabled={savingId !== null}
                    className="flex-1 py-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer"
                    style={{
                      background: isDark ? '#171B2B' : '#F1F5F9',
                      borderColor: isDark ? '#252A3A' : '#CBD5E1',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    }}
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Draft</span>
                  </button>

                  <button
                    onClick={() => handleSaveAndPublish(true)}
                    disabled={savingId !== null}
                    className="btn-neon-primary flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Publish Method</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                Click on any bank or wallet method from the left column to enter its account details and submit it for Admin review.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
