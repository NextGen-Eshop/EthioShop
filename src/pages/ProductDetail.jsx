import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { getProductById, products, categories } from '../data/products';

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
  const { id } = useParams();
  const navigate = useNavigate();
  const product = getProductById(id);
  const { toggle, isWished } = useWishlistStore();
  const addItemToCart = useCartStore((state) => state.addItem);
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'privileged';

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
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

  if (!product) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Product Not Found</h1>
        <Link to="/products" className="text-indigo-600 font-semibold underline">Back to Products</Link>
      </div>
    );
  }

  const colors = colorPalettes[product.category] || colorPalettes.default;
  const categoryName = categories.find((c) => c.id === product.category)?.name || product.category;
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    addItemToCart(product, quantity, colors[selectedColor].name);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div>
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12 py-8">
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link to="/home" className="hover:text-gray-600 transition-colors">Home</Link>
          <ChevronRight />
          <Link to="/products" className="hover:text-gray-600 transition-colors">Products</Link>
          <ChevronRight />
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          <div>
            <div className="relative overflow-hidden rounded-2xl bg-gray-50 mb-4">
              <img src={product.images[activeImage]} alt={product.name} className="w-full aspect-square object-cover" />
              {product.badge && <span className="absolute top-4 left-4 px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md">{product.badge}</span>}
              {discount > 0 && <span className="absolute top-4 right-4 px-2.5 py-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-md">-{discount}%</span>}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((src, i) => (
                <button key={i} onClick={() => setActiveImage(i)} className={`overflow-hidden rounded-xl border-2 transition-all ${activeImage === i ? 'border-indigo-500' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                  <img src={src} alt="" className="w-full aspect-square object-cover rounded-lg" loading="lazy" />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[10px] font-semibold text-indigo-600 tracking-widest uppercase">{categoryName}</span>
              <span className="text-gray-200">|</span>
              <div className="flex items-center gap-1">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => <StarIcon key={i} filled={i < Math.floor(product.rating)} />)}
                </div>
                <span className="text-xs text-gray-500 ml-1">{product.rating} ({product.reviews} reviews)</span>
              </div>
            </div>

            <div className="flex items-start justify-between gap-3">
              <h1 className="text-lg sm:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
              <button onClick={() => toggle(product)} className="shrink-0 p-2 rounded-xl border border-gray-200 hover:bg-red-50 transition-all">
                <HeartIcon filled={saved} />
              </button>
            </div>

            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">ETB {product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <>
                  <span className="text-sm sm:text-base text-gray-400 line-through">ETB {product.originalPrice.toLocaleString()}</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full">-{discount}%</span>
                </>
              )}
            </div>

            <p className="text-sm text-gray-500 leading-relaxed mt-5">{product.description}</p>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-3"><p className="text-sm font-semibold text-gray-900">Color</p><p className="text-sm text-indigo-600 font-medium">{colors[selectedColor].name}</p></div>
              <div className="flex flex-wrap gap-2">
                {colors.map((color, i) => (
                  <button key={i} onClick={() => setSelectedColor(i)} title={color.name} className={`relative w-8 h-8 rounded-full transition-all focus:outline-none ${selectedColor === i ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-105'}`} style={{ backgroundColor: color.hex }}>
                    {selectedColor === i && <span className={`absolute inset-0 flex items-center justify-center rounded-full ${color.dark ? 'text-gray-700' : 'text-white'}`}><CheckIcon /></span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              {product.stock === 0 ? (
                <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-wider bg-red-50 p-2 rounded-lg border border-red-100 w-max">
                  <span className="material-symbols-outlined text-[14px]">error</span> Out of Stock
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-wider bg-green-50 p-2 rounded-lg border border-green-100 w-max">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> {product.stock} Units Available
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl overflow-hidden w-full sm:w-auto justify-between sm:justify-start">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2.5 text-gray-500 hover:bg-gray-50 transition-colors"><MinusIcon /></button>
                  <span className="w-10 text-center text-xs font-bold text-gray-900">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-2.5 text-gray-500 hover:bg-gray-50 transition-colors"><PlusIcon /></button>
                </div>
                <p className="text-xs text-gray-400">Total: <span className="font-bold text-gray-900">ETB {(product.price * quantity).toLocaleString()}</span></p>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`w-full py-3.5 text-xs font-bold rounded-xl transition-all shadow-xl active:scale-[0.99] flex items-center justify-center gap-2 text-white ${addedToCart ? 'bg-green-500' : product.stock === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
              >
                {addedToCart ? <><CheckIcon /> Added</> : product.stock === 0 ? 'Out of Stock' : <><CartIcon /> Add to Cart</>}
              </button>

              <button disabled={product.stock === 0} className="w-full py-3.5 text-sm font-bold text-indigo-600 border-2 border-indigo-600 rounded-xl hover:bg-indigo-50 transition-all opacity-100 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed">
                Buy Now
              </button>

              {isAdmin && (
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
                    Admin Controls
                  </p>
                  <Link to="/admin/products" className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]">
                    <span className="material-symbols-outlined text-[18px]">edit</span> Edit This Product
                  </Link>
                </div>
              )}
          </div>
        </div>
      </div>

      <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Related Products</h2>
              <p className="text-sm text-gray-500 mt-1">Customers who viewed this also liked these items.</p>
            </div>
            <Link to="/products" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">View All Products</Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {related.map((p) => {
              const pDiscount = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
              return (
                <Link key={p.id} to={`/products/${p.id}`} onClick={() => window.scrollTo(0, 0)} className="group bg-white rounded-2xl border border-gray-100 p-2 sm:p-4 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all hover:-translate-y-1">
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3 relative">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {pDiscount > 0 && <span className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-lg shadow-sm">-{pDiscount}%</span>}
                  </div>
                  <div className="px-1">
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{p.name}</h3>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-sm font-black text-indigo-600">ETB {p.price.toLocaleString()}</span>
                      {p.originalPrice && <span className="text-[10px] text-gray-400 line-through">ETB {p.originalPrice.toLocaleString()}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
