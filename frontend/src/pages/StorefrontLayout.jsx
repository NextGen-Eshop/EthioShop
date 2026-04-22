import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useWishlistStore } from '../store/wishlistStore';
import { categories } from '../data/products';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
void motion;

const navLinks = [
  { to: '/home', label: 'Home' },
  { to: '/products', label: 'Shop' },
  { to: '/support', label: 'Support' },
];

function WishlistPanel({ onClose }) {
  const { items, toggle } = useWishlistStore();

  return (
    <>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
      />
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 260 }}
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-[#d8deed] bg-white"
      >
        <div className="flex items-center justify-between border-b border-[#d8deed] px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#111827]">Saved picks</h2>
            <p className="text-xs text-[#5b6475]">{items.length} items</p>
          </div>
          <button onClick={onClose} className="btn-ghost rounded-lg p-2">Close</button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="panel flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <p className="text-sm font-semibold">No wishlist items yet</p>
              <p className="text-xs text-[#5b6475]">Save products from the catalog and they will appear here.</p>
            </div>
          ) : (
            items.map((p) => (
              <div key={p.id} className="panel flex items-center gap-3 p-3">
                <img src={p.image} alt={p.name} className="h-14 w-14 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <Link to={`/products/${p.id}`} onClick={onClose} className="line-clamp-1 text-sm font-medium">
                    {p.name}
                  </Link>
                  <p className="mt-1 text-sm font-semibold text-[#3857d6]">ETB {p.price.toLocaleString()}</p>
                </div>
                <button className="btn-ghost rounded-lg px-2 py-1 text-xs" onClick={() => toggle(p)}>Remove</button>
              </div>
            ))
          )}
        </div>
      </motion.aside>
    </>
  );
}

