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
  Check
} from 'lucide-react';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';
import { useThemeStore } from '../../store/themeStore';
import { ModernProductCard } from './Home';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const categories = [
  { id: 'all', name: 'All Categories', icon: '✨' },
  { id: 'electronics', name: 'Electronics', icon: '⚡' },
  { id: 'fashion', name: 'Fashion', icon: '👗' },
  { id: 'home', name: 'Home & Living', icon: '🏠' },
  { id: 'beauty', name: 'Beauty', icon: '🌸' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'books', name: 'Books', icon: '📚' },
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

  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (sortBy === 'price-low') {
      return list.sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-high') {
      return list.sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'rating') {
      return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    if (sortBy === 'discount') {
      return list.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
    }
    return list;
  }, [products, sortBy]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ── HEADER & SEARCH BAR ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-purple-400">
            Real Database Catalog
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mt-1" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            Products & Collections
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
            Showing {sortedProducts.length} verified products with video animations and live inventory.
          </p>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products, phones, clothes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none transition-all"
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
        className="p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4"
        style={{
          background: isDark ? '#111522' : '#FFFFFF',
          border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
        }}
      >
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
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

        {/* Sort Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>Sort by:</span>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
            style={{
              background: isDark ? '#171B2B' : '#F1F5F9',
              border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
              color: isDark ? '#F8FAFC' : '#0F172A',
            }}
          >
            <option value="featured">Featured & Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated (★)</option>
            <option value="discount">Biggest Discount (%)</option>
          </select>
        </div>
      </div>

      {/* ── PRODUCTS GRID ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="h-80 rounded-3xl animate-pulse"
              style={{ background: isDark ? '#111522' : '#E2E8F0' }}
            />
          ))}
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="py-20 text-center rounded-3xl" style={{ background: isDark ? '#111522' : '#FFFFFF', border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>
          <p className="text-lg font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            No products found matching your search.
          </p>
          <button
            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
            className="btn-neon-primary px-6 py-2.5 text-xs mt-4"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedProducts.map((prod, idx) => (
            <ModernProductCard key={prod._id || idx} product={prod} delay={idx * 0.05} />
          ))}
        </div>
      )}
    </div>
  );
}
