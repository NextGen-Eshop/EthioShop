import { orderStatuses } from '../../data/mockData';
import { HiEllipsisVertical } from 'react-icons/hi2';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const statusStyles = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-sky-100 text-sky-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

export default function OrdersTable({ orders, onStatusChange }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <h4 className="font-headline text-lg font-bold text-slate-900">Recent Transactions</h4>
        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Showing 1-4 of 1,240 results</div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[980px] border-collapse text-left">
          <thead>
            <tr className="text-xs uppercase tracking-[0.2em] text-slate-400">
              <th className="px-8 py-4 font-bold">Order ID</th>
              <th className="px-6 py-4 font-semibold">Customer Name</th>
              <th className="px-6 py-4 font-semibold">Contact Info</th>
              <th className="px-6 py-4 font-semibold">City</th>
              <th className="px-6 py-4 text-right font-semibold">Amount</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-8 py-4 text-center font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders.map((order) => (
              <tr key={order.id} className="group cursor-pointer transition-colors hover:bg-slate-50/60">
                <td className="px-8 py-5 text-sm font-semibold tracking-tight text-blue-700">#{order.id}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                      {getInitials(order.customer)}
                    </div>
                    <span className="text-sm font-medium text-slate-900">{order.customer}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm font-medium text-slate-500">{order.phone}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{order.city}</td>
                <td className="px-6 py-5 text-right text-sm font-bold text-slate-900">{currency.format(order.total)}</td>
                <td className="px-6 py-4">
                  <div className="relative w-full max-w-[150px]">
                    <select
                      value={order.status}
                      onChange={(event) => onStatusChange(order.id, event.target.value)}
                      className={`w-full appearance-none rounded-full border-none px-3 py-2 pr-8 text-[11px] font-bold uppercase tracking-[0.18em] outline-none ${statusStyles[order.status]}`}
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-current">▼</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-center">
                  <button type="button" className="text-slate-400 transition-colors hover:text-blue-700">
                    <HiEllipsisVertical className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-4 bg-slate-50/40 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
        <button type="button" className="flex items-center gap-2 text-xs font-bold text-slate-400 transition-colors hover:text-blue-700">
          <span aria-hidden="true">&larr;</span>
          PREVIOUS
        </button>
        <div className="flex items-center gap-2 self-center">
          <button type="button" className="h-8 w-8 rounded-lg bg-blue-700 text-xs font-bold text-white">1</button>
          <button type="button" className="h-8 w-8 rounded-lg text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100">2</button>
          <button type="button" className="h-8 w-8 rounded-lg text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100">3</button>
          <span className="mx-1 text-slate-400">...</span>
          <button type="button" className="h-8 w-8 rounded-lg text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100">124</button>
        </div>
        <button type="button" className="flex items-center gap-2 self-end text-xs font-bold text-slate-600 transition-colors hover:text-blue-700 sm:self-auto">
          NEXT
          <span aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </section>
  );
}

function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
