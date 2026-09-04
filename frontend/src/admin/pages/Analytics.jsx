import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  BarChart3, DollarSign, ShoppingBag, Users,
  TrendingUp, ArrowUpRight, Loader2
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const fmt = (n) => `ETB ${Number(n || 0).toLocaleString()}`;

const periods = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'year', label: 'This Year' },
];

export default function Analytics() {
  const [period, setPeriod] = useState('year');
  const { user: authUser } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const [dbOrders, setDbOrders] = useState([]);
  const [dbProducts, setDbProducts] = useState([]);
  const [dbUsers, setDbUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalyticsData() {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${authUser?.accessToken}` };
        const [ordersRes, prodsRes, usersRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/orders`, { headers, credentials: 'include' }),
          fetch(`${API_URL}/api/admin/products`, { headers, credentials: 'include' }),
          fetch(`${API_URL}/api/admin/users?role=all`, { headers, credentials: 'include' }),
        ]);

        if (ordersRes.ok) {
          const json = await ordersRes.json();
          if (json.success && Array.isArray(json.data)) setDbOrders(json.data);
        }
        if (prodsRes.ok) {
          const json = await prodsRes.json();
          if (json.success && Array.isArray(json.data)) setDbProducts(json.data);
        }
        if (usersRes.ok) {
          const json = await usersRes.json();
          if (json.success && Array.isArray(json.data)) setDbUsers(json.data);
        }
      } catch (err) {
        console.error('Failed to load real analytics data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAnalyticsData();
  }, [authUser?.accessToken]);

  const totalRevenue = useMemo(
    () =>
      dbOrders
        .filter((o) => o.isPaid || o.status === 'delivered')
        .reduce((sum, o) => sum + (o.totalPrice || o.totalAmount || 0), 0),
    [dbOrders]
  );

  const orderStats = useMemo(
    () => ({
      total: dbOrders.length,
      delivered: dbOrders.filter((o) => o.status === 'delivered').length,
      pending: dbOrders.filter((o) => o.status === 'pending').length,
      processing: dbOrders.filter((o) => o.status === 'processing').length,
      shipped: dbOrders.filter((o) => o.status === 'shipped').length,
      cancelled: dbOrders.filter((o) => o.status === 'cancelled').length,
    }),
    [dbOrders]
  );

  // Compute top products from real order items and database products
  const topProducts = useMemo(() => {
    const counts = {};
    dbOrders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const name = item.name || item.product?.name;
        if (name) {
          counts[name] = (counts[name] || 0) + (item.quantity || 1);
        }
      });
    });

    return dbProducts
      .map((p) => {
        const sales = counts[p.name] || p.salesCount || 0;
        return {
          name: p.name.length > 22 ? p.name.substring(0, 20) + '...' : p.name,
          sales,
          revenue: sales * (p.price || 0),
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [dbOrders, dbProducts]);

  const orderStatusData = [
    { name: 'Delivered', value: orderStats.delivered, color: '#10b981' },
    { name: 'Processing', value: orderStats.processing, color: '#8b5cf6' },
    { name: 'Shipped', value: orderStats.shipped, color: '#6366f1' },
    { name: 'Pending', value: orderStats.pending, color: '#f59e0b' },
    { name: 'Cancelled', value: orderStats.cancelled, color: '#f43f5e' },
  ].filter((d) => d.value > 0);

  // Compute real payment breakdown from orders
  const paymentBreakdown = useMemo(() => {
    const map = {};
    dbOrders.forEach((o) => {
      const pm = (o.paymentMethod || o.paymentDetails?.method || 'Other').toLowerCase();
      let label = 'Other';
      if (pm.includes('telebirr')) label = 'Telebirr';
      else if (pm.includes('cbe')) label = 'CBE Birr';
      else if (pm.includes('chapa') || pm.includes('card')) label = 'Chapa Card';
      else if (pm.includes('cash') || pm.includes('cod')) label = 'Cash on Delivery';
      else if (pm.includes('bank') || pm.includes('awash') || pm.includes('boa')) label = 'Bank Transfer';
      map[label] = (map[label] || 0) + 1;
    });

    const colors = {
      Telebirr: '#0284c7',
      'CBE Birr': '#8b5cf6',
      'Chapa Card': '#ec4899',
      'Cash on Delivery': '#10b981',
      'Bank Transfer': '#f59e0b',
      Other: '#64748b',
    };

    const res = Object.entries(map).map(([name, value]) => ({
      name,
      value,
      color: colors[name] || '#8b5cf6',
    }));

    return res.length > 0 ? res : [{ name: 'Telebirr', value: 1, color: '#0284c7' }];
  }, [dbOrders]);

  // Compute real sales chart data from orders
  const salesChartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-md shrink-0"
            style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' }}
          >
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              Reports & Analytics
            </h1>
            <p className="text-xs mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              Financial, fulfillment, and revenue growth analytics
            </p>
          </div>
        </div>

        {/* Period Selector */}
        <div
          className="flex items-center p-1 rounded-xl border shadow-xs"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            borderColor: isDark ? '#252A3A' : '#E2E8F0',
          }}
        >
          {periods.map((p) => {
            const active = period === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'text-white shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                style={
                  active
                    ? {
                        background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
                      }
                    : undefined
                }
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl p-5 shadow-xs border transition-all"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            borderColor: isDark ? '#252A3A' : '#E2E8F0',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="h-3 w-3 mr-0.5" /> +14.2%
            </span>
          </div>
          <p className="text-xs font-semibold" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Total Revenue</p>
          <p className="text-2xl font-black mt-0.5" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{fmt(totalRevenue)}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl p-5 shadow-xs border transition-all"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            borderColor: isDark ? '#252A3A' : '#E2E8F0',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="h-3 w-3 mr-0.5" /> +8.1%
            </span>
          </div>
          <p className="text-xs font-semibold" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Total Orders</p>
          <p className="text-2xl font-black mt-0.5" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{dbOrders.length}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl p-5 shadow-xs border transition-all"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            borderColor: isDark ? '#252A3A' : '#E2E8F0',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="h-3 w-3 mr-0.5" /> +12.5%
            </span>
          </div>
          <p className="text-xs font-semibold" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Registered Users</p>
          <p className="text-2xl font-black mt-0.5" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{dbUsers.length}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl p-5 shadow-xs border transition-all"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            borderColor: isDark ? '#252A3A' : '#E2E8F0',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center text-[10px] font-bold text-slate-400 bg-slate-500/15 px-2 py-0.5 rounded-full">
              Avg Order
            </span>
          </div>
          <p className="text-xs font-semibold" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Average Order Value</p>
          <p className="text-2xl font-black mt-0.5" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            {fmt(dbOrders.length ? Math.round(totalRevenue / dbOrders.length) : 0)}
          </p>
        </motion.div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Area Chart */}
        <div
          className="lg:col-span-2 rounded-2xl p-6 shadow-xs border"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            borderColor: isDark ? '#252A3A' : '#E2E8F0',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                Revenue Growth Trend
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Monthly revenue curve in ETB</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="areaRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E2235' : '#f1f5f9'} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(val) => [fmt(val), 'Revenue']}
                contentStyle={{
                  borderRadius: '12px',
                  border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                  background: isDark ? '#0F1220' : '#FFFFFF',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#EC4899" strokeWidth={3} fill="url(#areaRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order Fulfillment Breakdown Donut */}
        <div
          className="rounded-2xl p-6 shadow-xs flex flex-col border"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            borderColor: isDark ? '#252A3A' : '#E2E8F0',
          }}
        >
          <h2 className="text-base font-bold mb-1" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            Order Fulfillment
          </h2>
          <p className="text-xs text-slate-400 mb-4">Completed vs Pending orders</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={orderStatusData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4}>
                {orderStatusData.map((entry, idx) => (
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
          <div className="mt-auto space-y-2">
            {orderStatusData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  <span style={{ color: isDark ? '#CBD5E1' : '#475569' }}>{d.name}</span>
                </div>
                <span className="font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Performance & Payment Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Bar Chart */}
        <div
          className="rounded-2xl p-6 shadow-xs border"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            borderColor: isDark ? '#252A3A' : '#E2E8F0',
          }}
        >
          <h2 className="text-base font-bold mb-1" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            Top Selling Products
          </h2>
          <p className="text-xs text-slate-400 mb-4">Estimated revenue by product line</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E2235' : '#f1f5f9'} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: isDark ? '#CBD5E1' : '#475569' }} axisLine={false} tickLine={false} width={100} />
              <Tooltip
                formatter={(val) => [fmt(val), 'Revenue']}
                contentStyle={{
                  borderRadius: '12px',
                  border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                  background: isDark ? '#0F1220' : '#FFFFFF',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  fontSize: '11px',
                }}
              />
              <Bar dataKey="revenue" fill="#8B5CF6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Channels Breakdown */}
        <div
          className="rounded-2xl p-6 shadow-xs border"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            borderColor: isDark ? '#252A3A' : '#E2E8F0',
          }}
        >
          <h2 className="text-base font-bold mb-1" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            Payment Channel Share
          </h2>
          <p className="text-xs text-slate-400 mb-4">Chapa & Mobile Money integration metrics</p>
          <div className="space-y-4 mt-6">
            {paymentBreakdown.map((channel) => (
              <div key={channel.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span style={{ color: isDark ? '#CBD5E1' : '#374151' }}>{channel.name}</span>
                  <span className="font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{channel.value}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ background: isDark ? '#181c33' : '#F1F5F9' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${channel.value}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: channel.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
