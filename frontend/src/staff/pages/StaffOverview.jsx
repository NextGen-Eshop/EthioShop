import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  ShoppingBag,
  CreditCard,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Plus,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  Zap,
  ArrowRight,
  ChevronRight,
  XCircle,
  Check,
} from 'lucide-react';
import { useStaffStore } from '../store/staffStore';

export default function StaffOverview() {
  const { products, orders, chapaConfig, updateStock } = useStaffStore();
  const [quickRestockId, setQuickRestockId] = useState(null);
  const [restockAmount, setRestockAmount] = useState(10);

  // Filter products by stock states
  const outOfStockItems = products.filter((p) => p.stock === 0);
  const lowStockItems = products.filter((p) => p.stock <= (p.lowStockThreshold || 5) && p.stock > 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'confirmed');

  // Max 2 out-of-stock items displayed initially
  const initialOutOfStockDisplay = outOfStockItems.slice(0, 2);

  const handleQuickRestock = (productId) => {
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      updateStock(productId, prod.stock + Number(restockAmount));
      setQuickRestockId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'shipped':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header & Quick Actions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Staff Operations Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time management for your assigned product inventory, order fulfillment, and Chapa payouts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/staff/products?new=1"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3857d6] hover:bg-[#2b44ac] text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all duration-200 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Product</span>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/staff/payments"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-all duration-200 cursor-pointer"
            >
              <CreditCard className="h-4 w-4 text-emerald-600" />
              <span>Payout Settings</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── Key Operational Metrics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Chapa Net Earnings */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
          className="panel p-5 bg-white border border-slate-200/90 shadow-2xs hover:shadow-md rounded-2xl transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chapa Balance</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
              <CreditCard className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-900 mt-2.5">
            ETB {chapaConfig.availableBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5 pt-2.5 border-t border-slate-100">
            <span>Pending settlement:</span>
            <span className="font-semibold text-slate-700">ETB {chapaConfig.pendingSettlement?.toLocaleString()}</span>
          </div>
        </motion.div>

        {/* Metric 2: Pending Orders */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
          className="panel p-5 bg-white border border-slate-200/90 shadow-2xs hover:shadow-md rounded-2xl transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">To Fulfill</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs">
              <ShoppingBag className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-900 mt-2.5">
            {pendingOrders.length} <span className="text-xs font-medium text-slate-400">orders</span>
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5 pt-2.5 border-t border-slate-100">
            <span>Requires action:</span>
            <Link to="/staff/orders" className="font-bold text-indigo-600 hover:underline flex items-center gap-0.5">
              <span>Process</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </motion.div>

        {/* Metric 3: Active Products */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
          className="panel p-5 bg-white border border-slate-200/90 shadow-2xs hover:shadow-md rounded-2xl transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Catalog</span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
              <Package className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-900 mt-2.5">
            {products.length} <span className="text-xs font-medium text-slate-400">items</span>
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5 pt-2.5 border-t border-slate-100">
            <span>In stock:</span>
            <span className="font-semibold text-emerald-600">
              {products.filter((p) => p.stock > 0).length} active
            </span>
          </div>
        </motion.div>

        {/* Metric 4: Depleted Stock */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
          className="panel p-5 bg-white border border-slate-200/90 shadow-2xs hover:shadow-md rounded-2xl transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Depleted Stock</span>
            <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-2xs">
              <AlertTriangle className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="text-xl font-black text-rose-600 mt-2.5">
            {outOfStockItems.length} <span className="text-xs font-medium text-slate-400">out of stock</span>
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5 pt-2.5 border-t border-slate-100">
            <span>Low stock (≤5):</span>
            <span className="font-bold text-amber-600">{lowStockItems.length} items</span>
          </div>
        </motion.div>
      </div>

      {/* ── Out-of-Stock Warning Section (Exact count mentioned in header/description, no '+' on items) ── */}
      {outOfStockItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50/90 via-pink-50/70 to-rose-50/90 p-5 shadow-xs"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500 text-white shadow-xs shrink-0">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-rose-900">
                  Out-of-Stock Warning ({outOfStockItems.length} Depleted {outOfStockItems.length === 1 ? 'Item' : 'Items'})
                </h3>
                <p className="text-xs text-rose-800/90 mt-0.5">
                  Customers cannot purchase depleted items. Replenish your inventory or update stock levels immediately.
                </p>
              </div>
            </div>

            {/* Clear Arrow Button directing staff to Products page */}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/staff/products?filter=out_of_stock"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all duration-200 shrink-0 group cursor-pointer"
              >
                <span>View All Out-of-Stock Products</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>

          {/* Displaying Max 2 Out-of-Stock Products Initially (Clean without '+' badge) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4 pt-3.5 border-t border-rose-200/60">
            {initialOutOfStockDisplay.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.01 }}
                className="flex items-center justify-between p-3 rounded-xl bg-white/95 border border-rose-200/80 shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-11 w-11 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                      <span>0 Units in Stock · Depleted</span>
                    </p>
                  </div>
                </div>

                {quickRestockId === item.id ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="number"
                      value={restockAmount}
                      onChange={(e) => setRestockAmount(e.target.value)}
                      className="w-14 h-8 text-xs text-center border border-slate-300 rounded-lg bg-white font-bold"
                      min="1"
                      autoFocus
                    />
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleQuickRestock(item.id)}
                      className="h-8 px-2 rounded-lg bg-emerald-600 text-white text-[11px] font-bold shadow-2xs hover:bg-emerald-700 cursor-pointer flex items-center justify-center"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setQuickRestockId(item.id);
                      setRestockAmount(15);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-[#3857d6] text-white text-[11px] font-bold transition-colors duration-200 shrink-0 cursor-pointer"
                  >
                    Restock
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Main Content Grid: Recent Orders & Chapa Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Customer Orders Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">Recent Customer Orders</h2>
              <p className="text-xs text-slate-500">Orders placed for your assigned inventory</p>
            </div>
            <Link
              to="/staff/orders"
              className="text-xs font-bold text-[#3857d6] hover:underline flex items-center gap-1 group"
            >
              <span>View All ({orders.length})</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="rounded-2xl overflow-hidden bg-white border border-slate-200/90 shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3.5">Order ID</th>
                    <th className="px-4 py-3.5">Customer</th>
                    <th className="px-4 py-3.5">Items</th>
                    <th className="px-4 py-3.5">Payment Rail</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.slice(0, 5).map((order, idx) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-slate-50/80 transition-colors duration-150"
                    >
                      <td className="px-4 py-3.5 font-mono font-bold text-indigo-700">
                        {order.id}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900">{order.customer.name}</p>
                        <p className="text-[11px] text-slate-400">{order.customer.city}</p>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-700">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900">ETB {order.totalAmount.toLocaleString()}</p>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                          {order.chapaPayment.method}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="inline-block">
                          <Link
                            to={`/staff/orders?selected=${order.id}`}
                            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-[#3857d6] hover:text-white text-slate-700 text-[11px] font-bold transition-all duration-150 inline-flex items-center gap-1 shadow-2xs"
                          >
                            <span>Process</span>
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        </motion.div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Chapa Payout & Destination Card */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">Chapa Payout Status</h2>
              <p className="text-xs text-slate-500">Configured Payout Destination</p>
            </div>
            <Link to="/staff/payments" className="text-xs font-bold text-[#3857d6] hover:underline">
              Settings
            </Link>
          </div>

          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="panel p-5 bg-white border border-slate-200/90 shadow-2xs rounded-2xl space-y-3.5"
          >
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <CreditCard className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 capitalize">{chapaConfig.bankName}</p>
                  <p className="text-[11px] font-mono text-slate-500">{chapaConfig.accountNumber}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Verified
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Beneficiary Name</span>
                <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                  {chapaConfig.accountHolderName}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Payout Schedule</span>
                <span className="font-semibold text-slate-800">Weekly (Fridays)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Chapa Gateway Fee</span>
                <span className="font-semibold text-slate-800">2.0%</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Total Lifetime Payout</span>
                <span className="font-bold text-emerald-700">ETB {chapaConfig.totalWithdrawn?.toLocaleString()}</span>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/staff/payments"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors duration-200"
              >
                <span>Manage Chapa Payouts</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
