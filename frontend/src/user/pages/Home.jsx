import { useState, useEffect, useRef, useMemo } from 'react';
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
  Flame,
  ShieldCheck,
  Truck,
  RotateCcw,
  Percent,
  Play
} from 'lucide-react';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';
import { useThemeStore } from '../../store/themeStore';
import { categories as defaultCategories } from '../../data/products';
import { formatEthiopianDate, getRemainingDiscountTime } from '../../utils/ethiopianDate';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
    <div className="flex items-center gap-1 sm:gap-1.5 py-0.5">
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
                className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5"
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
      <span className="text-[9px] sm:text-[11px] font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
        {Number(rating).toFixed(1)}
      </span>
      {reviews > 0 && (
        <span className="text-[8px] sm:text-[10px]" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
          ({reviews})
        </span>
      )}
    </div>
  );
}

/* ─── Modern Animated Futuristic Product Card with 0.7s Short Video ─── */
/* ─── Modern Animated Futuristic Product Card with 0.7s Short Video ─── */
export function ModernProductCard({ product, delay = 0, viewMode = 'grid' }) {
  return <NeonCard product={product} delay={delay} viewMode={viewMode} />;
}

function NeonCard({ product, delay = 0, viewMode = 'grid' }) {
  const { toggle, isWished } = useWishlistStore();
  const { addItem } = useCartStore();
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  const [cartState, setCartState] = useState('idle'); // idle | adding | added
  const [videoError, setVideoError] = useState(false);
  const prodId = product._id || product.id;
  const wished = isWished(prodId);

  const pct = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : (product.discountPercentage || 0);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartState !== 'idle') return;
    setCartState('adding');
    setTimeout(() => {
      addItem({
        id: prodId,
        _id: prodId,
        name: product.name,
        image: product.image || product.imageUrl,
        price: product.price,
      });
      setCartState('added');
      setTimeout(() => setCartState('idle'), 2000);
    }, 550);
  };

  const isListView = viewMode === 'list';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, scale: 1.01 }}
      className={`group relative flex transition-all duration-300 p-[1px] sm:p-[1.5px] rounded-[14px] sm:rounded-[18px] overflow-hidden ${
        isListView ? 'w-full flex-col sm:flex-row' : 'flex-col h-full'
      }`}
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(139,92,246,0.35) 0%, rgba(37,42,58,0.7) 50%, rgba(236,72,153,0.3) 100%)'
          : 'linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(226,232,240,0.8) 50%, rgba(236,72,153,0.25) 100%)',
        boxShadow: isDark
          ? '0 10px 24px -10px rgba(0,0,0,0.5)'
          : '0 8px 24px -10px rgba(139,92,246,0.08), 0 2px 8px rgba(0,0,0,0.03)',
      }}
    >
      {/* Inner Card Body */}
      <div
        className={`flex flex-1 rounded-[13px] sm:rounded-[16.5px] overflow-hidden transition-all duration-300 p-2 sm:p-3 ${
          isListView ? 'flex-col sm:flex-row gap-3 sm:gap-4 items-center' : 'flex-col'
        }`}
        style={{
          background: isDark ? '#111522' : '#FFFFFF',
        }}
      >
        {/* Media Container: 0.7s Short Looping Video with Image Fallback */}
        <Link
          to={`/products/${prodId}`}
          className={`block relative overflow-hidden aspect-[4/3] rounded-[10px] sm:rounded-[13px] transition-all duration-500 ${
            isListView ? 'w-full sm:w-48 md:w-56 shrink-0' : 'w-full'
          }`}
          style={{ background: isDark ? '#171B2B' : '#F1F5F9' }}
        >
          {product.shortVideoUrl && !videoError ? (
            <video
              src={product.shortVideoUrl}
              autoPlay
              loop
              muted
              playsInline
              onError={() => setVideoError(true)}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          ) : (
            <motion.img
              src={product.image || product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              loading="lazy"
            />
          )}

          {/* Floating Badges */}
          {product.badge && (
            <motion.span
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
              className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 sm:px-3 py-0.5 sm:py-1 text-[8px] sm:text-[9px] font-black tracking-wider uppercase rounded-full text-white backdrop-blur-md"
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
              className="absolute top-2 right-9 sm:top-3 sm:right-12 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[9px] font-black text-white badge-sale shadow-md"
            >
              -{pct}%
            </span>
          )}

          {/* Floating Wishlist Button */}
          <motion.button
            whileTap={{ scale: 0.65 }}
            whileHover={{ scale: 1.15, rotate: 6 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle({
                id: prodId,
                name: product.name,
                image: product.image || product.imageUrl,
                price: product.price,
              });
            }}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 flex h-6.5 w-6.5 sm:h-8 sm:w-8 items-center justify-center rounded-full transition-all cursor-pointer z-10 shadow-lg"
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
            <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill={wished ? '#FFFFFF' : 'none'} />
          </motion.button>

          {/* Interactive Quick View Bar that slides up on hover */}
          <div className="absolute inset-x-2 sm:inset-x-3 bottom-2 sm:bottom-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-10">
            <div
              className="py-1.5 sm:py-2 text-[9.5px] sm:text-[11px] font-extrabold text-center rounded-lg sm:rounded-xl backdrop-blur-md shadow-lg"
              style={{
                background: isDark ? 'rgba(17,21,34,0.92)' : 'rgba(255,255,255,0.95)',
                color: '#8B5CF6',
                border: '1px solid rgba(139,92,246,0.3)',
              }}
            >
              View Details →
            </div>
          </div>
        </Link>

        {/* Card Metadata */}
        <div className={`flex flex-col flex-1 ${isListView ? 'w-full justify-between' : 'pt-2.5 sm:pt-3.5 px-0.5 sm:px-1 justify-between'}`}>
          <div>
            <div className="flex items-center justify-between gap-1 mb-1 sm:mb-1.5">
              <span
                className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full"
                style={{
                  background: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)',
                  color: '#8B5CF6',
                }}
              >
                {product.category || 'Collection'}
              </span>
              <CardStarRating rating={product.rating || 4.8} reviews={product.reviewsCount || product.reviews || 0} isDark={isDark} />
            </div>

            <Link to={`/products/${prodId}`}>
              <h3
                className="text-xs sm:text-sm font-bold leading-tight sm:leading-snug line-clamp-2 hover:text-[#8B5CF6] transition-colors"
                style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
              >
                {product.name}
              </h3>
            </Link>
          </div>

          {/* Pricing & Add to Cart */}
          <div className="pt-2 sm:pt-3 mt-2 sm:mt-3 flex flex-col min-[380px]:flex-row min-[380px]:items-end justify-between gap-1.5 sm:gap-2 border-t" style={{ borderColor: isDark ? '#252A3A' : '#F1F5F9' }}>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-xs sm:text-base font-black tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  ETB {Number(product.price).toLocaleString()}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-[9.5px] sm:text-[11px] line-through font-semibold" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
                    ETB {Number(product.originalPrice).toLocaleString()}
                  </span>
                )}
              </div>
              <div className="flex flex-col mt-0.5">
                <span className="text-[9px] sm:text-[10px] font-bold" style={{ color: (product.countInStock || product.stock) > 0 ? '#10B981' : '#EF4444' }}>
                  {(product.countInStock || product.stock) > 0 ? `${product.countInStock || product.stock} in stock` : 'Out of stock'}
                </span>
                <span
                  className="text-[8.5px] sm:text-[9.5px] font-bold tracking-tight truncate"
                  style={{
                    color: (() => {
                      const text = (() => {
                        if (product.shippingFee !== undefined && product.shippingFee !== null) {
                          return Number(product.shippingFee) === 0 ? 'Shipping: Free' : `Shipping fee: ${product.shippingFee} ETB`;
                        }
                        if (product.deliveryFee !== undefined && product.deliveryFee !== null) {
                          return Number(product.deliveryFee) === 0 ? 'Shipping: Free' : `Shipping fee: ${product.deliveryFee} ETB`;
                        }
                        if (product.isFreeShipping === true || product.freeShipping === true) return 'Shipping: Free';
                        if (product.isFreeShipping === false || product.freeShipping === false) {
                          return `Shipping fee: ${product.shippingFee || product.deliveryFee || 150} ETB`;
                        }
                        return Number(product.price) >= 2000 ? 'Shipping: Free' : 'Shipping fee: 150 ETB';
                      })();
                      return text.includes('Free') ? '#10B981' : (isDark ? '#94A3B8' : '#64748B');
                    })(),
                  }}
                >
                  {(() => {
                    if (product.shippingFee !== undefined && product.shippingFee !== null) {
                      return Number(product.shippingFee) === 0 ? 'Shipping: Free' : `Shipping fee: ${product.shippingFee} ETB`;
                    }
                    if (product.deliveryFee !== undefined && product.deliveryFee !== null) {
                      return Number(product.deliveryFee) === 0 ? 'Shipping: Free' : `Shipping fee: ${product.deliveryFee} ETB`;
                    }
                    if (product.isFreeShipping === true || product.freeShipping === true) return 'Shipping: Free';
                    if (product.isFreeShipping === false || product.freeShipping === false) {
                      return `Shipping fee: ${product.shippingFee || product.deliveryFee || 150} ETB`;
                    }
                    return Number(product.price) >= 2000 ? 'Shipping: Free' : 'Shipping fee: 150 ETB';
                  })()}
                </span>
              </div>
            </div>

            {/* Action Buttons: Buy Now & Cart */}
            <div className="flex items-center gap-1 sm:gap-1.5 self-end min-[380px]:self-auto shrink-0">
              <motion.button
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.05 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addItem({
                    id: prodId,
                    _id: prodId,
                    name: product.name,
                    image: product.image || product.imageUrl,
                    price: product.price,
                  });
                  window.location.href = '/checkout';
                }}
                className="px-2 sm:px-2.5 py-1 sm:py-1.5 text-[9px] sm:text-[10px] font-extrabold rounded-md sm:rounded-lg text-white flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
                title="Buy Now"
              >
                <Zap className="h-2 w-2 sm:h-2.5 sm:w-2.5 fill-white" />
                <span>Buy</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.08 }}
                onClick={handleAddToCart}
                className="flex h-6.5 w-6.5 sm:h-7.5 sm:w-7.5 items-center justify-center rounded-md sm:rounded-lg font-bold cursor-pointer transition-all shadow-xs"
                style={{
                  background: cartState === 'added'
                    ? '#10B981'
                    : 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                  boxShadow: cartState === 'added'
                    ? '0 0 12px rgba(16,185,129,0.45)'
                    : '0 2px 10px rgba(139,92,246,0.3)',
                  color: '#FFFFFF',
                }}
                aria-label="Add to cart"
              >
                {cartState === 'added' ? <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── 0. TICKER (Glow Announcement Bar) ─── */
function Ticker() {
  const items = [
    '🚀 FLASH SALE • 20% OFF ON ELECTRONICS',
    '✨ 50,000+ HAPPY ETHIOPIAN SHOPPERS',
    '⚡ FREE DELIVERY IN ADDIS ABABA OVER ETB 2,000',
    '🛡️ SECURE ESCROW VIA TELEBIRR & CBE',
    '🔥 USE CODE ETHIO20 AT CHECKOUT',
  ];
  return (
    <div
      className="relative overflow-hidden py-2.5 text-xs font-black tracking-widest uppercase select-none border-b transition-colors duration-300"
      style={{
        background: 'linear-gradient(90deg, #8B5CF6 0%, #EC4899 50%, #8B5CF6 100%)',
        borderColor: 'rgba(139,92,246,0.3)',
        color: '#FFFFFF',
      }}
    >
      <div className="flex gap-12 whitespace-nowrap animate-marquee">
        {[...items, ...items, ...items].map((text, i) => (
          <span key={i} className="flex items-center gap-3 shrink-0">
            {text}
            <span className="opacity-40">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── 1. HERO SECTION (Dynamic 3D Floating Presentation) ─── */
function Hero({ productsList = [] }) {
  const isDark = useThemeStore((state) => state.theme) === 'dark';
  const featured = productsList.slice(0, 3);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (featured.length === 0) return;
    const timer = setInterval(() => setActive((p) => (p + 1) % featured.length), 4200);
    return () => clearInterval(timer);
  }, [featured.length]);

  const activeProduct = featured[active] || featured[0];

  return (
    <section
      className="relative overflow-hidden transition-colors duration-300"
      style={{
        background: isDark
          ? 'radial-gradient(ellipse at 50% -20%, #1c1444 0%, #080A12 65%)'
          : 'radial-gradient(ellipse at 50% -20%, #ede9fe 0%, #F8FAFC 65%)',
      }}
    >
      {/* Floating Glowing Orbs */}
      <motion.div
        className="pointer-events-none absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full blur-[140px] opacity-30"
        style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute top-1/3 right-10 w-[350px] h-[350px] rounded-full blur-[120px] opacity-20"
        style={{ background: '#EC4899' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut', delay: 2 }}
      />

      <div className="container-shell mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-14 pt-14 pb-0 lg:pt-20">
        <div className="grid lg:grid-cols-[1fr_480px] gap-10 lg:gap-16 items-center min-h-[70vh]">
          {/* Left Copy */}
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
                Curated electronics, smartphones, traditional wear, and lifestyle accessories — delivered across Ethiopia with speed and care.
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

          {/* Right — 3D Floating Product Showcase */}
          {activeProduct && (
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
                  <Link to={`/products/${activeProduct._id || activeProduct.id}`} className="block">
                    <div
                      className="relative rounded-2xl overflow-hidden aspect-[3/4] shadow-2xl"
                      style={{
                        border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                        background: isDark ? '#111522' : '#FFFFFF',
                        boxShadow: isDark ? '0 0 60px rgba(139,92,246,0.2), 0 32px 64px rgba(0,0,0,0.6)' : '0 20px 50px rgba(139,92,246,0.15)',
                      }}
                    >
                      <motion.img
                        src={activeProduct.image || activeProduct.imageUrl || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80'}
                        alt={activeProduct.name}
                        className="w-full h-full object-cover"
                        loading="eager"
                      />

                      {/* Top Tag */}
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

                      {/* Bottom Card */}
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
                          {activeProduct.category}
                        </p>
                        <p className="text-sm font-bold line-clamp-1" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                          {activeProduct.name}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-base font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                            ETB {Number(activeProduct.price).toLocaleString()}
                          </span>
                          <span
                            className="text-[10px] font-bold px-2.5 py-1 rounded-lg text-white"
                            style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)' }}
                          >
                            {activeProduct.badge || 'Popular'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </AnimatePresence>

              {/* Dot Navigation */}
              <div className="flex justify-center gap-2 mt-5 pb-4">
                {featured.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className="rounded-full transition-all duration-300 cursor-pointer"
                    style={{
                      width: i === active ? '2rem' : '0.625rem',
                      height: '0.625rem',
                      background: i === active ? 'linear-gradient(135deg,#8B5CF6,#EC4899)' : (isDark ? '#252A3A' : '#CBD5E1'),
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─── 2. CATEGORIES ─── */
function Categories() {
  const isDark = useThemeStore((state) => state.theme) === 'dark';
  return (
    <section id="categories" className="py-20 lg:py-28 transition-colors duration-300" style={{ background: isDark ? '#080A12' : '#F8FAFC' }}>
      <div className="container-shell mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-14">
        <FadeUpSection className="flex items-end justify-between mb-10">
          <div>
            <Label>Collections</Label>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              Shop by <span className="text-gradient-brand">Category</span>
            </h2>
          </div>
          <Link
            to="/products"
            className="hidden sm:flex items-center gap-1.5 text-sm font-bold transition-colors hover:text-purple-400"
            style={{ color: isDark ? '#94A3B8' : '#64748B' }}
          >
            All categories <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeUpSection>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {defaultCategories.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              whileHover={{ y: -6, scale: 1.03 }}
            >
              <Link
                to={`/products?category=${c.id}`}
                className="group flex flex-col items-center text-center p-5 rounded-2xl transition-all duration-300 block"
                style={{
                  background: isDark ? '#111522' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                  boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3 transition-transform duration-300 group-hover:scale-115 group-hover:rotate-6"
                  style={{ background: isDark ? '#171B2B' : '#F1F5F9' }}
                >
                  {c.icon}
                </div>
                <h4 className="text-xs font-bold transition-colors group-hover:text-purple-400" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  {c.name}
                </h4>
                <p className="text-[10px] mt-0.5" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
                  {c.count} items
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 3. FLASH DEALS WITH COUNTDOWN TIMER ─── */
function Deals({ promotionsList = [], superDealProducts = [] }) {
  const isDark = useThemeStore((state) => state.theme) === 'dark';

  // 1. Filter active promotions based on endDate
  const activePromos = useMemo(() => {
    const curTime = Date.now();
    return (promotionsList || []).filter((p) => {
      if (!p || !p.endDate) return false;
      return new Date(p.endDate).getTime() > curTime;
    });
  }, [promotionsList]);

  // 2. Earliest target end date timestamp (primitive number for stable dependency)
  const targetEndMs = useMemo(() => {
    if (activePromos.length === 0) return null;
    let minMs = null;
    for (const p of activePromos) {
      const ms = new Date(p.endDate).getTime();
      if (minMs === null || ms < minMs) {
        minMs = ms;
      }
    }
    return minMs;
  }, [activePromos]);

  // 3. Dynamic countdown timer state
  const [remaining, setRemaining] = useState(() => getRemainingDiscountTime(targetEndMs));

  useEffect(() => {
    if (!targetEndMs) {
      setRemaining({ isExpired: true, days: 0, hours: 0, minutes: 0, seconds: 0, ethiopianEndDate: '' });
      return;
    }
    setRemaining(getRemainingDiscountTime(targetEndMs));
    const timer = setInterval(() => {
      setRemaining(getRemainingDiscountTime(targetEndMs));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetEndMs]);

  // 4. Products under active discount with "Discount" badge
  const promoLinked = useMemo(() => {
    return activePromos
      .flatMap((promo) => (promo.products || []).map((p) => {
        const discountVal = Number(promo.discountValue) || 0;
        const origPrice = p.originalPrice && p.originalPrice > p.price
          ? p.originalPrice
          : (discountVal > 0 ? Math.round(p.price / (1 - discountVal / 100)) : p.price);
        return {
          ...p,
          badge: 'Discount',
          isSuperDeal: true,
          promoTitle: promo.title,
          promoDiscount: discountVal,
          discountPercentage: discountVal,
          originalPrice: origPrice > p.price ? origPrice : (p.originalPrice || p.price),
        };
      }));
  }, [activePromos]);

  // When expired, remove products from Flash Deals (Requirement 10)
  const dealProducts = useMemo(() => {
    if (remaining.isExpired || !targetEndMs) return [];
    if (promoLinked.length > 0) return promoLinked.slice(0, 4);
    return superDealProducts.map((p) => ({
      ...p,
      badge: 'Discount',
      isSuperDeal: true,
    })).slice(0, 4);
  }, [remaining.isExpired, targetEndMs, promoLinked, superDealProducts]);

  // Only show section if there are active deals and discount has not expired
  if (dealProducts.length === 0 || remaining.isExpired || !targetEndMs) return null;

  const pad = (n) => String(n).padStart(2, '0');

  // Dynamic remaining discount time display (Requirements 5 & 6):
  // If remaining is more than 1 day -> DAYS, HRS, MIN
  // If remaining is less than 1 day -> HRS, MIN
  const timerBlocks = remaining.days > 0
    ? [
        [remaining.days, 'DAYS'],
        [remaining.hours, 'HRS'],
        [remaining.minutes, 'MIN'],
      ]
    : [
        [remaining.hours, 'HRS'],
        [remaining.minutes, 'MIN'],
      ];

  const ethiopianDateStr = targetEndMs ? formatEthiopianDate(targetEndMs) : '';

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden transition-colors duration-300" style={{ background: isDark ? '#0D0F1C' : '#F1F5F9' }}>
      <div className="container-shell mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-14">
        <FadeUpSection className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              <Label color="#EC4899">Limited Time Drops</Label>
            </div>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              Flash <span className="text-gradient-brand">Deals</span>
            </h2>
          </div>

          {/* Countdown Clock & Ethiopian Calendar Date */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Ethiopian Calendar Discount End Date (Requirement 4) */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
              style={{
                background: isDark ? '#171B2B' : '#FFFFFF',
                border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                color: isDark ? '#F59E0B' : '#D97706',
              }}
              title="Ethiopian Calendar End Date"
            >
              <span>📅</span>
              <span>Ends: {ethiopianDateStr}</span>
            </div>

            {/* Dynamic Countdown Display (Requirements 3, 5, 6) */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                Ends in:
              </span>
              <div className="flex items-center gap-1.5">
                {timerBlocks.map(([val, label]) => (
                  <div
                    key={label}
                    className="flex flex-col items-center px-3 py-2 rounded-xl"
                    style={{
                      background: isDark ? '#171B2B' : '#FFFFFF',
                      border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                    }}
                  >
                    <span className="font-mono text-base font-black text-rose-500">{pad(val)}</span>
                    <span className="text-[8px] font-bold tracking-widest text-slate-400">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeUpSection>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {dealProducts.map((p, i) => (
            <NeonCard key={p._id || p.id} product={p} delay={i * 0.05} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 4. BEST SELLERS ─── */
function BestSellers({ productsList = [] }) {
  const isDark = useThemeStore((state) => state.theme) === 'dark';
  const list = productsList.slice(0, 8);

  if (list.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 transition-colors duration-300" style={{ background: isDark ? '#080A12' : '#F8FAFC' }}>
      <div className="container-shell mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-14">
        <FadeUpSection className="flex items-end justify-between mb-10">
          <div>
            <Label>Top Picks</Label>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              Best <span className="text-gradient-brand">Sellers</span>
            </h2>
          </div>
          <Link
            to="/products?sort=sales"
            className="hidden sm:flex items-center gap-1.5 text-sm font-bold transition-colors hover:text-purple-400"
            style={{ color: isDark ? '#94A3B8' : '#64748B' }}
          >
            View all best sellers <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeUpSection>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {list.map((p, i) => (
            <NeonCard key={p._id || p.id} product={p} delay={i * 0.04} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 5. FEATURED BANNER DROP ─── */
function FeatureBanner({ productsList = [] }) {
  const isDark = useThemeStore((state) => state.theme) === 'dark';
  const laptop = productsList.find(
    (p) =>
      p.name?.toLowerCase().includes('macbook') ||
      p.name?.toLowerCase().includes('laptop') ||
      p.category === 'electronics'
  ) || {
    _id: productsList[0]?._id,
    name: 'Apple MacBook Pro 16" (M3 Max 36GB / 1TB Space Black)',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&q=80',
    price: 285000,
  };

  const bannerImage = laptop.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&q=80';

  return (
    <section className="py-12 transition-colors duration-300" style={{ background: isDark ? '#080A12' : '#F8FAFC' }}>
      <div className="container-shell mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-14">
        <div
          className="relative rounded-3xl overflow-hidden grid lg:grid-cols-2 items-center"
          style={{
            background: isDark ? 'linear-gradient(135deg, #111522 0%, #171B2B 100%)' : 'linear-gradient(135deg, #EDE9FE 0%, #F1F5F9 100%)',
            border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
          }}
        >
          <div className="p-8 sm:p-12 lg:p-16 space-y-6">
            <Label color="#EC4899">Spotlight Deal</Label>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              Next-Gen Silicon & <br />
              <span className="text-gradient-brand">Pro Laptop Power.</span>
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              Unleash unprecedented workstation speed with Liquid Retina XDR displays, M3 Max extreme multithreading, and up to 22-hour battery life.
            </p>
            <div className="pt-2">
              <Link
                to={`/products/${laptop._id || laptop.id}`}
                className="btn-neon-primary inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold shadow-xl"
              >
                Claim Deal Now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <motion.div
            className="relative hidden lg:block overflow-hidden h-full min-h-[360px]"
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={bannerImage}
              alt={laptop.name}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── 6. NEW ARRIVALS ─── */
function NewArrivals({ productsList = [] }) {
  const isDark = useThemeStore((state) => state.theme) === 'dark';
  const list = productsList.slice(4, 12);

  if (list.length === 0) return null;

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
            <NeonCard key={p._id || p.id} product={p} delay={i * 0.04} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 7. TRUST STRIP ─── */
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

/* ─── 8. NEWSLETTER ─── */
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
  const [dbProducts, setDbProducts] = useState([]);
  const [activePromotions, setActivePromotions] = useState([]);
  const [superDealProducts, setSuperDealProducts] = useState([]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch(`${API_URL}/api/user/products?limit=20`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            setDbProducts(json.data);
          }
        }
      } catch (err) {
        // silently fail — sections will hide themselves when empty
      }
    }

    async function loadPromotions() {
      try {
        const res = await fetch(`${API_URL}/api/user/promotions`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            const now = Date.now();
            const valid = json.data.filter((p) => p.endDate && new Date(p.endDate).getTime() > now);
            setActivePromotions(valid);
          } else {
            setActivePromotions([]);
          }
          // Fallback: products marked isSuperDeal when no promotion has linked products
          if (json.superDealProducts && json.superDealProducts.length > 0) {
            setSuperDealProducts(json.superDealProducts);
          }
        }
      } catch (err) {
        // silently fail — Deals section will hide when no promotions
      }
    }

    loadProducts();
    loadPromotions();
  }, []);

  return (
    <div>
      <Ticker />
      {/* 1. Hero Section (fade in + slide up + 3D floating cards) */}
      <Hero productsList={dbProducts} />
      <TrustStrip />
      {/* 2. Categories (fade in + slide up) */}
      <Categories />
      {/* 3. Flash Deals — only shown when admin has active promotions */}
      <Deals promotionsList={activePromotions} superDealProducts={superDealProducts} />
      {/* 4. Best Sellers (fade in + slide up) */}
      <BestSellers productsList={dbProducts} />
      {/* 5. Featured Banner Drop (fade in + slide up) */}
      <FeatureBanner productsList={dbProducts} />
      {/* 6. New Arrivals (fade in + slide up) */}
      <NewArrivals productsList={dbProducts} />
      {/* 7. Newsletter (fade in + slide up) */}
      <Newsletter />
    </div>
  );
}
