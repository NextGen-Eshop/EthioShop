import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { products, categories } from '../data/products';
import ProductSkeletonGrid from '../components/ProductSkeleton';
import PageTransition from '../components/PageTransition';
import toast from 'react-hot-toast';

const StarIcon = ({ filled }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);
const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
);
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);

const sortOptions = [
  { value: 'featured', label: 'Featured', icon: '⭐' },
  { value: 'newest', label: 'New Arrivals', icon: '🆕' },
  { value: 'price-low', label: 'Price: Low → High', icon: '↑' },
  { value: 'price-high', label: 'Price: High → Low', icon: '↓' },
  { value: 'rating', label: 'Highest Rated', icon: '🏆' },
  { value: 'discount', label: 'Biggest Discount', icon: '%' },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};
const staggerGrid = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

function ProductCard({ product, viewMode }) {
  const { toggle, isWished } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);
  const wished = isWished(product.id);
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const catName = categories.find((c) => c.id === product.category)?.name || product.category;
  const isSoldOut = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 5;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut) return;
    addItem(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  if (viewMode === 'list') {
    return (
      <motion.div variants={fadeInUp} layout>
        <Link to={`/products/${product.id}`}
          className={`group flex bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-indigo-100/40 hover:border-indigo-100 transition-all duration-300 ${isSoldOut ? 'opacity-70' : ''}`}>
          <div className="relative w-40 sm:w-56 shrink-0 overflow-hidden bg-gray-50">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            {product.badge && <span className="absolute top-3 left-3 px-2.5 py-1 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">{product.badge}</span>}
            {isSoldOut && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><span className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-full uppercase tracking-wider">Sold Out</span></div>}
          </div>
          <div className="flex-1 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-semibold text-indigo-600 tracking-widest uppercase">{catName}</span>
                {isLowStock && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Low Stock</span>}
              </div>
              <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2 leading-snug">{product.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{product.description}</p>
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-400">{[...Array(5)].map((_, i) => <StarIcon key={i} filled={i < Math.floor(product.rating)} />)}</div>
                <span className="text-xs text-gray-500 font-medium">{product.rating}</span>
                <span className="text-xs text-gray-400">({product.reviews})</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-gray-900">ETB {product.price.toLocaleString()}</span>
                {product.originalPrice && (<><span className="text-sm text-gray-400 line-through">ETB {product.originalPrice.toLocaleString()}</span><span className="px-2 py-0.5 bg-green-100 text-green-700 text-[11px] font-bold rounded-full">-{discount}%</span></>)}
              </div>
              <button onClick={handleAddToCart} disabled={isSoldOut} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${isSoldOut ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'}`}>
                {isSoldOut ? 'Sold Out' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Grid card
  return (
    <motion.div variants={fadeInUp} layout className="h-full flex">
      <Link to={`/products/${product.id}`} id={`product-${product.id}`}
        className={`group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-100/50 hover:border-indigo-200 transition-all duration-300 flex flex-col w-full ${isSoldOut ? 'opacity-80' : ''}`}>
        <div className="relative overflow-hidden bg-gray-50 aspect-square">
          <motion.img whileHover={{ scale: 1.06 }} transition={{ duration: 0.4 }} src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
          {product.badge && <span className="absolute top-3 left-3 px-2.5 py-1 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md z-10">{product.badge}</span>}
          {discount > 0 && !isSoldOut && <span className="absolute top-3 right-3 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-md z-10">-{discount}%</span>}
          {isLowStock && <span className="absolute top-3 right-3 px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-full shadow-md z-10">Low Stock</span>}
          
          {/* Sold Out Overlay */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-20">
              <span className="px-5 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg">Sold Out</span>
            </div>
          )}

          {/* Wishlist btn */}
          <button onClick={(e) => { e.preventDefault(); toggle(product); }}
            className={`absolute bottom-3 right-3 z-20 p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 ${wished ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-500 hover:bg-red-50 hover:text-red-500'}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
          </button>

          {/* Add to Cart hover overlay */}
          {!isSoldOut && (
            <div className="absolute bottom-3 left-3 right-12 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-10">
              <button onClick={handleAddToCart} className="w-full bg-indigo-600/95 backdrop-blur-sm text-white text-xs font-bold text-center py-2.5 rounded-xl shadow-lg hover:bg-indigo-700 transition-colors active:scale-95">
                Add to Cart
              </button>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1">
          <p className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase mb-1.5">{catName}</p>
          <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 mb-2.5 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
          <div className="flex items-center gap-1 mb-3">
            <div className="flex text-amber-400">{[...Array(5)].map((_, i) => <StarIcon key={i} filled={i < Math.floor(product.rating)} />)}</div>
            <span className="text-[11px] text-gray-500 font-medium ml-1">{product.rating}</span>
            <span className="text-[11px] text-gray-400">({product.reviews})</span>
          </div>
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-base font-extrabold text-gray-900">ETB {product.price.toLocaleString()}</span>
            {product.originalPrice && <span className="text-xs text-gray-400 line-through">ETB {product.originalPrice.toLocaleString()}</span>}
          </div>
          {isLowStock && <p className="text-[10px] text-amber-600 font-semibold mt-1.5">Only {product.stock} left!</p>}
          {isSoldOut && <p className="text-[10px] text-red-500 font-semibold mt-1.5">Out of stock</p>}
        </div>
      </Link>
    </motion.div>
  );
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [sortOpen, setSortOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const selectedCategory = searchParams.get('category') || 'all';
  const sortBy = searchParams.get('sort') || 'featured';
  const searchQuery = searchParams.get('q') || '';

  // Simulate loading
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [selectedCategory, sortBy, searchQuery]);

  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all' && value !== 'featured') { params.set(key, value); } else { params.delete(key); }
    setSearchParams(params);
  };

  const currentSort = sortOptions.find((o) => o.value === sortBy) || sortOptions[0];

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (selectedCategory !== 'all') result = result.filter((p) => p.category === selectedCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || (categories.find((c) => c.id === p.category)?.name || '').toLowerCase().includes(q));
    }
    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'newest': result.sort((a, b) => b.id - a.id); break;
      case 'discount': result.sort((a, b) => { const dA = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) : 0; const dB = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) : 0; return dB - dA; }); break;
      default: break;
    }
    return result;
  }, [selectedCategory, sortBy, searchQuery]);

  const clearAll = () => setSearchParams({});
  const hasFilters = selectedCategory !== 'all' || sortBy !== 'featured' || searchQuery;

  return (
    <PageTransition>
      <div>
        {/* Page Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12 py-12">
            <nav className="flex items-center gap-2 text-xs text-indigo-200 mb-5">
              <Link to="/home" className="hover:text-white transition-colors">Home</Link><ChevronRight />
              <span className="text-white font-medium">{selectedCategory !== 'all' ? categories.find((c) => c.id === selectedCategory)?.name : 'All Products'}</span>
            </nav>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{selectedCategory !== 'all' ? categories.find((c) => c.id === selectedCategory)?.name : 'All Products'}</h1>
                <p className="text-indigo-200 text-sm mt-2">{searchQuery ? `Search results for "${searchQuery}" — ` : ''}<span className="font-semibold text-white">{filteredProducts.length}</span> products found</p>
              </div>
              {hasFilters && (
                <button onClick={clearAll} className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold rounded-xl hover:bg-white/20 transition-all"><XIcon /> Clear all filters</button>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12 py-8">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full sm:w-auto hide-scrollbar">
              <button onClick={() => setFilter('category', 'all')} className={`shrink-0 px-4 py-2 text-xs font-bold rounded-full border-2 transition-all ${selectedCategory === 'all' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'}`}>All</button>
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setFilter('category', cat.id)} className={`shrink-0 px-4 py-2 text-xs font-bold rounded-full border-2 transition-all flex items-center gap-1.5 ${selectedCategory === cat.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'}`}>
                  <span>{cat.icon}</span> {cat.name}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
              <div className="relative">
                <button onClick={() => setSortOpen(!sortOpen)} className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 hover:border-indigo-300 rounded-xl text-xs font-bold text-gray-700 transition-all min-w-[160px] justify-between">
                  <span className="flex items-center gap-1.5"><span>{currentSort.icon}</span> {currentSort.label}</span>
                  <motion.span animate={{ rotate: sortOpen ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown /></motion.span>
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl shadow-gray-200/80 border border-gray-100 overflow-hidden z-30">
                      {sortOptions.map((opt) => (
                        <button key={opt.value} onClick={() => { setFilter('sort', opt.value); setSortOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left ${sortBy === opt.value ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}>
                          <span className="w-6 text-center text-base">{opt.icon}</span>{opt.label}
                          {sortBy === opt.value && <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setViewMode('grid')} className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-600'}`} aria-label="Grid view"><GridIcon /></button>
                <button onClick={() => setViewMode('list')} className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-600'}`} aria-label="List view"><ListIcon /></button>
              </div>
            </div>
          </div>

          {/* Active filters */}
          {(searchQuery || selectedCategory !== 'all') && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                  🔍 "{searchQuery}"
                  <button onClick={() => { const p = new URLSearchParams(searchParams); p.delete('q'); setSearchParams(p); }} className="hover:text-indigo-900"><XIcon /></button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                  {categories.find((c) => c.id === selectedCategory)?.icon} {categories.find((c) => c.id === selectedCategory)?.name}
                  <button onClick={() => setFilter('category', 'all')} className="hover:text-indigo-900"><XIcon /></button>
                </span>
              )}
            </div>
          )}

          {/* Product Grid / List */}
          {loading ? (
            <ProductSkeletonGrid count={8} />
          ) : (
            <AnimatePresence mode="wait">
              {filteredProducts.length > 0 ? (
                <motion.div key={`${selectedCategory}-${sortBy}-${searchQuery}-${viewMode}`} variants={staggerGrid} initial="hidden" animate="visible" exit={{ opacity: 0 }}
                  className={viewMode === 'grid' ? 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6' : 'flex flex-col gap-4'}>
                  {filteredProducts.map((product) => <ProductCard key={product.id} product={product} viewMode={viewMode} />)}
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-24">
                  <div className="w-24 h-24 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-6 text-4xl">🔍</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                  <p className="text-sm text-gray-400 mb-8 max-w-xs mx-auto">Try adjusting your search terms or browse a different category.</p>
                  <button onClick={clearAll} className="px-8 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">Clear All Filters</button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
