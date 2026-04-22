import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useWishlistStore } from '../store/wishlistStore';
import { categories } from '../data/products';

/* ── icons ── */
const SearchIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const HeartIcon = ({ on }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={on ? 'text-red-500' : ''}>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);
const BagIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

const navLinks = [
  { to: '/home', label: 'Home' },
  { to: '/products', label: 'Products' },
];

/* ── wishlist panel ── */
function WishlistPanel({ onClose }) {
  const { items, toggle } = useWishlistStore();
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
      />
      <motion.aside
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-[360px] bg-white z-[70] flex flex-col shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div>
            <h2 className="text-sm font-bold text-stone-900">Wishlist</h2>
            <p className="text-xs text-stone-400 mt-0.5">{items.length} saved</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all">
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4 text-red-400">
                <HeartIcon on />
              </div>
              <p className="text-sm font-semibold text-stone-900 mb-1">Nothing saved yet</p>
              <p className="text-xs text-stone-400 mb-6 max-w-[180px]">Tap ♡ on any product to save it here.</p>
              <button onClick={onClose} className="px-5 py-2.5 bg-stone-900 text-white text-xs font-bold rounded-xl hover:bg-orange-500 transition-all">
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {items.map(p => (
                <motion.div
                  key={p.id} layout
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                  className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl group hover:bg-stone-100 transition-colors"
                >
                  <Link to={`/products/${p.id}`} onClick={onClose} className="shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-white border border-stone-100">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${p.id}`} onClick={onClose}>
                      <p className="text-xs font-semibold text-stone-900 line-clamp-1 hover:text-orange-500 transition-colors">{p.name}</p>
                    </Link>
                    <p className="text-sm font-bold text-stone-900 mt-1">ETB {p.price.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => toggle(p)}
                    className="p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <TrashIcon />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-4 py-4 border-t border-stone-100">
            <Link
              to="/products" onClick={onClose}
              className="flex items-center justify-center w-full py-3 bg-stone-900 hover:bg-orange-500 text-white text-sm font-bold rounded-xl transition-all"
            >
              Shop All Products
            </Link>
          </div>
        )}
      </motion.aside>
    </>
  );
}

/* ── layout ── */
export default function StorefrontLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [q, setQ] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { items } = useWishlistStore();

  const handleSearch = (e) => {
    e.preventDefault();
    if (q.trim()) { navigate(`/products?q=${encodeURIComponent(q.trim())}`); setSearchOpen(false); setQ(''); }
  };

  const isActive = (to) => location.pathname === to;

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f7]">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-stone-100 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="mx-auto max-w-[1400px] flex items-center justify-between px-5 sm:px-8 lg:px-14 h-[60px]">

          {/* logo */}
          <Link to="/home" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-xl bg-stone-900 flex items-center justify-center text-white font-black text-sm group-hover:bg-orange-500 transition-colors shadow-sm">
              E
            </div>
            <span className="text-[15px] font-black text-stone-900 tracking-tight">
              Ethio<span className="text-orange-500">Shop</span>
            </span>
          </Link>

          {/* desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={label} to={to}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive(to) ? 'text-stone-900 bg-stone-100' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                {label}
              </Link>
            ))}

            {/* categories dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCatOpen(true)}
              onMouseLeave={() => setCatOpen(false)}
            >
              <button className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                catOpen ? 'text-stone-900 bg-stone-100' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
              }`}>
                Categories
                <motion.span animate={{ rotate: catOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown />
                </motion.span>
              </button>

              <AnimatePresence>
                {catOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-52 bg-white rounded-2xl shadow-xl shadow-stone-200/60 border border-stone-100 overflow-hidden z-50"
                  >
                    <div className="absolute -top-3 left-0 right-0 h-3" />
                    <div className="py-1.5">
                      {categories.map(cat => (
                        <Link
                          key={cat.id}
                          to={`/products?category=${cat.id}`}
                          onClick={() => setCatOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        >
                          <span className="text-base">{cat.icon}</span>
                          <span className="font-medium">{cat.name}</span>
                          <span className="ml-auto text-[10px] text-stone-400">{cat.count}</span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* actions */}
          <div className="flex items-center gap-1">
            {/* search */}
            <AnimatePresence mode="wait">
              {searchOpen ? (
                <motion.form
                  key="open"
                  initial={{ width: 36, opacity: 0 }} animate={{ width: 200, opacity: 1 }} exit={{ width: 36, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  onSubmit={handleSearch}
                  className="relative flex items-center"
                >
                  <input
                    autoFocus type="text" placeholder="Search…" value={q} onChange={e => setQ(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 text-sm border border-stone-200 rounded-xl outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-stone-50"
                  />
                  <button type="submit" className="absolute left-2 text-stone-400"><SearchIcon /></button>
                  <button type="button" onClick={() => { setSearchOpen(false); setQ(''); }} className="absolute right-2 text-stone-400 hover:text-stone-700"><CloseIcon /></button>
                </motion.form>
              ) : (
                <motion.button
                  key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onClick={() => setSearchOpen(true)}
                  className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all"
                  aria-label="Search"
                >
                  <SearchIcon />
                </motion.button>
              )}
            </AnimatePresence>

            {/* wishlist */}
            <button
              onClick={() => setWishlistOpen(true)}
              className="relative p-2 rounded-lg text-stone-500 hover:text-red-500 hover:bg-red-50 transition-all hidden sm:flex"
              aria-label="Wishlist"
            >
              <HeartIcon on={items.length > 0} />
              {items.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {items.length > 9 ? '9+' : items.length}
                </span>
              )}
            </button>

            {/* cart */}
            <button className="relative p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all" aria-label="Cart">
              <BagIcon />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-stone-900 text-white text-[9px] font-bold rounded-full flex items-center justify-center">2</span>
            </button>

            <Link
              to="/login"
              className="hidden sm:inline-flex items-center px-4 py-1.5 text-xs font-bold text-white bg-stone-900 hover:bg-orange-500 rounded-lg transition-all ml-1 shadow-sm"
            >
              Sign In
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all"
              aria-label="Menu"
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* mobile nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-stone-100 bg-white overflow-hidden"
            >
              <nav className="flex flex-col px-4 py-3 gap-1">
                {navLinks.map(({ to, label }) => (
                  <Link
                    key={label} to={to} onClick={() => setMobileOpen(false)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive(to) ? 'text-stone-900 bg-stone-100' : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
                {categories.map(cat => (
                  <Link
                    key={cat.id} to={`/products?category=${cat.id}`} onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-stone-500 hover:bg-stone-50 transition-colors"
                  >
                    <span>{cat.icon}</span> {cat.name}
                  </Link>
                ))}
                <button
                  onClick={() => { setMobileOpen(false); setWishlistOpen(true); }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-stone-600 hover:bg-red-50 hover:text-red-500 transition-colors text-left"
                >
                  <HeartIcon on={items.length > 0} /> Wishlist {items.length > 0 && `(${items.length})`}
                </button>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-xl text-sm font-bold text-orange-500 hover:bg-orange-50 transition-colors">
                  Sign In
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-stone-900 text-white">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-14 pt-14 pb-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
            {/* brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black text-sm">E</div>
                <span className="text-[15px] font-black tracking-tight">Ethio<span className="text-orange-400">Shop</span></span>
              </div>
              <p className="text-sm text-stone-400 leading-relaxed max-w-xs">
                Your premier destination for quality products. Curated collections, fair prices, fast delivery across Ethiopia.
              </p>
              <div className="flex gap-3 mt-6">
                {['Facebook', 'Twitter', 'Instagram'].map(name => (
                  <a key={name} href="#" aria-label={name} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-orange-500 flex items-center justify-center text-stone-400 hover:text-white transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      {name === 'Facebook' && <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>}
                      {name === 'Twitter' && <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>}
                      {name === 'Instagram' && (<><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.5"/></>)}
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {[
              { title: 'Shop', links: [['All Products', '/products'], ['New Arrivals', '/products?sort=newest'], ['Best Sellers', '/products?sort=rating'], ['Deals', '/products?sort=discount']] },
              { title: 'Company', links: [['About Us', '#'], ['Careers', '#'], ['Contact', '#'], ['Blog', '#']] },
              { title: 'Support', links: [['Help Center', '#'], ['Shipping Info', '#'], ['Returns', '#'], ['Privacy Policy', '#']] },
            ].map(({ title, links }) => (
              <div key={title}>
                <p className="text-[10px] font-bold text-stone-500 tracking-widest uppercase mb-4">{title}</p>
                <ul className="space-y-2.5">
                  {links.map(([label, to]) => (
                    <li key={label}>
                      <Link to={to} className="text-sm text-stone-400 hover:text-white transition-colors">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-stone-600">© {new Date().getFullYear()} EthioShop. All rights reserved.</p>
            <p className="text-xs text-stone-600">Made with ♥ in Ethiopia</p>
          </div>
        </div>
      </footer>

      {/* wishlist panel */}
      <AnimatePresence>
        {wishlistOpen && <WishlistPanel onClose={() => setWishlistOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
