import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  X,
  Heart,
  ShoppingCart,
  Menu,
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useWishlistStore } from '../store/wishlistStore';
import { categories } from '../data/products';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import Avatar from '../components/ui/Avatar';

const navLinks = [
  { to: '/home', label: 'Home' },
  { to: '/products', label: 'Shop' },
  { to: '/support', label: 'Support' },
];

const trendingTags = [
  'Yirgacheffe Coffee',
  'Leather Bags',
  'Habesha Kemis',
  'Berbere Spice',
  'Handmade Crafts',
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
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
      />
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 260 }}
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-white/40 bg-white/95 backdrop-blur-2xl shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#d8deed]/80 px-5 py-4 bg-white/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500 shadow-xs">
              <Heart className="h-4.5 w-4.5 fill-rose-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111827]">Saved Items</h2>
              <p className="text-xs text-[#5b6475]">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost rounded-xl p-2 text-[#5b6475] hover:text-[#111827] hover:bg-black/5 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="panel flex h-full flex-col items-center justify-center gap-3 p-6 text-center bg-white/70">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-400 shadow-inner">
                <Heart className="h-8 w-8" />
              </div>
              <p className="text-sm font-bold text-[#111827]">Your wishlist is empty</p>
              <p className="text-xs text-[#5b6475] max-w-xs leading-relaxed">
                Save your favorite Ethiopian crafts, apparel, and coffee by tapping the heart icon on any product.
              </p>
            </div>
          ) : (
            items.map((p) => (
              <div key={p.id} className="panel group flex items-center gap-3 p-3 bg-white/80 hover:bg-white hover:shadow-md transition-all">
                <img src={p.image} alt={p.name} className="h-14 w-14 rounded-xl object-cover bg-slate-50 shadow-2xs" />
                <div className="min-w-0 flex-1">
                  <Link to={`/products/${p.id}`} onClick={onClose} className="line-clamp-1 text-sm font-semibold text-[#111827] hover:text-[#3857d6] transition-colors">
                    {p.name}
                  </Link>
                  <p className="mt-1 text-sm font-bold text-[#3857d6]">ETB {p.price?.toLocaleString()}</p>
                </div>
                <button
                  className="rounded-lg p-1.5 text-xs text-rose-500 hover:bg-rose-50 transition-colors"
                  onClick={() => toggle(p)}
                  title="Remove"
                >
                  <X className="h-4 w-4" />
                </button>
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
  const [imgError, setImgError] = useState(false);

  const { items } = useWishlistStore();
  const { isAuthenticated, user, signOut } = useAuthStore();
  const totalItems = useCartStore((state) => state.totalItems);

  const isActive = (to) => location.pathname === to;

  // Search section is ONLY visible on Home and Shop pages
  const isSearchVisible =
    location.pathname === '/home' ||
    location.pathname === '/' ||
    location.pathname === '/products';

  const onSearch = (event) => {
    event?.preventDefault();
    if (!search.trim()) return;
    navigate(`/products?q=${encodeURIComponent(search.trim())}`);
    setSearch('');
    setMobileOpen(false);
  };

  const handleTagClick = (tag) => {
    navigate(`/products?q=${encodeURIComponent(tag)}`);
  };

  const userInitial = user?.firstName?.[0] || user?.name?.[0] || 'U';
  const displayName = user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Account';

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f6fb]">
      {/* ── Transparent & Attractive Glassmorphism Header ── */}
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/65 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all duration-300">
        <div className="container-shell flex h-16 items-center justify-between gap-4">
          {/* ── Brand Logo ── */}
          <Link to="/home" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#2442c7] via-[#3857d6] to-[#5b78f6] text-white shadow-lg shadow-[#3857d6]/25 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[#3857d6]/40">
              <span className="font-black text-lg tracking-wider font-mono">E</span>
              <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-amber-300 drop-shadow-xs" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-[#111827] leading-none">
                Ethio<span className="text-[#3857d6]">Shop</span>
              </span>
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#6b7280] mt-0.5">Atelier</span>
            </div>
          </Link>

          {/* ── Desktop Navigation Links (Individual, unboxed with smooth animations) ── */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-9">
            {navLinks.map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="group relative py-1.5 transition-colors focus:outline-none"
                >
                  <motion.span
                    whileHover={{ y: -1.5 }}
                    whileTap={{ scale: 0.96 }}
                    className={`inline-block text-sm font-semibold tracking-normal transition-colors duration-200 ${
                      active
                        ? 'text-[#3857d6] font-bold'
                        : 'text-[#4b5563] group-hover:text-[#111827]'
                    }`}
                  >
                    {link.label}
                  </motion.span>

                  {/* Animated underline indicator */}
                  {active ? (
                    <motion.div
                      layoutId="activeNavLine"
                      className="absolute -bottom-0.5 left-0 right-0 h-[2.5px] rounded-full bg-[#3857d6] shadow-xs shadow-[#3857d6]/50"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  ) : (
                    <span className="absolute -bottom-0.5 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-[#3857d6]/70 transition-all duration-250 ease-out group-hover:w-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Right Section: Saved, Cart & Profile/Auth ── */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* ── Saved / Wishlist (Icon only) ── */}
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setWishlistOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/80 backdrop-blur-md text-[#374151] hover:text-[#111827] hover:bg-white shadow-2xs hover:shadow-md transition-all cursor-pointer"
              title="Saved items"
              aria-label="Saved items"
            >
              <Heart className={`h-5 w-5 transition-colors duration-200 ${items.length > 0 ? 'text-rose-500 fill-rose-500' : 'text-[#4b5563]'}`} />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-1 text-[10px] font-black text-white shadow-sm ring-2 ring-white">
                  {items.length}
                </span>
              )}
            </motion.button>

            {/* ── Cart (Icon only) ── */}
            <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
              <Link
                to="/cart"
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/80 backdrop-blur-md text-[#374151] hover:text-[#111827] hover:bg-white shadow-2xs hover:shadow-md transition-all"
                title="Shopping cart"
                aria-label="Shopping cart"
              >
                <ShoppingCart className={`h-5 w-5 transition-colors duration-200 ${totalItems() > 0 ? 'text-[#3857d6]' : 'text-[#4b5563]'}`} />
                {totalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-[#3857d6] to-[#5b78f6] px-1 text-[10px] font-black text-white shadow-sm ring-2 ring-white">
                    {totalItems()}
                  </span>
                )}
              </Link>
            </motion.div>

            {/* ── User Profile (Direct link to /account) or Sign In ── */}
            {isAuthenticated ? (
              <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                <Link
                  to="/account"
                  className="relative flex items-center justify-center rounded-full p-0.5 border-2 border-white/80 hover:border-[#3857d6] shadow-2xs hover:shadow-md transition-all cursor-pointer"
                  title={`${displayName} - Account`}
                >
                  <Avatar
                    src={user?.avatar}
                    name={displayName}
                    size="sm"
                    showBadge={false}
                  />
                </Link>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/login"
                  className="flex items-center justify-center h-10 px-4.5 rounded-full bg-gradient-to-r from-[#3857d6] to-[#4f6fee] hover:from-[#2b44ac] hover:to-[#3857d6] text-white text-xs font-bold shadow-md shadow-[#3857d6]/25 hover:shadow-lg hover:shadow-[#3857d6]/35 transition-all"
                >
                  <span>Sign In</span>
                </Link>
              </motion.div>
            )}

            {/* ── Mobile Menu Toggle ── */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="flex md:hidden h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/80 text-[#5b6475] hover:bg-white shadow-2xs"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Drawer ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-[#d8deed]/60 bg-white/95 backdrop-blur-2xl md:hidden overflow-hidden shadow-xl"
            >
              <div className="container-shell space-y-3 py-4">
                <div className="grid gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#4b5563] hover:bg-[#ecf1ff] hover:text-[#3857d6] transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="my-1 border-t border-[#eef2fb]" />
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.id}`}
                      className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-sm text-[#5b6475] hover:bg-[#ecf1ff] transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      <span>{cat.icon}</span>
                      <span className="font-medium">{cat.name}</span>
                    </Link>
                  ))}
                </div>

                <div className="pt-2">
                  {isAuthenticated ? (
                    <div className="flex gap-2">
                      <Link
                        to="/account"
                        onClick={() => setMobileOpen(false)}
                        className="btn-secondary flex-1 py-2.5 text-center text-xs font-bold rounded-xl"
                      >
                        My Account
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setMobileOpen(false);
                          navigate('/home');
                        }}
                        className="btn-primary flex-1 py-2.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700"
                      >
                        Sign out
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Link
                        to="/login"
                        onClick={() => setMobileOpen(false)}
                        className="btn-primary flex-1 py-2.5 text-center text-xs font-bold rounded-xl"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileOpen(false)}
                        className="btn-secondary flex-1 py-2.5 text-center text-xs font-bold rounded-xl"
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Professional & Attractive Search Section (Home & Shop pages ONLY) ── */}
      <AnimatePresence>
        {isSearchVisible && (
          <motion.section
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="border-b border-[#e2e8f5]/80 bg-gradient-to-b from-white/70 via-white/40 to-transparent backdrop-blur-md py-4"
          >
            <div className="container-shell max-w-3xl">
              <form onSubmit={onSearch} className="relative group">
                <div className="relative flex items-center rounded-2xl border border-white/80 bg-white/90 backdrop-blur-xl p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 focus-within:border-[#3857d6] focus-within:ring-4 focus-within:ring-[#3857d6]/15 focus-within:shadow-[0_12px_36px_rgba(56,87,214,0.12)]">
                  {/* Search Icon with pulse animation */}
                  <div className="flex h-10 w-10 items-center justify-center text-[#98a1b2] group-focus-within:text-[#3857d6] transition-colors pl-2">
                    <Search className="h-5 w-5" />
                  </div>

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search premium Ethiopian products, coffee, fashion & crafts..."
                    className="w-full h-11 pl-2 pr-24 bg-transparent text-sm font-medium text-[#111827] placeholder:text-[#9ca3af] focus:outline-none"
                  />

                  {/* Quick Clear Button */}
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="p-1.5 mr-2 rounded-full text-[#9ca3af] hover:text-[#111827] hover:bg-black/5 transition-all"
                      title="Clear text"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}

                  {/* Interactive Search Button */}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#3857d6] to-[#4f6fee] hover:from-[#2b44ac] hover:to-[#3857d6] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#3857d6]/20 hover:shadow-lg hover:shadow-[#3857d6]/30 transition-all cursor-pointer shrink-0"
                  >
                    <span>Search</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </motion.button>
                </div>
              </form>

              {/* Trending Quick Suggestions */}
              <div className="mt-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 text-xs text-[#5b6475]">
                <div className="flex items-center gap-1 font-semibold text-[#6b7280] shrink-0">
                  <TrendingUp className="h-3.5 w-3.5 text-[#3857d6]" />
                  <span>Trending:</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                  {trendingTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagClick(tag)}
                      className="rounded-full border border-white/80 bg-white/70 px-2.5 py-1 text-[11px] font-medium text-[#4b5563] hover:border-[#3857d6] hover:bg-white hover:text-[#3857d6] hover:shadow-2xs transition-all cursor-pointer shrink-0"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Page Content ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Professional & Clean Footer ── */}
      <footer className="mt-16 border-t border-[#d8deed] bg-white/70 backdrop-blur-xl">
        <div className="container-shell grid gap-8 py-12 md:grid-cols-4">
          <div className="md:col-span-2 space-y-3">
            <Link to="/home" className="flex items-center gap-2.5 group">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#2442c7] to-[#3857d6] text-white shadow-xs">
                <span className="font-black text-sm font-mono">E</span>
                <Sparkles className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 text-amber-300" />
              </div>
              <span className="font-bold text-base tracking-tight text-[#111827]">
                Ethio<span className="text-[#3857d6]">Shop</span> <span className="text-xs font-semibold text-[#64748b]">Atelier</span>
              </span>
            </Link>
            <p className="max-w-md text-xs leading-relaxed text-[#5b6475]">
              Crafted commerce for modern Ethiopian shoppers. Discover practical products with elevated quality and trusted delivery.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827]">Company</h4>
            <div className="mt-3 space-y-2 text-xs text-[#5b6475]">
              <Link to="/privacy" className="block hover:text-[#3857d6] transition-colors">Privacy</Link>
              <Link to="/terms" className="block hover:text-[#3857d6] transition-colors">Terms</Link>
              <Link to="/support" className="block hover:text-[#3857d6] transition-colors">Support</Link>
              <Link to="/contact" className="block hover:text-[#3857d6] transition-colors">Contact</Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827]">Connect</h4>
            <div className="mt-3 space-y-2 text-xs text-[#5b6475]">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="block hover:text-[#3857d6] transition-colors">Instagram</a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="block hover:text-[#3857d6] transition-colors">X / Twitter</a>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="block hover:text-[#3857d6] transition-colors">Telegram</a>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-[#e2e8f0]/80 py-4">
          <div className="container-shell flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#64748b]">
            <p>© {new Date().getFullYear()} EthioShop Atelier. All rights reserved.</p>
            <p className="inline-flex items-center gap-1 font-medium text-[#111827]">
              <span>Made in Ethiopia</span>
              <span>🇪🇹</span>
            </p>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {wishlistOpen && <WishlistPanel onClose={() => setWishlistOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
