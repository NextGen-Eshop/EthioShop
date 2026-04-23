import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useWishlistStore } from '../store/wishlistStore';
import { products, categories, getFeaturedProducts } from '../data/products';
void motion;

/* ─── tiny reusable icons ─── */
const Arrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const Star = ({ half }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill={half ? 'url(#half)' : 'currentColor'} stroke="none">
    {half && <defs><linearGradient id="half"><stop offset="50%" stopColor="currentColor"/><stop offset="50%" stopColor="#e5e7eb"/></linearGradient></defs>}
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const Heart = ({ on }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);

/* ─── fade-up helper ─── */
function FadeUp({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── section label ─── */
function Label({ children }) {
  return (
    <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.18em] text-orange-500 uppercase">
      <span className="w-5 h-[2px] bg-orange-500 rounded-full" />
      {children}
    </span>
  );
}

/* ─── product card ─── */
function Card({ product }) {
  const { toggle, isWished } = useWishlistStore();
  const wished = isWished(product.id);
  const pct = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="group relative bg-white rounded-2xl overflow-hidden border border-stone-100 hover:border-stone-200 hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] transition-all duration-300"
    >
      {/* image */}
      <Link to={`/products/${product.id}`} className="block relative overflow-hidden bg-stone-50 aspect-[4/3]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
        {/* badges */}
        {product.badge && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-stone-900 text-white text-[9px] font-bold tracking-widest uppercase rounded-full">
            {product.badge}
          </span>
        )}
        {pct > 0 && (
          <span className="absolute top-3 right-10 px-2 py-1 bg-orange-500 text-white text-[9px] font-bold rounded-full">
            -{pct}%
          </span>
        )}
        {/* wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); toggle(product); }}
          className={`absolute top-3 right-3 p-1.5 rounded-full transition-all ${
            wished ? 'bg-red-500 text-white' : 'bg-white/80 text-stone-400 opacity-0 group-hover:opacity-100 hover:text-red-500'
          }`}
          aria-label="Wishlist"
        >
          <Heart on={wished} />
        </button>
      </Link>

      {/* info */}
      <div className="p-4">
        <p className="text-[9px] font-bold text-orange-500 tracking-widest uppercase mb-1">
          {categories.find(c => c.id === product.category)?.name}
        </p>
        <Link to={`/products/${product.id}`}>
          <h3 className="text-sm font-semibold text-stone-900 leading-snug line-clamp-2 mb-2 hover:text-orange-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-3 text-amber-400">
          {[...Array(5)].map((_, i) => (
            <Star key={i} half={i + 0.5 === product.rating} />
          ))}
          <span className="text-[10px] text-stone-400 ml-1">({product.reviews})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-base font-bold text-stone-900">ETB {product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-xs text-stone-400 line-through ml-2">ETB {product.originalPrice.toLocaleString()}</span>
            )}
          </div>
          <Link
            to={`/products/${product.id}`}
            className="p-2 rounded-xl bg-stone-100 text-stone-500 hover:bg-orange-500 hover:text-white transition-all"
          >
            <Arrow />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── hero ticker ─── */
const tickers = ['Free Delivery Over ETB 2,000', 'New Arrivals Every Week', 'Secure Chapa Payments', '30-Day Easy Returns', 'Trusted by 50K+ Customers'];

