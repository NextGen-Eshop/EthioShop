import { orders } from '../data/mockData';

const currency = (n) => `ETB ${n.toLocaleString()}`;

export default function Overview() {
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span> Last 30 days
          </button>
          <button className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200">
            Download Report
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <KPICard label="Total Revenue" value={currency(totalRevenue)} trend="+12%" trendUp icon="payments" color="bg-indigo-50 text-indigo-600" />
        <KPICard label="Active Orders" value="24" trend="+5%" trendUp icon="local_mall" color="bg-emerald-50 text-emerald-600" />
        <KPICard label="New Customers" value="1,240" trend="-2%" trendUp={false} icon="group" color="bg-purple-50 text-purple-600" />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Revenue Forecast</h2>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              <button className="px-3.5 py-1.5 text-xs font-bold bg-white text-gray-900 rounded-lg shadow-sm">Sales</button>
              <button className="px-3.5 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 rounded-lg">Volume</button>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 h-[360px] flex flex-col">
            <div className="flex-1 flex items-end gap-2 sm:gap-3 pb-6">
              {[35, 55, 45, 75, 95, 65, 85, 40, 60, 50, 70, 90].map((h, i) => (
                <div key={i} className="group relative flex-1 flex flex-col items-center">
                  <div className="w-full bg-indigo-100 rounded-lg transition-all duration-300 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-200 cursor-pointer" style={{ height: `${h}%` }} />
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg -translate-y-2">
                    ETB {(h * 100).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-4 border-t border-gray-50">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <span key={m}>{m}</span>)}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-5">
          <h2 className="text-lg font-bold text-gray-900">Activity</h2>
          <div className="space-y-6">
            <ActivityItem user="Amara Okafor" action="ordered" item="Ceramic Set" time="2m ago" avatar="11" />
            <ActivityItem user="Liam Hudson" action="joined" item="Verified" time="15m ago" avatar="12" />
            <ActivityItem user="Elena Rossi" action="reviewed" item="Linen Duvet" time="1h ago" avatar="13" />
            <ActivityItem user="Marcus Chen" action="ordered" item="Gold Watch" time="3h ago" avatar="14" />
          </div>
          <button className="w-full py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">See all activity</button>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Recent Orders</h3>
          <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">View all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead className="bg-gray-50/80 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <tr><th className="px-6 py-4">Order ID</th><th className="px-6 py-4">Customer</th><th className="px-6 py-4">Total</th><th className="px-6 py-4">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              <Row id="#82734" name="James Wilson" total="ETB 4,200" status="Paid" color="text-emerald-600 bg-emerald-50" />
              <Row id="#82733" name="Sia Khun" total="ETB 1,500" status="Pending" color="text-amber-600 bg-amber-50" />
              <Row id="#82732" name="Sarah Bell" total="ETB 8,900" status="Shipped" color="text-blue-600 bg-blue-50" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, trend, trendUp, icon, color }) {
  return (
    <div className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-100 hover:shadow-lg hover:shadow-indigo-100/30 hover:border-indigo-100 transition-all group">
      <div className="flex justify-between items-start mb-5">
        <div className={`w-11 h-11 flex items-center justify-center rounded-xl ${color} transition-colors`}>
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{trend}</span>
      </div>
      <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
    </div>
  );
}

function ActivityItem({ user, action, item, time, avatar }) {
  return (
    <div className="flex gap-3">
      <img src={`https://i.pravatar.cc/150?img=${avatar}`} className="w-9 h-9 rounded-full border border-gray-100 object-cover" alt={user} />
      <div className="flex-1">
        <p className="text-sm"><span className="font-bold text-gray-900">{user}</span> <span className="text-gray-500">{action}</span> <span className="font-semibold text-gray-800">{item}</span></p>
        <p className="text-xs text-gray-400 mt-0.5">{time}</p>
      </div>
    </div>
  );
}

function Row({ id, name, total, status, color }) {
  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4 font-mono text-xs text-gray-400">{id}</td>
      <td className="px-6 py-4 font-bold text-gray-900">{name}</td>
      <td className="px-6 py-4 font-semibold text-gray-700">{total}</td>
      <td className="px-6 py-4 text-xs"><span className={`px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider ${color}`}>{status}</span></td>
    </tr>
  );
}
