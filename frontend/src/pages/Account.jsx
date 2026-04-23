import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';

// Mock order history for the logged-in user
const mockOrders = [
  { id: 'ORD-2024-001', date: 'Apr 18, 2026', total: 2180, status: 'delivered', items: [{ name: 'Wireless Headphones', qty: 1, price: 1200 }, { name: 'Organic Face Serum', qty: 2, price: 650 }] },
  { id: 'ORD-2024-002', date: 'Apr 10, 2026', total: 1580, status: 'shipped', items: [{ name: 'Running Shoes Ultra', qty: 1, price: 1580 }] },
  { id: 'ORD-2024-003', date: 'Mar 28, 2026', total: 980, status: 'delivered', items: [{ name: 'Portable Bluetooth Speaker', qty: 1, price: 980 }] },
];

const statusStyle = {
  delivered: 'bg-green-50 text-green-700',
  shipped: 'bg-blue-50 text-blue-700',
  pending: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-red-50 text-red-700',
};

const tabs = [
  { id: 'overview', label: 'Overview', icon: '🏠' },
  { id: 'orders', label: 'My Orders', icon: '📦' },
  { id: 'wishlist', label: 'Wishlist', icon: '❤️' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];

export default function Account() {
  const navigate = useNavigate();
  const { user, signOut, isAuthenticated } = useAuthStore();
  const { items: wishlist, toggle } = useWishlistStore();
  const { items: cartItems } = useCartStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '', phone: '', address: '' });
  const [profileSaved, setProfileSaved] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="container-shell flex flex-col items-center justify-center py-32 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-[#111827] mb-2">Sign in to view your account</h2>
        <p className="text-[#5b6475] mb-6">You need to be logged in to access your dashboard.</p>
        <Link to="/login?redirect=/account" className="btn-primary px-8 py-3 text-sm">Sign In</Link>
      </div>
    );
  }

  const handleSignOut = () => {
    signOut();
    navigate('/home');
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    // TODO: PATCH /api/users/me
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const totalSpent = mockOrders.reduce((s, o) => s + o.total, 0);

  return (
    <div className="container-shell py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#ecf1ff] flex items-center justify-center text-2xl font-black text-[#3857d6] shrink-0">
            {user?.avatar
              ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
              : user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">{user?.name}</h1>
            <p className="text-sm text-[#5b6475]">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleSignOut} className="btn-secondary px-4 py-2 text-sm hidden sm:block">
          Sign Out
        </button>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        {/* Sidebar nav */}
        <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0">
          {tabs.map(t => (
            <button
              key={t.id}
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
            onClick={handleSignOut}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#5b6475] hover:bg-red-50 hover:text-red-500 transition-all lg:mt-4 whitespace-nowrap sm:hidden"
          >
            🚪 Sign Out
          </button>
        </nav>

        {/* Content */}
        <div>

          {/* ── Overview ── */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Orders', value: mockOrders.length, icon: '📦' },
                  { label: 'Total Spent', value: `ETB ${totalSpent.toLocaleString()}`, icon: '💳' },
                  { label: 'Wishlist', value: wishlist.length, icon: '❤️' },
                  { label: 'Cart Items', value: cartItems.reduce((s, i) => s + i.quantity, 0), icon: '🛒' },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="panel p-4 text-center">
                    <p className="text-2xl mb-1">{icon}</p>
                    <p className="text-xl font-black text-[#111827]">{value}</p>
                    <p className="text-xs text-[#5b6475] mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Recent orders */}
              <div className="panel p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-[#111827]">Recent Orders</h2>
                  <button onClick={() => setActiveTab('orders')} className="text-xs text-[#3857d6] font-semibold hover:underline">View all</button>
                </div>
                <div className="space-y-3">
                  {mockOrders.slice(0, 2).map(o => (
                    <div key={o.id} className="flex items-center justify-between py-2 border-b border-[#d8deed] last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">{o.id}</p>
                        <p className="text-xs text-[#5b6475]">{o.date} · {o.items.length} item{o.items.length > 1 ? 's' : ''}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#111827]">ETB {o.total.toLocaleString()}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle[o.status]}`}>{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wishlist preview */}
              {wishlist.length > 0 && (
                <div className="panel p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-[#111827]">Saved Items</h2>
                    <button onClick={() => setActiveTab('wishlist')} className="text-xs text-[#3857d6] font-semibold hover:underline">View all</button>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {wishlist.slice(0, 4).map(p => (
                      <Link key={p.id} to={`/products/${p.id}`} className="shrink-0 group">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#f4f6fb] border border-[#d8deed] group-hover:border-[#3857d6] transition-colors">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-[10px] text-[#5b6475] mt-1 w-16 truncate">{p.name}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick links */}
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { label: 'Browse Products', to: '/products', icon: '🛍️' },
                  { label: 'View Cart', to: '/cart', icon: '🛒' },
                  { label: 'Get Support', to: '/support', icon: '🎧' },
                ].map(({ label, to, icon }) => (
                  <Link key={label} to={to} className="panel p-4 flex items-center gap-3 hover:border-[#3857d6] transition-colors group">
                    <span className="text-xl">{icon}</span>
                    <span className="text-sm font-semibold text-[#111827] group-hover:text-[#3857d6] transition-colors">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Orders ── */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[#111827]">My Orders</h2>
              {mockOrders.length === 0 ? (
                <div className="panel p-10 text-center">
                  <p className="text-4xl mb-3">📦</p>
                  <p className="text-sm font-semibold text-[#111827] mb-1">No orders yet</p>
                  <p className="text-xs text-[#5b6475] mb-4">Start shopping to see your orders here.</p>
                  <Link to="/products" className="btn-primary px-6 py-2.5 text-sm inline-block">Shop Now</Link>
                </div>
              ) : (
                mockOrders.map(o => (
                  <div key={o.id} className="panel p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-bold text-[#111827]">{o.id}</p>
                        <p className="text-xs text-[#5b6475]">{o.date}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusStyle[o.status]}`}>
                        {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                      </span>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      {o.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-[#5b6475]">{item.name} × {item.qty}</span>
                          <span className="font-semibold text-[#111827]">ETB {item.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-[#d8deed]">
                      <span className="text-sm font-bold text-[#111827]">Total: ETB {o.total.toLocaleString()}</span>
                      {o.status === 'delivered' && (
                        <button className="text-xs text-[#3857d6] font-semibold hover:underline">Leave Review</button>
                      )}
                      {o.status === 'pending' && (
                        <button className="text-xs text-[#c7414b] font-semibold hover:underline">Cancel Order</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── Wishlist ── */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[#111827]">My Wishlist ({wishlist.length})</h2>
              {wishlist.length === 0 ? (
                <div className="panel p-10 text-center">
                  <p className="text-4xl mb-3">❤️</p>
                  <p className="text-sm font-semibold text-[#111827] mb-1">Nothing saved yet</p>
                  <p className="text-xs text-[#5b6475] mb-4">Tap the heart icon on any product to save it here.</p>
                  <Link to="/products" className="btn-primary px-6 py-2.5 text-sm inline-block">Browse Products</Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {wishlist.map(p => (
                    <div key={p.id} className="panel flex items-center gap-4 p-4 group">
                      <Link to={`/products/${p.id}`} className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-[#f4f6fb]">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/products/${p.id}`}>
                          <p className="text-sm font-semibold text-[#111827] line-clamp-1 hover:text-[#3857d6] transition-colors">{p.name}</p>
                        </Link>
                        <p className="text-sm font-bold text-[#111827] mt-1">ETB {p.price.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => toggle(p)}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Remove"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Profile ── */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-[#111827]">Profile Settings</h2>
              <form onSubmit={handleProfileSave} className="panel p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6475]">Full Name</label>
                    <input
                      value={profileForm.name}
                      onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                      className="field"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6475]">Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                      className="field"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6475]">Phone</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                      className="field"
                      placeholder="+251 9XX XXX XXX"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6475]">Delivery Address</label>
                    <input
                      value={profileForm.address}
                      onChange={e => setProfileForm(p => ({ ...p, address: e.target.value }))}
                      className="field"
                      placeholder="Addis Ababa, Ethiopia"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button type="submit" className="btn-primary px-6 py-2.5 text-sm">
                    Save Changes
                  </button>
                  {profileSaved && <p className="text-sm text-[#00a98f] font-semibold">✓ Saved successfully</p>}
                </div>
              </form>

              {/* Danger zone */}
              <div className="panel p-5 border-red-100">
                <h3 className="text-sm font-bold text-[#111827] mb-1">Danger Zone</h3>
                <p className="text-xs text-[#5b6475] mb-3">These actions are permanent and cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={handleSignOut} className="px-4 py-2 text-sm font-semibold text-[#c7414b] border border-red-200 rounded-xl hover:bg-red-50 transition-all">
                    Sign Out
                  </button>
                  <button className="px-4 py-2 text-sm font-semibold text-[#5b6475] border border-[#d8deed] rounded-xl hover:bg-[#f4f6fb] transition-all">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
