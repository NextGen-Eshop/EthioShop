import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlistStore } from '../store/wishlistStore';
import { products, categories, getFeaturedProducts } from '../data/products';

const StarIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const TruckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
  </svg>
);

const HeadphonesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0118 0v6" /><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
  </svg>
);

// Framer motion variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

function ProductCard({ product }) {
  const { toggle, isWished } = useWishlistStore();
  const wished = isWished(product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div variants={fadeInUp} className="h-full flex">
      <Link
        to={`/products/${product.id}`}
        id={`product-card-${product.id}`}
        className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-100/50 hover:border-indigo-200 transition-all duration-300 flex flex-col w-full"
      >
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-50 aspect-square">
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {product.badge && (
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md z-10">
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="absolute top-3 right-3 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-md z-10">
              -{discount}%
            </span>
          )}
          {/* Wishlist button */}
          <button
            onClick={(e) => { e.preventDefault(); toggle(product); }}
            className={`absolute bottom-3 right-3 z-20 p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 ${
              wished ? 'bg-red-500 text-white shadow-md' : 'bg-white/80 text-gray-500 hover:bg-red-50 hover:text-red-500'
            }`}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>
          {/* Quick action overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1 bg-white">
          <p className="text-[10px] font-semibold text-indigo-600 tracking-widest uppercase mb-1">
            {categories.find((c) => c.id === product.category)?.name || product.category}
          </p>
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} filled={i < Math.floor(product.rating)} />
              ))}
            </div>
            <span className="text-[11px] text-gray-400 ml-1">({product.reviews})</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-lg font-bold text-gray-900">
              ETB {product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                ETB {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Famous & Expensive Products Carousel Component
function PremiumCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Sort by price descending to get the most premium products
  const premiumProducts = [...products]
    .sort((a, b) => b.price - a.price)
    .slice(0, 4);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % premiumProducts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [premiumProducts.length]);

  return (
    <section className="bg-indigo-950 py-16 lg:py-20 overflow-hidden relative">
      {/* Dynamic Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent" 
        />
        <div className="absolute right-0 bottom-0 w-1/2 h-1/2 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-transparent to-transparent" />
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-[10px] font-semibold text-indigo-400 tracking-widest uppercase mb-3 flex items-center gap-2"
            >
              <span className="w-8 h-[1px] bg-indigo-400"></span>
              The Prestige Collection
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight"
            >
              Famous & Exclusive
            </motion.h2>
          </div>
          
          {/* Custom Navigation */}
          <div className="flex gap-3">
            <button 
              onClick={() => setCurrentIndex((prev) => (prev === 0 ? premiumProducts.length - 1 : prev - 1))}
              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all duration-300"
            >
              <ArrowRight className="rotate-180" />
            </button>
            <button 
              onClick={() => setCurrentIndex((prev) => (prev + 1) % premiumProducts.length)}
              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all duration-300"
            >
              <ArrowRight />
            </button>
          </div>
        </div>

        <div className="relative min-h-[400px] md:min-h-[500px] lg:min-h-[550px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 1.05, x: -50 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 w-full"
            >
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 h-full items-center">
                {/* Image */}
                <Link to={`/products/${premiumProducts[currentIndex].id}`} className="relative h-full w-full rounded-3xl overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/80 via-transparent to-transparent z-10" />
                  <img 
                    src={premiumProducts[currentIndex].image} 
                    alt={premiumProducts[currentIndex].name}
                    className="w-full h-[350px] md:h-[500px] lg:h-[550px] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
                    <span className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest rounded-full">
                      Premium
                    </span>
                  </div>
                </Link>

                {/* Content */}
                <div className="flex flex-col justify-center text-white py-8 lg:py-0">
                  <h3 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
                    {premiumProducts[currentIndex].name}
                  </h3>
                  <p className="text-lg text-slate-300 mb-8 max-w-lg leading-relaxed">
                    {premiumProducts[currentIndex].description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-8 mb-10 pb-10 border-b border-white/10">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Price</p>
                      <p className="text-3xl font-bold text-white">ETB {premiumProducts[currentIndex].price.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Rating</p>
                      <div className="flex items-center gap-2">
                        <StarIcon filled={true} />
                        <span className="text-xl font-bold">{premiumProducts[currentIndex].rating}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/products/${premiumProducts[currentIndex].id}`}
                    className="inline-flex items-center gap-4 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-semibold transition-all group w-max"
                  >
                    Discover Detail
                    <span className="bg-white/20 p-1.5 rounded-lg group-hover:translate-x-1 transition-transform">
                      <ArrowRight />
                    </span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const featured = getFeaturedProducts().slice(0, 4);
  const allProducts = products.slice(0, 8);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      variants={staggerContainer}
    >
      {/* ═══════════ SWAPPING PREMIUM COLLECTION (Moved to Top) ═══════════ */}
      <PremiumCarousel />

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-96 h-96 bg-white/30 rounded-full blur-3xl mix-blend-overlay" />
          <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-purple-400/30 rounded-full blur-3xl mix-blend-overlay" />
        </div>

        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12 py-16 sm:py-24 lg:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left copy */}
            <motion.div variants={fadeInUp} className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-xs font-semibold mb-8 shadow-xl shadow-indigo-900/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Free Shipping on Orders Over ETB 2,000
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
                Discover{' '}
                <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white">
                  Premium
                </span>
                <br />
                Products
              </h1>
              
              <p className="text-base sm:text-lg text-indigo-100/90 leading-relaxed max-w-lg mx-auto lg:mx-0 mb-10 font-medium">
                Curated collections of electronics, fashion, and lifestyle products delivered to your door across Ethiopia.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link
                  to="/products"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-700 font-bold text-sm rounded-xl hover:bg-indigo-50 hover:scale-105 active:scale-[0.98] transition-all shadow-xl shadow-indigo-900/30"
                >
                  Shop Now <ArrowRight />
                </Link>
                <a
                  href="#categories"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold text-sm rounded-xl hover:bg-white/20 border border-white/20 transition-all"
                >
                  Explore Categories
                </a>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center lg:justify-start gap-10 mt-12 pt-10 border-t border-white/10">
                {[
                  { value: '10K+', label: 'Products' },
                  { value: '50K+', label: 'Customers' },
                  { value: '4.9/5', label: 'Rating' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center lg:text-left">
                    <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-[11px] text-indigo-200 tracking-widest uppercase mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right - Featured product showcase */}
            <motion.div variants={fadeInUp} className="hidden lg:block relative">
              <div className="relative">
                <div className="absolute -inset-8 bg-gradient-to-tr from-white/5 to-white/10 rounded-[40px] backdrop-blur-sm border border-white/10 transform rotate-3" />
                <div className="relative grid grid-cols-2 gap-4">
                  {featured.slice(0, 4).map((product, i) => (
                    <Link
                      to={`/products/${product.id}`}
                      key={product.id}
                      className={`group bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden border border-white/20 shadow-2xl hover:bg-white/20 transition-all duration-500 ${
                        i === 0 ? 'row-span-2' : ''
                      }`}
                    >
                      <div className="relative w-full h-full overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className={`w-full object-cover group-hover:scale-110 transition-transform duration-700 ${
                            i === 0 ? 'h-full min-h-[400px]' : 'aspect-square'
                          }`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ TRUST BADGES ═══════════ */}
      <section className="bg-white border-b border-gray-100 relative z-20 shadow-sm">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12 py-8">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8"
          >
            {[
              { icon: <TruckIcon />, title: 'Free Delivery', desc: 'On orders over ETB 2,000' },
              { icon: <ShieldIcon />, title: 'Secure Payment', desc: '100% protected checkout' },
              { icon: <RefreshIcon />, title: 'Easy Returns', desc: '30-day return policy' },
              { icon: <HeadphonesIcon />, title: '24/7 Support', desc: 'Dedicated help center' },
            ].map((badge) => (
              <motion.div variants={fadeInUp} key={badge.title} className="flex items-center gap-4 group cursor-pointer">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  {badge.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{badge.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{badge.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Premium Collection moved to top */}

      {/* ═══════════ CATEGORIES ═══════════ */}
      <section id="categories" className="bg-gray-50 py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <p className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase mb-3 flex items-center gap-2">
                <span className="w-8 h-[2px] bg-indigo-600"></span>
                Browse
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Shop by Category</h2>
            </div>
            <Link to="/products" className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors group">
              View All <span className="group-hover:translate-x-1 transition-transform"><ArrowRight /></span>
            </Link>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6"
          >
            {categories.map((cat) => (
              <motion.div variants={fadeInUp} key={cat.id}>
                <Link
                  to={`/products?category=${cat.id}`}
                  className="group flex flex-col items-center gap-4 p-6 sm:p-8 bg-white rounded-3xl border border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 h-full"
                >
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50/50 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
                    {cat.icon}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-900 mb-1">{cat.name}</p>
                    <p className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{cat.count} items</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ NEW ARRIVALS ═══════════ */}
      <section className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <p className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase mb-3 flex items-center gap-2">
                <span className="w-8 h-[2px] bg-indigo-600"></span>
                Fresh Drops
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">New Arrivals</h2>
            </div>
            <Link to="/products?sort=newest" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors group">
              View All <span className="group-hover:translate-x-1 transition-transform"><ArrowRight /></span>
            </Link>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
          >
            {allProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ NEWSLETTER ═══════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-950" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=80')] bg-cover bg-center opacity-10" />
        
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12 py-24 lg:py-32 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center bg-white/10 backdrop-blur-xl border border-white/10 p-8 sm:p-12 rounded-[40px] shadow-2xl"
          >
            <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-300 mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">Join Our Inner Circle</h2>
            <p className="text-base text-indigo-200 mb-8 max-w-lg mx-auto">Get exclusive early access to new collections, secret sales, and premium styling advice delivered straight to your inbox.</p>
            
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-5 py-4 text-sm font-medium bg-white/5 border border-white/20 text-white rounded-xl outline-none focus:border-indigo-400 focus:bg-white/10 transition-all placeholder-white/40"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-white text-indigo-950 text-sm font-bold rounded-xl hover:bg-indigo-50 transition-all active:scale-[0.98] shadow-xl"
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
