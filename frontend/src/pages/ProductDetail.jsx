import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useWishlistStore } from '../store/wishlistStore';
import { getProductById, products, categories } from '../data/products';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

const StarIcon = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const HeartIcon = ({ filled }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={filled ? 'text-red-500' : ''}>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
  </svg>
);

const TruckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const MinusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const reviews = [
  {
    initials: 'AT',
    name: 'Abeba Tesfaye',
    role: 'Verified Buyer',
    when: '2 weeks ago',
    rating: 5,
    color: 'bg-indigo-100 text-indigo-700',
    text: 'Amazing quality! Exactly as described and the shipping was faster than expected. Highly recommend this product.',
  },
  {
    initials: 'DH',
    name: 'Daniel Haile',
    role: 'Verified Buyer',
    when: '1 month ago',
    rating: 4,
    color: 'bg-purple-100 text-purple-700',
    text: 'Great value for the price. Build quality is excellent and it looks even better in person. Minor packaging issue but product was perfect.',
  },
  {
    initials: 'SK',
    name: 'Sara Kebede',
    role: 'Verified Buyer',
    when: '2 months ago',
    rating: 5,
    color: 'bg-amber-100 text-amber-700',
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

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [actionError, setActionError] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [selectedColor, setSelectedColor] = useState(0);

  const saved = product ? isWished(product.id) : false;

  // Derive a set of colors per product (based on category)
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
      { name: 'Cream White', hex: '#faf3e0', dark: true },
    ],
    beauty: [
      { name: 'Natural', hex: '#e8c9a0', dark: true },
      { name: 'Rose Gold', hex: '#c9767c' },
      { name: 'Pearl', hex: '#f0ead6', dark: true },
      { name: 'Ruby Red', hex: '#9b2335' },
    ],
    'home-living': [
      { name: 'Walnut', hex: '#6b3d2e' },
      { name: 'White Oak', hex: '#d4b896', dark: true },
      { name: 'Matte Black', hex: '#1c1c1e' },
      { name: 'Sage', hex: '#8a9e7e' },
    ],
    sports: [
      { name: 'Black', hex: '#111827' },
      { name: 'Royal Blue', hex: '#1d4ed8' },
      { name: 'Fire Red', hex: '#dc2626' },
      { name: 'Volt Green', hex: '#84cc16', dark: true },
    ],
    default: [
      { name: 'Classic Black', hex: '#1a1a1a' },
      { name: 'Snow White', hex: '#f9fafb', dark: true },
      { name: 'Ocean Blue', hex: '#0ea5e9' },
      { name: 'Forest Green', hex: '#16a34a' },
    ],
  };
  const colors = colorPalettes[product.category] || colorPalettes.default;

  if (!product) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12 py-20 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6 text-3xl">
          😕
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Product Not Found</h1>
        <p className="text-sm text-gray-400 mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/products"
          className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const categoryName = categories.find((c) => c.id === product.category)?.name || product.category;

  // Related products (same category, exclude current)
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

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
    <div>
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link to="/home" className="hover:text-gray-600 transition-colors">Home</Link>
          <ChevronRight />
          <Link to="/products" className="hover:text-gray-600 transition-colors">Products</Link>
          <ChevronRight />
          <Link to={`/products?category=${product.category}`} className="hover:text-gray-600 transition-colors">{categoryName}</Link>
          <ChevronRight />
          <span className="text-gray-900 font-medium truncate max-w-[120px] sm:max-w-none">{product.name}</span>
        </nav>

        {/* ═══════════ PRODUCT MAIN ═══════════ */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* ── Gallery ── */}
          <div>
            {/* Main image */}
            <div className="relative overflow-hidden rounded-2xl bg-gray-50 mb-4">
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="w-full aspect-square object-cover transition-opacity duration-500"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md">
                  {product.badge}
                </span>
              )}
              {discount > 0 && (
                <span className="absolute top-4 right-4 px-2.5 py-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-md">
                  -{discount}%
                </span>
              )}
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-3 gap-3">
              {product.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`overflow-hidden rounded-xl border-2 transition-all ${
                    activeImage === i
                      ? 'border-indigo-500 shadow-md shadow-indigo-100'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={src}
                    alt={`${product.name} view ${i + 1}`}
                    className="w-full aspect-square object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* ── Product Info ── */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            {/* Category & Rating */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[10px] font-semibold text-indigo-600 tracking-widest uppercase">{categoryName}</span>
              <span className="text-gray-200">|</span>
              <div className="flex items-center gap-1">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} filled={i < Math.floor(product.rating)} />
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-1">{product.rating} ({product.reviews} reviews)</span>
              </div>
            </div>

            {/* Title & Save */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              <button
                onClick={() => toggle(product)}
                aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
                className="shrink-0 p-2.5 rounded-xl border border-gray-200 hover:border-red-200 hover:bg-red-50 transition-all"
              >
                <HeartIcon filled={saved} />
              </button>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-3xl font-bold text-gray-900">ETB {product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <>
                  <span className="text-base text-gray-400 line-through">ETB {product.originalPrice.toLocaleString()}</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[11px] font-semibold rounded-full">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-500 leading-relaxed mt-5">
              {product.description}
            </p>

            {/* ── Color Chooser ── */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-900">Color</p>
                <p className="text-sm text-indigo-600 font-medium">{colors[selectedColor].name}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {colors.map((color, i) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(i)}
                    title={color.name}
                    aria-label={`Select color ${color.name}`}
                    className={`relative w-9 h-9 rounded-full transition-all duration-200 focus:outline-none ${
                      selectedColor === i
                        ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {selectedColor === i && (
                      <span className={`absolute inset-0 flex items-center justify-center rounded-full ${
                        color.dark ? 'text-gray-700' : 'text-white'
                      }`}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                    {color.dark && (
                      <span className="absolute inset-0 rounded-full border border-gray-200" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5">
              {product.stock > 5 ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckIcon />
                  <span className="text-xs font-medium">In Stock — Ready to ship</span>
                </div>
              ) : product.stock > 0 ? (
                <div className="flex items-center gap-2 text-amber-600">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium">Only {product.stock} left — Order soon</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-500">
                  <span className="text-xs font-medium">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-4">
                {/* Quantity selector */}
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <MinusIcon />
                  </button>
                  <span className="w-12 text-center text-sm font-semibold text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <PlusIcon />
                  </button>
                </div>

                {/* Total */}
                <p className="text-sm text-gray-400">
                  Total: <span className="font-semibold text-gray-900">ETB {(product.price * quantity).toLocaleString()}</span>
                </p>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                id="add-to-cart"
                className={`w-full flex items-center justify-center gap-2 py-4 text-sm font-semibold rounded-xl transition-all active:scale-[0.99] cursor-pointer shadow-sm ${
                  addedToCart
                    ? 'bg-green-600 text-white shadow-green-200'
                    : product.stock === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                }`}
              >
                {addedToCart ? (
                  <>
                    <CheckIcon /> Added to Cart
                  </>
                ) : (
                  <>
                    <CartIcon /> Add to Cart
                  </>
                )}
              </button>
              {actionError && <p className="text-sm text-red-500">{actionError}</p>}

              {/* Buy now */}
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="w-full py-3.5 text-sm font-semibold text-indigo-600 border-2 border-indigo-600 rounded-xl hover:bg-indigo-50 transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Buy Now
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-gray-100">
              {[
                { icon: <TruckIcon />, label: 'Free Shipping' },
                { icon: <ShieldIcon />, label: 'Secure Payment' },
                { icon: <RefreshIcon />, label: '30-Day Returns' },
              ].map((badge) => (
                <div key={badge.label} className="flex flex-col items-center gap-2 text-center">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center">
                    {badge.icon}
                  </div>
                  <span className="text-[10px] font-medium text-gray-500">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════ TABS SECTION ═══════════ */}
        <div className="mt-16 sm:mt-24">
          <div className="flex border-b border-gray-200 gap-1">
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-6 py-3 text-sm font-medium capitalize transition-colors relative ${
                  activeTab === tab
                    ? 'text-indigo-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600 rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="py-8">
            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="max-w-2xl">
                <p className="text-sm text-gray-600 leading-relaxed mb-6">{product.description}</p>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <CheckIcon />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === 'specifications' && (
              <div className="max-w-md">
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  {product.specs.map((spec, i) => (
                    <div
                      key={spec.label}
                      className={`flex items-center justify-between px-5 py-3.5 text-sm ${
                        i % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      }`}
                    >
                      <span className="text-gray-500 font-medium">{spec.label}</span>
                      <span className="text-gray-900 font-semibold">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                {/* Rating summary */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} filled={i < Math.floor(product.rating)} />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{product.rating}</span>
                  <span className="text-sm text-gray-400">Based on {product.reviews} reviews</span>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {reviews.map((r) => (
                    <article key={r.name} className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6">
                      <div className="flex items-start justify-between">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${r.color}`}>
                          {r.initials}
                        </div>
                        <span className="text-[11px] text-gray-400">{r.when}</span>
                      </div>
                      <div className="flex text-amber-400 mt-3 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon key={i} filled={i < r.rating} />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed flex-1">"{r.text}"</p>
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                        <p className="text-[11px] text-gray-400">{r.role}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════ RELATED PRODUCTS ═══════════ */}
        {related.length > 0 && (
          <section className="mt-16 sm:mt-24 pb-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[10px] font-semibold text-indigo-600 tracking-widest uppercase mb-2">You May Also Like</p>
                <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
              </div>
              <Link
                to={`/products?category=${product.category}`}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                View All <ChevronRight />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p) => (
                <Link
                  to={`/products/${p.id}`}
                  key={p.id}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-indigo-100/40 hover:border-indigo-100 transition-all duration-300"
                >
                  <div className="overflow-hidden bg-gray-50 aspect-square">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-base font-bold text-gray-900 mt-2">ETB {p.price.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
