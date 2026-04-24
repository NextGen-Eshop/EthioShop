import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import api from '../utils/api';
import { getMyOrders } from '../services/ordersService';
import { displayName } from '../lib/displayName';

const statusStyle = {
  pending_payment: 'bg-amber-50 text-amber-800',
  under_review: 'bg-sky-50 text-sky-800',
  approved: 'bg-emerald-50 text-emerald-800',
  rejected: 'bg-rose-50 text-rose-800',
  shipped: 'bg-indigo-50 text-indigo-800',
  delivered: 'bg-green-50 text-green-800',
  cancelled: 'bg-slate-100 text-slate-700',
};

const tabs = [
  { id: 'overview', label: 'Overview', icon: '🏠' },
  { id: 'orders', label: 'My orders', icon: '📦' },
  { id: 'wishlist', label: 'Wishlist', icon: '❤️' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];

function formatStatus(s) {
  return s ? s.replace(/_/g, ' ') : '—';
}

export default function Account() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, updateUser } = useAuthStore();
  const { items: wishlist, toggle } = useWishlistStore();
  const { items: cartItems } = useCartStore();
  const [activeTab, setActiveTab] = useState(() => (location.state?.tab === 'orders' ? 'orders' : 'overview'));
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({
    name: displayName(user),
    email: user?.email || '',
    phone: '',
    address: '',
  });
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (location.state?.tab) setActiveTab(location.state.tab);
  }, [location.state]);

  useEffect(() => {
    getMyOrders()
      .then((res) => {
        if (res.data?.data) setOrders(res.data.data);
      })
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  }, []);

  useEffect(() => {
    setProfileForm((p) => ({
      ...p,
      name: displayName(user),
      email: user?.email || '',
    }));
  }, [user]);

  const handleSignOut = () => {
    signOut();
    navigate('/home');
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const [firstName, ...rest] = profileForm.name.trim().split(/\s+/);
      const lastName = rest.join(' ') || 'User';
      const { data } = await api.put('/api/auth/profile', {
        firstName,
        lastName,
        email: profileForm.email,
      });
      if (data?.data) {
        const { permissions: _p, accessToken: _a, ...rest } = data.data;
        updateUser(rest);
      } else {
        updateUser({ firstName, lastName, email: profileForm.email, name: `${firstName} ${lastName}`.trim() });
      }
    } catch {
      /* offline */
    }
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const totalSpent = orders
    .filter((o) => ['approved', 'shipped', 'delivered'].includes(o.status))
    .reduce((s, o) => s + Number(o.totalPrice || 0), 0);
  const name = displayName(user);

  return (
    <div className="container-shell py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#ecf1ff] flex items-center justify-center text-2xl font-black text-[#3857d6] shrink-0">
            {user?.picture ? (
              <img src={user.picture} alt={name} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              name[0]?.toUpperCase() || 'U'
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">{name}</h1>
            <p className="text-sm text-[#5b6475]">{user?.email}</p>
          </div>
        </div>
        <button type="button" onClick={handleSignOut} className="btn-secondary px-4 py-2 text-sm hidden sm:block">
          Sign out
        </button>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === t.id
                  ? 'bg-[#ecf1ff] text-[#3857d6]'
                  : 'text-[#5b6475] hover:bg-[#f4f6fb] hover:text-[#111827]'
              }`}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#5b6475] hover:bg-red-50 hover:text-red-500 transition-all lg:mt-4 whitespace-nowrap sm:hidden"
          >
            🚪 Sign out
          </button>
        </nav>

        <div>
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Orders', value: orders.length, icon: '📦' },
                  { label: 'Confirmed spend', value: `ETB ${totalSpent.toLocaleString()}`, icon: '💳' },
                  { label: 'Wishlist', value: wishlist.length, icon: '❤️' },
                  { label: 'Cart', value: cartItems.reduce((s, i) => s + i.quantity, 0), icon: '🛒' },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="panel p-4 text-center">
                    <p className="text-2xl mb-1" aria-hidden>
                      {icon}
                    </p>
                    <p className="text-lg font-black text-[#111827]">{value}</p>
                    <p className="text-xs text-[#5b6475] mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              <div className="panel p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-[#111827]">Recent orders</h2>
                  <button type="button" onClick={() => setActiveTab('orders')} className="text-xs text-[#3857d6] font-semibold hover:underline">
                    View all
                  </button>
                </div>
                {ordersLoading ? (
                  <p className="text-sm text-[#5b6475]">Loading…</p>
                ) : orders.length === 0 ? (
                  <p className="text-sm text-[#5b6475]">No orders yet.</p>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((o) => (
                      <div key={o._id} className="flex items-center justify-between py-2 border-b border-[#d8deed] last:border-0">
                        <div>
                          <p className="text-sm font-semibold text-[#111827]">#{String(o._id).slice(-8).toUpperCase()}</p>
                          <p className="text-xs text-[#5b6475]">
                            {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#111827]">ETB {Number(o.totalPrice).toLocaleString()}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle[o.status] || 'bg-slate-100'}`}>
                            {formatStatus(o.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {wishlist.length > 0 && (
                <div className="panel p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-[#111827]">Saved items</h2>
                    <button type="button" onClick={() => setActiveTab('wishlist')} className="text-xs text-[#3857d6] font-semibold hover:underline">
                      View all
                    </button>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {wishlist.slice(0, 4).map((p) => (
                      <Link key={p.id} to={`/products/${p.id}`} className="shrink-0 group">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#f4f6fb] border border-[#d8deed] group-hover:border-[#3857d6]">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-[10px] text-[#5b6475] mt-1 w-16 truncate">{p.name}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { label: 'Browse products', to: '/products', icon: '🛍️' },
                  { label: 'Cart', to: '/cart', icon: '🛒' },
                  { label: 'Support', to: '/support', icon: '🎧' },
                ].map(({ label, to, icon }) => (
                  <Link key={label} to={to} className="panel p-4 flex items-center gap-3 hover:border-[#3857d6] group">
                    <span className="text-xl" aria-hidden>
                      {icon}
                    </span>
                    <span className="text-sm font-semibold text-[#111827] group-hover:text-[#3857d6]">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[#111827]">My orders</h2>
              {ordersLoading ? (
                <p className="text-sm text-[#5b6475]">Loading…</p>
              ) : orders.length === 0 ? (
                <div className="panel p-10 text-center">
                  <p className="text-4xl mb-3" aria-hidden>
                    📦
                  </p>
                  <p className="text-sm font-semibold text-[#111827] mb-1">No orders yet</p>
                  <p className="text-xs text-[#5b6475] mb-4">When you check out, your orders and payment status appear here.</p>
                  <Link to="/products" className="btn-primary px-6 py-2.5 text-sm inline-block">
                    Shop
                  </Link>
                </div>
              ) : (
                orders.map((o) => (
                  <div key={o._id} className="panel p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div>
                        <p className="text-sm font-bold text-[#111827]">#{String(o._id).slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-[#5b6475]">
                          {o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusStyle[o.status] || 'bg-slate-100'}`}>
                          {formatStatus(o.status)}
                        </span>
                        {(o.status === 'pending_payment' || o.status === 'rejected') && (
                          <Link to={`/orders/${o._id}/payment`} className="text-xs text-[#3857d6] font-semibold hover:underline">
                            {o.status === 'rejected' ? 'Upload new proof' : 'Upload payment proof'}
                          </Link>
                        )}
                      </div>
                    </div>
                    {o.rejectionReason && o.status === 'rejected' && (
                      <p className="text-xs text-rose-700 bg-rose-50 rounded-lg px-2 py-1.5 mb-2">{o.rejectionReason}</p>
                    )}
                    <div className="space-y-1.5 mb-3">
                      {(o.items || []).map((line, i) => {
                        const p = line.product;
                        const label = p?.name || line.name || 'Item';
                        const lineTotal = Number(line.price) * Number(line.quantity);
                        return (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-[#5b6475]">
                              {label} × {line.quantity}
                            </span>
                            <span className="font-semibold text-[#111827]">ETB {lineTotal.toLocaleString()}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-[#d8deed]">
                      <span className="text-sm font-bold text-[#111827]">Total: ETB {Number(o.totalPrice).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[#111827]">Wishlist ({wishlist.length})</h2>
              {wishlist.length === 0 ? (
                <div className="panel p-10 text-center">
                  <p className="text-4xl mb-3" aria-hidden>
                    ❤️
                  </p>
                  <p className="text-sm font-semibold text-[#111827] mb-1">Nothing saved yet</p>
                  <p className="text-xs text-[#5b6475] mb-4">Save products with the heart icon to see them here.</p>
                  <Link to="/products" className="btn-primary px-6 py-2.5 text-sm inline-block">
                    Browse
                  </Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {wishlist.map((p) => (
                    <div key={p.id} className="panel flex items-center gap-4 p-4 group">
                      <Link to={`/products/${p.id}`} className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-[#f4f6fb]">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/products/${p.id}`}>
                          <p className="text-sm font-semibold text-[#111827] line-clamp-1 hover:text-[#3857d6]">{p.name}</p>
                        </Link>
                        <p className="text-sm font-bold text-[#111827] mt-1">ETB {p.price.toLocaleString()}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggle(p)}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-[#111827]">Profile</h2>
              <form onSubmit={handleProfileSave} className="panel p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6475]">Full name</label>
                    <input
                      className="field"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6475]">Email</label>
                    <input
                      type="email"
                      className="field"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6475]">Phone</label>
                    <input
                      type="tel"
                      className="field"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+251 9xx xxx xxx"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6475]">Default address (optional)</label>
                    <input
                      className="field"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm((p) => ({ ...p, address: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button type="submit" className="btn-primary px-6 py-2.5 text-sm">
                    Save
                  </button>
                  {profileSaved && <p className="text-sm text-[#00a98f] font-semibold">Saved</p>}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
