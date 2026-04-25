import { useState } from 'react';
import OrdersTable from '../components/orders/OrdersTable';
import { orders as mockOrders } from '../data/mockData';

export default function Orders() {
  const [orders, setOrders] = useState(mockOrders);
  const [activeTab, setActiveTab] = useState('all');

  const handleStatusChange = (orderId, nextStatus) => {
    setOrders((c) => c.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)));
  };

  const tabs = ['All Orders', 'Pending', 'Processing', 'Delivered'];
  const filteredOrders = activeTab === 'all' ? orders : orders.filter((o) => o.status.toLowerCase() === activeTab.toLowerCase());

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'Pending').length,
    processing: orders.filter((o) => o.status === 'Processing').length,
    delivered: orders.filter((o) => o.status === 'Delivered').length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">Orders</h1>
          <p className="text-gray-500 text-sm">Manage and track your storefront sales and fulfillment.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all">
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export Data
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatMini label="Total" value={stats.total} color="text-gray-900" bg="bg-gray-50" />
        <StatMini label="Pending" value={stats.pending} color="text-amber-600" bg="bg-amber-50" />
        <StatMini label="Processing" value={stats.processing} color="text-blue-600" bg="bg-blue-50" />
        <StatMini label="Delivered" value={stats.delivered} color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => {
          const val = tab === 'All Orders' ? 'all' : tab;
          const isActive = activeTab.toLowerCase() === val.toLowerCase();
          return (
            <button key={tab} onClick={() => setActiveTab(val.toLowerCase())}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
              {tab}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Recent Transactions</h3>
          <span className="text-xs text-gray-400 font-medium">{filteredOrders.length} orders</span>
        </div>
        <OrdersTable orders={filteredOrders} onStatusChange={handleStatusChange} />
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 sm:p-8 space-y-3">
          <h4 className="font-bold text-gray-900">Priority Fulfillment</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            There are <span className="font-bold text-indigo-600">{stats.pending} orders</span> currently pending that require immediate action.
          </p>
          <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4 transition-colors">Review Issues</button>
        </div>
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white space-y-4">
          <h4 className="font-bold">Shipping Analytics</h4>
          <div className="flex items-end gap-2 h-16">
            {[40, 70, 100, 60, 45, 80, 30].map((h, i) => (
              <div key={i} className="flex-1 bg-white/20 rounded-t-sm hover:bg-white/40 transition-colors cursor-pointer" style={{ height: `${h}%` }} />
            ))}
          </div>
          <p className="text-xs text-indigo-200">Weekly delivery performance is up by 12% compared to last week.</p>
        </div>
      </div>
    </div>
  );
}

function StatMini({ label, value, color, bg }) {
  return (
    <div className={`${bg} rounded-2xl p-4 sm:p-5 border border-transparent`}>
      <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
