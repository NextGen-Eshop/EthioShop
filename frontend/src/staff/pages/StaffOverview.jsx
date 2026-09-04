import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  ShoppingBag,
  Package,
  Users,
  ClipboardList,
  TrendingUp,
  ChevronDown,
  MoreHorizontal,
  Check,
  X,
  CreditCard,
  AlertTriangle,
  FileText,
  UserCheck,
  Sparkles,
  Calendar,
  Plus,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Truck,
  Loader2,
} from 'lucide-react';
import { useStaffStore } from '../store/staffStore';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CATEGORY_COLORS = ['#8b5cf6', '#0088ff', '#00b09b', '#ff5858', '#f59e0b', '#ec4899', '#14b8a6'];

// Custom Spline Tooltip displaying actual hovered amount
function CustomTooltip({ active, payload, isDark }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={`border rounded-xl px-3 py-2 text-center shadow-2xl ${
        isDark ? 'bg-[#121526] border-[#222744] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'
      }`}>
        <p className="text-xs font-black">ETB {Number(data.amount || 0).toLocaleString()}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">{data.day || ''}</p>
      </div>
    );
  }
  return null;
}

export default function StaffOverview() {
  const { user: authUser } = useAuthStore();
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const [dbStats, setDbStats] = useState(null);
  const [dbOrders, setDbOrders] = useState([]);
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dateRange, setDateRange] = useState('This Week');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [salesPeriod, setSalesPeriod] = useState('This Week');
  const [salesDropdown, setSalesDropdown] = useState(false);
  const [catPeriod, setCatPeriod] = useState('All Time');
  const [catDropdown, setCatDropdown] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [quickRestockId, setQuickRestockId] = useState(null);
  const [restockAmount, setRestockAmount] = useState(15);
  const [restocking, setRestocking] = useState(false);

  // Dynamic To Do list state
  const [todos, setTodos] = useState([
    { id: '1', text: 'Process pending orders', countKey: 'pending', badgeColor: 'bg-purple-600/30 text-purple-300', checked: false },
    { id: '2', text: 'Check low stock products', countKey: 'lowStock', badgeColor: 'bg-amber-500/30 text-amber-300', checked: false },
    { id: '3', text: 'Fulfill processing orders', countKey: 'processing', badgeColor: 'bg-blue-500/30 text-blue-300', checked: false },
    { id: '4', text: 'Review return / cancelled requests', countKey: 'cancelled', badgeColor: 'bg-rose-500/30 text-rose-300', checked: false },
  ]);

  const toggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, checked: !t.checked } : t))
    );
  };

  // Fetch real database overview, orders, and products
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const headers = authUser?.accessToken
        ? { Authorization: `Bearer ${authUser.accessToken}` }
        : {};

      const [overviewRes, ordersRes, productsRes] = await Promise.all([
        fetch(`${API_URL}/api/staff/overview`, { headers, credentials: 'include' }),
        fetch(`${API_URL}/api/staff/orders`, { headers, credentials: 'include' }),
        fetch(`${API_URL}/api/staff/products`, { headers, credentials: 'include' }),
      ]);

      if (overviewRes.ok) {
        const json = await overviewRes.json();
        if (json.success && json.data) {
          setDbStats(json.data);
        }
      }

      if (ordersRes.ok) {
        const json = await ordersRes.json();
        if (json.success && Array.isArray(json.data)) {
          setDbOrders(json.data);
          useStaffStore.setState({ orders: json.data });
        }
      }

      if (productsRes.ok) {
        const json = await productsRes.json();
        if (json.success && Array.isArray(json.data)) {
          const normalized = json.data.map((p) => ({
            id: p._id || p.id,
            name: p.name,
            category: p.category,
            price: Number(p.price) || 0,
            originalPrice: Number(p.originalPrice) || Number(p.price) || 0,
            stock: Number(p.countInStock !== undefined ? p.countInStock : p.stock) || 0,
            sku: p.sku || `SKU-${(p._id || '').toString().slice(-4).toUpperCase()}`,
            image: p.image || (Array.isArray(p.images) && p.images[0]) || '',
            description: p.description || '',
          }));
          setDbProducts(normalized);
          useStaffStore.setState({ products: normalized });
        }
      }
    } catch (err) {
      console.error('Failed to load real staff overview data:', err);
    } finally {
      setLoading(false);
    }
  }, [authUser?.accessToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived metrics
  const outOfStockItems = useMemo(() => {
    return dbProducts.filter((p) => p.stock === 0);
  }, [dbProducts]);

  const lowStockCount = useMemo(() => {
    return dbProducts.filter((p) => p.stock > 0 && p.stock <= 5).length;
  }, [dbProducts]);

  const pendingCount = useMemo(() => {
    return dbOrders.filter((o) => o.status === 'pending').length;
  }, [dbOrders]);

  const processingCount = useMemo(() => {
    return dbOrders.filter((o) => o.status === 'processing').length;
  }, [dbOrders]);

  const cancelledCount = useMemo(() => {
    return dbOrders.filter((o) => o.status === 'cancelled').length;
  }, [dbOrders]);

  const totalSales = useMemo(() => {
    if (dbStats?.totalSales !== undefined) return dbStats.totalSales;
    return dbOrders
      .filter((o) => o.status === 'delivered' || o.isPaid)
      .reduce((sum, o) => sum + (o.totalPrice || o.totalAmount || 0), 0);
  }, [dbStats, dbOrders]);

  const totalOrders = useMemo(() => {
    return dbStats?.totalOrders ?? dbOrders.length;
  }, [dbStats, dbOrders]);

  const totalCustomers = useMemo(() => {
    if (dbStats?.totalCustomers !== undefined) return dbStats.totalCustomers;
    const unique = new Set(dbOrders.map((o) => o.user?._id || o.user).filter(Boolean));
    return unique.size || 1;
  }, [dbStats, dbOrders]);

  const totalProducts = useMemo(() => {
    return dbStats?.totalProducts ?? dbProducts.length;
  }, [dbStats, dbProducts]);

  // Handle Quick Restock with real database PUT API
  const handleQuickRestock = async (productId) => {
    const prod = dbProducts.find((p) => p.id === productId);
    if (!prod) return;
    try {
      setRestocking(true);
      const newStock = prod.stock + Number(restockAmount);
      const res = await fetch(`${API_URL}/api/staff/products/${productId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authUser?.accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ countInStock: newStock }),
      });
      if (res.ok) {
        setDbProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
        );
        useStaffStore.getState().updateStock(productId, newStock);
        setQuickRestockId(null);
      }
    } catch (err) {
      console.error('Failed to restock product:', err);
    } finally {
      setRestocking(false);
    }
  };

  // Dynamic Sales Overview Data for Chart (Real data from orders)
  const salesOverviewData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    // Build past 7 days
    const dailyMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayName = days[d.getDay()];
      const key = d.toISOString().slice(0, 10);
      dailyMap[key] = { day: dayName, amount: 0 };
    }

    dbOrders.forEach((o) => {
      const dateStr = o.createdAt ? new Date(o.createdAt).toISOString().slice(0, 10) : null;
      if (dateStr && dailyMap[dateStr]) {
        dailyMap[dateStr].amount += Number(o.totalPrice || o.totalAmount || 0);
      }
    });

    const result = Object.values(dailyMap);
    // If no orders yet, display realistic smooth baseline
    const hasData = result.some((r) => r.amount > 0);
    if (!hasData) {
      return [
        { day: 'Mon', amount: 0 },
        { day: 'Tue', amount: 0 },
        { day: 'Wed', amount: 0 },
        { day: 'Thu', amount: 0 },
        { day: 'Fri', amount: 0 },
        { day: 'Sat', amount: 0 },
        { day: 'Sun', amount: 0 },
      ];
    }
    return result;
  }, [dbOrders]);

  // Dynamic Top Categories from real database products
  const topCategories = useMemo(() => {
    if (!dbProducts.length) {
      return [{ name: 'Equipment', value: 100, color: '#8b5cf6' }];
    }
    const counts = {};
    dbProducts.forEach((p) => {
      const cat = p.category
        ? p.category.charAt(0).toUpperCase() + p.category.slice(1)
        : 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const total = dbProducts.length;

    return entries.slice(0, 5).map(([name, count], idx) => ({
      name,
      value: Math.round((count / total) * 100),
      color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
    }));
  }, [dbProducts]);

  // Dynamic Recent Activities based on real orders & stock alerts
  const recentActivities = useMemo(() => {
    const list = [];

    // Recent orders activities
    dbOrders.slice(0, 3).forEach((o, idx) => {
      const custName = o.user?.firstName
        ? `${o.user.firstName} ${o.user.lastName || ''}`.trim()
        : 'Customer';
      list.push({
        id: `act-order-${o._id || idx}`,
        icon: ShoppingBag,
        iconBg: 'bg-purple-600',
        title: `Order #${(o._id || '').slice(-6).toUpperCase()} ${o.status || 'placed'}`,
        subtitle: `${custName} • ETB ${Number(o.totalPrice || o.totalAmount || 0).toLocaleString()}`,
        time: o.createdAt ? new Date(o.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recently',
      });
    });

    // Low stock warnings
    if (outOfStockItems.length > 0) {
      list.push({
        id: 'act-depleted',
        icon: AlertTriangle,
        iconBg: 'bg-rose-600',
        title: 'Inventory Alert',
        subtitle: `${outOfStockItems.length} items depleted of stock`,
        time: 'Active',
      });
    } else if (lowStockCount > 0) {
      list.push({
        id: 'act-lowstock',
        icon: AlertTriangle,
        iconBg: 'bg-amber-600',
        title: 'Low Stock Alert',
        subtitle: `${lowStockCount} items below safety threshold`,
        time: 'Active',
      });
    }

    if (!list.length) {
      list.push({
        id: 'act-ready',
        icon: Check,
        iconBg: 'bg-emerald-600',
        title: 'System Operational',
        subtitle: 'All order queues synchronized with database',
        time: 'Now',
      });
    }

    return list.slice(0, 4);
  }, [dbOrders, outOfStockItems, lowStockCount]);

  // Dynamic Recent Orders for table
  const recentOrders = useMemo(() => {
    return dbOrders.slice(0, 6).map((o) => {
      const customer = o.user?.firstName
        ? `${o.user.firstName} ${o.user.lastName || ''}`.trim()
        : (o.shippingAddress?.fullName || 'Customer');
      const avatar = o.user?.avatar || null;
      const date = o.createdAt
        ? new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Recent';
      const amount = `ETB ${Number(o.totalPrice || o.totalAmount || 0).toLocaleString()}`;
      const payment = o.paymentMethod || o.paymentMethodRef?.name || 'Chapa';
      const status = o.status
        ? o.status.charAt(0).toUpperCase() + o.status.slice(1)
        : 'Pending';

      return {
        id: `#${(o._id || '').slice(-6).toUpperCase()}`,
        rawId: o._id,
        customer,
        avatar,
        date,
        amount,
        payment,
        status,
      };
    });
  }, [dbOrders]);

  const getStatusPill = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'processing':
        return isDark
          ? 'bg-[#1e293b] text-[#38bdf8] border border-[#0284c7]/40'
          : 'bg-sky-50 text-sky-700 border border-sky-200';
      case 'shipped':
        return isDark
          ? 'bg-[#064e3b]/80 text-[#34d399] border border-[#059669]/40'
          : 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'delivered':
        return isDark
          ? 'bg-[#064e3b]/80 text-[#10b981] border border-[#059669]/40'
          : 'bg-teal-50 text-teal-700 border border-teal-200';
      case 'cancelled':
        return isDark
          ? 'bg-[#4c0519]/80 text-[#f87171] border border-[#e11d48]/40'
          : 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return isDark
          ? 'bg-amber-950/40 text-amber-300 border border-amber-500/30'
          : 'bg-amber-50 text-amber-800 border border-amber-200';
    }
  };

  const renderPaymentLogo = (payment) => {
    const p = (payment || '').toUpperCase();
    if (p.includes('VISA')) {
      return (
        <span className="px-2 py-0.5 rounded bg-[#1e293b] text-blue-400 font-extrabold text-[10px] italic border border-blue-500/30">
          VISA
        </span>
      );
    }
    if (p.includes('MASTER') || p.includes('CARD')) {
      return (
        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#1e293b] border border-slate-700">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500 -mr-1" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
        </span>
      );
    }
    if (p.includes('CHAPA')) {
      return (
        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
          Chapa
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded bg-[#1e293b] text-sky-400 font-bold text-[10px] border border-sky-500/30">
        {payment || 'Direct'}
      </span>
    );
  };

  // Card theme classes
  const cardClass = isDark
    ? 'bg-[#0f1222] border border-[#1b1f38] text-white shadow-md'
    : 'bg-white border border-slate-200/90 text-slate-900 shadow-sm';

  const staffGreeting = authUser?.firstName
    ? `Good day, ${authUser.firstName}!`
    : 'Good day, Team!';

  return (
    <div className="space-y-6 select-none">
      {/* ── 0. Main Dashboard Page Header with Greeting & Date/Today filter ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <span>{staffGreeting}</span>
            <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time store operations, live inventory & fulfillment progress.
          </p>
        </div>

        {/* Date Filter & Quick Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <button
              type="button"
              onClick={() => setDatePickerOpen((v) => !v)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                isDark
                  ? 'bg-[#151828] border border-white/[0.08] text-slate-200 hover:bg-[#1c2035]'
                  : 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 shadow-xs'
              }`}
            >
              <Calendar className="h-3.5 w-3.5 text-purple-400" />
              <span>{dateRange}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            <AnimatePresence>
              {datePickerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className={`absolute right-0 top-full mt-2 w-48 rounded-2xl border p-1.5 shadow-2xl z-50 text-xs ${
                    isDark ? 'bg-[#16192b] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  {['Today', 'This Week', 'This Month', 'This Quarter', 'All Time'].map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => {
                        setDateRange(range);
                        setDatePickerOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        dateRange === range
                          ? 'bg-purple-600 text-white'
                          : isDark ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Action: Add Product */}
          <Link
            to="/staff/products?new=1"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Link>

          {/* Quick Action: Payouts */}
          <Link
            to="/staff/payments"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              isDark
                ? 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs'
            }`}
          >
            <CreditCard className="h-4 w-4 text-emerald-500" />
            <span>Payouts</span>
          </Link>
        </div>
      </div>

      {/* ── 1. Top 4 Gradient Metric Cards (Live Database Data) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales (Purple) */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br from-[#6b11ff] via-[#7d2ae8] to-[#aa38f2] shadow-xl shadow-purple-950/20"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/90">Total Sales</span>
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-[26px] font-black tracking-tight mt-2 text-white">
            ETB {Number(totalSales).toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-xs font-medium text-white/85 mt-2">
            <TrendingUp className="h-3.5 w-3.5 text-white" />
            <span>Live from database</span>
          </div>
        </motion.div>

        {/* Orders (Cyan/Blue) */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br from-[#0072ff] via-[#0088ff] to-[#00c6ff] shadow-xl shadow-cyan-950/20"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/90">Orders</span>
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <ClipboardList className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-[26px] font-black tracking-tight mt-2 text-white">
            {totalOrders.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-xs font-medium text-white/85 mt-2">
            <TrendingUp className="h-3.5 w-3.5 text-white" />
            <span>{pendingCount} pending fulfillment</span>
          </div>
        </motion.div>

        {/* Customers (Green) */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br from-[#00b09b] via-[#0ebf87] to-[#96c93d] shadow-xl shadow-emerald-950/20"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/90">Customers</span>
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-[26px] font-black tracking-tight mt-2 text-white">
            {totalCustomers.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-xs font-medium text-white/85 mt-2">
            <TrendingUp className="h-3.5 w-3.5 text-white" />
            <span>Active registered buyers</span>
          </div>
        </motion.div>

        {/* Products (Orange) */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br from-[#f857a6] via-[#ff5858] to-[#ff9900] shadow-xl shadow-orange-950/20"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/90">Products</span>
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-[26px] font-black tracking-tight mt-2 text-white">
            {totalProducts.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-xs font-medium text-white/85 mt-2">
            <TrendingUp className="h-3.5 w-3.5 text-white" />
            <span>{outOfStockItems.length} out of stock</span>
          </div>
        </motion.div>
      </div>

      {/* ── Depleted Stock Warning Bar (Real database out-of-stock items) ── */}
      {outOfStockItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border ${
            isDark
              ? 'bg-[#17121c] border-rose-500/30 text-white'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-rose-400">
                Inventory Notice: {outOfStockItems.length} Depleted Items
              </h4>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Customers cannot order depleted products. Update stock directly here:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {outOfStockItems.slice(0, 2).map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shrink-0 ${
                  isDark ? 'bg-[#121422] border-white/10' : 'bg-white border-slate-200'
                }`}
              >
                {item.image ? (
                  <img src={item.image} alt="" className="h-7 w-7 rounded-lg object-cover" />
                ) : (
                  <div className="h-7 w-7 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white">
                    {item.name?.charAt(0) || 'P'}
                  </div>
                )}
                <span className={`text-xs font-bold max-w-[120px] truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {item.name}
                </span>
                {quickRestockId === item.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={restockAmount}
                      onChange={(e) => setRestockAmount(e.target.value)}
                      className="w-12 h-6 text-xs text-center rounded bg-slate-800 text-white font-bold border border-white/20"
                      min="1"
                    />
                    <button
                      onClick={() => handleQuickRestock(item.id)}
                      disabled={restocking}
                      className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer disabled:opacity-50"
                    >
                      {restocking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setQuickRestockId(item.id);
                      setRestockAmount(20);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold cursor-pointer"
                  >
                    Restock
                  </button>
                )}
              </div>
            ))}
            <Link
              to="/staff/products?filter=out_of_stock"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 ${
                isDark ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-rose-200 text-rose-800'
              }`}
            >
              View All
            </Link>
          </div>
        </motion.div>
      )}

      {/* ── 2. Middle Row: Left (Charts) & Right (Widgets) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Sales Overview & Top Categories */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sales Overview Card */}
          <div className={`${cardClass} rounded-2xl p-5 sm:p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Sales Overview</h3>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSalesDropdown((v) => !v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                    isDark
                      ? 'bg-[#171b30] border border-[#232948] text-slate-300 hover:text-white'
                      : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{salesPeriod}</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>
                {salesDropdown && (
                  <div className={`absolute right-0 top-full mt-1 w-32 rounded-xl border p-1 shadow-xl z-20 text-xs ${
                    isDark ? 'bg-[#171b30] border-[#232948] text-white' : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    {['This Week', 'This Month', 'All Time'].map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setSalesPeriod(t);
                          setSalesDropdown(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg ${
                          salesPeriod === t
                            ? 'bg-purple-600 text-white'
                            : isDark ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Area Spline Chart with real order data */}
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesOverviewData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    stroke={isDark ? '#475569' : '#94a3b8'}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={5}
                  />
                  <YAxis
                    stroke={isDark ? '#475569' : '#94a3b8'}
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => (v === 0 ? '0' : `${v / 1000}K`)}
                  />
                  <Tooltip content={<CustomTooltip isDark={isDark} />} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#salesGrad)"
                    activeDot={{
                      r: 6,
                      fill: '#ffffff',
                      stroke: '#8b5cf6',
                      strokeWidth: 3,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Categories Card (Real DB Products) */}
          <div className={`${cardClass} rounded-2xl p-5 sm:p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Top Categories</h3>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCatDropdown((v) => !v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                    isDark
                      ? 'bg-[#171b30] border border-[#232948] text-slate-300 hover:text-white'
                      : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{catPeriod}</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>
                {catDropdown && (
                  <div className={`absolute right-0 top-full mt-1 w-32 rounded-xl border p-1 shadow-xl z-20 text-xs ${
                    isDark ? 'bg-[#171b30] border-[#232948] text-white' : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    {['All Time', 'This Month'].map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setCatPeriod(t);
                          setCatDropdown(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg ${
                          catPeriod === t
                            ? 'bg-purple-600 text-white'
                            : isDark ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4">
              {/* Donut Chart */}
              <div className="sm:col-span-6 h-[180px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {topCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Legend */}
              <div className="sm:col-span-6 space-y-2 text-xs">
                {topCategories.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className={isDark ? 'text-slate-300' : 'text-slate-700 font-medium'}>{cat.name}</span>
                    </div>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{cat.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`mt-4 pt-3 border-t flex items-center justify-between ${
              isDark ? 'border-[#1b1f38]' : 'border-slate-100'
            }`}>
              <span className="text-xs text-slate-400">Total Live Catalog Items</span>
              <span className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {totalProducts} products
              </span>
            </div>
          </div>
        </div>

        {/* Right 1 Column: To Do List, Banner, Recent Activities */}
        <div className="space-y-6">
          {/* 1. Dynamic To Do List */}
          <div className={`${cardClass} rounded-2xl p-5`}>
            <div className={`flex items-center justify-between pb-3 mb-3 border-b ${
              isDark ? 'border-[#1b1f38]' : 'border-slate-100'
            }`}>
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>To Do List</h3>
              <Link to="/staff/orders" className="text-xs font-semibold text-[#0088ff] hover:underline">
                View Orders
              </Link>
            </div>

            <div className="space-y-2.5">
              {todos.map((item) => {
                let count = 0;
                if (item.countKey === 'pending') count = pendingCount;
                if (item.countKey === 'lowStock') count = lowStockCount;
                if (item.countKey === 'processing') count = processingCount;
                if (item.countKey === 'cancelled') count = cancelledCount;

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleTodo(item.id)}
                    className="flex items-center justify-between py-1 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                          item.checked
                            ? 'bg-purple-600 border-purple-600 text-white'
                            : isDark ? 'border-slate-600 bg-[#161a2e]' : 'border-slate-300 bg-slate-50'
                        }`}
                      >
                        {item.checked && <Check className="h-3 w-3" />}
                      </div>
                      <span className={`text-xs ${
                        item.checked
                          ? 'line-through text-slate-400'
                          : isDark ? 'text-slate-300 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'
                      }`}>
                        {item.text}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor}`}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Technical Catalog Promo Banner */}
          <AnimatePresence>
            {bannerVisible && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br from-[#8019b8] via-[#d6247c] to-[#f04860] shadow-xl"
              >
                <button
                  type="button"
                  onClick={() => setBannerVisible(false)}
                  className="absolute top-3 right-3 text-white/70 hover:text-white cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                <div className="flex items-center gap-1 text-[11px] font-black uppercase text-amber-300">
                  <span>Equipment Catalog</span>
                  <Sparkles className="h-3 w-3 text-amber-300" />
                </div>
                <h4 className="text-lg font-black tracking-tight text-white mt-1">Industrial Equipment</h4>
                <p className="text-xs text-white/80 mt-0.5 max-w-[170px]">Manage tools, measurement kits & technical hardware</p>

                <div className="mt-4 flex items-center justify-between">
                  <Link
                    to="/staff/products"
                    className="inline-block px-4 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-black shadow hover:bg-slate-100 transition-colors"
                  >
                    Manage Stock
                  </Link>

                  <img
                    src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop&q=80"
                    alt="Equipment"
                    className="h-16 w-16 rounded-2xl object-cover shadow-lg border border-white/20 transform rotate-6"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3. Real Recent Activities */}
          <div className={`${cardClass} rounded-2xl p-5`}>
            <div className={`flex items-center justify-between pb-3 mb-3 border-b ${
              isDark ? 'border-[#1b1f38]' : 'border-slate-100'
            }`}>
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Recent Activities</h3>
              <Link to="/staff/orders" className="text-xs font-semibold text-[#0088ff] hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {recentActivities.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-8 w-8 rounded-xl ${act.iconBg} flex items-center justify-center text-white shrink-0`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className={`font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{act.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">{act.subtitle}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{act.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Bottom Row: Recent Orders Table (Live DB Orders) ── */}
      <div className={`${cardClass} rounded-2xl p-5 sm:p-6`}>
        <div className="flex items-center justify-between pb-4">
          <div>
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Recent Orders</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real orders placed by registered customers in the database</p>
          </div>
          <Link to="/staff/orders" className="text-xs font-semibold text-[#0088ff] hover:underline">
            View All Orders
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No orders found in the database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`text-[11px] font-semibold border-b ${
                isDark ? 'text-slate-400 border-[#1b1f38]' : 'text-slate-500 border-slate-200'
              }`}>
                <tr>
                  <th className="pb-3 px-2 font-semibold">Order ID</th>
                  <th className="pb-3 px-2 font-semibold">Customer</th>
                  <th className="pb-3 px-2 font-semibold">Date</th>
                  <th className="pb-3 px-2 font-semibold">Amount</th>
                  <th className="pb-3 px-2 font-semibold">Payment</th>
                  <th className="pb-3 px-2 font-semibold">Status</th>
                  <th className="pb-3 px-2 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-[#1b1f38]' : 'divide-slate-100'}`}>
                {recentOrders.map((order) => (
                  <tr key={order.rawId || order.id} className={`transition-colors ${
                    isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'
                  }`}>
                    <td className={`py-3 px-2 font-medium ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{order.id}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2.5">
                        {order.avatar ? (
                          <img
                            src={order.avatar}
                            alt=""
                            className="h-6 w-6 rounded-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black text-white bg-gradient-to-tr from-purple-600 to-pink-500 shrink-0 select-none">
                            {(order.customer ? order.customer.trim().charAt(0) : 'C').toUpperCase()}
                          </div>
                        )}
                        <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{order.customer}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-slate-400">{order.date}</td>
                    <td className={`py-3 px-2 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{order.amount}</td>
                    <td className="py-3 px-2">{renderPaymentLogo(order.payment)}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${getStatusPill(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <Link
                        to="/staff/orders"
                        className="p-1 rounded text-slate-400 hover:text-purple-600 inline-block cursor-pointer"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
