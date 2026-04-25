import { useState, useEffect } from 'react';
import { HiOutlineCalendarDays } from 'react-icons/hi2';
import { orders as mockOrders, products as mockProducts, users as mockUsers } from '../data/mockData';
import { useAuthStore } from '../../store/authStore';
import api from '../../utils/api';

const fmt = (n) => `ETB ${Number(n).toLocaleString()}`;

const statusStyle = {
  delivered: 'text-green-600 bg-green-50',
  shipped: 'text-blue-600 bg-blue-50',
  approved: 'text-emerald-600 bg-emerald-50',
  under_review: 'text-sky-600 bg-sky-50',
  pending_payment: 'text-amber-600 bg-amber-50',
  rejected: 'text-rose-600 bg-rose-50',
  cancelled: 'text-red-600 bg-red-50',
};

export default function Overview() {
  const { user } = useAuthStore();

  const [stats, setStats] = useState({
    totalRevenue:  mockOrders.reduce((s, o) => s + o.total, 0),
    totalOrders:   mockOrders.length,
    totalUsers:    mockUsers.length,
    totalProducts: mockProducts.length,
    activeOrders:  mockOrders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length,
    revenueByMonth: [],
  });

  const [recentOrders, setRecentOrders] = useState(mockOrders);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get('/api/admin/dashboard'),
      api.get('/api/orders'),
    ]).then(([dashRes, ordersRes]) => {
      if (dashRes.status === 'fulfilled' && dashRes.value.data?.data) {
        setStats(dashRes.value.data.data);
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value.data?.data?.length) {
        setRecentOrders(ordersRes.value.data.data.slice(0, 5));
      }
    }).finally(() => setLoading(false));
  }, []);

  const kpis = [
    { label: 'Total Revenue',  value: fmt(stats.totalRevenue),  trend: '+12%', up: true,  icon: 'payments'     },
    { label: 'Active Orders',  value: stats.activeOrders,       trend: '+5%',  up: true,  icon: 'local_mall'   },
    { label: 'Customers',      value: stats.totalUsers,         trend: '+8%',  up: true,  icon: 'group'        },
    { label: 'Products',       value: stats.totalProducts,      trend: '0%',   up: true,  icon: 'inventory_2'  },
  ];

  // Bar chart heights — use real data if available, else placeholder
  const chartData = stats.revenueByMonth.length
    ? stats.revenueByMonth
    : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        .map((month, i) => ({ month, revenue: [35,55,45,75,95,65,85,40,60,50,70,90][i] * 100 }));

  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-10">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}. Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <HiOutlineCalendarDays className="w-4 h-4" />
            Last 30 days
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map(({ label, value, trend, up, icon }) => (
          <div key={label} className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                <span className="material-symbols-outlined text-lg">{icon}</span>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {trend}
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">Revenue Overview</h2>
          <span className="text-xs text-slate-400 font-medium">
            {stats.revenueByMonth.length ? 'Live data' : 'Sample data'}
          </span>
        </div>
        <div className="flex items-end gap-2 h-48">
          {chartData.map(({ month, revenue }) => (
            <div key={month} className="group relative flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-slate-100 rounded-t-md group-hover:bg-indigo-500 transition-all duration-300"
                style={{ height: `${(revenue / maxRevenue) * 100}%`, minHeight: '4px' }}
              />
              <span className="text-[9px] font-bold text-slate-400 uppercase">{month}</span>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap">
                {fmt(revenue)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">Recent Orders</h3>
          <a href="/admin/orders" className="text-sm font-semibold text-indigo-600 hover:underline">View all</a>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {recentOrders.map((o) => {
                  const id = o.id || o._id;
                  const customer = o.customer || `${o.user?.firstName || ''} ${o.user?.lastName || ''}`.trim() || 'Customer';
                  const total = o.total || o.totalPrice || 0;
                  const date = o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—';
                  return (
                    <tr key={id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-slate-400">{String(id).slice(-8).toUpperCase()}</td>
                      <td className="px-5 py-4 font-semibold text-slate-900">{customer}</td>
                      <td className="px-5 py-4 font-semibold text-slate-700">{fmt(total)}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${statusStyle[o.status] || statusStyle.pending}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs">{date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
