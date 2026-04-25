import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { listAllOrders } from '../../services/ordersService';
import { approvePayment, rejectPayment } from '../../services/paymentsService';
import { usePermission } from '../../hooks/usePermission';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function shotUrl(u) {
  if (!u) return null;
  if (u.startsWith('http')) return u;
  return `${BASE}${u.startsWith('/') ? u : `/${u}`}`;
}

const statusClass = {
  pending_payment: 'bg-amber-100 text-amber-800',
  under_review: 'bg-sky-100 text-sky-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-rose-100 text-rose-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-slate-200 text-slate-800',
};

export default function Orders() {
  const { can } = usePermission();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const load = () =>
    listAllOrders()
      .then((res) => setOrders(res.data?.data || []))
      .catch((e) => {
        toast.error(e.response?.data?.message || 'Could not load orders');
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const onApprove = async (orderId) => {
    if (!can('approve_payment')) return;
    setActionId(orderId);
    try {
      await approvePayment(orderId);
      toast.success('Payment approved');
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setActionId(null);
    }
  };

  const onReject = async (orderId) => {
    if (!can('approve_payment')) return;
    const reason = window.prompt('Rejection reason (visible to the customer):');
    if (reason == null) return;
    setActionId(orderId);
    try {
      await rejectPayment(orderId, reason);
      toast.success('Payment rejected');
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto p-8 text-slate-500 text-sm">Loading orders…</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Orders & payments</h1>
        <p className="text-slate-500 text-sm mt-1">
          Review bank-transfer screenshots, approve to confirm and deduct stock, or reject with a reason.
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-[900px]">
          <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Proof</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  No orders yet.
                </td>
              </tr>
            )}
            {orders.map((o) => {
              const id = o._id || o.id;
              const customer = o.user
                ? `${o.user.firstName || ''} ${o.user.lastName || ''}`.trim() || o.user.email
                : '—';
              const st = o.status;
              const img = shotUrl(o.paymentScreenshotUrl);
              return (
                <tr key={id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">
                    {String(id).slice(-8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 max-w-[180px] truncate">
                    {customer}
                  </td>
                  <td className="px-4 py-3 font-semibold">ETB {Number(o.totalPrice).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded ${
                        statusClass[st] || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {st?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {img ? (
                      <a href={img} target="_blank" rel="noreferrer" className="inline-block">
                        <img src={img} alt="" className="h-10 w-14 object-cover rounded border border-slate-200" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {st === 'under_review' && can('approve_payment') && (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={actionId === id}
                          onClick={() => onApprove(id)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={actionId === id}
                          onClick={() => onReject(id)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
