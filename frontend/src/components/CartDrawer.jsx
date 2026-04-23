import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCartStore } from '../store/cartStore';

/* ── Icons ── */
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const MinusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const ShoppingBagIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

export default function CartDrawer({ onClose }) {
  const { items, removeItem, updateQuantity } = useCartStore();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[70] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Shopping Cart</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                <ShoppingBagIcon />
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">Your cart is empty</p>
              <p className="text-xs text-gray-400 mb-6 max-w-[220px]">
                Add products to your cart to see them here.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(({ product, quantity }) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-2xl group"
                >
                  {/* Thumbnail */}
                  <Link to={`/products/${product.id}`} onClick={onClose} className="shrink-0">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-gray-100">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${product.id}`} onClick={onClose}>
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1 hover:text-indigo-600 transition-colors leading-tight">
                        {product.name}
                      </p>
                    </Link>
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      ETB {product.price.toLocaleString()}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                          <MinusIcon />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-gray-900">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stock}
                          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <PlusIcon />
                        </button>
                      </div>
                      <span className="text-xs text-gray-400">
                        = ETB {(product.price * quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Remove btn */}
                  <button
                    onClick={() => removeItem(product.id)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Remove from cart"
                  >
                    <TrashIcon />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 space-y-3 bg-white">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Subtotal</span>
              <span className="text-lg font-bold text-gray-900">
                ETB {totalPrice.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Shipping and taxes calculated at checkout.</p>

            {/* CTA buttons */}
            <Link
              to="/checkout"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all active:scale-[0.99] shadow-sm shadow-emerald-200"
            >
              Proceed to Checkout
            </Link>
            <Link
              to="/cart"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-3 border-2 border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              View Full Cart
            </Link>
          </div>
        )}
      </motion.div>
    </>
  );
}
