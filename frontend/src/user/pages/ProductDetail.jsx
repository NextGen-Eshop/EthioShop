import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Heart, ShoppingCart, Truck, Shield, RotateCcw,
  Check, Minus, Plus, ChevronRight, Zap, ArrowLeft
} from 'lucide-react';
import { useWishlistStore } from '../../store/wishlistStore';
import { getProductById, products, categories } from '../../data/products';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useThemeStore } from '../../store/themeStore';

const reviews = [
  {
    initials: 'AT',
    name: 'Abeba Tesfaye',
    role: 'Verified Buyer',
    when: '2 weeks ago',
    rating: 5,
    text: 'Amazing quality! Exactly as described and the shipping was faster than expected. Highly recommend this product.',
  },
  {
    initials: 'DH',
    name: 'Daniel Haile',
    role: 'Verified Buyer',
    when: '1 month ago',
    rating: 4,
    text: 'Great value for the price. Build quality is excellent and it looks even better in person. Minor packaging issue but product was perfect.',
  },
  {
    initials: 'SK',
    name: 'Sara Kebede',
    role: 'Verified Buyer',
    when: '2 months ago',
    rating: 5,
    text: 'This is my second purchase from EthioShop and they never disappoint. Premium quality with great customer service.',
  },
];

export default function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const product = getProductById(id);
  const { toggle, isWished } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const addItem = useCartStore((state) => state.addItem);
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [actionError, setActionError] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [selectedColor, setSelectedColor] = useState(0);

  const saved = product ? isWished(product.id) : false;

  const colorPalettes = {
    electronics: [
      { name: 'Midnight Black', hex: '#1a1a1a' },
      { name: 'Space Gray', hex: '#6b7280' },
      { name: 'Arctic White', hex: '#f3f4f6', dark: true },
      { name: 'Indigo Blue', hex: '#4f46e5' },
    ],
    fashion: [
      { name: 'Classic Black', hex: '#111827' },
      { name: 'Navy Blue', hex: '#1e3a5f' },
      { name: 'Olive Green', hex: '#3d4f2e' },
      { name: 'Camel Brown', hex: '#b08850' },
    ],
    default: [
      { name: 'Classic Black', hex: '#1a1a1a' },
      { name: 'Snow White', hex: '#f9fafb', dark: true },
      { name: 'Ocean Blue', hex: '#0ea5e9' },
    ],
  };
  const colors = (product && colorPalettes[product.category]) || colorPalettes.default;

  if (!product) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12 py-24 text-center">
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl"
          style={{ background: isDark ? '#111522' : '#FFFFFF', border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}
        >
          😕
        </div>
        <h1 className="text-2xl font-black mb-3" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
          Product Not Found
        </h1>
        <p className="text-sm mb-8 max-w-xs mx-auto" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
          The product you are looking for does not exist or has been removed.
        </p>
        <Link to="/products" className="btn-neon-primary px-8 py-3.5 text-sm inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Catalog
        </Link>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const categoryName = categories.find((c) => c.id === product.category)?.name || product.category;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/products/${product.id}`)}&intent=cart`);
      return;
    }
    if (quantity > product.stock) {
      setActionError('Selected quantity is greater than available stock.');
      return;
    }
    addItem(product, quantity);
    setAddedToCart(true);
    setActionError('');
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent('/checkout')}&intent=buy`);
      return;
    }
    addItem(product, quantity);
    navigate('/checkout');
  };

  return (
    <div style={{ background: isDark ? '#080A12' : '#F8FAFC', minHeight: '100vh' }} className="transition-colors duration-300">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs mb-8 flex-wrap" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
          <Link to="/home" className="transition-colors hover:text-purple-400">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/products" className="transition-colors hover:text-purple-400">Products</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to={`/products?category=${product.category}`} className="transition-colors hover:text-purple-400">
            {categoryName}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold truncate max-w-[160px] sm:max-w-none" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            {product.name}
          </span>
        </nav>

        {/* ═══════════ PRODUCT MAIN ═══════════ */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start"
        >
          {/* ── Gallery ── */}
          <div>
            <div
              className="relative overflow-hidden rounded-3xl mb-4 group p-2 shadow-2xl transition-all"
              style={{
                background: isDark ? '#111522' : '#FFFFFF',
                border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                boxShadow: isDark ? '0 0 35px rgba(139,92,246,0.15)' : '0 10px 40px rgba(0,0,0,0.06)',
              }}
            >
              <div className="relative overflow-hidden rounded-2xl aspect-square" style={{ background: isDark ? '#171B2B' : '#F1F5F9' }}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    src={product.images ? product.images[activeImage] : product.image}
                    alt={product.name}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                  />
                </AnimatePresence>

                {product.badge && (
                  <motion.span
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    className="absolute top-4 left-4 px-3.5 py-1.5 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg"
                    style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', boxShadow: '0 4px 15px rgba(139,92,246,0.5)' }}
                  >
                    {product.badge}
                  </motion.span>
                )}
                {discount > 0 && (
                  <span className="absolute top-4 right-4 px-3 py-1.5 text-white text-[10px] font-bold rounded-full badge-sale shadow-lg">
                    -{discount}%
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {product.images.map((src, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setActiveImage(i)}
                    className="overflow-hidden rounded-2xl border-2 transition-all cursor-pointer p-1"
                    style={{
                      borderColor: activeImage === i ? '#8B5CF6' : (isDark ? '#252A3A' : '#E2E8F0'),
                      background: isDark ? '#111522' : '#FFFFFF',
                      boxShadow: activeImage === i ? '0 0 15px rgba(139,92,246,0.35)' : 'none',
                    }}
                  >
                    <img
                      src={src}
                      alt={`${product.name} view ${i + 1}`}
                      className="w-full aspect-square object-cover rounded-xl"
                      loading="lazy"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ── */}
          <div
            className="p-6 sm:p-8 rounded-3xl transition-all"
            style={{
              background: isDark ? '#111522' : '#FFFFFF',
              border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
              boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.04)',
            }}
          >
            {/* Category & Rating */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: '#8B5CF6' }}>
                {categoryName}
              </span>
              <span style={{ color: isDark ? '#252A3A' : '#CBD5E1' }}>|</span>
              <div className="flex items-center gap-1" style={{ color: '#F97316' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
                ))}
                <span className="text-xs ml-1 font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>
            </div>

            {/* Title & Save */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                {product.name}
              </h1>
              <motion.button
                whileHover={{ scale: 1.15, rotate: 6 }}
                whileTap={{ scale: 0.8 }}
                onClick={() => toggle(product)}
                aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
                className="shrink-0 p-3 rounded-2xl border transition-all cursor-pointer shadow-md"
                style={{
                  background: saved ? 'rgba(236,72,153,0.15)' : (isDark ? '#171B2B' : '#F1F5F9'),
                  borderColor: saved ? '#EC4899' : (isDark ? '#252A3A' : '#E2E8F0'),
                  color: saved ? '#EC4899' : (isDark ? '#94A3B8' : '#64748B'),
                  boxShadow: saved ? '0 0 15px rgba(236,72,153,0.4)' : 'none',
                }}
              >
                <Heart className="h-5 w-5" fill={saved ? '#EC4899' : 'none'} />
              </motion.button>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-3xl sm:text-4xl font-black text-gradient-brand">
                ETB {product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-base line-through" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
                    ETB {product.originalPrice.toLocaleString()}
                  </span>
                  <span className="badge-sale">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-sm leading-relaxed mt-5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              {product.description}
            </p>

            {/* ── Color Selection ── */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Color</p>
                <p className="text-xs font-bold" style={{ color: '#8B5CF6' }}>{colors[selectedColor]?.name}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {colors.map((color, i) => (
                  <motion.button
                    key={color.name}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setSelectedColor(i)}
                    className="relative w-9 h-9 rounded-full transition-all focus:outline-none cursor-pointer shadow-md"
                    style={{
                      backgroundColor: color.hex,
                      outline: selectedColor === i ? '2.5px solid #8B5CF6' : 'none',
                      outlineOffset: '2px',
                    }}
                  >
                    {selectedColor === i && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Check className={`h-4 w-4 ${color.dark ? 'text-gray-800' : 'text-white'}`} />
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Stock State */}
            <div className="mt-5">
              {product.stock > 5 ? (
                <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold">
                  <Check className="h-4 w-4" />
                  <span>In Stock — Ready for Nationwide Dispatch</span>
                </div>
              ) : product.stock > 0 ? (
                <div className="flex items-center gap-2 text-amber-500 text-xs font-bold">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                  <span>Only {product.stock} left in stock — Order soon</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-rose-500 text-xs font-bold">
                  <span>Out of Stock</span>
                </div>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="mt-6 space-y-3.5">
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center rounded-2xl overflow-hidden"
                  style={{
                    background: isDark ? '#171B2B' : '#F1F5F9',
                    border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                  }}
                >
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3.5 transition-colors cursor-pointer"
                    style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </motion.button>
                  <span className="w-12 text-center text-sm font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                    {quantity}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-3.5 transition-colors cursor-pointer"
                    style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </motion.button>
                </div>

                <p className="text-sm font-medium" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  Total: <span className="font-black text-base text-gradient-brand">ETB {(product.price * quantity).toLocaleString()}</span>
                </p>
              </div>

              {/* Add to Cart */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="btn-neon-primary w-full flex items-center justify-center gap-2.5 py-4 text-sm font-bold shadow-xl cursor-pointer"
                style={{
                  background: addedToCart ? '#22C55E' : undefined,
                  boxShadow: addedToCart ? '0 0 20px rgba(34,197,94,0.5)' : undefined,
                }}
              >
                {addedToCart ? (
                  <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                    <Check className="h-4 w-4" /> Added to Cart!
                  </motion.span>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" /> Add to Cart
                  </>
                )}
              </motion.button>
              {actionError && <p className="text-xs text-rose-500 font-semibold">{actionError}</p>}

              {/* Buy now */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="btn-neon-secondary w-full py-3.5 text-sm font-bold cursor-pointer"
              >
                Instant Buy Now
              </motion.button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 mt-8 pt-6" style={{ borderTop: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>
              {[
                { icon: <Truck className="h-4 w-4" />, label: 'Free Delivery' },
                { icon: <Shield className="h-4 w-4" />, label: 'Chapa Protected' },
                { icon: <RotateCcw className="h-4 w-4" />, label: '30-Day Returns' },
              ].map((badge) => (
                <div key={badge.label} className="flex flex-col items-center gap-2 text-center">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-[#8B5CF6]"
                    style={{ background: isDark ? '#171B2B' : '#F1F5F9', border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}
                  >
                    {badge.icon}
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ═══════════ TABS SECTION ═══════════ */}
        <div className="mt-16 sm:mt-24">
          <div className="flex gap-2 relative" style={{ borderBottom: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-6 py-3.5 text-sm font-bold capitalize transition-colors relative cursor-pointer"
                style={{
                  color: activeTab === tab ? (isDark ? '#F8FAFC' : '#0F172A') : (isDark ? '#94A3B8' : '#64748B'),
                }}
              >
                {tab === 'reviews' ? `Reviews (${product.reviews})` : tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeProductTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg,#8B5CF6,#EC4899)', boxShadow: '0 0 10px rgba(139,92,246,0.6)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="py-8">
            {/* Description Tab */}
            {activeTab === 'description' && (
              <div
                className="p-6 sm:p-8 rounded-3xl max-w-3xl"
                style={{
                  background: isDark ? '#111522' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                }}
              >
                <p className="text-sm leading-relaxed mb-6" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{product.description}</p>
                <h3 className="text-sm font-black mb-3" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Key Highlights</h3>
                <ul className="space-y-2.5">
                  {(product.features || ['Premium Ethiopian Craftsmanship', 'Reliable nationwide express delivery', 'Official 1-Year Warranty']).map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white" style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)' }}>
                        <Check className="h-3 w-3" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === 'specifications' && (
              <div
                className="rounded-3xl max-w-lg overflow-hidden"
                style={{
                  background: isDark ? '#111522' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                }}
              >
                {(product.specs || [
                  { label: 'Category', value: categoryName },
                  { label: 'Warranty', value: '1 Year Brand Warranty' },
                  { label: 'Authenticity', value: '100% Genuine' },
                  { label: 'Delivery', value: 'Nationwide Express' },
                ]).map((spec, i) => (
                  <div
                    key={spec.label}
                    className="flex items-center justify-between px-6 py-4 text-sm"
                    style={{
                      background: i % 2 === 0 ? (isDark ? '#171B2B' : '#F8FAFC') : 'transparent',
                      borderBottom: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                    }}
                  >
                    <span style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{spec.label}</span>
                    <span className="font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="grid gap-4 max-w-2xl">
                {reviews.map((r) => (
                  <div
                    key={r.name}
                    className="p-5 rounded-2xl"
                    style={{
                      background: isDark ? '#111522' : '#FFFFFF',
                      border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white"
                          style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)' }}
                        >
                          {r.initials}
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{r.name}</p>
                          <p className="text-[10px]" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>{r.role} • {r.when}</p>
                        </div>
                      </div>
                      <div className="flex text-amber-400">
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed mt-2" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                      {r.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
