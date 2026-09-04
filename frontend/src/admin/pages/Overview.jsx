import { useState, useEffect, useMemo } from 'react';
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
import { useAdminStore } from '../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const fmt = (n) => `ETB ${Number(n || 0).toLocaleString()}`;

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.35, ease: 'easeOut' } }),
};

export default function Overview() {
  const { notifications } = useAdminStore();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const [dbStats, setDbStats] = useState(null);
  const [dbOrders, setDbOrders] = useState([]);
  const [dbUsers, setDbUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const headers = user?.accessToken
          ? { Authorization: `Bearer ${user.accessToken}` }
          : {};

        const [overviewRes, ordersRes, usersRes, notifsRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/overview`, { headers, credentials: 'include' }),
          fetch(`${API_URL}/api/admin/orders`, { headers, credentials: 'include' }),
          fetch(`${API_URL}/api/admin/users`, { headers, credentials: 'include' }),
          fetch(`${API_URL}/api/notifications`, { headers, credentials: 'include' }),
        ]);

        if (overviewRes.ok) {
          const json = await overviewRes.json();
          if (json.success && json.data) {
            setDbStats(json.data);
          }
        }

        if (ordersRes.ok) {
          const json = await ordersRes.json();
          if (json.success && json.data) {
            setDbOrders(json.data);
          }
        }

        if (usersRes.ok) {
          const json = await usersRes.json();
          if (json.success && json.data) {
            setDbUsers(json.data);
          }
        }

        if (notifsRes.ok) {
          const json = await notifsRes.json();
          if (json.success && Array.isArray(json.data)) {
            const formatted = json.data.map((n) => ({
              id: n._id,
              message: n.title ? `${n.title}: ${n.message}` : n.message,
              time: n.createdAt ? new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recently',
              read: Boolean(n.isRead),
              type: n.type || 'system',
            }));
            useAdminStore.setState({ notifications: formatted });
          }
        }
      } catch (err) {
        console.error('Failed to load real admin overview data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user?.accessToken]);

  const stats = useMemo(() => {
    if (dbStats) {
      return {
        totalUsers: dbStats.totalUsers ?? dbUsers.length,
        totalStaff: dbStats.totalStaff ?? dbUsers.filter(u => u.role === 'staff').length,
        totalProducts: dbStats.totalProducts ?? 0,
        totalOrders: dbStats.totalOrders ?? dbOrders.length,
        totalRevenue: dbStats.totalRevenue ?? dbOrders.filter(o => o.status === 'delivered' || o.isPaid).reduce((s, o) => s + (o.totalPrice || o.totalAmount || 0), 0),
        pendingOrders: dbStats.pendingOrders ?? dbOrders.filter(o => o.status === 'pending').length,
        completedOrders: dbStats.completedOrders ?? dbOrders.filter(o => o.status === 'delivered').length,
        cancelledOrders: dbStats.cancelledOrders ?? dbOrders.filter(o => o.status === 'cancelled').length,
        outOfStock: dbStats.outOfStock ?? 0,
        lowStock: dbStats.lowStock ?? 0,
        successfulPayments: dbStats.successfulPayments ?? dbOrders.filter(o => o.isPaid).length,
        failedPayments: dbStats.failedPayments ?? dbOrders.filter(o => o.status === 'cancelled').length,
        pendingPayments: dbStats.pendingPayments ?? dbOrders.filter(o => !o.isPaid && o.status !== 'cancelled').length,
      };
    }

    const pendingOrders = dbOrders.filter(o => o.status === 'pending').length;
    const completedOrders = dbOrders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = dbOrders.filter(o => o.status === 'cancelled').length;
    const successfulPayments = dbOrders.filter(o => o.isPaid).length;
    const failedPayments = dbOrders.filter(o => o.status === 'cancelled').length;
    const pendingPayments = dbOrders.filter(o => !o.isPaid && o.status !== 'cancelled').length;
    const totalRevenue = dbOrders.filter(o => o.status === 'delivered' || o.isPaid).reduce((s, o) => s + (o.totalPrice || o.totalAmount || 0), 0);

    return {
      totalUsers: dbUsers.length,
      totalStaff: dbUsers.filter(u => u.role === 'staff').length,
      totalProducts: 0,
      totalOrders: dbOrders.length,
      totalRevenue,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      outOfStock: 0,
      lowStock: 0,
      successfulPayments,
      failedPayments,
      pendingPayments,
    };
  }, [dbStats, dbOrders, dbUsers]);

  const kpiCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'indigo', link: '/admin/users', trend: 'Live DB' },
    { label: 'Total Staff', value: stats.totalStaff, icon: UserCog, color: 'violet', link: '/admin/staff', trend: 'Live DB' },
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'blue', link: '/admin/products', trend: `${stats.outOfStock} OOS` },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'sky', link: '/admin/orders', trend: `${stats.pendingOrders} pending` },
    { label: 'Total Revenue', value: fmt(stats.totalRevenue), icon: DollarSign, color: 'emerald', link: '/admin/payments', trend: 'Delivered/Paid' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'amber', link: '/admin/orders', trend: 'Action needed' },
    { label: 'Completed Orders', value: stats.completedOrders, icon: CheckCircle2, color: 'emerald', link: '/admin/orders', trend: 'Delivered' },
    { label: 'Cancelled Orders', value: stats.cancelledOrders, icon: XCircle, color: 'rose', link: '/admin/orders', trend: 'Cancelled' },
    { label: 'Out of Stock', value: stats.outOfStock, icon: AlertTriangle, color: 'red', link: '/admin/inventory', trend: 'Count = 0' },
    { label: 'Low Stock', value: stats.lowStock, icon: TrendingUp, color: 'orange', link: '/admin/inventory', trend: 'Stock ≤ 5' },
    { label: 'Successful Payments', value: stats.successfulPayments, icon: CreditCard, color: 'emerald', link: '/admin/payments', trend: 'Paid' },
    { label: 'Failed Payments', value: stats.failedPayments, icon: XCircle, color: 'rose', link: '/admin/payments', trend: 'Cancelled' },
    { label: 'Pending Payments', value: stats.pendingPayments, icon: Clock, color: 'amber', link: '/admin/payments', trend: 'Unpaid' },
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
    { name: 'Pending', value: dbOrders.filter(o => o.status === 'pending').length, color: '#f59e0b' },
    { name: 'Processing', value: dbOrders.filter(o => o.status === 'processing').length, color: '#8b5cf6' },
    { name: 'Shipped', value: dbOrders.filter(o => o.status === 'shipped').length, color: '#6366f1' },
    { name: 'Delivered', value: dbOrders.filter(o => o.status === 'delivered').length, color: '#10b981' },
    { name: 'Cancelled', value: dbOrders.filter(o => o.status === 'cancelled').length, color: '#f43f5e' },
  ].filter(d => d.value > 0);

  const paymentStatusData = [
    { name: 'Successful', value: stats.successfulPayments, color: '#10b981' },
    { name: 'Pending', value: stats.pendingPayments, color: '#f59e0b' },
    { name: 'Failed', value: stats.failedPayments, color: '#f43f5e' },
  ].filter(d => d.value > 0);

  const salesChartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const monthlyMap = months.map((month) => ({ month, revenue: 0, orders: 0 }));

    dbOrders.forEach((order) => {
      const orderDate = order.createdAt ? new Date(order.createdAt) : null;
      if (orderDate && !isNaN(orderDate.getTime())) {
        const mIdx = orderDate.getMonth();
        monthlyMap[mIdx].orders += 1;
        if (order.status === 'delivered' || order.isPaid) {
          monthlyMap[mIdx].revenue += (order.totalPrice ?? order.totalAmount ?? 0);
        }
      }
    });

    return monthlyMap;
  }, [dbOrders]);

  const recentOrders = dbOrders.slice(0, 5);
  const recentUsers = [...dbUsers].sort((a, b) => new Date(b.createdAt || b.joined || 0) - new Date(a.createdAt || a.joined || 0)).slice(0, 5);
  const alertNotifs = notifications.filter(n => !n.read).slice(0, 4);

  const statusColor = (s) => {
    switch (s) {
      case 'delivered':
        return isDark ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'shipped':
        return isDark ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'processing':
        return isDark ? 'bg-purple-500/15 text-purple-300 border-purple-500/30' : 'bg-purple-50 text-purple-700 border-purple-200';
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
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">No orders recorded in database</td></tr>
                ) : recentOrders.map(o => {
                  const orderId = o._id ? `#${o._id.toString().slice(-6).toUpperCase()}` : o.id;
                  const customerName = o.user
                    ? `${o.user.firstName || ''} ${o.user.lastName || ''}`.trim() || o.user.email
                    : (o.shippingAddress?.fullName || o.customer?.name || 'Customer');
                  const amount = o.totalPrice ?? o.totalAmount ?? 0;
                  return (
                    <tr key={o._id || o.id} className="transition-colors" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                      <td className="px-4 py-3 font-mono text-purple-400">{orderId}</td>
                      <td className="px-4 py-3 font-semibold">{customerName}</td>
                      <td className="px-4 py-3 font-bold">{fmt(amount)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusColor(o.status)}`}>
                          {o.status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
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
            {recentUsers.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-400 text-xs">No users recorded in database</div>
            ) : recentUsers.map(u => {
              const userName = u.firstName
                ? `${u.firstName} ${u.lastName || ''}`.trim()
                : (u.name || 'User');
              const userFirst = u.firstName || userName.split(' ')[0] || 'User';
              const joinedDate = u.createdAt
                ? new Date(u.createdAt).toLocaleDateString()
                : (u.joined || 'Recent');
              const roleTag = u.role || (u.status === 'active' ? 'active' : 'user');

              return (
                <div key={u._id || u.id} className="flex items-center gap-3 px-5 py-3 transition-colors">
                  <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 bg-slate-800 ring-1 ring-purple-500/30">
                    {u.avatar ? (
                      <img src={u.avatar} alt={userName} className="h-full w-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs font-black text-white bg-gradient-to-tr from-pink-500 to-purple-600 select-none">
                        {(userName ? userName.trim().charAt(0) : 'U').toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{userName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      roleTag === 'admin'
                        ? isDark ? 'bg-pink-500/15 text-pink-300' : 'bg-pink-50 text-pink-700'
                        : roleTag === 'staff'
                        ? isDark ? 'bg-purple-500/15 text-purple-300' : 'bg-purple-50 text-purple-700'
                        : isDark ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {roleTag}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{joinedDate}</p>
                  </div>
                </div>
              );
            })}
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
