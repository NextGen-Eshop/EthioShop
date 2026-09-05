import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Star,
  ShoppingCart,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Sparkles,
  Zap,
  ArrowUpDown,
  Check,
  Percent
} from 'lucide-react';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { ModernProductCard } from './Home';
import { CATEGORIES } from '../../constants/categories';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const BASE_CATEGORIES = [
  { id: 'all', name: 'All Products', icon: '🛍️' },
  ...CATEGORIES.filter((c) => c.id !== 'all').map((c) => ({
    id: c.id,
    name: c.label,
    icon: c.icon,
  })),
];

export default function StorefrontProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // promotionMap: productId -> { discountValue, badge }
  const [promotionMap, setPromotionMap] = useState({});

  const { isAuthenticated, user } = useAuthStore();
  const addItem = useCartStore((state) => state.addItem);
  const toggle = useWishlistStore((state) => state.toggle);

  // Restore pending action (Cart / Wishlist / Buy Now) if user just logged in
  useEffect(() => {
    if (isAuthenticated && (user?.role || '').toLowerCase().trim() === 'user') {
      try {
        const pending = sessionStorage.getItem('ethioshop_pending_action');
        if (pending) {
          const action = JSON.parse(pending);
          sessionStorage.removeItem('ethioshop_pending_action');
          if (action.type === 'cart' && action.product) {
            addItem(action.product, action.quantity || 1);
          } else if (action.type === 'favorite' && action.product) {
            toggle(action.product);
          } else if (action.type === 'buyNow' && action.product) {
            addItem(action.product, action.quantity || 1);
            window.location.href = '/checkout';
          }
        }
      } catch (err) {
        console.error('Failed to restore pending action:', err);
      }
    }
  }, [isAuthenticated, user, addItem, toggle]);

  // Fetch active promotions to build the discount map
  useEffect(() => {
    async function loadPromotions() {
      try {
        const res = await fetch(`${API_URL}/api/user/promotions`);
        if (!res.ok) return;
        const json = await res.json();
        const map = {};
        const now = Date.now();

        (json.data || []).forEach((promo) => {
          // Exclude expired promotions
          if (promo.endDate && new Date(promo.endDate).getTime() <= now) return;
          (promo.products || []).forEach((p) => {
            const pid = typeof p === 'string' ? p : (p._id || p.id);
            if (!map[pid]) {
              map[pid] = { discountValue: promo.discountValue, badge: 'Discount' };
            }
          });
        });

        // Also cover active superDealProducts
        (json.superDealProducts || []).forEach((p) => {
          const pid = p._id || p.id;
          if (!map[pid] && p.isSuperDeal) {
            const pct = p.originalPrice && p.originalPrice > p.price
              ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
              : (p.discountPercentage || 0);
            if (pct > 0) map[pid] = { discountValue: pct, badge: 'Discount' };
          }
        });

        setPromotionMap(map);
      } catch (err) {
        // silent
      }
    }
    loadPromotions();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        let url = `${API_URL}/api/user/products?limit=100`;
        if (selectedCategory !== 'all') {
          url += `&category=${selectedCategory}`;
        }
        if (searchQuery.trim()) {
          url += `&keyword=${encodeURIComponent(searchQuery.trim())}`;
        }

        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          setProducts(json.data || []);
        }
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [selectedCategory, searchQuery]);

  // Merge discount badges onto products
  const enrichedProducts = useMemo(() => {
    return products.map((p) => {
      const pid = p._id || p.id;
      const promo = promotionMap[pid];
      if (promo) {
        const discountVal = Number(promo.discountValue) || 0;
        const origPrice = p.originalPrice && p.originalPrice > p.price
          ? p.originalPrice
          : (discountVal > 0 ? Math.round(p.price / (1 - discountVal / 100)) : p.price);
        return {
          ...p,
          badge: 'Discount',
          isSuperDeal: true,
          discountPercentage: discountVal,
          originalPrice: origPrice > p.price ? origPrice : (p.originalPrice || p.price),
        };
      }
      // When not under active discount, remove any stale discount badge
      const isStaleDiscountBadge = p.badge && (p.badge.toLowerCase().includes('discount') || p.badge.includes('%'));
      return {
        ...p,
        badge: isStaleDiscountBadge ? '' : p.badge,
        isSuperDeal: false,
      };
    });
  }, [products, promotionMap]);

  const sortedProducts = useMemo(() => {
    let list = [...enrichedProducts];

    if (sortBy === 'price-low') return list.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') return list.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sortBy === 'discount') return list.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
    return list;
  }, [enrichedProducts, sortBy]);

  return (
    <div className="mx-auto max-w-[1400px] px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* ── HEADER & SEARCH BAR ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-purple-400">
            Real Database Catalog
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mt-0.5 sm:mt-1" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            Products &amp; Collections
          </h1>
          <p className="text-xs sm:text-sm mt-0.5 sm:mt-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
            Showing {sortedProducts.length} verified products with video animations and live inventory.
          </p>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products, phones, clothes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium focus:outline-none transition-all"
              style={{
                background: isDark ? '#111522' : '#FFFFFF',
                border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                color: isDark ? '#F8FAFC' : '#0F172A',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── FILTER & SORT CONTROLS ── */}
      <div
        className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4"
        style={{
          background: isDark ? '#111522' : '#FFFFFF',
          border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
        }}
      >
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none w-full md:w-auto -mx-0.5 px-0.5">
          {BASE_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 sm:gap-1.5 shrink-0"
                style={{
                  background: active
                    ? 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
                    : isDark ? '#171B2B' : '#F1F5F9',
                  color: active ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B',
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown & View Mode Switcher */}
        <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0" style={{ borderColor: isDark ? '#1F2437' : '#F1F5F9' }}>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
            <ArrowUpDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>Sort:</span>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold focus:outline-none cursor-pointer"
            style={{
              background: isDark ? '#171B2B' : '#F1F5F9',
              border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
              color: isDark ? '#F8FAFC' : '#0F172A',
            }}
          >
            <option value="featured">Featured &amp; Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated (★)</option>
            <option value="discount">Biggest Discount (%)</option>
          </select>

          {/* View Mode Toggle (Grid / List) */}
          <div
            className="flex items-center p-0.5 sm:p-1 rounded-lg sm:rounded-xl ml-1"
            style={{
              background: isDark ? '#171B2B' : '#F1F5F9',
              border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 sm:p-1.5 rounded-md sm:rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 sm:p-1.5 rounded-md sm:rounded-lg transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List View"
              aria-label="List View"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── PRODUCTS GRID / LIST ── */}
      {loading ? (
        <div className={viewMode === 'grid'
          ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5 lg:gap-6"
          : "flex flex-col gap-3 sm:gap-4"
        }>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className={`${viewMode === 'grid' ? 'h-64 sm:h-80' : 'h-32 sm:h-44'} rounded-2xl sm:rounded-3xl animate-pulse`}
              style={{ background: isDark ? '#111522' : '#E2E8F0' }}
            />
          ))}
        </div>
      ) : sortedProducts.length === 0 ? (
        <div
          className="py-12 sm:py-20 text-center rounded-2xl sm:rounded-3xl px-4"
          style={{ background: isDark ? '#111522' : '#FFFFFF', border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}
        >
          <p className="text-base sm:text-lg font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            No products found matching your search.
          </p>
          <button
            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
            className="btn-neon-primary px-5 sm:px-6 py-2 sm:py-2.5 text-xs mt-3 sm:mt-4"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid'
          ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5 lg:gap-6"
          : "flex flex-col gap-3 sm:gap-4"
        }>
          {sortedProducts.map((prod, idx) => (
            <ModernProductCard key={prod._id || idx} product={prod} delay={idx * 0.04} viewMode={viewMode} />
          ))}
        </div>
      )}
    </div>
  );
}
