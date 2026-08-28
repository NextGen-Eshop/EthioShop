import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ShoppingCart,
  Heart,
  Star,
  Zap,
  TrendingUp,
  Timer,
  Award,
  Sparkles,
  Flame
} from 'lucide-react';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';
import { useThemeStore } from '../../store/themeStore';
import { products, categories, getFeaturedProducts } from '../../data/products';

/* ─── Fade-up Section Helper ─── */
function FadeUpSection({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 38 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Section label ─── */
function Label({ children, color = '#8B5CF6' }) {
  return (
    <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.22em] uppercase" style={{ color }}>
      <span className="w-5 h-[2px] rounded-full" style={{ background: color }} />
      {children}
    </span>
  );
}

/* ─── Animated 5-Star Rating Component for Product Cards ─── */
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

/* ─── Modern Animated Futuristic Product Card (Non-rectangular) ─── */
function NeonCard({ product, delay = 0 }) {
  const { toggle, isWished } = useWishlistStore();
  const { addItem } = useCartStore();
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  const [cartState, setCartState] = useState('idle'); // idle | adding | added
  const wished = isWished(product.id);

  const pct = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (cartState !== 'idle') return;
    setCartState('adding');
    setTimeout(() => {
      addItem(product);
      setCartState('added');
      setTimeout(() => setCartState('idle'), 2000);
    }, 550);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
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
      {/* Inner Card Body */}
      <div
        className="flex flex-col flex-1 rounded-[16.5px] overflow-hidden transition-all duration-300 p-3"
        style={{
          background: isDark ? '#111522' : '#FFFFFF',
        }}
      >
        {/* Image Container */}
        <Link
          to={`/products/${product.id}`}
          className="block relative overflow-hidden aspect-[4/3] rounded-[13px] transition-all duration-500"
          style={{ background: isDark ? '#171B2B' : '#F1F5F9' }}
        >
          <motion.img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            loading="lazy"
          />

          {/* Floating Badges */}
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

          {pct > 0 && (
            <span
              className="absolute top-3 right-12 px-2.5 py-1 rounded-full text-[9px] font-black text-white badge-sale shadow-md"
            >
              -{pct}%
            </span>
          )}

          {/* Floating Wishlist Button */}
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

          {/* Interactive Quick View Bar that slides up on hover */}
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

          {/* Ambient Lighting Overlay */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(139,92,246,0.18) 0%, transparent 60%)' }}
          />
        </Link>

        {/* Product Information */}
        <div className="flex flex-col flex-1 p-2 pt-3">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span
              className="text-[9px] font-extrabold tracking-[0.16em] uppercase"
              style={{ color: '#8B5CF6' }}
            >
              {categories.find(c => c.id === product.category)?.name}
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

          {/* Price & Action Button Footer */}
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
              onClick={handleAddToCart}
              className="flex items-center gap-1.5 h-8.5 px-3.5 rounded-full text-[11px] font-extrabold text-white transition-all duration-300 cursor-pointer shadow-md"
              style={{
                background: cartState === 'added' ? '#22C55E' : 'linear-gradient(135deg,#8B5CF6,#EC4899)',
                boxShadow: cartState === 'added'
                  ? '0 0 16px rgba(34,197,94,0.45)'
                  : '0 4px 15px rgba(139,92,246,0.4)',
              }}
            >
              {cartState === 'idle' && (
                <>
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span>Add</span>
                </>
              )}
              {cartState === 'adding' && <span className="animate-pulse">Adding...</span>}
              {cartState === 'added' && <span>✓ Added</span>}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Ticker ─── */
const tickers = [
  'Free Delivery Over ETB 2,000',
  'New Arrivals Every Week',
  'Secure Chapa & Bank Escrow',
  '30-Day Easy Returns',
  'Trusted by 50K+ Ethiopian Shoppers',
];

function Ticker() {
  const isDark = useThemeStore((state) => state.theme) === 'dark';
  return (
    <div
      className="overflow-hidden py-2.5 transition-colors duration-300"
      style={{
        background: isDark ? 'linear-gradient(90deg, #111522, #171B2B, #111522)' : 'linear-gradient(90deg, #F1F5F9, #FFFFFF, #F1F5F9)',
        borderBottom: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
      }}
    >
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        className="flex gap-14 whitespace-nowrap"
      >
        {[...tickers, ...tickers].map((t, i) => (
          <span key={i} className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-3" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', boxShadow: '0 0 6px rgba(139,92,246,0.7)' }} />
            {t}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── 1. HERO SECTION (Fade in + slide up) ─── */
function Hero() {
  const featured = getFeaturedProducts().slice(0, 3);
  const [active, setActive] = useState(0);
  const isDark = useThemeStore((state) => state.theme) === 'dark';

  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % featured.length), 4500);
    return () => clearInterval(t);
  }, [featured.length]);

  return (
    <section
      className="relative overflow-hidden transition-colors duration-300"
      style={{ background: isDark ? '#080A12' : '#F8FAFC', minHeight: '80vh' }}
    >
      {/* Background orbs */}
      <motion.div
        className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: isDark ? 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: isDark ? 'radial-gradient(circle, rgba(236,72,153,0.10) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut', delay: 2 }}
      />

      <div className="container-shell mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-14 pt-14 pb-0 lg:pt-20">
        <div className="grid lg:grid-cols-[1fr_480px] gap-10 lg:gap-16 items-center min-h-[70vh]">
          {/* Left copy */}
          <div className="pb-14 lg:pb-20">
            <FadeUpSection>
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-6"
                style={{
                  background: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.08)',
                  border: `1px solid ${isDark ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.2)'}`,
                  color: '#8B5CF6',
                }}
              >
                <Zap className="h-3.5 w-3.5" />
                EthioShop Atelier — Premium E-Commerce
              </div>
            </FadeUpSection>

            <FadeUpSection delay={0.08}>
              <h1
                className="text-[clamp(2.8rem,6vw,5.5rem)] font-black leading-[1.02] tracking-tight"
                style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
              >
                Shop What<br />
                <span style={{ color: '#EC4899', textShadow: isDark ? '0 0 30px rgba(236,72,153,0.4)' : 'none' }}>Matters</span>
                {' '}Most.
              </h1>
            </FadeUpSection>

            <FadeUpSection delay={0.14}>
              <p className="mt-5 text-base leading-relaxed max-w-md" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                Curated electronics, smartphones, OLED laptops, and lifestyle accessories — delivered across Ethiopia with speed and care.
              </p>
            </FadeUpSection>

            <FadeUpSection delay={0.2} className="mt-8 flex flex-wrap gap-3">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/products"
                  className="btn-neon-primary inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-bold shadow-xl"
                >
                  Browse Shop <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <a
                  href="#categories"
                  className="btn-neon-secondary inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold"
                >
                  Categories
                </a>
              </motion.div>
            </FadeUpSection>

            {/* Stats */}
            <FadeUpSection delay={0.28} className="mt-12 flex flex-wrap gap-6 sm:gap-8 pt-8" style={{ borderTop: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>
              {[['10K+', 'Products'], ['50K+', 'Customers'], ['4.9★', 'Rating']].map(([v, l]) => (
                <div key={l}>
                  <p className="text-2xl font-black text-gradient-brand">{v}</p>
                  <p className="text-[10px] tracking-widest uppercase mt-0.5" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>{l}</p>
                </div>
              ))}
            </FadeUpSection>
          </div>

          {/* Right — Product showcase */}
          <div className="hidden lg:block relative self-center">
            <div
              className="absolute -inset-8 rounded-3xl pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.20) 0%, rgba(236,72,153,0.12) 50%, transparent 70%)' }}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: -16 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8, rotateY: -2 }}
                className="animate-float-slow"
              >
                <Link to={`/products/${featured[active].id}`} className="block">
                  <div
                    className="relative rounded-2xl overflow-hidden aspect-[3/4] shadow-2xl"
                    style={{
                      border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                      background: isDark ? '#111522' : '#FFFFFF',
                      boxShadow: isDark ? '0 0 60px rgba(139,92,246,0.2), 0 32px 64px rgba(0,0,0,0.6)' : '0 20px 50px rgba(139,92,246,0.15)',
                    }}
                  >
                    <img
                      src={featured[active].image}
                      alt={featured[active].name}
                      className="w-full h-full object-cover"
                    />

                    {/* Top tag */}
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
                      className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-extrabold"
                      style={{
                        background: isDark ? 'rgba(17,21,34,0.9)' : 'rgba(255,255,255,0.92)',
                        backdropFilter: 'blur(12px)',
                        color: '#8B5CF6',
                        border: '1px solid rgba(139,92,246,0.3)',
                        boxShadow: '0 0 15px rgba(139,92,246,0.25)',
                      }}
                    >
                      ✦ Featured Selection
                    </motion.div>

                    {/* Bottom card */}
                    <div
                      className="absolute bottom-4 left-4 right-4 rounded-2xl p-4"
                      style={{
                        background: isDark ? 'rgba(17,21,34,0.95)' : 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(139,92,246,0.2)',
                        boxShadow: isDark ? '0 0 20px rgba(139,92,246,0.15)' : '0 10px 30px rgba(0,0,0,0.08)',
                      }}
                    >
                      <p className="text-[9px] font-bold tracking-widest uppercase mb-1" style={{ color: '#8B5CF6' }}>
                        {categories.find((c) => c.id === featured[active].category)?.name}
                      </p>
                      <p className="text-sm font-bold line-clamp-1" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                        {featured[active].name}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-base font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                          ETB {featured[active].price.toLocaleString()}
                        </span>
                        <span
                          className="text-[10px] font-bold px-2.5 py-1 rounded-lg text-white"
                          style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)' }}
                        >
                          {featured[active].badge || 'Popular'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </AnimatePresence>

            {/* Dot nav */}
            <div className="flex justify-center gap-2 mt-5 pb-4">
              {featured.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className="rounded-full transition-all duration-300 cursor-pointer"
                  style={{
                    width: i === active ? '2rem' : '0.625rem',
                    height: '0.625rem',
                    background: i === active ? 'linear-gradient(90deg,#8B5CF6,#EC4899)' : (isDark ? '#252A3A' : '#CBD5E1'),
                    boxShadow: i === active ? '0 0 10px rgba(139,92,246,0.5)' : 'none',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 2. CATEGORIES SECTION (Fade in + slide up) ─── */
function Categories() {
  const isDark = useThemeStore((state) => state.theme) === 'dark';
  const catColors = ['#8B5CF6', '#EC4899', '#3B82F6', '#F97316', '#22C55E', '#F43F5E'];
  return (
    <section id="categories" className="py-20 lg:py-28 transition-colors duration-300" style={{ background: isDark ? '#080A12' : '#F8FAFC' }}>
      <div className="container-shell mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-14">
        <FadeUpSection className="flex items-end justify-between mb-12">
          <div>
            <Label>Explore</Label>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              Shop by <span className="text-gradient-brand">Category</span>
            </h2>
          </div>
          <Link
            to="/products"
            className="hidden sm:flex items-center gap-1.5 text-sm font-bold transition-colors hover:text-purple-400"
            style={{ color: isDark ? '#94A3B8' : '#64748B' }}
          >
            All Categories <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeUpSection>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 32, scale: 0.92 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8, scale: 1.06 }}
            >
              <Link
                to={`/products?category=${cat.id}`}
                className="group flex flex-col items-center justify-center gap-3 rounded-2xl p-6 h-full text-center transition-all duration-300"
                style={{
                  background: isDark ? '#111522' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                  boxShadow: isDark ? 'none' : '0 4px 15px rgba(0,0,0,0.03)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = catColors[i % catColors.length] + '60';
                  e.currentTarget.style.boxShadow = `0 0 20px ${catColors[i % catColors.length]}20, 0 12px 30px rgba(0,0,0,0.1)`;
                  e.currentTarget.style.background = isDark ? '#171B2B' : '#F8FAFC';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isDark ? '#252A3A' : '#E2E8F0';
                  e.currentTarget.style.boxShadow = isDark ? 'none' : '0 4px 15px rgba(0,0,0,0.03)';
                  e.currentTarget.style.background = isDark ? '#111522' : '#FFFFFF';
                }}
              >
                <motion.span
                  className="text-4xl"
                  animate={{ rotate: [0, 0, 6, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 4 + i * 0.5, ease: 'easeInOut', delay: i * 0.4 }}
                >
                  {cat.icon}
                </motion.span>
                <div>
                  <p className="text-sm font-bold transition-colors" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{cat.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{cat.count} items</p>
                </div>
                <span
                  className="block h-[2px] w-0 rounded-full transition-all duration-300 group-hover:w-8"
                  style={{ background: catColors[i % catColors.length] }}
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 3. FLASH DEALS SECTION (Fade in + slide up) ─── */
function Deals() {
  const deals = products.filter((p) => p.originalPrice && p.originalPrice > p.price).slice(0, 4);
  const isDark = useThemeStore((state) => state.theme) === 'dark';
  const [time, setTime] = useState({ h: 5, m: 34, s: 12 });

  useEffect(() => {
    const t = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <section
      className="py-20 lg:py-28 transition-colors duration-300"
      style={{
        background: isDark ? '#111522' : '#FFFFFF',
        borderTop: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
        borderBottom: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
      }}
    >
      <div className="container-shell mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-14">
        <FadeUpSection className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <Label color="#F97316">
              <span className="flex items-center gap-1">
                <Flame className="h-3.5 w-3.5" /> Limited Time
              </span>
            </Label>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              Flash <span style={{ color: '#F97316' }}>Deals</span>
            </h2>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-1.5">
            <Timer className="h-4 w-4" style={{ color: '#F97316' }} />
            {[pad(time.h), pad(time.m), pad(time.s)].map((v, i) => (
              <span key={i} className="flex items-center gap-1">
                <motion.span
                  key={v}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black"
                  style={{
                    background: isDark ? '#171B2B' : '#F1F5F9',
                    color: '#F97316',
                    border: '1px solid rgba(249,115,22,0.3)',
                    boxShadow: '0 0 10px rgba(249,115,22,0.15)',
                  }}
                >
                  {v}
                </motion.span>
                {i < 2 && <span className="font-black text-sm" style={{ color: '#F97316' }}>:</span>}
              </span>
            ))}
          </div>
        </FadeUpSection>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {deals.map((p, i) => (
            <NeonCard key={p.id} product={p} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 4. BEST SELLERS / TOP RATED SECTION (Fade in + slide up) ─── */
function BestSellers() {
  const bestSellersList = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);
  const isDark = useThemeStore((state) => state.theme) === 'dark';

  return (
    <section className="py-20 lg:py-28 transition-colors duration-300" style={{ background: isDark ? '#080A12' : '#F8FAFC' }}>
      <div className="container-shell mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-14">
        <FadeUpSection className="flex items-end justify-between mb-10">
          <div>
            <Label color="#22C55E">
              <span className="flex items-center gap-1">
                <Award className="h-3.5 w-3.5" /> Top Rated
              </span>
            </Label>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              Best <span className="text-gradient-brand">Sellers</span>
            </h2>
          </div>
          <Link
            to="/products?sort=rating"
            className="hidden sm:flex items-center gap-1.5 text-sm font-bold transition-colors hover:text-purple-400"
            style={{ color: isDark ? '#94A3B8' : '#64748B' }}
          >
            View All Top Rated <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeUpSection>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {bestSellersList.map((p, i) => (
            <NeonCard key={p.id} product={p} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 5. FEATURED DROP BANNER (Fade in + slide up) ─── */
function FeatureBanner() {
  const top = [...products].sort((a, b) => b.price - a.price)[0];
  const isDark = useThemeStore((state) => state.theme) === 'dark';

  return (
    <section
      className="overflow-hidden relative transition-colors duration-300"
      style={{
        background: isDark ? '#0D0F1C' : '#F1F5F9',
        borderTop: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
        borderBottom: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
      }}
    >
      {/* Animated orbs */}
      <motion.div
        className="absolute -left-40 top-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-0 bottom-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.10) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ repeat: Infinity, duration: 9, ease: 'easeInOut', delay: 2 }}
      />

      <div className="container-shell mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-14 py-16 lg:py-0 relative z-10">
        <div className="grid lg:grid-cols-2 gap-0 items-stretch">
          {/* Copy */}
          <div className="flex flex-col justify-center py-16 lg:py-20 lg:pr-16">
            <FadeUpSection>
              <Label color="#F97316">Featured Drop</Label>
              <h2 className="mt-4 text-3xl sm:text-5xl font-black leading-tight tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                {top.name}
              </h2>
              <p className="mt-4 text-base leading-relaxed max-w-md" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                {top.description}
              </p>

              <div className="mt-8 flex items-center gap-8">
                <div>
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>Price</p>
                  <p className="text-3xl font-black mt-1 text-gradient-brand">
                    ETB {top.price.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>Rating</p>
                  <motion.p
                    className="text-3xl font-black mt-1"
                    animate={{ textShadow: ['0 0 0px #F97316', '0 0 20px #F97316', '0 0 0px #F97316'] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    style={{ color: '#F97316' }}
                  >
                    {top.rating}★
                  </motion.p>
                </div>
              </div>

              <div className="mt-8">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to={`/products/${top.id}`}
                    className="btn-neon-primary inline-flex items-center gap-3 px-7 py-3.5 text-sm font-bold shadow-xl"
                  >
                    View Product Details <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </div>
            </FadeUpSection>
          </div>

          {/* Image */}
          <motion.div
            className="relative hidden lg:block overflow-hidden"
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background: isDark
                  ? 'linear-gradient(to right, #0D0F1C 0%, rgba(13,15,28,0.3) 40%, transparent 100%)'
                  : 'linear-gradient(to right, #F1F5F9 0%, rgba(241,245,249,0.3) 40%, transparent 100%)',
              }}
            />
            <motion.img
              src={top.image}
              alt={top.name}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── 6. NEW ARRIVALS (Fade in + slide up) ─── */
function NewArrivals() {
  const list = products.slice(0, 8);
  const isDark = useThemeStore((state) => state.theme) === 'dark';
  return (
    <section className="py-20 lg:py-28 transition-colors duration-300" style={{ background: isDark ? '#080A12' : '#F8FAFC' }}>
      <div className="container-shell mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-14">
        <FadeUpSection className="flex items-end justify-between mb-10">
          <div>
            <Label>Fresh Drops</Label>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              New <span className="text-gradient-brand">Arrivals</span>
            </h2>
          </div>
          <Link
            to="/products?sort=newest"
            className="hidden sm:flex items-center gap-1.5 text-sm font-bold transition-colors hover:text-purple-400"
            style={{ color: isDark ? '#94A3B8' : '#64748B' }}
          >
            See all new products <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeUpSection>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {list.map((p, i) => (
            <NeonCard key={p.id} product={p} delay={i * 0.04} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 7. TRUST STRIP (Fade in + slide up) ─── */
function TrustStrip() {
  const isDark = useThemeStore((state) => state.theme) === 'dark';
  const items = [
    { icon: '🚚', title: 'Free Delivery', sub: 'Orders over ETB 2,000' },
    { icon: '🔒', title: 'Secure Checkout', sub: 'Chapa & bank protected' },
    { icon: '↩️', title: '30-Day Returns', sub: 'Hassle-free policy' },
    { icon: '⚡', title: '24/7 Support', sub: 'Always here for you' },
  ];
  return (
    <div
      style={{ background: isDark ? '#111522' : '#FFFFFF', borderBottom: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}
      className="transition-colors duration-300"
    >
      <div className="container-shell mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-14 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map(({ icon, title, sub }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex items-center gap-3 group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>
              <div>
                <p className="text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{title}</p>
                <p className="text-xs" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── 8. NEWSLETTER (Fade in + slide up) ─── */
function Newsletter() {
  const isDark = useThemeStore((state) => state.theme) === 'dark';
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (email) { setSent(true); setEmail(''); }
  };

  return (
    <section
      className="py-20 lg:py-28 relative overflow-hidden transition-colors duration-300"
      style={{ background: isDark ? '#0D0F1C' : '#F8FAFC' }}
    >
      <div className="container-shell mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-14 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <FadeUpSection>
            <Label>Stay in the loop</Label>
            <h2 className="mt-4 text-3xl sm:text-5xl font-black leading-tight tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              Get Early Access<br />to{' '}
              <span className="text-gradient-brand">New Drops.</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed max-w-sm" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              Join 50,000+ shoppers who get exclusive deals, new arrivals, and styling tips before anyone else.
            </p>
          </FadeUpSection>

          <FadeUpSection delay={0.1}>
            {sent ? (
              <div className="flex flex-col items-start gap-3">
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-4xl">🎉</motion.span>
                <p className="text-xl font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>You're in!</p>
                <p className="text-sm" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Check your inbox for a welcome gift.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-5 py-4 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: isDark ? '#171B2B' : '#FFFFFF',
                    border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#8B5CF6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.18)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = isDark ? '#252A3A' : '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; }}
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-neon-primary px-7 py-4 text-sm font-bold whitespace-nowrap shadow-lg"
                >
                  Subscribe
                </motion.button>
              </form>
            )}
            <p className="mt-3 text-[11px]" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>No spam. Unsubscribe anytime.</p>
          </FadeUpSection>
        </div>
      </div>
    </section>
  );
}

/* ─── Home Page Assembly: Exact Ordered Sequence ─── */
export default function Home() {
  return (
    <div>
      <Ticker />
      {/* 1. Hero Section (fade in + slide up) */}
      <Hero />
      <TrustStrip />
      {/* 2. Categories (fade in + slide up) */}
      <Categories />
      {/* 3. Flash Deals (fade in + slide up) */}
      <Deals />
      {/* 4. Best Sellers (fade in + slide up) */}
      <BestSellers />
      {/* 5. Featured Banner Drop (fade in + slide up) */}
      <FeatureBanner />
      {/* 6. New Arrivals (fade in + slide up) */}
      <NewArrivals />
      {/* 7. Newsletter (fade in + slide up) */}
      <Newsletter />
    </div>
  );
}
