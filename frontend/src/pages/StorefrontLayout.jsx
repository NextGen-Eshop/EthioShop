import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useWishlistStore } from '../store/wishlistStore';
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
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
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
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const StarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const navLinks = [
  { to: '/home', label: 'Home' },
  { to: '/products', label: 'Products' },
];

/* ── Wishlist Slide-Over Panel ── */
function WishlistPanel({ onClose }) {
  const { items, toggle } = useWishlistStore();

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-[70] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">My Wishlist</h2>
            <p className="text-xs text-gray-400 mt-0.5">{items.length} saved {items.length === 1 ? 'item' : 'items'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                <HeartIcon filled />
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">Your wishlist is empty</p>
              <p className="text-xs text-gray-400 mb-6 max-w-[200px]">Save products you love by clicking the ♡ icon on any product.</p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((product) => {
                const discount = product.originalPrice
                  ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                  : 0;
                const catName = categories.find((c) => c.id === product.category)?.name || product.category;
                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group"
                  >
                    {/* Thumbnail */}
                    <Link to={`/products/${product.id}`} onClick={onClose} className="shrink-0">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-gray-100">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase mb-0.5">{catName}</p>
                      <Link to={`/products/${product.id}`} onClick={onClose}>
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1 hover:text-indigo-600 transition-colors leading-tight">
                          {product.name}
                        </p>
                      </Link>
                      <div className="flex items-center gap-1 mt-1">
                        <StarIcon />
                        <span className="text-[11px] text-gray-500 font-medium">{product.rating}</span>
                      </div>
                      <div className="flex items-baseline gap-1.5 mt-1.5">
                        <span className="text-sm font-extrabold text-gray-900">ETB {product.price.toLocaleString()}</span>
                        {product.originalPrice && (
                          <>
                            <span className="text-xs text-gray-400 line-through">ETB {product.originalPrice.toLocaleString()}</span>
                            <span className="text-[10px] font-bold text-green-600">-{discount}%</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Remove btn */}
                    <button
                      onClick={() => toggle(product)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Remove from wishlist"
                    >
                      <TrashIcon />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        {items.length > 0 && (
          <div className="px-4 py-4 border-t border-gray-100 space-y-2">
            <Link
              to="/products"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all"
            >
              Shop All Products
            </Link>
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
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/70 shadow-sm">
        <div className="mx-auto max-w-[1400px] flex items-center justify-between px-4 sm:px-6 lg:px-10 h-14">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2 group shrink-0">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xs group-hover:scale-105 transition-transform shadow-md shadow-indigo-200">
              E
            </div>
            <span className="text-base font-extrabold text-gray-900 tracking-tight">
              Ethio<span className="text-indigo-600">Shop</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`text-sm font-medium transition-colors relative py-1 ${
                  location.pathname === link.to
                    ? 'text-indigo-600'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {link.label}
                {location.pathname === link.to && (
                  <span className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-indigo-600 rounded-full" />
                )}
              </Link>
            ))}

            {/* Categories Dropdown */}
            <div 
              className="relative py-1"
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <button className={`flex items-center gap-1 text-sm font-medium transition-colors ${categoriesOpen || location.search.includes('category') ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}>
                Categories
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              
              <AnimatePresence>
                {categoriesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-56 bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-gray-100 overflow-hidden z-50"
                  >
                    {/* Bridge gap for hover */}
                    <div className="absolute -top-4 left-0 right-0 h-4 bg-transparent" />
                    
                    <div className="py-2">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/products?category=${cat.id}`}
                          onClick={() => setCategoriesOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          <span className="text-lg">{cat.icon}</span>
                          <span className="font-medium">{cat.name}</span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {(categoriesOpen || location.search.includes('category')) && (
                <span className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-indigo-600 rounded-full" />
              )}
            </div>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Expanding Search */}
            <AnimatePresence mode="wait">
              {searchOpen ? (
                <motion.form
                  key="search-open"
                  initial={{ width: 32, opacity: 0 }}
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 32, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleSearch}
                  className="relative flex items-center overflow-hidden"
                >
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-8 py-1.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-gray-50"
                  />
                  <button type="submit" className="absolute left-2 text-gray-400 hover:text-indigo-600 transition-colors">
                    <SearchIcon />
                  </button>
                  <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="absolute right-2 text-gray-400 hover:text-gray-700">
                    <CloseIcon />
                  </button>
                </motion.form>
              ) : (
                <motion.button
                  key="search-icon"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search"
                  className="p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                >
                  <SearchIcon />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Wishlist */}
            <button
              onClick={() => setWishlistOpen(true)}
              aria-label="Wishlist"
              className="relative p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all hidden sm:flex"
            >
              <HeartIcon filled={items.length > 0} />
              {items.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {items.length > 9 ? '9+' : items.length}
                </span>
              )}
            </button>

            {/* Cart */}
            <button aria-label="Cart" className="relative p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
              <CartIcon />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-indigo-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                2
              </span>
            </button>

            <Link
              to="/login"
              className="hidden sm:inline-flex items-center px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all active:scale-[0.98] shadow-sm shadow-indigo-200 ml-1"
            >
              Sign In
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
            >
              <nav className="flex flex-col px-4 py-3 gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === link.to
                        ? 'text-indigo-600 bg-indigo-50 font-bold'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={() => { setMobileOpen(false); setWishlistOpen(true); }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors text-left"
                >
                  <HeartIcon filled={items.length > 0} />
                  Wishlist {items.length > 0 && `(${items.length})`}
                </button>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="mt-1 px-3 py-2.5 rounded-lg text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  Sign In
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 text-white">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12 py-12">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-extrabold text-xs">E</div>
                <span className="text-base font-extrabold tracking-tight">Ethio<span className="text-indigo-400">Shop</span></span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Your premier destination for quality products. Curated collections, fair prices, fast delivery across Ethiopia.
              </p>
            </div>

            {/* Shop */}
            <div>
              <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-4">Shop</p>
              <ul className="space-y-2.5 text-sm text-slate-300">
                <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
                <li><Link to="/products?sort=newest" className="hover:text-white transition-colors">New Arrivals</Link></li>
                <li><Link to="/products?sort=rating" className="hover:text-white transition-colors">Best Sellers</Link></li>
                <li><Link to="/products?sort=discount" className="hover:text-white transition-colors">Deals</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-4">Company</p>
              <ul className="space-y-2.5 text-sm text-slate-300">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-4">Support</p>
              <ul className="space-y-2.5 text-sm text-slate-300">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
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
                    {name === 'Instagram' && (<><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.5"/></>)}
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── WISHLIST SLIDE-OVER ── */}
      <AnimatePresence>
        {wishlistOpen && <WishlistPanel onClose={() => setWishlistOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
