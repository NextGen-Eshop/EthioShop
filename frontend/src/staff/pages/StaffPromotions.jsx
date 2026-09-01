import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Percent,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  Sparkles,
  Loader2,
  Check
} from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function StaffPromotions() {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const isDark = theme === 'dark';

  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Proposal Form
  const [form, setForm] = useState({
    title: '',
    description: '',
    discountValue: 15,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    selectedProducts: [],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [promoRes, prodRes] = await Promise.all([
        fetch(`${API_URL}/api/staff/promotions`, {
          headers: { Authorization: `Bearer ${user?.accessToken}` },
          credentials: 'include',
        }),
        fetch(`${API_URL}/api/staff/products`, {
          headers: { Authorization: `Bearer ${user?.accessToken}` },
          credentials: 'include',
        }),
      ]);

      if (promoRes.ok) {
        const json = await promoRes.json();
        setPromotions(json.data || []);
      }
      if (prodRes.ok) {
        const json = await prodRes.json();
        setProducts(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load promotions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleProduct = (prodId) => {
    setForm((prev) => {
      const exists = prev.selectedProducts.includes(prodId);
      return {
        ...prev,
        selectedProducts: exists
          ? prev.selectedProducts.filter((id) => id !== prodId)
          : [...prev.selectedProducts, prodId],
      };
    });
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setErrorMsg('Please enter a promotion title (e.g. New Year Discount).');
      return;
    }
    if (form.selectedProducts.length === 0) {
      setErrorMsg('Please select at least one product for this discount proposal.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_URL}/api/staff/promotions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          discountValue: Number(form.discountValue),
          startDate: form.startDate,
          endDate: form.endDate,
          products: form.selectedProducts,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to submit discount proposal');

      setSuccessMsg(`Discount proposal "${form.title}" submitted to Admin for review!`);
      setShowCreateModal(false);
      setForm({
        title: '',
        description: '',
        discountValue: 15,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        selectedProducts: [],
      });
      loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Submission error');
    } finally {
      setSubmitting(false);
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
            Discount Proposals & Promotions
          </h1>
          <p className="text-xs mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
            Create discount proposals with products, rates, and schedule for Admin review and approval.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-neon-primary px-5 py-3 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <Plus className="h-4 w-4" />
          <span>New Discount Proposal</span>
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

      {/* ── PROPOSALS LIST ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto" />
          </div>
        ) : promotions.length === 0 ? (
          <div
            className="col-span-full p-12 text-center rounded-3xl"
            style={{ background: isDark ? '#111522' : '#FFFFFF', border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}
          >
            <Percent className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              No Discount Proposals Yet
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Create a proposal above to suggest discounts for festivals, holiday sales, or seasonal clearances.
            </p>
          </div>
        ) : (
          promotions.map((promo) => {
            const isApproved = promo.status === 'approved' || promo.status === 'published';
            const isPending = promo.status === 'pending_approval';
            const isRejected = promo.status === 'rejected';

            return (
              <div
                key={promo._id}
                className="p-6 rounded-3xl space-y-4 relative overflow-hidden"
                style={{
                  background: isDark ? '#111522' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                      {promo.title}
                    </h3>
                    <p className="text-xs text-purple-400 font-black mt-0.5">
                      {promo.discountValue}% OFF
                    </p>
                  </div>

                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0"
                    style={{
                      background: isApproved
                        ? 'rgba(16,185,129,0.15)'
                        : isPending
                        ? 'rgba(245,158,11,0.15)'
                        : 'rgba(239,68,68,0.15)',
                      color: isApproved ? '#10B981' : isPending ? '#F59E0B' : '#EF4444',
                    }}
                  >
                    {promo.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{promo.description || 'No description provided.'}</p>

                <div
                  className="p-3 rounded-2xl text-xs space-y-1"
                  style={{ background: isDark ? '#171B2B' : '#F8FAFC' }}
                >
                  <div className="flex justify-between">
                    <span className="text-slate-400">Products Included:</span>
                    <span className="font-bold">{promo.products?.length || 0} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Start Date:</span>
                    <span>{new Date(promo.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">End Date:</span>
                    <span>{new Date(promo.endDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {isRejected && promo.rejectionReason && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                    <strong>Admin Reason:</strong> {promo.rejectionReason}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── CREATE DISCOUNT PROPOSAL MODAL ── */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl my-8 space-y-5"
              style={{
                background: isDark ? '#111522' : '#FFFFFF',
                border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                    Create Discount Proposal
                  </h3>
                  <p className="text-xs text-slate-400">
                    Proposals will be sent to the Administrator for approval before publishing.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitProposal} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                    Promotion Title * (e.g. New Year Discount)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Meskel Grand 20% Sale"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium focus:outline-none"
                    style={{
                      background: isDark ? '#171B2B' : '#F8FAFC',
                      border: `1px solid ${isDark ? '#252A3A' : '#CBD5E1'}`,
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    }}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                      Discount Value (%) *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={form.discountValue}
                      onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium focus:outline-none"
                      style={{
                        background: isDark ? '#171B2B' : '#F8FAFC',
                        border: `1px solid ${isDark ? '#252A3A' : '#CBD5E1'}`,
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium focus:outline-none"
                      style={{
                        background: isDark ? '#171B2B' : '#F8FAFC',
                        border: `1px solid ${isDark ? '#252A3A' : '#CBD5E1'}`,
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium focus:outline-none"
                      style={{
                        background: isDark ? '#171B2B' : '#F8FAFC',
                        border: `1px solid ${isDark ? '#252A3A' : '#CBD5E1'}`,
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Short description of the sale/campaign..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-medium focus:outline-none"
                    style={{
                      background: isDark ? '#171B2B' : '#F8FAFC',
                      border: `1px solid ${isDark ? '#252A3A' : '#CBD5E1'}`,
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    }}
                  />
                </div>

                {/* Product Selection List */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                    Select Products for Discount ({form.selectedProducts.length} selected) *
                  </label>
                  <div
                    className="max-h-48 overflow-y-auto p-2 rounded-2xl space-y-2 border"
                    style={{
                      background: isDark ? '#171B2B' : '#F8FAFC',
                      borderColor: isDark ? '#252A3A' : '#E2E8F0',
                    }}
                  >
                    {products.map((p) => {
                      const selected = form.selectedProducts.includes(p._id);
                      return (
                        <div
                          key={p._id}
                          onClick={() => handleToggleProduct(p._id)}
                          className={`p-2.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-all ${
                            selected ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300' : 'hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                                selected ? 'bg-purple-500 border-purple-400' : 'border-slate-600'
                              }`}
                            >
                              {selected && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <span className="font-bold truncate max-w-[280px]">{p.name}</span>
                          </div>
                          <span className="font-mono">ETB {Number(p.price).toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold"
                    style={{ background: isDark ? '#171B2B' : '#F1F5F9', color: isDark ? '#94A3B8' : '#64748B' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-neon-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{submitting ? 'Submitting...' : 'Submit for Admin Approval'}</span>
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
