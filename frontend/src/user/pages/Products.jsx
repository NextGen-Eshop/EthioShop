import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, ShoppingCart, X, ChevronDown, LayoutGrid, List, Search } from 'lucide-react';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';
import { useThemeStore } from '../../store/themeStore';
import { products, categories } from '../../data/products';

void motion;

const sortOptions = [
  { value: 'featured', label: 'Featured', icon: '⭐' },
  { value: 'newest', label: 'New Arrivals', icon: '🆕' },
  { value: 'price-low', label: 'Price: Low to High', icon: '↑' },
  { value: 'price-high', label: 'Price: High to Low', icon: '↓' },
  { value: 'rating', label: 'Highest Rated', icon: '🏆' },
  { value: 'discount', label: 'Biggest Discount', icon: '%' },
];

const staggerGrid = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const cardVariant = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Animated 5-Star Rating Component for Product Cards ── */
function CardStarRating({ rating = 5, reviews = 0, isDark = true }) {
  const roundedRating = Math.round(rating);
  return (
    <div className="flex items-center gap-1.5 py-0.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = starIndex <= roundedRating;
          return (
            <motion.div
              key={starIndex}
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: starIndex * 0.05 }}
            >
              <Star
                className="h-3.5 w-3.5"
                style={{
                  fill: isFilled ? '#F59E0B' : 'transparent',
                  color: isFilled ? '#F59E0B' : (isDark ? '#4B5563' : '#CBD5E1'),
                  filter: isFilled ? 'drop-shadow(0 0 4px rgba(245,158,11,0.45))' : 'none',
                }}
              />
            </motion.div>
          );
        })}
      </div>
      <span className="text-[11px] font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
        {rating}
      </span>
      {reviews > 0 && (
        <span className="text-[10px]" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
          ({reviews})
        </span>
      )}
    </div>
  );
}