export default function StorefrontLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { items } = useWishlistStore();
  const { isAuthenticated, user, signOut } = useAuthStore();
  const totalItems = useCartStore((state) => state.totalItems);

  const handleSignOut = () => {
    signOut();
    setUserMenuOpen(false);
    navigate('/home');
  };

  const isActive = (to) => location.pathname === to;

  const onSearch = (event) => {
    event.preventDefault();
    if (!search.trim()) return;
    navigate(`/products?q=${encodeURIComponent(search.trim())}`);
    setSearch('');
    setMobileOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-[#d8deed] bg-white/90 backdrop-blur-xl">
        <div className="container-shell flex h-16 items-center justify-between gap-4">
          <Link to="/home" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#3857d6] text-sm font-bold text-white">E</span>
            <span className="font-semibold tracking-tight">EthioShop Atelier</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                  isActive(link.to) ? 'bg-[#ecf1ff] text-[#111827]' : 'text-[#5b6475] hover:bg-[#ecf1ff]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <form onSubmit={onSearch}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="field w-52"
                placeholder="Search products..."
              />
            </form>
            <button onClick={() => setWishlistOpen(true)} className="btn-secondary relative px-3 py-2 text-sm">
              Saved
              {items.length > 0 && <span className="ml-2 rounded-full bg-[#3857d6] px-2 py-0.5 text-xs text-white">{items.length}</span>}
            </button>
            <Link to="/cart" className="btn-secondary relative px-3 py-2 text-sm">
              Cart
              {totalItems() > 0 && <span className="ml-2 rounded-full bg-[#00a98f] px-2 py-0.5 text-xs text-white">{totalItems()}</span>}
            </Link>
            {isAuthenticated ? (
              /* ── Avatar dropdown ── */
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-xl border border-[#d8deed] bg-white px-3 py-1.5 text-sm font-semibold text-[#111827] hover:border-[#3857d6] hover:bg-[#f4f6fb] transition-all"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3857d6] text-[11px] font-black text-white shrink-0">
                    {user?.name?.[0]?.toUpperCase()}
                  </span>
                  <span className="max-w-[90px] truncate">{user?.name?.split(' ')[0]}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 z-20 w-52 rounded-2xl border border-[#d8deed] bg-white shadow-xl shadow-black/10 overflow-hidden">
                      <div className="px-4 py-3 border-b border-[#d8deed] bg-[#f4f6fb]">
                        <p className="text-sm font-bold text-[#111827] truncate">{user?.name}</p>
                        <p className="text-xs text-[#5b6475] truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        {[
                          { to: '/account', label: 'My Dashboard', icon: '🏠' },
                          { to: '/account', label: 'My Orders', icon: '📦' },
                          { to: '/account', label: 'Wishlist', icon: '❤️' },
                          { to: '/cart', label: 'Cart', icon: '🛒' },
                        ].map(({ to, label, icon }) => (
                          <Link
                            key={label}
                            to={to}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#ecf1ff] hover:text-[#3857d6] transition-colors"
                          >
                            <span>{icon}</span> {label}
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-[#d8deed] py-1">
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#c7414b] hover:bg-red-50 transition-colors"
                        >
                          <span>🚪</span> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-secondary px-4 py-2 text-sm">Login</Link>
                <Link to="/register" className="btn-primary px-4 py-2 text-sm">Sign up</Link>
              </>
            )}
          </div>

          <button onClick={() => setMobileOpen((v) => !v)} className="btn-secondary px-3 py-2 text-sm md:hidden">
            Menu
          </button>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-[#d8deed] bg-white md:hidden"
            >
              <div className="container-shell space-y-2 py-3">
                <form onSubmit={onSearch}>
                  <input value={search} onChange={(e) => setSearch(e.target.value)} className="field" placeholder="Search products..." />
                </form>
                <div className="grid gap-1">
                  {navLinks.map((link) => (
                    <Link key={link.to} to={link.to} className="rounded-lg px-3 py-2 text-sm text-[#5b6475] hover:bg-[#ecf1ff]" onClick={() => setMobileOpen(false)}>
                      {link.label}
                    </Link>
                  ))}
                  {categories.map((cat) => (
                    <Link key={cat.id} to={`/products?category=${cat.id}`} className="rounded-lg px-3 py-2 text-sm text-[#5b6475] hover:bg-[#ecf1ff]" onClick={() => setMobileOpen(false)}>
                      {cat.icon} {cat.name}
                    </Link>
                  ))}
                  <button onClick={() => setWishlistOpen(true)} className="btn-secondary px-3 py-2 text-left text-sm">Wishlist ({items.length})</button>
                  <div className="mt-1 flex gap-2">
                    {isAuthenticated ? (
                      <>
                        <Link to="/account" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 px-3 py-2 text-center text-sm">My Account</Link>
                        <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="btn-primary flex-1 px-3 py-2 text-sm">Sign out</button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" className="btn-secondary flex-1 px-3 py-2 text-center text-sm">Login</Link>
                        <Link to="/register" className="btn-primary flex-1 px-3 py-2 text-center text-sm">Sign up</Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-[#d8deed] bg-[#eef2fb]">
        <div className="container-shell grid gap-8 py-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="text-lg font-semibold">EthioShop Atelier</p>
            <p className="mt-2 max-w-md text-sm text-[#5b6475]">
              Crafted commerce for modern Ethiopian shoppers. Discover practical products with elevated quality and trusted delivery.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Company</p>
            <div className="mt-3 space-y-2 text-sm text-[#5b6475]">
              <Link to="/privacy" className="block hover:text-[#111827]">Privacy</Link>
              <Link to="/terms" className="block hover:text-[#111827]">Terms</Link>
              <Link to="/support" className="block hover:text-[#111827]">Support</Link>
              <Link to="/contact" className="block hover:text-[#111827]">Contact</Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Social</p>
            <div className="mt-3 space-y-2 text-sm text-[#5b6475]">
              <a href="#" className="block hover:text-[#111827]">Instagram</a>
              <a href="#" className="block hover:text-[#111827]">X / Twitter</a>
              <a href="#" className="block hover:text-[#111827]">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {wishlistOpen && <WishlistPanel onClose={() => setWishlistOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
