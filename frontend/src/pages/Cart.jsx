import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCartStore } from '../store/cartStore';
import PageTransition from '../components/PageTransition';

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
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const ShoppingBagIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();

  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = totalPrice >= 2000 ? 0 : 150;

  return (
    <PageTransition>
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link to="/home" className="hover:text-gray-600 transition-colors">Home</Link>
          <ChevronRight />
          <span className="text-gray-900 font-medium">Shopping Cart</span>
        </nav>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Shopping Cart</h1>
            <p className="text-sm text-gray-400 mt-1">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-all"
            >
              Clear Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* ── Empty State ── */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24"
          >
            <div className="w-24 h-24 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <ShoppingBagIcon />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-sm text-gray-400 mb-8 max-w-xs mx-auto">
              Looks like you haven't added anything yet. Start exploring our collection!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              Browse Products
            </Link>
          </motion.div>
        ) : (
          /* ── Cart Content ── */
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(({ product, quantity }) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-4 sm:gap-6 p-4 sm:p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow group"
                >
                  {/* Image */}
                  <Link to={`/products/${product.id}`} className="shrink-0">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <Link to={`/products/${product.id}`}>
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Unit price: ETB {product.price.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity */}
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                        >
                          <MinusIcon />
                        </button>
                        <span className="w-10 text-center text-sm font-semibold text-gray-900">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stock}
                          className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <PlusIcon />
                        </button>
                      </div>

                      {/* Price + Remove */}
                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-gray-900">
                          ETB {(product.price * quantity).toLocaleString()}
                        </span>
                        <button
                          onClick={() => removeItem(product.id)}
                          className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                          aria-label="Remove item"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <h3 className="text-base font-bold text-gray-900">Order Summary</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal ({totalItems} items)</span>
                    <span className="font-medium text-gray-900">ETB {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    <span className={`font-medium ${shipping === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                      {shipping === 0 ? 'Free' : `ETB ${shipping}`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-[11px] text-indigo-600 bg-indigo-50 rounded-lg px-3 py-2">
                      Add ETB {(2000 - totalPrice).toLocaleString()} more for free shipping!
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-gray-900">
                    ETB {(totalPrice + shipping).toLocaleString()}
                  </span>
                </div>

                <Link
                  to="/checkout"
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all active:scale-[0.99] shadow-sm shadow-emerald-200"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  to="/products"
                  className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
