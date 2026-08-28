import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  BarChart3, DollarSign, ShoppingBag, Users,
  TrendingUp, ArrowUpRight
} from 'lucide-react';
import { useStaffStore } from '../../staff/store/staffStore';
import { useAdminStore } from '../store/adminStore';
import { salesChartData } from '../data/adminData';
import { useThemeStore } from '../../store/themeStore';

const fmt = (n) => `ETB ${Number(n).toLocaleString()}`;

const periods = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'year', label: 'This Year' },
];

export default function Analytics() {
  const [period, setPeriod] = useState('year');
  const { products, orders } = useStaffStore();
  const { users, payments } = useAdminStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const totalRevenue = useMemo(
    () => payments.filter((p) => p.status === 'successful').reduce((s, p) => s + p.amount, 0),
    [payments]
  );

  const orderStats = useMemo(
    () => ({
      total: orders.length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      pending: orders.filter((o) => o.status === 'pending').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    }),
    [orders]
  );

  const topProducts = useMemo(() => {
    return products
      .slice(0, 5)
      .map((p) => ({
        name: p.name.length > 20 ? p.name.substring(0, 18) + '...' : p.name,
        sales: Math.floor(Math.random() * 40) + 10,
        revenue: (Math.floor(Math.random() * 40) + 10) * p.price,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [products]);

  const orderStatusData = [
    { name: 'Delivered', value: orderStats.delivered || 1, color: '#10b981' },
    { name: 'Pending', value: orderStats.pending || 1, color: '#f59e0b' },
    { name: 'Cancelled', value: orderStats.cancelled || 1, color: '#f43f5e' },
  ];

  const paymentBreakdown = [
    { name: 'Telebirr', value: 45, color: '#0284c7' },
    { name: 'CBE Birr', value: 30, color: '#8b5cf6' },
    { name: 'Chapa Card', value: 15, color: '#ec4899' },
    { name: 'Bank Transfer', value: 10, color: '#f59e0b' },
  ];

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
          <p className="text-2xl font-black mt-0.5" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{orders.length}</p>
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
          <p className="text-2xl font-black mt-0.5" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{users.length}</p>
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
            {fmt(orders.length ? Math.round(totalRevenue / orders.length) : 0)}
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
