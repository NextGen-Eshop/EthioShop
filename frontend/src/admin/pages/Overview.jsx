import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Users, UserCog, Package, ShoppingBag, DollarSign,
  Clock, CheckCircle2, XCircle, AlertTriangle, TrendingUp,
  CreditCard, ArrowRight, Bell, BarChart3,
} from 'lucide-react';
import { useStaffStore } from '../../staff/store/staffStore';
import { useAdminStore } from '../store/adminStore';
import { salesChartData } from '../data/adminData';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

const fmt = (n) => `ETB ${Number(n).toLocaleString()}`;

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.35, ease: 'easeOut' } }),
};

export default function Overview() {
  const { products, orders } = useStaffStore();
  const { users, staff, payments, notifications } = useAdminStore();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const stats = useMemo(() => {
    const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.totalAmount || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= (p.lowStockThreshold || 5)).length;
    const successfulPayments = payments.filter(p => p.status === 'successful').length;
    const failedPayments = payments.filter(p => p.status === 'failed').length;
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const totalRevFromPayments = payments.filter(p => p.status === 'successful').reduce((s, p) => s + p.amount, 0);
    return {
      totalUsers: users.length, totalStaff: staff.length, totalProducts: products.length,
      totalOrders: orders.length, totalRevenue: totalRevFromPayments,
      pendingOrders, completedOrders, cancelledOrders,
      outOfStock, lowStock, successfulPayments, failedPayments, pendingPayments,
    };
  }, [products, orders, users, staff, payments]);

  const kpiCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'indigo', link: '/admin/users', trend: '+8%' },
    { label: 'Total Staff', value: stats.totalStaff, icon: UserCog, color: 'violet', link: '/admin/staff', trend: '+2' },
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'blue', link: '/admin/products', trend: `${stats.outOfStock} OOS` },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'sky', link: '/admin/orders', trend: `${stats.pendingOrders} pending` },
    { label: 'Total Revenue', value: fmt(stats.totalRevenue), icon: DollarSign, color: 'emerald', link: '/admin/payments', trend: '+12%' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'amber', link: '/admin/orders', trend: 'Action needed' },
    { label: 'Completed Orders', value: stats.completedOrders, icon: CheckCircle2, color: 'emerald', link: '/admin/orders', trend: 'All time' },
    { label: 'Cancelled Orders', value: stats.cancelledOrders, icon: XCircle, color: 'rose', link: '/admin/orders', trend: 'All time' },
    { label: 'Out of Stock', value: stats.outOfStock, icon: AlertTriangle, color: 'red', link: '/admin/inventory', trend: 'Urgent' },
    { label: 'Low Stock', value: stats.lowStock, icon: TrendingUp, color: 'orange', link: '/admin/inventory', trend: 'Monitor' },
    { label: 'Successful Payments', value: stats.successfulPayments, icon: CreditCard, color: 'emerald', link: '/admin/payments', trend: 'All time' },
    { label: 'Failed Payments', value: stats.failedPayments, icon: XCircle, color: 'rose', link: '/admin/payments', trend: 'Review' },
    { label: 'Pending Payments', value: stats.pendingPayments, icon: Clock, color: 'amber', link: '/admin/payments', trend: 'Awaiting' },
  ];

  const colorMap = {
    indigo: 'from-pink-500 to-purple-600 shadow-pink-500/20',
    violet: 'from-violet-500 to-purple-600 shadow-purple-500/20',
    blue: 'from-blue-500 to-indigo-600 shadow-blue-500/20',
    sky: 'from-sky-500 to-blue-600 shadow-sky-500/20',
    emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/20',
    amber: 'from-amber-500 to-orange-600 shadow-amber-500/20',
    rose: 'from-rose-500 to-red-600 shadow-rose-500/20',
    red: 'from-red-500 to-rose-600 shadow-red-500/20',
    orange: 'from-orange-500 to-amber-600 shadow-orange-500/20',
  };

  const orderStatusData = [
    { name: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: '#f59e0b' },
    { name: 'Confirmed', value: orders.filter(o => o.status === 'confirmed').length, color: '#3b82f6' },
    { name: 'Processing', value: orders.filter(o => o.status === 'processing').length, color: '#8b5cf6' },
    { name: 'Shipped', value: orders.filter(o => o.status === 'shipped').length, color: '#6366f1' },
    { name: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: '#10b981' },
    { name: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length, color: '#f43f5e' },
  ].filter(d => d.value > 0);

  const paymentStatusData = [
    { name: 'Successful', value: stats.successfulPayments, color: '#10b981' },
    { name: 'Pending', value: stats.pendingPayments, color: '#f59e0b' },
    { name: 'Failed', value: stats.failedPayments, color: '#f43f5e' },
  ].filter(d => d.value > 0);

  const recentOrders = orders.slice(0, 5);
  const recentUsers = [...users].sort((a, b) => new Date(b.joined) - new Date(a.joined)).slice(0, 5);
  const alertNotifs = notifications.filter(n => !n.read).slice(0, 4);

  const statusColor = (s) => {
    switch (s) {
      case 'delivered':
        return isDark ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'shipped':
        return isDark ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'processing':
        return isDark ? 'bg-purple-500/15 text-purple-300 border-purple-500/30' : 'bg-purple-50 text-purple-700 border-purple-200';
      case 'confirmed':
        return isDark ? 'bg-blue-500/15 text-blue-300 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled':
        return isDark ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return isDark ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            Admin Dashboard
          </h1>
          <p className="text-xs mt-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
            Welcome back{user?.name ? `, ${user.name}` : ''}. Overview of platform metrics & operations.
          </p>
        </div>
        <Link
          to="/admin/analytics"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
            boxShadow: '0 0 16px rgba(236,72,153,0.35)',
          }}
        >
          <BarChart3 className="h-4 w-4" />
          <span>View Reports</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -2, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Link to={card.link} className="block group">
                <div
                  className="rounded-2xl p-4 transition-all duration-200 border"
                  style={{
                    background: isDark ? '#111522' : '#FFFFFF',
                    borderColor: isDark ? '#252A3A' : '#E2E8F0',
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center bg-gradient-to-br ${colorMap[card.color]} shadow-md shrink-0`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-[10px] font-semibold leading-tight text-right text-slate-400">{card.trend}</span>
                  </div>
                  <p className="text-[11px] font-semibold mb-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                    {card.label}
                  </p>
                  <p className="text-lg font-black tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                    {card.value}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div
          className="lg:col-span-2 rounded-2xl p-5 shadow-xs border"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            borderColor: isDark ? '#252A3A' : '#E2E8F0',
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                Revenue & Orders Overview
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Monthly performance for the year</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={salesChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E2235' : '#f1f5f9'} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(val, name) => [name === 'revenue' ? fmt(val) : val, name === 'revenue' ? 'Revenue' : 'Orders']}
                contentStyle={{
                  borderRadius: '12px',
                  border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                  background: isDark ? '#0F1220' : '#FFFFFF',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  fontSize: '11px',
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#EC4899" strokeWidth={2} fill="url(#revGrad)" dot={false} />
              <Area type="monotone" dataKey="orders" stroke="#8B5CF6" strokeWidth={2} fill="none" dot={false} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 justify-end text-[10px] font-semibold text-slate-400">
            <div className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-pink-500 inline-block" /> Revenue</div>
            <div className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-purple-500 inline-block" /> Orders</div>
          </div>
        </div>

        {/* Order Status Donut */}
        <div
          className="rounded-2xl p-5 shadow-xs flex flex-col border"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            borderColor: isDark ? '#252A3A' : '#E2E8F0',
          }}
        >
          <h2 className="text-base font-bold mb-1" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Order Status</h2>
          <p className="text-xs text-slate-400 mb-4">Distribution of all orders</p>
          {orderStatusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={orderStatusData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                    {orderStatusData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [val, name]}
                    contentStyle={{
                      borderRadius: '12px',
                      border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                      background: isDark ? '#0F1220' : '#FFFFFF',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1">
                {orderStatusData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: d.color }} />
                      <span style={{ color: isDark ? '#CBD5E1' : '#475569' }} className="font-medium">{d.name}</span>
                    </div>
                    <span className="font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">No order data</div>
          )}
        </div>
      </div>

      {/* Payment + Bar Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Bar Chart */}
        <div
          className="lg:col-span-2 rounded-2xl p-5 shadow-xs border"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            borderColor: isDark ? '#252A3A' : '#E2E8F0',
          }}
        >
          <h2 className="text-base font-bold mb-1" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Monthly Orders Volume</h2>
          <p className="text-xs text-slate-400 mb-4">Orders per month this year</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={salesChartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E2235' : '#f1f5f9'} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                  background: isDark ? '#0F1220' : '#FFFFFF',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  fontSize: '11px',
                }}
              />
              <Bar dataKey="orders" fill="#8B5CF6" radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Distribution */}
        <div
          className="rounded-2xl p-5 shadow-xs flex flex-col border"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            borderColor: isDark ? '#252A3A' : '#E2E8F0',
          }}
        >
          <h2 className="text-base font-bold mb-1" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Payment Status</h2>
          <p className="text-xs text-slate-400 mb-4">Payment distribution</p>
          {paymentStatusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={paymentStatusData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={4}>
                    {paymentStatusData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                      background: isDark ? '#0F1220' : '#FFFFFF',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1.5">
                {paymentStatusData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: d.color }} />
                      <span style={{ color: isDark ? '#CBD5E1' : '#475569' }} className="font-medium">{d.name}</span>
                    </div>
                    <span className="font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">No payment data</div>
          )}
        </div>
      </div>

      {/* Recent Orders + Users Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div
          className="rounded-2xl shadow-xs overflow-hidden border"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            borderColor: isDark ? '#252A3A' : '#E2E8F0',
          }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
            <h3 className="font-bold text-sm" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[420px]">
              <thead style={{ background: isDark ? '#151928' : '#F8FAFC' }}>
                <tr>
                  {['Order ID', 'Customer', 'Amount', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-[#252A3A]' : 'divide-slate-100'}`}>
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">No orders yet</td></tr>
                ) : recentOrders.map(o => (
                  <tr key={o.id} className="transition-colors" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                    <td className="px-4 py-3 font-mono text-purple-400">{o.id}</td>
                    <td className="px-4 py-3 font-semibold">{o.customer?.name || '—'}</td>
                    <td className="px-4 py-3 font-bold">{fmt(o.totalAmount || 0)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusColor(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Users */}
        <div
          className="rounded-2xl shadow-xs overflow-hidden border"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            borderColor: isDark ? '#252A3A' : '#E2E8F0',
          }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
            <h3 className="font-bold text-sm" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Recent Registrations</h3>
            <Link to="/admin/users" className="text-xs font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className={`divide-y ${isDark ? 'divide-[#252A3A]' : 'divide-slate-100'}`}>
            {recentUsers.map(u => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3 transition-colors">
                <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 bg-slate-800 ring-1 ring-purple-500/30">
                  {u.avatar ? (
                    <img src={u.avatar} alt={u.name} className="h-full w-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[11px] font-bold text-white bg-gradient-to-tr from-pink-500 to-purple-600">
                      {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{u.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    u.status === 'active'
                      ? isDark ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-500/10 text-slate-400'
                  }`}>
                    {u.status}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{u.joined}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Notifications */}
      {alertNotifs.length > 0 && (
        <div
          className="rounded-2xl shadow-xs overflow-hidden border"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            borderColor: isDark ? '#252A3A' : '#E2E8F0',
          }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-400" />
              <h3 className="font-bold text-sm" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>System Notifications</h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400">{alertNotifs.length} unread</span>
            </div>
            <Link to="/admin/settings" className="text-xs font-semibold text-pink-400 hover:text-pink-300">Manage</Link>
          </div>
          <div className={`divide-y ${isDark ? 'divide-[#252A3A]' : 'divide-slate-100'}`}>
            {alertNotifs.map(n => (
              <div
                key={n.id}
                className="flex items-start gap-4 px-5 py-3 border-l-4"
                style={{
                  borderLeftColor: n.type === 'out_of_stock' ? '#F43F5E' : n.type === 'low_stock' ? '#F59E0B' : '#8B5CF6',
                  background: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
                }}
              >
                <div className="flex-1">
                  <p className="text-xs" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{n.message}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
