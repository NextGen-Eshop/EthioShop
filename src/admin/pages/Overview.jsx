import {
  HiOutlineArrowTrendingUp,
  HiOutlineCalendarDays,
  HiOutlineArrowDownTray,
  HiOutlineChevronRight,
  HiOutlineCube,
} from 'react-icons/hi2';
import { motion } from 'framer-motion';
import { orders } from '../data/mockData';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 100 } }
};

export default function Overview() {
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto space-y-12 pb-10"
    >
      {/* Header Area */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">Dashboard</h1>
          <p className="text-slate-500 text-sm font-medium">Real-time statistics and summary of your store's performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <HiOutlineCalendarDays className="w-4 h-4" />
            Last 30 days
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-slate-900/20">
            Download Report
          </button>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <KPICard 
          label="Total Revenue" 
          value={currency.format(totalRevenue)} 
          trend="+12%" 
          trendUp={true} 
          icon="payments"
        />
        <KPICard 
          label="Active Orders" 
          value="24" 
          trend="+5%" 
          trendUp={true} 
          icon="local_mall"
        />
        <KPICard 
          label="New Customers" 
          value="1,240" 
          trend="-2%" 
          trendUp={false} 
          icon="group"
        />
      </motion.div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Revenue Chart */}
        <motion.div variants={fadeUp} className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Revenue Forecast</h2>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-md">
              <button className="px-3 py-1 text-xs font-semibold bg-white text-slate-900 rounded shadow-sm">Sales</button>
              <button className="px-3 py-1 text-xs font-semibold text-slate-500 hover:text-slate-900">Volume</button>
            </div>
          </div>
          
          <div className="bg-white border border-slate-100 rounded-2xl p-8 h-[360px] flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
            <div className="flex-1 flex items-end gap-3 pb-6">
              {[35, 55, 45, 75, 95, 65, 85, 40, 60, 50, 70, 90].map((h, i) => (
                <div key={i} className="group relative flex-1 flex flex-col items-center h-full justify-end">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: i * 0.05, ease: 'easeOut' }}
                    className="w-full bg-indigo-50 rounded-md transition-all duration-300 group-hover:bg-indigo-500 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]" 
                  ></motion.div>
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
        </motion.div>

        {/* Activity Feed */}
        <motion.div variants={fadeUp} className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Activity</h2>
          <div className="space-y-6">
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
          <button className="w-full py-3 text-sm font-semibold text-slate-500 hover:text-indigo-600 border border-transparent hover:border-indigo-100 hover:bg-indigo-50 rounded-xl transition-all active:scale-[0.98]">
            See all activity
          </button>
        </motion.div>
      </div>

      {/* Featured Table */}
      <motion.div variants={fadeUp} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-900">Recent Orders</h3>
          <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">View list</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">Order ID</th>
                <th className="px-8 py-4">Customer</th>
                <th className="px-8 py-4">Total</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              <Row id="#82734" name="James Wilson" total="$420.00" status="Paid" color="text-green-600 bg-green-50" />
              <Row id="#82733" name="Sia Khun" total="$150.00" status="Pending" color="text-amber-600 bg-amber-50" />
              <Row id="#82732" name="Sarah Bell" total="$890.00" status="Shipped" color="text-blue-600 bg-blue-50" />
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}

function KPICard({ label, value, trend, trendUp, icon }) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-indigo-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer">
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all group-hover:scale-110 shadow-sm">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-md ${trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trend}
        </span>
      </div>
      <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
      <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
    </div>
  );
}

function ActivityItem({ user, action, item, time, avatar }) {
  return (
    <div className="flex gap-4 p-3 -mx-3 rounded-xl hover:bg-slate-50 hover:translate-x-2 transition-all cursor-pointer">
      <img src={`https://i.pravatar.cc/150?img=${avatar}`} className="w-10 h-10 rounded-full border border-slate-100 shadow-sm" />
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-bold text-slate-900">{user}</span>
          <span className="text-slate-500 mx-1">{action}</span>
          <span className="font-semibold text-slate-800">{item}</span>
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{time}</p>
      </div>
    </div>
  );
}

function Row({ id, name, total, status, color }) {
  return (
    <tr className="hover:bg-indigo-50/40 transition-colors group cursor-pointer">
      <td className="px-8 py-5 font-mono text-xs text-slate-400">{id}</td>
      <td className="px-8 py-5 font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{name}</td>
      <td className="px-8 py-5 font-semibold text-slate-700">{total}</td>
      <td className="px-8 py-5 text-xs">
        <span className={`px-2 py-1.5 rounded-md font-bold uppercase tracking-wider ${color}`}>{status}</span>
      </td>
      <td className="px-8 py-5 text-right">
        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center ml-auto group-hover:bg-indigo-100 group-hover:translate-x-1 transition-all">
          <HiOutlineChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
        </div>
      </td>
    </tr>
  );
}

