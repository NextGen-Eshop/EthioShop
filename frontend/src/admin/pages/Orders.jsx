import { useState } from 'react';
import { HiOutlineArrowDownTray, HiOutlineFunnel } from 'react-icons/hi2';
import OrdersTable from '../components/orders/OrdersTable';
import { orders as mockOrders } from '../data/mockData';

export default function Orders() {
  const [orders, setOrders] = useState(mockOrders);

  const handleStatusChange = (orderId, nextStatus) => {
    setOrders((current) =>
      current.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order)),
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-10">
      {/* Header Area */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Orders</h1>
          <p className="text-slate-500 text-sm">Manage and track your storefront sales and fulfillment.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <HiOutlineArrowDownTray className="w-4 h-4" />
          Export Data
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {['All Orders', 'Pending', 'Processing', 'Delivered'].map((tab, i) => (
          <button 
            key={tab} 
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${i === 0 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">Recent Transactions</h3>
          <div className="flex items-center gap-2 text-slate-400">
            <HiOutlineFunnel className="w-4 h-4" />
            <span className="text-xs font-medium">Filter</span>
          </div>
        </div>
        <OrdersTable orders={orders} onStatusChange={handleStatusChange} />
      </div>

      {/* Insights Section / Minimalist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-50 rounded-2xl p-8 space-y-4">
          <h4 className="font-bold text-slate-900">Priority Fulfillment</h4>
          <p className="text-sm text-slate-500 leading-relaxed">
            There are <span className="font-bold text-slate-900">8 orders</span> currently requiring immediate action due to shipping delays.
          </p>
          <button className="text-sm font-bold text-primary underline">Review Issues</button>
        </div>
        <div className="bg-slate-900 rounded-2xl p-8 text-white space-y-4">
          <h4 className="font-bold">Shipping Analytics</h4>
          <div className="flex items-end gap-2 h-16">
            {[40, 70, 100, 60, 45, 80, 30].map((h, i) => (
              <div key={i} className="flex-1 bg-white/20 rounded-t-sm" style={{ height: `${h}%` }}></div>
            ))}
          </div>
          <p className="text-xs text-white/60">Weekly delivery performance is up by 12% compared to last week.</p>
        </div>
      </div>
    </div>
  );
}
