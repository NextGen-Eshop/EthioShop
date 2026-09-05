import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  Check,
  Minus,
  Plus,
  ChevronRight,
  Zap,
  ArrowLeft,
  Sparkles,
  Play,
  Share2,
  CheckCircle2,
  MessageSquarePlus,
  Send
} from 'lucide-react';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import { useAuthPromptStore } from '../../store/authPromptStore';
import { useCartStore } from '../../store/cartStore';
import { useThemeStore } from '../../store/themeStore';
import { ModernProductCard } from './Home';
import { getProductById as getFallbackProduct } from '../../data/products';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const verifiedReviews = [
  {
    initials: 'AT',
    name: 'Abeba Tesfaye',
    role: 'Verified Buyer',
    when: '2 weeks ago',
    rating: 5,
    text: 'Amazing build quality! Exactly as described and the shipping was fast. Highly recommend this for anyone looking for authentic quality.',
  },
  {
    initials: 'DH',
    name: 'Daniel Haile',
    role: 'Verified Buyer',
    when: '1 month ago',
    rating: 5,
    text: 'Great value for the price in Ethiopia. Packaging was pristine and customer service was very responsive.',
  },
  {
    initials: 'SK',
    name: 'Sara Kebede',
    role: 'Verified Buyer',
    when: '2 months ago',
    rating: 4,
    text: 'This is my second purchase from EthioShop and they consistently deliver authentic products on time.',
  },
];

const colorPalettes = {
  electronics: [
    { name: 'Titanium Black', hex: '#1e1e1e' },
    { name: 'Space Gray', hex: '#64748b' },
    { name: 'Natural Titanium', hex: '#d1d5db' },
    { name: 'Deep Blue', hex: '#1e3a8a' },
  ],
  fashion: [
    { name: 'Traditional White', hex: '#f8fafc' },
    { name: 'Midnight Black', hex: '#0f172a' },
    { name: 'Golden Thread', hex: '#d97706' },
    { name: 'Olive Green', hex: '#3f6212' },
  ],
  default: [
    { name: 'Classic Black', hex: '#18181b' },
    { name: 'Silver Slate', hex: '#94a3b8' },
    { name: 'Royal Gold', hex: '#eab308' },
  ],
};