/* ── Dark / Light Dynamic Product Card ── */
function ProductCard({ product, viewMode }) {
  const { toggle, isWished } = useWishlistStore();
  const { addItem } = useCartStore();
  const isDark = useThemeStore((state) => state.theme) === 'dark';
  const [cartState, setCartState] = useState('idle');
  const wished = isWished(product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const catName = categories.find(c => c.id === product.category)?.name || product.category;

  const handleCart = (e) => {
    e.preventDefault();
    if (cartState !== 'idle') return;
    setCartState('adding');
    setTimeout(() => { addItem(product); setCartState('added'); setTimeout(() => setCartState('idle'), 2000); }, 600);
  };

  if (viewMode === 'list') {
    return (
      <motion.div variants={cardVariant} layout>
        <Link to={`/products/${product.id}`}
          className="group flex rounded-2xl overflow-hidden transition-all duration-300"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
            boxShadow: isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.03)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)';
            e.currentTarget.style.boxShadow = isDark
              ? '0 0 20px rgba(139,92,246,0.12), 0 12px 30px rgba(0,0,0,0.4)'
              : '0 8px 30px rgba(139,92,246,0.12), 0 2px 10px rgba(0,0,0,0.06)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = isDark ? '#252A3A' : '#E2E8F0';
            e.currentTarget.style.boxShadow = isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.03)';
          }}
        >
          <div className="relative w-40 sm:w-52 shrink-0 overflow-hidden" style={{ background: isDark ? '#171B2B' : '#F1F5F9' }}>
            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            {product.badge && (
              <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full text-white"
                style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)' }}>
                {product.badge}
              </span>
            )}
          </div>
          <div className="flex-1 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#8B5CF6' }}>{catName}</span>
                <motion.button whileTap={{ scale: 0.7 }} whileHover={{ scale: 1.2 }}
                  onClick={e => { e.preventDefault(); toggle(product); }}
                  className="p-1.5 rounded-lg transition-all cursor-pointer"
                  style={{ color: wished ? '#EC4899' : (isDark ? '#94A3B8' : '#64748B'), background: wished ? 'rgba(236,72,153,0.1)' : 'transparent' }}>
                  <Heart className="h-4 w-4" fill={wished ? '#EC4899' : 'none'} />
                </motion.button>
              </div>
              <h3 className="text-base font-bold leading-snug mb-2 transition-colors" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{product.name}</h3>
              <p className="text-xs line-clamp-2 mb-3 leading-relaxed" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{product.description}</p>
              <CardStarRating rating={product.rating} reviews={product.reviews} isDark={isDark} />
            </div>
            <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>ETB {product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-sm line-through" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>ETB {product.originalPrice.toLocaleString()}</span>
                    <span className="badge-sale">-{discount}%</span>
                  </>
                )}
              </div>
              <motion.button whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.93 }}
                onClick={handleCart}
                className="flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
                style={{ background: cartState === 'added' ? '#22C55E' : '#8B5CF6', boxShadow: cartState === 'added' ? '0 0 14px rgba(34,197,94,0.4)' : '0 0 14px rgba(139,92,246,0.3)' }}>
                {cartState === 'idle' && <><ShoppingCart className="h-3.5 w-3.5" /> Add to Cart</>}
                {cartState === 'adding' && <span className="animate-pulse">Adding...</span>}
                {cartState === 'added' && '✓ Added'}
              </motion.button>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardVariant}
      layout
      whileHover={{ y: -9, scale: 1.02 }}
      className="group relative flex flex-col transition-all duration-400 p-[1.5px] rounded-[18px] overflow-hidden h-full"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(139,92,246,0.35) 0%, rgba(37,42,58,0.7) 50%, rgba(236,72,153,0.3) 100%)'
          : 'linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(226,232,240,0.8) 50%, rgba(236,72,153,0.25) 100%)',
        boxShadow: isDark
          ? '0 10px 30px -10px rgba(0,0,0,0.5)'
          : '0 10px 30px -10px rgba(139,92,246,0.08), 0 2px 10px rgba(0,0,0,0.04)',
      }}
    >
      <div
        className="flex flex-col flex-1 rounded-[16.5px] overflow-hidden transition-all duration-300 p-3"
        style={{
          background: isDark ? '#111522' : '#FFFFFF',
        }}
      >
        <Link
          to={`/products/${product.id}`}
          className="group relative block overflow-hidden aspect-[4/3] rounded-[13px] transition-all duration-500"
          style={{ background: isDark ? '#171B2B' : '#F1F5F9' }}
        >
          <motion.img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            loading="lazy"
          />
          {product.badge && (
            <motion.span
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
              className="absolute top-3 left-3 px-3 py-1 text-[9px] font-black tracking-widest uppercase rounded-full text-white backdrop-blur-md"
              style={{
                background: 'linear-gradient(135deg,#8B5CF6,#EC4899)',
                boxShadow: '0 4px 15px rgba(139,92,246,0.5)',
              }}
            >
              {product.badge}
            </motion.span>
          )}
          {discount > 0 && <span className="absolute top-3 right-12 px-2.5 py-1 rounded-full text-[9px] font-black text-white badge-sale shadow-md">-{discount}%</span>}
          <motion.button
            whileTap={{ scale: 0.65 }}
            whileHover={{ scale: 1.22, rotate: 6 }}
            onClick={(e) => { e.preventDefault(); toggle(product); }}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full transition-all cursor-pointer z-10 shadow-lg"
            style={{
              background: wished
                ? 'rgba(236,72,153,0.9)'
                : (isDark ? 'rgba(17,21,34,0.85)' : 'rgba(255,255,255,0.92)'),
              backdropFilter: 'blur(8px)',
              color: wished ? '#FFFFFF' : (isDark ? '#94A3B8' : '#64748B'),
              boxShadow: wished ? '0 0 16px rgba(236,72,153,0.6)' : 'none',
            }}
            aria-label="Wishlist"
          >
            <Heart className="h-4 w-4" fill={wished ? '#FFFFFF' : 'none'} />
          </motion.button>

          {/* Quick view bar */}
          <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-10">
            <div
              className="py-2 text-[11px] font-extrabold text-center rounded-xl backdrop-blur-md shadow-lg"
              style={{
                background: isDark ? 'rgba(17,21,34,0.92)' : 'rgba(255,255,255,0.95)',
                color: '#8B5CF6',
                border: '1px solid rgba(139,92,246,0.3)',
              }}
            >
              View Details →
            </div>
          </div>

          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(139,92,246,0.18) 0%, transparent 60%)' }}
          />
        </Link>

        <div className="flex flex-col flex-1 p-2 pt-3">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[9px] font-extrabold tracking-[0.16em] uppercase" style={{ color: '#8B5CF6' }}>
              {catName}
            </span>
          </div>

          <Link to={`/products/${product.id}`}>
            <h3
              className="text-sm font-bold leading-snug line-clamp-2 mb-2 transition-colors duration-200"
              style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
              onMouseEnter={e => e.currentTarget.style.color = '#8B5CF6'}
              onMouseLeave={e => e.currentTarget.style.color = isDark ? '#F8FAFC' : '#0F172A'}
            >
              {product.name}
            </h3>
          </Link>

          {/* Glowing Animated 5-Star Rating */}
          <CardStarRating rating={product.rating} reviews={product.reviews} isDark={isDark} />

          <div
            className="mt-auto flex items-center justify-between gap-2 pt-2.5"
            style={{ borderTop: `1px solid ${isDark ? 'rgba(37,42,58,0.6)' : 'rgba(226,232,240,0.8)'}` }}
          >
            <div>
              <span className="text-base font-black tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                ETB {product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <p className="text-[10px] line-through -mt-0.5" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
                  ETB {product.originalPrice.toLocaleString()}
                </p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleCart}
              className="flex items-center gap-1.5 h-8.5 px-3.5 rounded-full text-[11px] font-extrabold text-white transition-all duration-300 cursor-pointer shadow-md"
              style={{
                background: cartState === 'added' ? '#22C55E' : 'linear-gradient(135deg,#8B5CF6,#EC4899)',
                boxShadow: cartState === 'added' ? '0 0 16px rgba(34,197,94,0.45)' : '0 4px 15px rgba(139,92,246,0.4)',
              }}
            >
              {cartState === 'idle' && <><ShoppingCart className="h-3.5 w-3.5" /> <span>Add</span></>}
              {cartState === 'adding' && <span className="animate-pulse">Adding...</span>}
              {cartState === 'added' && <span>✓ Added</span>}
            </motion.button>
          </div>

          {product.stock === 0 && <p className="text-[10px] font-semibold mt-2" style={{ color: '#F43F5E' }}>Out of stock</p>}
          {product.stock > 0 && product.stock <= 5 && <p className="text-[10px] font-semibold mt-2" style={{ color: '#F97316' }}>Only {product.stock} left!</p>}
        </div>
      </div>
    </motion.div>
  );
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [sortOpen, setSortOpen] = useState(false);
  const isDark = useThemeStore((state) => state.theme) === 'dark';

  const selectedCategory = searchParams.get('category') || 'all';
  const sortBy = searchParams.get('sort') || 'featured';
  const searchQuery = searchParams.get('q') || '';

  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all' && value !== 'featured') params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  const currentSort = sortOptions.find(o => o.value === sortBy) || sortOptions[0];

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (selectedCategory !== 'all') result = result.filter(p => p.category === selectedCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || (categories.find(c => c.id === p.category)?.name || '').toLowerCase().includes(q));
    }
    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'newest': result.sort((a, b) => b.id - a.id); break;
      case 'discount': result.sort((a, b) => {
        const dA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const dB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return dB - dA;
      }); break;
      default: break;
    }
    return result;
  }, [selectedCategory, sortBy, searchQuery]);

  const clearAll = () => setSearchParams({});
  const hasFilters = selectedCategory !== 'all' || sortBy !== 'featured' || searchQuery;

  return (
    <div style={{ background: isDark ? '#080A12' : '#F8FAFC', minHeight: '100vh' }} className="transition-colors duration-300">
      {/* Page Header */}
      <div className="relative overflow-hidden transition-colors duration-300"
        style={{
          background: isDark ? 'linear-gradient(135deg, #111522 0%, #171B2B 100%)' : 'linear-gradient(135deg, #F1F5F9 0%, #FFFFFF 100%)',
          borderBottom: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
        }}>
        {/* Glow */}
        <div className="absolute top-0 left-1/4 w-96 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.15) 0%, transparent 70%)' }} />
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12 py-10 relative z-10">
          <nav className="flex items-center gap-2 text-xs mb-5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
            <Link to="/home" className="transition-colors hover:text-purple-500">Home</Link>
            <span>›</span>
            <span style={{ color: isDark ? '#F8FAFC' : '#0F172A', fontWeight: 600 }}>
              {selectedCategory !== 'all' ? categories.find(c => c.id === selectedCategory)?.name : 'All Products'}
            </span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                {selectedCategory !== 'all' ? (
                  <>
                    {categories.find(c => c.id === selectedCategory)?.icon}{' '}
                    <span className="text-gradient-brand">{categories.find(c => c.id === selectedCategory)?.name}</span>
                  </>
                ) : (
                  <>All <span className="text-gradient-brand">Products</span></>
                )}
              </h1>
              <p className="text-sm mt-2" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                {searchQuery ? `Results for "${searchQuery}" — ` : ''}
                <span className="font-bold" style={{ color: '#8B5CF6' }}>{filteredProducts.length}</span> products found
              </p>
            </div>
            {hasFilters && (
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', color: '#F43F5E' }}>
                <X className="h-3.5 w-3.5" /> Clear all filters
              </motion.button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          {/* Category chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full sm:w-auto no-scrollbar">
            <button
              onClick={() => setFilter('category', 'all')}
              className="shrink-0 px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer"
              style={selectedCategory === 'all'
                ? { background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', color: '#fff', border: '1px solid transparent', boxShadow: '0 0 14px rgba(139,92,246,0.4)' }
                : { background: isDark ? '#111522' : '#FFFFFF', color: isDark ? '#94A3B8' : '#64748B', border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}
            >
              All
            </button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setFilter('category', cat.id)}
                className="shrink-0 px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
                style={selectedCategory === cat.id
                  ? { background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', color: '#fff', border: '1px solid transparent', boxShadow: '0 0 14px rgba(139,92,246,0.4)' }
                  : { background: isDark ? '#111522' : '#FFFFFF', color: isDark ? '#94A3B8' : '#64748B', border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}
              >
                <span>{cat.icon}</span> {cat.name}
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Sort dropdown */}
            <div className="relative">
              <button onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all min-w-[160px] justify-between cursor-pointer"
                style={{
                  background: isDark ? '#111522' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                  color: isDark ? '#F8FAFC' : '#0F172A',
                }}>
                <span className="flex items-center gap-1.5"><span>{currentSort.icon}</span> {currentSort.label}</span>
                <motion.span animate={{ rotate: sortOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="h-3.5 w-3.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }} />
                </motion.span>
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 rounded-2xl overflow-hidden z-30 shadow-2xl"
                    style={{
                      background: isDark ? '#111522' : '#FFFFFF',
                      border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                      boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                    }}>
                    {sortOptions.map(opt => (
                      <button key={opt.value} onClick={() => { setFilter('sort', opt.value); setSortOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left cursor-pointer"
                        style={{
                          color: sortBy === opt.value ? '#8B5CF6' : (isDark ? '#94A3B8' : '#64748B'),
                          background: sortBy === opt.value ? 'rgba(139,92,246,0.1)' : 'transparent',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = isDark ? '#171B2B' : '#F1F5F9'; e.currentTarget.style.color = isDark ? '#F8FAFC' : '#0F172A'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = sortBy === opt.value ? 'rgba(139,92,246,0.1)' : 'transparent'; e.currentTarget.style.color = sortBy === opt.value ? '#8B5CF6' : (isDark ? '#94A3B8' : '#64748B'); }}
                      >
                        <span className="w-6 text-center">{opt.icon}</span>
                        {opt.label}
                        {sortBy === opt.value && <span className="ml-auto" style={{ color: '#8B5CF6' }}>✓</span>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* View toggle */}
            <div className="flex rounded-xl overflow-hidden" style={{ border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`, background: isDark ? '#111522' : '#FFFFFF' }}>
              {[['grid', <LayoutGrid className="h-4 w-4" />], ['list', <List className="h-4 w-4" />]].map(([mode, icon]) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className="p-2.5 transition-all cursor-pointer"
                  style={{
                    background: viewMode === mode ? 'linear-gradient(135deg,#8B5CF6,#EC4899)' : 'transparent',
                    color: viewMode === mode ? '#fff' : (isDark ? '#94A3B8' : '#64748B'),
                  }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active filters */}
        {(searchQuery || selectedCategory !== 'all') && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>Active:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full"
                style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', color: '#8B5CF6' }}>
                <Search className="h-3 w-3" /> "{searchQuery}"
                <button onClick={() => { const p = new URLSearchParams(searchParams); p.delete('q'); setSearchParams(p); }} className="cursor-pointer">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full"
                style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', color: '#8B5CF6' }}>
                {categories.find(c => c.id === selectedCategory)?.icon} {categories.find(c => c.id === selectedCategory)?.name}
                <button onClick={() => setFilter('category', 'all')} className="cursor-pointer"><X className="h-3 w-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* Grid / List */}
        <AnimatePresence mode="wait">
          {filteredProducts.length > 0 ? (
            <motion.div
              key={`${selectedCategory}-${sortBy}-${searchQuery}-${viewMode}`}
              variants={staggerGrid} initial="hidden" animate="visible" exit={{ opacity: 0 }}
              className={viewMode === 'grid' ? 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5' : 'flex flex-col gap-4'}
            >
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} viewMode={viewMode} />
              ))}
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24">
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl"
                style={{ background: isDark ? '#111522' : '#FFFFFF', border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>🔍</div>
              <h3 className="text-xl font-bold mb-2" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>No products found</h3>
              <p className="text-sm mb-8 max-w-xs mx-auto" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Try adjusting your search terms or browse a different category.</p>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={clearAll} className="btn-neon-primary px-8 py-3 text-sm cursor-pointer">
                Clear All Filters
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
