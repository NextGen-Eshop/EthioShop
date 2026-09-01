import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Percent,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Check,
  X,
  AlertCircle,
  Calendar,
  Sparkles,
  Loader2,
  Tag
} from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminPromotions() {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const isDark = theme === 'dark';

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Reject modal state
  const [rejectingPromo, setRejectingPromo] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/promotions`, {
        headers: { Authorization: `Bearer ${user?.accessToken}` },
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        setPromotions(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load promotions for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_URL}/api/admin/promotions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ status: 'approved' }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to approve promotion');

      setSuccessMsg('Discount proposal approved and published to store!');
      loadPromotions();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectingPromo) return;
    setActionLoading(rejectingPromo._id);
    try {
      const res = await fetch(`${API_URL}/api/admin/promotions/${rejectingPromo._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          status: 'rejected',
          rejectionReason: rejectReason || 'Rejected by Admin review',
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to reject promotion');

      setSuccessMsg('Discount proposal marked as rejected.');
      setRejectingPromo(null);
      setRejectReason('');
      loadPromotions();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this promotion record?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/promotions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.accessToken}` },
        credentials: 'include',
      });
      if (res.ok) {
        setSuccessMsg('Promotion deleted.');
        loadPromotions();
      }
    } catch (err) {
      setErrorMsg('Error deleting promotion');
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div>
        <span className="text-[11px] font-bold tracking-wider uppercase text-purple-400">
          Admin Governance & Revenue
        </span>
        <h1 className="text-2xl font-black mt-0.5" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
          Promotions & Discount Proposals
        </h1>
        <p className="text-xs mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
          Review, approve, reject, or publish Staff discount proposals before they become visible to customers.
        </p>
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

      {/* ── PROMOTIONS LIST ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto" />
          </div>
        ) : promotions.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl" style={{ background: isDark ? '#111522' : '#FFFFFF', border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>
            <p className="text-sm font-bold">No promotions found in database.</p>
          </div>
        ) : (
          promotions.map((promo) => {
            const isApproved = promo.status === 'approved' || promo.status === 'published';
            const isPending = promo.status === 'pending_approval';

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
                    <h3 className="text-base font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                      {promo.title}
                    </h3>
                    <p className="text-xs text-purple-400 font-bold mt-0.5">
                      Proposed Discount: {promo.discountValue}% OFF
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

                <p className="text-xs text-slate-400">{promo.description || 'No description'}</p>

                {/* Details box */}
                <div
                  className="p-3.5 rounded-2xl text-xs space-y-1.5"
                  style={{ background: isDark ? '#171B2B' : '#F8FAFC' }}
                >
                  <div className="flex justify-between">
                    <span className="text-slate-400">Proposed By:</span>
                    <span className="font-bold">{promo.proposedBy?.firstName} ({promo.proposedBy?.email})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Products:</span>
                    <span className="font-bold text-purple-400">{promo.products?.length || 0} products</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Duration:</span>
                    <span>
                      {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Products Preview Chips */}
                {promo.products && promo.products.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {promo.products.slice(0, 3).map((p, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-800 text-slate-300 truncate max-w-[150px]"
                      >
                        {p.name || 'Product'}
                      </span>
                    ))}
                    {promo.products.length > 3 && (
                      <span className="text-[10px] text-slate-400">+{promo.products.length - 3} more</span>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-between border-t" style={{ borderColor: isDark ? '#252A3A' : '#F1F5F9' }}>
                  <button
                    onClick={() => handleDelete(promo._id)}
                    className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <>
                        <button
                          onClick={() => {
                            setRejectingPromo(promo);
                            setRejectReason('');
                          }}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 cursor-pointer flex items-center gap-1"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </button>

                        <button
                          onClick={() => handleApprove(promo._id)}
                          disabled={actionLoading === promo._id}
                          className="btn-neon-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve & Publish</span>
                        </button>
                      </>
                    )}

                    {isApproved && (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Live on Store</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── REJECT MODAL ── */}
      <AnimatePresence>
        {rejectingPromo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-3xl space-y-4"
              style={{
                background: isDark ? '#111522' : '#FFFFFF',
                border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
              }}
            >
              <h3 className="text-lg font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                Reject Discount Proposal
              </h3>
              <p className="text-xs text-slate-400">
                Please specify the reason why "{rejectingPromo.title}" is being rejected.
              </p>

              <textarea
                rows={3}
                placeholder="Reason (e.g., Margins too thin, schedule conflicts)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium focus:outline-none"
                style={{
                  background: isDark ? '#171B2B' : '#F8FAFC',
                  border: `1px solid ${isDark ? '#252A3A' : '#CBD5E1'}`,
                  color: isDark ? '#F8FAFC' : '#0F172A',
                }}
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setRejectingPromo(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold"
                  style={{ background: isDark ? '#171B2B' : '#F1F5F9', color: isDark ? '#94A3B8' : '#64748B' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white cursor-pointer hover:bg-rose-500"
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
