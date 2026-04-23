import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { categories } from '../data/products';

/* ── Icons ── */
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const HeartIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={filled ? 'text-red-500' : ''}>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);
const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
  </svg>
);
const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);
const StarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
);
const ShopIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
);
const ChoiceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);
const AccountIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

const navLinks = [
  { to: '/home', label: 'Home' },
  { to: '/products', label: 'Products' },
];

function WishlistPanel({ onClose }) {
  const { items, toggle } = useWishlistStore();
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }} className="fixed right-0 top-0 bottom-0 w-full sm:max-w-sm bg-white z-[70] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">My Wishlist</h2>
            <p className="text-xs text-gray-400 mt-0.5">{items.length} saved {items.length === 1 ? 'item' : 'items'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"><CloseIcon /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4"><HeartIcon filled /></div>
              <p className="text-sm font-semibold text-gray-900 mb-1">Your wishlist is empty</p>
              <p className="text-xs text-gray-400 mb-6 max-w-[200px]">Save products you love by clicking the ♡ icon on any product.</p>
              <button onClick={onClose} className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all">Start Shopping</button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((product) => {
                const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
                const catName = categories.find((c) => c.id === product.category)?.name || product.category;
                return (
                  <motion.div key={product.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-start gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group">
                    <Link to={`/products/${product.id}`} onClick={onClose} className="shrink-0"><div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-gray-100"><img src={product.image} alt={product.name} className="w-full h-full object-cover" /></div></Link>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase mb-0.5">{catName}</p>
                      <Link to={`/products/${product.id}`} onClick={onClose}><p className="text-sm font-semibold text-gray-900 line-clamp-1 hover:text-indigo-600 transition-colors leading-tight">{product.name}</p></Link>
                      <div className="flex items-center gap-1 mt-1"><StarIcon /><span className="text-[11px] text-gray-500 font-medium">{product.rating}</span></div>
                      <div className="flex items-baseline gap-1.5 mt-1.5">
                        <span className="text-sm font-extrabold text-gray-900">ETB {product.price.toLocaleString()}</span>
                        {product.originalPrice && (
                          <><span className="text-xs text-gray-400 line-through">ETB {product.originalPrice.toLocaleString()}</span><span className="text-[10px] font-bold text-green-600">-{discount}%</span></>
                        )}
                      </div>
                    </div>
                    <button onClick={() => toggle(product)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100" aria-label="Remove from wishlist"><TrashIcon /></button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
        {items.length > 0 && (
          <div className="px-4 py-4 border-t border-gray-100 space-y-2">
            <Link to="/products" onClick={onClose} className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all">Shop All Products</Link>
          </div>
        )}
      </motion.div>
    </>
  );
}

export default function StorefrontLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { items } = useWishlistStore();
  const { user } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/70 shadow-sm">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link to="/home" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                  E
                </div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Ethio<span className="text-indigo-600">Shop</span>
                </span>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      location.pathname === link.to
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Search Toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                aria-label="Search"
              >
                <SearchIcon />
              </button>

              {/* Wishlist */}
              <button
                onClick={() => setWishlistOpen(true)}
                className="p-2.5 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all relative"
                aria-label="Wishlist"
              >
                <HeartIcon filled={items.length > 0} />
                {items.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>

              {/* Cart (Desktop Only) */}
              <Link
                to="/cart"
                className="hidden md:flex p-2.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all relative"
                aria-label="Cart"
              >
                <CartIcon />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {cartItems.length}
                  </span>
                )}
              </Link>

              {/* User/Account */}
              <div className="h-6 w-px bg-slate-200 mx-1" />
              {user ? (
                <Link
                  to="/settings"
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-50 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                    <AccountIcon />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-slate-900 leading-none">{user.name || 'User'}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Account</p>
                  </div>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="flex px-4 sm:px-5 py-2 bg-slate-900 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-sm"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2.5 rounded-xl text-slate-500 hover:bg-slate-50 transition-all"
                aria-label="Toggle Menu"
              >
                {mobileOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>

        {/* Search Overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-slate-100 bg-white overflow-hidden"
            >
              <form onSubmit={handleSearch} className="max-w-[1400px] mx-auto px-4 py-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <SearchIcon />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products, brands, and more..."
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
                    autoFocus
                  />
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-slate-100 bg-white overflow-hidden"
            >
              <nav className="flex flex-col px-4 py-6 gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 rounded-2xl text-base font-semibold transition-all ${
                      location.pathname === link.to
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {/* Removed mobile sign-in button as it is now in the top header */}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <main className="flex-1 pb-16 md:pb-0"><Outlet /></main>
      <footer className="bg-slate-900 text-white">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12 py-12">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div className="sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3"><div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-extrabold text-xs">E</div><span className="text-base font-extrabold tracking-tight">Ethio<span className="text-indigo-400">Shop</span></span></div>
              <p className="text-sm text-slate-400 leading-relaxed">Your premier destination for quality products across Ethiopia.</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-4">Shop</p>
              <ul className="space-y-2.5 text-sm text-slate-300">
                <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
                <li><Link to="/products?sort=newest" className="hover:text-white transition-colors">New Arrivals</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-4">Company</p>
              <ul className="space-y-2.5 text-sm text-slate-300">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-4">Support</p>
              <ul className="space-y-2.5 text-sm text-slate-300">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">© {new Date().getFullYear()} EthioShop. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {['Facebook', 'Twitter', 'Instagram'].map((name) => (
                <a key={name} href="#" aria-label={name} className="text-slate-500 hover:text-white transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    {name === 'Facebook' && <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />}
                    {name === 'Twitter' && <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />}
                    {name === 'Instagram' && (<><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="17.5" cy="6.5" r="1.5" /></>)}
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
      <AnimatePresence>{wishlistOpen && <WishlistPanel onClose={() => setWishlistOpen(false)} />}</AnimatePresence>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/70 z-50 px-1 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-around h-14">
          <Link to="/home" className={`flex flex-col items-center gap-0.5 p-1 ${location.pathname === '/home' ? 'text-indigo-600' : 'text-gray-400'}`}><HomeIcon /><span className="text-[9px] font-bold">Home</span></Link>
          <Link to="/products" className={`flex flex-col items-center gap-0.5 p-1 ${location.pathname === '/products' ? 'text-indigo-600' : 'text-gray-400'}`}><ShopIcon /><span className="text-[9px] font-bold">Shop</span></Link>
          <button onClick={() => setWishlistOpen(true)} className="flex flex-col items-center gap-0.5 p-1 text-gray-400 relative"><ChoiceIcon />{items.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}<span className="text-[9px] font-bold">Choice</span></button>
          <Link to="/cart" className={`flex flex-col items-center gap-0.5 p-1 relative ${location.pathname === '/cart' ? 'text-indigo-600' : 'text-gray-400'}`}><CartIcon />{cartItems.length > 0 && <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-indigo-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white">{cartItems.length}</span>}<span className="text-[9px] font-bold">Cart</span></Link>
          <Link to="/settings" className={`flex flex-col items-center gap-0.5 p-1 ${location.pathname === '/settings' ? 'text-indigo-600' : 'text-gray-400'}`}><AccountIcon /><span className="text-[9px] font-bold">Account</span></Link>
        </div>
      </nav>
    </div>
  );
}
