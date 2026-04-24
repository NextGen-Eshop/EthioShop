import {
  HiOutlineArrowTrendingUp,
  HiOutlineCalendarDays,
  HiOutlineArrowDownTray,
  HiOutlineChevronRight,
  HiOutlineCube,
} from 'react-icons/hi2';
import { orders, products, users } from '../data/mockData';
import { useAuthStore } from '../../store/authStore';

const fmt = (n) => `ETB ${Number(n).toLocaleString()}`;

export default function Overview() {
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const { user } = useAuthStore();

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-10">
      {/* Header Area */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-500 text-sm">Welcome back{user?.name ? `, ${user.name}` : ''}. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <HiOutlineCalendarDays className="w-4 h-4" />
            Last 30 days
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors">
            Download Report
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard label="Total Revenue" value={fmt(totalRevenue)} trend="+12%" trendUp={true} icon="payments" />
        <KPICard label="Active Orders" value={orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length.toString()} trend="+5%" trendUp={true} icon="local_mall" />
        <KPICard label="Customers" value={users.length.toString()} trend="+8%" trendUp={true} icon="group" />
        <KPICard label="Products" value={products.length.toString()} trend="0%" trendUp={true} icon="inventory_2" />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Revenue Chart Placeholder / Redesign */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Revenue Forecast</h2>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-md">
              <button className="px-3 py-1 text-xs font-semibold bg-white text-slate-900 rounded shadow-sm">Sales</button>
              <button className="px-3 py-1 text-xs font-semibold text-slate-500 hover:text-slate-900">Volume</button>
            </div>
          </div>
          
          <div className="bg-white border border-slate-100 rounded-2xl p-8 h-[360px] flex flex-col">
            <div className="flex-1 flex items-end gap-3 pb-6">
              {[35, 55, 45, 75, 95, 65, 85, 40, 60, 50, 70, 90].map((h, i) => (
                <div key={i} className="group relative flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-slate-100 rounded-md transition-all duration-300 group-hover:bg-primary group-hover:shadow-[0_0_20px_rgba(53,37,205,0.2)]" 
                    style={{ height: `${h}%` }}
                  ></div>
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded -translate-y-2">
                    ${h * 100}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-4 border-t border-slate-50">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <span key={m}>{m}</span>)}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Activity</h2>
          <div className="space-y-8">
            <ActivityItem 
              user="Amara Okafor" 
              action="ordered" 
              item="Ceramic Set" 
              time="2m ago" 
              avatar="11"
            />
            <ActivityItem 
              user="Liam Hudson" 
              action="joined" 
              item="Verified" 
              time="15m ago" 
              avatar="12"
            />
            <ActivityItem 
              user="Elena Rossi" 
              action="reviewed" 
              item="Linen Duvet" 
              time="1h ago" 
              avatar="13"
            />
            <ActivityItem 
              user="Marcus Chen" 
              action="ordered" 
              item="Gold Watch" 
              time="3h ago" 
              avatar="14"
            />
          </div>
          <button className="w-full py-3 text-sm font-semibold text-slate-500 hover:text-slate-900 border border-transparent hover:border-slate-100 rounded-xl transition-all">
            See all activity
          </button>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">Recent Orders</h3>
          <a href="/admin/orders" className="text-sm font-semibold text-primary hover:underline">View all</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">City</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {orders.slice(0, 5).map(o => (
                <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">{o.id}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{o.customer}</td>
                  <td className="px-6 py-4 text-slate-500">{o.city}</td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{fmt(o.total)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      o.status === 'delivered' ? 'text-green-600 bg-green-50' :
                      o.status === 'shipped' ? 'text-blue-600 bg-blue-50' :
                      o.status === 'paid' ? 'text-indigo-600 bg-indigo-50' :
                      o.status === 'cancelled' ? 'text-red-600 bg-red-50' :
                      'text-amber-600 bg-amber-50'
                    }`}>{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


function KPICard({ label, value, trend, trendUp, icon }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-primary/20 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-lg">{icon}</span>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-md ${trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trend}
        </span>
      </div>
      <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
    </div>
  );
}
