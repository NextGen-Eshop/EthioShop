import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { products, categories } from '../data/products';
import { mockUsers } from '../data/mockUsers';
import { useAuthStore } from '../store/authStore';
import PageTransition from '../components/PageTransition';

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState('inventory');

  return (
    <PageTransition>
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link to="/home" className="hover:text-gray-600 transition-colors">Home</Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
          <span className="text-gray-900 font-medium">Dashboard</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-200">
            {user?.name?.charAt(0) || 'P'}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Welcome, <span className="font-semibold text-gray-600">{user?.name || 'Admin'}</span>
              <span className="ml-2 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-full">{user?.role}</span>
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {[
            { label: 'Total Products', value: products.length, icon: '📦', color: 'bg-blue-50 text-blue-600' },
            { label: 'Total Users', value: mockUsers.length, icon: '👥', color: 'bg-purple-50 text-purple-600' },
            { label: 'Low Stock', value: products.filter(p => p.stock > 0 && p.stock < 5).length, icon: '⚠️', color: 'bg-amber-50 text-amber-600' },
            { label: 'Out of Stock', value: products.filter(p => p.stock === 0).length, icon: '🚫', color: 'bg-red-50 text-red-600' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 hover:shadow-lg hover:border-gray-200 transition-all">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${kpi.color}`}>{kpi.icon}</span>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3 mb-1">{kpi.value}</p>
              <p className="text-xs text-gray-400 font-medium">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 gap-1 mb-8">
          {['inventory', 'users'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-semibold capitalize transition-colors relative ${activeTab === tab ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
              {tab === 'inventory' ? 'Inventory Management' : 'User List'}
              {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600 rounded-full" />}
            </button>
          ))}
        </div>

        {activeTab === 'inventory' ? <InventoryTable /> : <UserTable />}
      </div>
    </PageTransition>
  );
}

function StockBadge({ stock }) {
  if (stock === 0) return <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-red-50 text-red-600">Out of Stock</span>;
  if (stock < 5) return <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">Low Stock</span>;
  return <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">In Stock</span>;
}

function InventoryTable() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-gray-50/80">
            <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{p.name}</p>
                      <p className="text-[11px] text-gray-400">ID: #{p.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                    {categories.find(c => c.id === p.category)?.name || p.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">ETB {p.price.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{p.stock}</td>
                <td className="px-6 py-4"><StockBadge stock={p.stock} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function UserTable() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-gray-50/80">
            <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {mockUsers.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full border border-gray-100 object-cover" />
                    <span className="text-sm font-semibold text-gray-900">{u.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${u.role === 'privileged' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1.5 text-xs font-medium ${u.status === 'active' ? 'text-emerald-600' : 'text-gray-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    {u.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-400">
                  {new Date(u.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
