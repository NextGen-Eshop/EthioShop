import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/cartStore';
import { products, categories } from '../data/products';

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
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

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const ShoppingBagIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

export default function Cart() {
  const { items, removeItem, updateQuantity, promoCode, discountPercent, applyPromo, removePromo, getCartTotal } = useCartStore();
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState({ type: '', text: '' });
  
  const { subtotal, discountAmount, total } = getCartTotal();
  const shipping = subtotal > 2000 ? 0 : 150; // Free shipping over 2000 ETB
  const finalTotal = items.length > 0 ? total + shipping : 0;

  const hasStockErrors = items.some(item => item.stock === 0 || item.quantity > item.stock);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    
    const success = applyPromo(promoInput);
    if (success) {
      setPromoMessage({ type: 'success', text: `Promo code applied successfully!` });
      setPromoInput('');
    } else {
      setPromoMessage({ type: 'error', text: 'Invalid or expired promo code.' });
    }
    
    setTimeout(() => setPromoMessage({ type: '', text: '' }), 3000);
  };

  if (items.length === 0) {
    const popularPicks = products.slice(0, 4);
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="mx-auto max-w-[1400px] px-4 py-20">
          <div className="flex flex-col items-center justify-center text-center mb-20">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-indigo-500 mb-8 shadow-2xl shadow-indigo-100/50 border border-indigo-50"
            >
              <ShoppingBagIcon />
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">Your cart is empty</h1>
            <p className="text-sm text-gray-500 mb-10 max-w-sm leading-relaxed">Looks like you haven't added anything to your cart yet. Discover our premium collections and find something you love.</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-indigo-700 hover:-translate-y-1 transition-all shadow-xl shadow-indigo-200"
            >
              Start Shopping <ArrowRight />
            </Link>
          </div>

          <div className="border-t border-gray-200 pt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Popular Picks</h2>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Recommended for you</p>
              </div>
              <Link to="/products" className="text-xs font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest">View All</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
              {popularPicks.map((p) => {
                const discount = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
                return (
                  <Link key={p.id} to={`/products/${p.id}`} className="group bg-white rounded-3xl p-3 sm:p-5 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 transition-all hover:-translate-y-1">
                    <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4 relative">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      {discount > 0 && <span className="absolute top-3 right-3 px-2 py-1 bg-red-500 text-white text-[10px] font-black rounded-lg shadow-lg">-{discount}%</span>}
                    </div>
                    <div className="px-1">
                      <p className="text-[9px] font-black text-indigo-600 tracking-widest uppercase mb-1">{p.category}</p>
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{p.name}</h3>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-sm font-black text-gray-900">ETB {p.price.toLocaleString()}</span>
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

  return (
    <div className="bg-gray-50 min-h-screen py-4 sm:py-10 lg:py-16">
      <div className="mx-auto max-w-[1400px] px-3 sm:px-6 lg:px-12">
        {/* ── CHECKOUT STEPPER ── */}
        <div className="mb-10 max-w-2xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-indigo-100">1</div>
              <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Cart</span>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 text-gray-400 flex items-center justify-center text-xs font-black">2</div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Info</span>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 text-gray-400 flex items-center justify-center text-xs font-black">3</div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment</span>
            </div>
          </div>
        </div>

        <div className="mb-10 px-1 sm:px-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Your Cart</h1>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-1 uppercase tracking-widest font-black flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                {items.length} {items.length === 1 ? 'item' : 'items'} in your bag
              </p>
            </div>
            
            {/* Free Shipping Progress */}
            <div className="w-full sm:w-72 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Free Shipping</span>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tight">
                  {subtotal >= 2000 ? 'Unlocked!' : `ETB ${(2000 - subtotal).toLocaleString()} left`}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((subtotal / 2000) * 100, 100)}%` }}
                  className={`h-full transition-colors duration-500 ${subtotal >= 2000 ? 'bg-green-500' : 'bg-indigo-600'}`}
                />
              </div>
              <p className="text-[9px] text-gray-400 mt-2 font-medium">Free shipping on orders over ETB 2,000</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 sm:gap-10">
          {/* ── CART ITEMS LIST ── */}
          <div className="lg:col-span-8 flex flex-col gap-4 sm:gap-6">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={`${item.id}-${item.selectedColor}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 flex flex-col xs:flex-row gap-4 sm:gap-6 shadow-sm border border-gray-100/50 hover:shadow-xl hover:shadow-indigo-50/40 transition-all group relative"
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 xs:w-24 xs:h-24 sm:w-36 sm:h-36 shrink-0 rounded-xl sm:rounded-2xl overflow-hidden bg-gray-50 relative mx-auto xs:mx-0">
                    <img 
                      src={item.image || (item.images && item.images[0])} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[9px] sm:text-[10px] font-bold text-indigo-600 tracking-widest uppercase mb-0.5">
                          {item.category}
                        </p>
                        <Link to={`/products/${item.id}`} className="text-sm sm:text-lg font-bold text-gray-900 line-clamp-1 sm:line-clamp-2 hover:text-indigo-600 transition-colors leading-tight">
                          {item.name}
                        </Link>
                        {item.selectedColor && (
                          <div className="flex items-center gap-1.5 mt-1 sm:mt-2">
                            <span className="text-[10px] sm:text-xs text-gray-400 font-medium">Color:</span>
                            <span className="text-[10px] sm:text-xs font-semibold text-gray-700">{item.selectedColor}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs sm:text-lg font-extrabold text-gray-900 shrink-0">
                        ETB {item.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Stock Status */}
                    <div className="mt-2">
                      {item.stock === 0 ? (
                        <div className="flex items-center gap-1.5 text-red-600 bg-red-50 w-max px-2 py-0.5 rounded-md border border-red-100">
                          <span className="text-[10px] font-bold uppercase tracking-tight">Out of Stock</span>
                        </div>
                      ) : item.quantity > item.stock ? (
                        <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 w-max px-2 py-0.5 rounded-md border border-amber-100">
                          <span className="text-[10px] font-bold uppercase tracking-tight">Only {item.stock} left</span>
                        </div>
                      ) : item.stock <= 5 && (
                        <div className="flex items-center gap-1.5 text-amber-500 bg-amber-50 w-max px-2 py-0.5 rounded-md border border-amber-50">
                          <span className="text-[10px] font-bold uppercase tracking-tight">Low Stock: {item.stock}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 sm:mt-auto pt-4 border-t border-gray-50 flex items-center justify-between gap-4">
                      {/* Quantity Control */}
                      <div className="flex items-center bg-gray-50 border border-gray-100 rounded-lg sm:rounded-xl overflow-hidden shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedColor, item.quantity - 1)}
                          className="p-1.5 sm:p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <MinusIcon />
                        </button>
                        <span className="w-8 sm:w-10 text-center text-xs sm:text-sm font-bold text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedColor, item.quantity + 1)}
                          className="p-1.5 sm:p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <PlusIcon />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.id, item.selectedColor)}
                        className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-bold text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <TrashIcon />
                        <span className="hidden xs:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ── ORDER SUMMARY ── */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl shadow-indigo-100/30 border border-gray-100 sticky top-24">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Promo Code */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <form onSubmit={handleApplyPromo} className="flex flex-col xs:flex-row gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Promo code"
                    className="w-full xs:flex-1 px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium uppercase"
                  />
                  <button
                    type="submit"
                    className="w-full xs:w-auto px-4 py-2.5 sm:px-5 sm:py-3 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors active:scale-95 shadow-sm"
                  >
                    Apply
                  </button>
                </form>
                <AnimatePresence>
                  {promoMessage.text && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`text-[10px] mt-3 px-3 py-2 rounded-lg font-bold uppercase tracking-tight ${
                        promoMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {promoMessage.text}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Totals */}
              <div className="space-y-4 mb-6 text-xs sm:text-sm font-medium text-gray-500">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="text-gray-900 font-bold">ETB {subtotal.toLocaleString()}</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span>Discount ({discountPercent}%)</span>
                    <span className="font-bold">- ETB {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <span>Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-black bg-green-50 px-2 py-0.5 rounded text-[10px] uppercase">Free</span>
                  ) : (
                    <span className="text-gray-900 font-bold">ETB {shipping.toLocaleString()}</span>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm sm:text-base text-gray-900 font-black uppercase tracking-tight">Total</span>
                  <span className="text-xl sm:text-2xl font-black text-indigo-600">
                    ETB {finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button 
                disabled={hasStockErrors}
                className={`w-full flex items-center justify-center gap-2 py-4 px-6 font-black text-xs sm:text-sm uppercase tracking-widest rounded-xl transition-all shadow-xl group ${
                  hasStockErrors 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1 shadow-indigo-200/50'
                }`}
              >
                {hasStockErrors ? 'Invalid Stock' : 'Checkout Now'}
                {!hasStockErrors && (
                  <span className="group-hover:translate-x-1 transition-transform">
                    <ArrowRight />
                  </span>
                )}
              </button>
              
              <div className="mt-8 pt-8 border-t border-gray-100 space-y-5">
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 transition-transform group-hover:scale-110">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight">Secure Payment</p>
                    <p className="text-[10px] text-gray-500 font-medium">SSL Encrypted Checkout</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 transition-transform group-hover:scale-110">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight">Local Delivery</p>
                    <p className="text-[10px] text-gray-500 font-medium">Reliable Shipping in Ethiopia</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 transition-transform group-hover:scale-110">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight">Easy Returns</p>
                    <p className="text-[10px] text-gray-500 font-medium">14-Day Money Back Guarantee</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RELATED PRODUCTS ── */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Recommended for You</h2>
              <p className="text-sm text-gray-500 mt-1">Add these top-rated items to your bag.</p>
            </div>
            <Link to="/products" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest">Explore All</Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {products.slice(4, 8).map((p) => {
              const pDiscount = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
              return (
                <Link key={p.id} to={`/products/${p.id}`} className="group bg-white rounded-3xl p-3 sm:p-5 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 transition-all hover:-translate-y-1">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4 relative">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    {pDiscount > 0 && <span className="absolute top-3 right-3 px-2 py-1 bg-red-500 text-white text-[10px] font-black rounded-lg shadow-lg">-{pDiscount}%</span>}
                  </div>
                  <div className="px-1">
                    <p className="text-[9px] font-black text-indigo-600 tracking-widest uppercase mb-1">{p.category}</p>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{p.name}</h3>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-sm font-black text-gray-900">ETB {p.price.toLocaleString()}</span>
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