function Ticker() {
  return (
    <div className="overflow-hidden bg-stone-900 text-white py-2.5">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        className="flex gap-12 whitespace-nowrap"
      >
        {[...tickers, ...tickers].map((t, i) => (
          <span key={i} className="text-[11px] font-semibold tracking-widest uppercase flex items-center gap-3">
            <span className="w-1 h-1 rounded-full bg-orange-400 inline-block" />
            {t}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── hero ─── */
function Hero() {
  const featured = getFeaturedProducts().slice(0, 3);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % featured.length), 4500);
    return () => clearInterval(t);
  }, [featured.length]);

  return (
    <section className="relative bg-[#faf9f7] overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-14 pt-14 pb-0 lg:pt-20">
        <div className="grid lg:grid-cols-[1fr_480px] gap-10 lg:gap-16 items-end">

          {/* left copy */}
          <div className="pb-14 lg:pb-20">
            <FadeUp>
              <Label>EthioShop — Est. 2024</Label>
            </FadeUp>
            <FadeUp delay={0.08}>
              <h1 className="mt-5 text-[clamp(2.6rem,6vw,5.5rem)] font-black leading-[1.02] tracking-tight text-stone-900">
                Shop What<br />
                <span className="relative inline-block">
                  <span className="relative z-10">Matters</span>
                  <span className="absolute bottom-1 left-0 right-0 h-3 bg-orange-400/30 -z-0 rounded" />
                </span>
                {' '}Most.
              </h1>
            </FadeUp>
            <FadeUp delay={0.14}>
              <p className="mt-5 text-base text-stone-500 leading-relaxed max-w-md">
                Curated electronics, fashion, and lifestyle products — delivered across Ethiopia with care.
              </p>
            </FadeUp>
            <FadeUp delay={0.2} className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-stone-900 text-white text-sm font-bold rounded-xl hover:bg-orange-500 transition-all duration-300 shadow-lg shadow-stone-900/20 active:scale-[0.98]"
              >
                Browse All <Arrow />
              </Link>
              <a
                href="#categories"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-stone-700 text-sm font-semibold rounded-xl border border-stone-200 hover:border-stone-400 transition-all"
              >
                Categories
              </a>
            </FadeUp>

            {/* stats row */}
            <FadeUp delay={0.28} className="mt-12 flex gap-8 pt-8 border-t border-stone-200">
              {[['10K+', 'Products'], ['50K+', 'Customers'], ['4.9★', 'Rating']].map(([v, l]) => (
                <div key={l}>
                  <p className="text-2xl font-black text-stone-900">{v}</p>
                  <p className="text-[10px] text-stone-400 tracking-widest uppercase mt-0.5">{l}</p>
                </div>
              ))}
            </FadeUp>
          </div>

          {/* right — stacked product showcase */}
          <div className="hidden lg:block relative self-end">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <Link to={`/products/${featured[active].id}`}>
                  <div className="relative rounded-t-3xl overflow-hidden bg-stone-100 aspect-[3/4]">
                    <img
                      src={featured[active].image}
                      alt={featured[active].name}
                      className="w-full h-full object-cover"
                    />
                    {/* floating price tag */}
                    <div className="absolute bottom-5 left-5 right-5 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl">
                      <p className="text-[9px] font-bold text-orange-500 tracking-widest uppercase mb-1">
                        {categories.find(c => c.id === featured[active].category)?.name}
                      </p>
                      <p className="text-sm font-bold text-stone-900 line-clamp-1">{featured[active].name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-base font-black text-stone-900">ETB {featured[active].price.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-lg">
                          {featured[active].badge}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </AnimatePresence>

            {/* dot nav */}
            <div className="flex justify-center gap-2 mt-4 pb-4">
              {featured.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`rounded-full transition-all duration-300 ${i === active ? 'w-6 h-2 bg-stone-900' : 'w-2 h-2 bg-stone-300'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── trust strip ─── */
function TrustStrip() {
  const items = [
    { icon: '🚚', title: 'Free Delivery', sub: 'Orders over ETB 2,000' },
    { icon: '🔒', title: 'Secure Checkout', sub: 'Chapa & card protected' },
    { icon: '↩️', title: '30-Day Returns', sub: 'Hassle-free policy' },
    { icon: '🎧', title: '24/7 Support', sub: 'Always here for you' },
  ];
  return (
    <div className="bg-white border-y border-stone-100">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-14 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map(({ icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3 group">
              <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>
              <div>
                <p className="text-sm font-bold text-stone-900">{title}</p>
                <p className="text-xs text-stone-400">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── categories ─── */
function Categories() {
  return (
    <section id="categories" className="bg-[#faf9f7] py-20 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-14">
        <FadeUp className="flex items-end justify-between mb-10">
          <div>
            <Label>Explore</Label>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">Shop by Category</h2>
          </div>
          <Link to="/products" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-stone-500 hover:text-orange-500 transition-colors group">
            All <span className="group-hover:translate-x-1 transition-transform"><Arrow /></span>
          </Link>
        </FadeUp>

        {/* asymmetric grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat, i) => (
            <FadeUp key={cat.id} delay={i * 0.05}>
              <Link
                to={`/products?category=${cat.id}`}
                className={`group flex flex-col items-center justify-center gap-3 rounded-2xl border border-stone-100 bg-white p-6 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-50 transition-all duration-300 ${i === 0 ? 'lg:col-span-2 lg:flex-row lg:justify-start lg:gap-5 lg:px-8' : ''}`}
              >
                <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                <div className={i === 0 ? 'text-left' : 'text-center'}>
                  <p className="text-sm font-bold text-stone-900">{cat.name}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{cat.count} items</p>
                </div>
              </Link>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── featured banner ─── */
function FeatureBanner() {
  const top = [...products].sort((a, b) => b.price - a.price)[0];
  return (
    <section className="bg-stone-900 overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-14 py-16 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-0 items-stretch">
          {/* copy */}
          <div className="flex flex-col justify-center py-16 lg:py-20 lg:pr-16">
            <FadeUp>
              <Label>Featured Drop</Label>
              <h2 className="mt-4 text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
                {top.name}
              </h2>
              <p className="mt-4 text-stone-400 text-base leading-relaxed max-w-md">
                {top.description}
              </p>
              <div className="mt-8 flex items-center gap-6">
                <div>
                  <p className="text-[10px] text-stone-500 uppercase tracking-widest">Price</p>
                  <p className="text-3xl font-black text-white mt-1">ETB {top.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-stone-500 uppercase tracking-widest">Rating</p>
                  <p className="text-3xl font-black text-white mt-1">{top.rating}★</p>
                </div>
              </div>
              <Link
                to={`/products/${top.id}`}
                className="mt-8 inline-flex items-center gap-3 px-7 py-3.5 bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold rounded-xl transition-all w-max shadow-lg shadow-orange-500/30 active:scale-[0.98]"
              >
                View Product <Arrow />
              </Link>
            </FadeUp>
          </div>

          {/* image — bleeds to edge */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/20 to-transparent z-10" />
            <img
              src={top.image}
              alt={top.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── new arrivals ─── */
function NewArrivals() {
  const list = products.slice(0, 8);
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-14">
        <FadeUp className="flex items-end justify-between mb-10">
          <div>
            <Label>Fresh Drops</Label>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">New Arrivals</h2>
          </div>
          <Link to="/products?sort=newest" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-stone-500 hover:text-orange-500 transition-colors group">
            See all <span className="group-hover:translate-x-1 transition-transform"><Arrow /></span>
          </Link>
        </FadeUp>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {list.map((p, i) => (
            <FadeUp key={p.id} delay={i * 0.04}>
              <Card product={p} />
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── deals row ─── */
function Deals() {
  const deals = products.filter(p => p.originalPrice).slice(0, 4);
  return (
    <section className="bg-[#faf9f7] py-20 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-14">
        <FadeUp className="flex items-end justify-between mb-10">
          <div>
            <Label>Limited Time</Label>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">Today's Deals</h2>
          </div>
          <Link to="/products?sort=discount" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-stone-500 hover:text-orange-500 transition-colors group">
            All deals <span className="group-hover:translate-x-1 transition-transform"><Arrow /></span>
          </Link>
        </FadeUp>

        {/* horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-5 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible scrollbar-hide">
          {deals.map((p, i) => (
            <div key={p.id} className="min-w-[260px] lg:min-w-0">
              <FadeUp delay={i * 0.06}>
                <Card product={p} />
              </FadeUp>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── newsletter ─── */
function Newsletter() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (email) { setSent(true); setEmail(''); }
  };

  return (
    <section className="bg-stone-900 py-20 lg:py-28 relative overflow-hidden">
      {/* decorative circle */}
      <div className="absolute -right-32 -top-32 w-[500px] h-[500px] rounded-full border border-white/5 pointer-events-none" />
      <div className="absolute -right-16 -top-16 w-[300px] h-[300px] rounded-full border border-white/5 pointer-events-none" />

      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-14">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <FadeUp>
            <Label>Stay in the loop</Label>
            <h2 className="mt-4 text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
              Get Early Access<br />to New Drops.
            </h2>
            <p className="mt-4 text-stone-400 text-base leading-relaxed max-w-sm">
              Join 50,000+ shoppers who get exclusive deals, new arrivals, and styling tips before anyone else.
            </p>
          </FadeUp>

          <FadeUp delay={0.1}>
            {sent ? (
              <div className="flex flex-col items-start gap-3">
                <span className="text-4xl">🎉</span>
                <p className="text-xl font-bold text-white">You're in!</p>
                <p className="text-stone-400 text-sm">Check your inbox for a welcome gift.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-5 py-4 bg-white/5 border border-white/10 text-white text-sm rounded-xl outline-none focus:border-orange-400 focus:bg-white/10 transition-all placeholder-stone-500"
                />
                <button
                  type="submit"
                  className="px-7 py-4 bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] whitespace-nowrap shadow-lg shadow-orange-500/20"
                >
                  Subscribe
                </button>
              </form>
            )}
            <p className="mt-3 text-[11px] text-stone-600">No spam. Unsubscribe anytime.</p>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

/* ─── page ─── */
export default function Home() {
  return (
    <div>
      <Ticker />
      <Hero />
      <TrustStrip />
      <Categories />
      <FeatureBanner />
      <NewArrivals />
      <Deals />
      <Newsletter />
    </div>
  );
}