export default function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toggle, isWished } = useWishlistStore();
  const { isAuthenticated, user } = useAuthStore();
  const { openAuthPrompt } = useAuthPromptStore();
  const userRole = (user?.role || '').toLowerCase().trim();
  const addItem = useCartStore((state) => state.addItem);
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description'); // 'description' | 'specs' | 'reviews'

  // Review submission
  const [customReviews, setCustomReviews] = useState(verifiedReviews);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const [prodRes, relRes] = await Promise.all([
          fetch(`${API_URL}/api/user/products/${id}`),
          fetch(`${API_URL}/api/user/products/${id}/related`),
        ]);

        if (prodRes.ok) {
          const json = await prodRes.json();
          if (json.data) {
            setProduct(json.data);
          } else {
            setProduct(getFallbackProduct(id));
          }
        } else {
          setProduct(getFallbackProduct(id));
        }

        if (relRes.ok) {
          const relJson = await relRes.json();
          setRelatedProducts(relJson.data || []);
        }
      } catch (err) {
        setProduct(getFallbackProduct(id));
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProduct();
      window.scrollTo(0, 0);
    }
  }, [id]);

  // Restore pending action if user just logged in
  useEffect(() => {
    if (isAuthenticated && userRole === 'user' && product) {
      try {
        const pending = sessionStorage.getItem('ethioshop_pending_action');
        if (pending) {
          const action = JSON.parse(pending);
          sessionStorage.removeItem('ethioshop_pending_action');
          if (action.type === 'cart' && action.product) {
            addItem(action.product, action.quantity || 1);
            setAddedToCart(true);
            setTimeout(() => setAddedToCart(false), 2000);
          } else if (action.type === 'favorite' && action.product) {
            toggle(action.product);
          } else if (action.type === 'buyNow' && action.product) {
            addItem(action.product, action.quantity || 1);
            navigate('/checkout');
          }
        }
      } catch (err) {
        console.error('Failed to restore pending action:', err);
      }
    }
  }, [isAuthenticated, userRole, product, addItem, toggle, navigate]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-24 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-purple-500 border-t-transparent mx-auto mb-4" />
        <p className="text-sm font-bold text-slate-400">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl bg-purple-500/10">
          🛍️
        </div>
        <h1 className="text-2xl font-black mb-3" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
          Product Not Found
        </h1>
        <p className="text-xs sm:text-sm mb-6 max-w-sm mx-auto text-slate-400">
          The requested product could not be found or has been discontinued.
        </p>
        <Link to="/products" className="btn-neon-primary px-6 py-3 text-xs inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Catalog
        </Link>
      </div>
    );
  }

  const prodId = product._id || product.id;
  const saved = isWished(prodId);
  const colors = colorPalettes[product.category] || colorPalettes.default;

  const discountPct = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : (product.discountPercentage || 0);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      openAuthPrompt({
        message: 'Please login or signup to proceed',
        redirectUrl: window.location.pathname + window.location.search,
        pendingAction: {
          type: 'cart',
          product: {
            id: prodId,
            _id: prodId,
            name: product.name,
            image: product.image || product.imageUrl,
            price: product.price,
          },
          quantity,
        },
      });
      return;
    }
    if (userRole !== 'user') {
      openAuthPrompt({
        message: 'Shopping cart is reserved for customer accounts only.',
        redirectUrl: userRole === 'admin' ? '/admin/overview' : '/staff/overview',
      });
      return;
    }

    addItem(
      {
        id: prodId,
        _id: prodId,
        name: product.name,
        image: product.image || product.imageUrl,
        price: product.price,
      },
      quantity
    );
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      openAuthPrompt({
        message: 'Please login or signup to proceed',
        redirectUrl: '/checkout',
        pendingAction: {
          type: 'buyNow',
          product: {
            id: prodId,
            _id: prodId,
            name: product.name,
            image: product.image || product.imageUrl,
            price: product.price,
          },
          quantity,
        },
      });
      return;
    }
    if (userRole !== 'user') {
      openAuthPrompt({
        message: 'Purchasing products is reserved for customer accounts only.',
        redirectUrl: userRole === 'admin' ? '/admin/overview' : '/staff/overview',
      });
      return;
    }

    addItem(
      {
        id: prodId,
        _id: prodId,
        name: product.name,
        image: product.image || product.imageUrl,
        price: product.price,
      },
      quantity
    );
    navigate('/checkout');
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      openAuthPrompt({
        message: 'Please login or signup to proceed',
        redirectUrl: window.location.pathname + window.location.search,
        pendingAction: {
          type: 'favorite',
          product: {
            id: prodId,
            name: product.name,
            image: product.image || product.imageUrl,
            price: product.price,
          },
        },
      });
      return;
    }
    if (userRole !== 'user') {
      openAuthPrompt({
        message: 'Favorites and wishlist are reserved for customer accounts only.',
        redirectUrl: userRole === 'admin' ? '/admin/overview' : '/staff/overview',
      });
      return;
    }
    toggle({ id: prodId, name: product.name, image: product.image, price: product.price });
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthPrompt({
        message: 'Please login or signup to proceed',
        redirectUrl: window.location.pathname + window.location.search,
      });
      return;
    }
    if (userRole !== 'user') {
      openAuthPrompt({
        message: 'Writing reviews is reserved for customer accounts only.',
        redirectUrl: userRole === 'admin' ? '/admin/overview' : '/staff/overview',
      });
      return;
    }
    if (!newReview.comment.trim()) return;

    const reviewObj = {
      initials: user?.firstName ? user.firstName.slice(0, 2).toUpperCase() : 'CU',
      name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Customer',
      role: 'Verified Customer',
      when: 'Just now',
      rating: newReview.rating,
      text: newReview.comment.trim(),
    };

    setCustomReviews([reviewObj, ...customReviews]);
    setNewReview({ rating: 5, comment: '' });
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 2500);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* ── BREADCRUMB ── */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <Link to="/home" className="hover:text-purple-400">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/products" className="hover:text-purple-400">Products</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="capitalize">{product.category}</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate max-w-[220px]" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
          {product.name}
        </span>
      </div>

      {/* ── TOP SHOWCASE (IMAGE & PURCHASE ACTIONS) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Media Display */}
        <div className="lg:col-span-6 space-y-4">
          <div
            className="aspect-[4/3] rounded-3xl overflow-hidden relative shadow-2xl"
            style={{
              background: isDark ? '#111522' : '#F1F5F9',
              border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
            }}
          >
            <img
              src={product.image || product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="eager"
            />

            {/* Badges */}
            {product.badge && (
              <span className="absolute top-4 left-4 px-3.5 py-1 text-xs font-black uppercase rounded-full text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
                {product.badge}
              </span>
            )}
            {discountPct > 0 && (
              <span className="absolute top-4 right-4 px-3 py-1 text-xs font-black rounded-full text-white bg-rose-500 shadow-lg">
                -{discountPct}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Right Info & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-amber-400 text-xs font-black">
                <Star className="h-4 w-4 fill-amber-400" />
                <span>{product.rating || 4.9}</span>
                <span className="text-slate-400 font-normal">
                  ({customReviews.length + (product.reviewsCount || 0)} reviews)
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              {product.name}
            </h1>
          </div>

          {/* Pricing Box */}
          <div
            className="p-5 rounded-2xl flex items-center justify-between"
            style={{
              background: isDark ? '#111522' : '#F8FAFC',
              border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
            }}
          >
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  ETB {Number(product.price).toLocaleString()}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-base line-through font-semibold text-slate-500">
                    ETB {Number(product.originalPrice).toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-500 font-bold mt-0.5">
                Inclusive of VAT • Escrow Protected
              </p>
            </div>

            <div className="text-right">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: (product.countInStock || product.stock || 1) > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                  color: (product.countInStock || product.stock || 1) > 0 ? '#10B981' : '#EF4444',
                }}
              >
                {(product.countInStock || product.stock || 1) > 0 ? `In Stock (${product.countInStock || product.stock || 10} units)` : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Color Switcher */}
          {colors && colors.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-400">Color / Finish</span>
                <span className="font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{colors[selectedColor]?.name}</span>
              </div>
              <div className="flex items-center gap-2.5">
                {colors.map((c, idx) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColor(idx)}
                    className="w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center"
                    style={{
                      backgroundColor: c.hex,
                      boxShadow: selectedColor === idx ? '0 0 0 3px #8B5CF6' : '0 0 0 1px rgba(255,255,255,0.2)',
                      transform: selectedColor === idx ? 'scale(1.15)' : 'scale(1)',
                    }}
                    title={c.name}
                  >
                    {selectedColor === idx && <Check className="h-3 w-3 text-white drop-shadow-md" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Counter & Add to Cart & Buy Now */}
          <div className="pt-2 space-y-3">
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
              <div
                className="flex items-center rounded-xl sm:rounded-2xl p-0.5 sm:p-1 shrink-0"
                style={{
                  background: isDark ? '#171B2B' : '#F1F5F9',
                  border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                }}
              >
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-purple-500/20 transition-all cursor-pointer"
                >
                  <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
                <span className="w-7 sm:w-8 text-center text-xs sm:text-sm font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-purple-500/20 transition-all cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                className="btn-neon-primary flex-1 py-2.5 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 shadow-xl cursor-pointer min-w-[110px]"
              >
                {addedToCart ? (
                  <>
                    <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-300" />
                    <span>Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleBuyNow}
                className="px-3.5 sm:px-6 py-2.5 sm:py-4 text-xs sm:text-sm font-black rounded-xl sm:rounded-2xl text-white flex items-center justify-center gap-1 sm:gap-1.5 shadow-xl cursor-pointer transition-all shrink-0"
                style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
              >
                <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-white" />
                <span>Buy Now</span>
              </motion.button>

              <button
                type="button"
                onClick={handleToggleWishlist}
                className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl transition-all cursor-pointer shrink-0"
                style={{
                  background: saved ? 'rgba(236,72,153,0.2)' : (isDark ? '#171B2B' : '#F1F5F9'),
                  border: `1px solid ${saved ? 'rgba(236,72,153,0.4)' : isDark ? '#252A3A' : '#E2E8F0'}`,
                  color: saved ? '#EC4899' : (isDark ? '#94A3B8' : '#64748B'),
                }}
              >
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" fill={saved ? '#EC4899' : 'none'} />
              </button>
            </div>
          </div>

          {/* 3 Guarantees Badges */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
            <div className="p-3 rounded-2xl text-center" style={{ background: isDark ? '#111522' : '#F8FAFC' }}>
              <Truck className="h-5 w-5 text-purple-400 mx-auto mb-1" />
              <p className="text-[11px] font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
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
              </p>
              <p className="text-[10px] text-slate-400">Available across Ethiopia</p>
            </div>
            <div className="p-3 rounded-2xl text-center" style={{ background: isDark ? '#111522' : '#F8FAFC' }}>
              <Shield className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
              <p className="text-[11px] font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>100% Genuine</p>
              <p className="text-[10px] text-slate-400">Verified Seller Goods</p>
            </div>
            <div className="p-3 rounded-2xl text-center" style={{ background: isDark ? '#111522' : '#F8FAFC' }}>
              <RotateCcw className="h-5 w-5 text-pink-400 mx-auto mb-1" />
              <p className="text-[11px] font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>7-Day Returns</p>
              <p className="text-[10px] text-slate-400">Hassle-free guarantee</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3 CORE TABS (DESCRIPTION, SPECIFICATIONS, REVIEWS) ── */}
      <div className="pt-8 border-t" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
        {/* Tab Headers */}
        <div className="flex items-center gap-3 border-b pb-3" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
          {[
            { id: 'description', label: '1. Description & Highlights' },
            { id: 'specs', label: '2. Specifications & Features' },
            { id: 'reviews', label: `3. Customer Reviews (${customReviews.length})` },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                style={{
                  background: active
                    ? 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
                    : isDark ? '#171B2B' : '#F1F5F9',
                  color: active ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Description */}
        {activeTab === 'description' && (
          <div className="py-6 space-y-4 max-w-3xl">
            <h3 className="text-base font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              Product Overview
            </h3>
            <p className="text-sm leading-relaxed text-slate-300">
              {product.description}
            </p>

            {product.features && product.features.length > 0 && (
              <div className="space-y-2 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Highlights</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {product.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs" style={{ color: isDark ? '#CBD5E1' : '#334155' }}>
                      <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Specifications */}
        {activeTab === 'specs' && (
          <div className="py-6 max-w-2xl">
            <h3 className="text-base font-black mb-4" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              Technical Specifications
            </h3>

            <div
              className="rounded-2xl border overflow-hidden text-xs"
              style={{
                background: isDark ? '#111522' : '#FFFFFF',
                borderColor: isDark ? '#252A3A' : '#E2E8F0',
              }}
            >
              {product.specs && product.specs.length > 0 ? (
                product.specs.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between p-3.5 border-b last:border-0"
                    style={{ borderColor: isDark ? '#252A3A' : '#F1F5F9' }}
                  >
                    <span className="font-bold text-slate-400">{s.label}</span>
                    <span className="font-semibold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{s.value}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex justify-between p-3.5 border-b" style={{ borderColor: isDark ? '#252A3A' : '#F1F5F9' }}>
                    <span className="font-bold text-slate-400">Category</span>
                    <span className="font-semibold capitalize" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{product.category}</span>
                  </div>
                  <div className="flex justify-between p-3.5 border-b" style={{ borderColor: isDark ? '#252A3A' : '#F1F5F9' }}>
                    <span className="font-bold text-slate-400">Authenticity</span>
                    <span className="font-semibold text-emerald-400">100% Genuine Verified</span>
                  </div>
                  <div className="flex justify-between p-3.5" style={{ borderColor: isDark ? '#252A3A' : '#F1F5F9' }}>
                    <span className="font-bold text-slate-400">Availability</span>
                    <span className="font-semibold">Nationwide Delivery</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Customer Reviews */}
        {activeTab === 'reviews' && (
          <div className="py-6 space-y-6 max-w-3xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                Customer Ratings & Feedback
              </h3>
              <span className="text-xs text-amber-400 font-black flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400" />
                <span>{product.rating || 4.9} out of 5</span>
              </span>
            </div>

            {/* Reviews List */}
            <div className="space-y-3">
              {customReviews.map((rev, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl space-y-2 border"
                  style={{
                    background: isDark ? '#111522' : '#FFFFFF',
                    borderColor: isDark ? '#252A3A' : '#E2E8F0',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center">
                        {rev.initials}
                      </div>
                      <div>
                        <p className="text-xs font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{rev.name}</p>
                        <p className="text-[10px] text-emerald-400 font-semibold">{rev.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className="h-3.5 w-3.5"
                          style={{
                            fill: s <= rev.rating ? '#F59E0B' : 'transparent',
                            color: s <= rev.rating ? '#F59E0B' : '#64748B',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{rev.text}</p>
                </div>
              ))}
            </div>

            {/* Submit Review Form */}
            <form
              onSubmit={handleAddReview}
              className="p-5 rounded-2xl space-y-3 border"
              style={{
                background: isDark ? '#171B2B' : '#F8FAFC',
                borderColor: isDark ? '#252A3A' : '#E2E8F0',
              }}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Write a Customer Review
              </h4>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Rating:</span>
                <select
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold"
                  style={{ background: isDark ? '#111522' : '#FFF', color: isDark ? '#FFF' : '#000' }}
                >
                  <option value={5}>5 Stars ★★★★★</option>
                  <option value={4}>4 Stars ★★★★☆</option>
                  <option value={3}>3 Stars ★★★☆☆</option>
                  <option value={2}>2 Stars ★★☆☆☆</option>
                  <option value={1}>1 Star ★☆☆☆☆</option>
                </select>
              </div>

              <textarea
                rows={2}
                placeholder="Share your feedback about this product..."
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium focus:outline-none"
                style={{
                  background: isDark ? '#111522' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#252A3A' : '#CBD5E1'}`,
                  color: isDark ? '#F8FAFC' : '#0F172A',
                }}
                required
              />

              <div className="flex items-center justify-between">
                {reviewSuccess && (
                  <span className="text-xs text-emerald-400 font-bold">Review submitted successfully!</span>
                )}
                <button
                  type="submit"
                  className="btn-neon-primary px-5 py-2 text-xs font-bold ml-auto flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Send className="h-3 w-3" />
                  <span>Submit Review</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ── RELATED PRODUCTS SECTION ── */}
      {relatedProducts.length > 0 && (
        <section className="pt-10 border-t" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
          <div className="mb-6">
            <span className="text-[11px] font-bold tracking-wider uppercase text-purple-400">Curated For You</span>
            <h2 className="text-2xl sm:text-3xl font-black mt-1" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              Related Products in this Collection
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5 lg:gap-6">
            {relatedProducts.map((rel, idx) => (
              <ModernProductCard key={rel._id || idx} product={rel} delay={idx * 0.08} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
