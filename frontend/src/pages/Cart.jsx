import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/cartStore';

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);
const MinusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
);

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, addItem, decrementItem, clearCart } = useCartStore();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 2000 ? 0 : 150;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="container-shell flex flex-col items-center justify-center py-32 text-center">
        <div className="text-6xl mb-6">🛍️</div>
        <h2 className="text-2xl font-bold text-[#111827] mb-2">Your cart is empty</h2>
        <p className="text-[#5b6475] mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn-primary px-8 py-3 text-sm">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container-shell py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#111827]">Your Cart</h1>
        <button onClick={clearCart} className="text-xs text-[#5b6475] hover:text-[#c7414b] transition-colors">
          Clear all
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        {/* items */}
        <div className="space-y-3">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="panel flex items-center gap-4 p-4"
              >
                <Link to={`/products/${item.id}`} className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-[#f4f6fb]">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.id}`}>
                    <p className="text-sm font-semibold text-[#111827] hover:text-[#3857d6] transition-colors line-clamp-2">
                      {item.name}
                    </p>
                  </Link>
                  <p className="text-base font-bold text-[#111827] mt-1">
                    ETB {(item.price * item.quantity).toLocaleString()}
                  </p>
                  <p className="text-xs text-[#5b6475]">ETB {item.price.toLocaleString()} each</p>
                </div>

                {/* qty controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => decrementItem(item.id)}
                    className="w-7 h-7 rounded-lg border border-[#d8deed] flex items-center justify-center text-[#5b6475] hover:border-[#3857d6] hover:text-[#3857d6] transition-all"
                  >
                    <MinusIcon />
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-[#111827]">{item.quantity}</span>
                  <button
                    onClick={() => addItem({ ...item }, 1)}
                    className="w-7 h-7 rounded-lg border border-[#d8deed] flex items-center justify-center text-[#5b6475] hover:border-[#3857d6] hover:text-[#3857d6] transition-all"
                  >
                    <PlusIcon />
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 rounded-lg text-[#5b6475] hover:text-[#c7414b] hover:bg-red-50 transition-all shrink-0"
                  aria-label="Remove"
                >
                  <TrashIcon />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* summary */}
        <div className="panel p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold text-[#111827] mb-5">Order Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-[#5b6475]">
              <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span className="font-semibold text-[#111827]">ETB {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#5b6475]">
              <span>Shipping</span>
              <span className={`font-semibold ${shipping === 0 ? 'text-[#00a98f]' : 'text-[#111827]'}`}>
                {shipping === 0 ? 'Free' : `ETB ${shipping}`}
              </span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-[#5b6475] bg-[#eef2fb] rounded-lg px-3 py-2">
                Add ETB {(2000 - subtotal).toLocaleString()} more for free shipping
              </p>
            )}
            <div className="border-t border-[#d8deed] pt-3 flex justify-between">
              <span className="font-bold text-[#111827]">Total</span>
              <span className="font-bold text-lg text-[#111827]">ETB {total.toLocaleString()}</span>
            </div>
          </div>

          <button onClick={() => navigate('/checkout')} className="btn-primary w-full px-4 py-3 mt-5 text-sm">
            Proceed to Checkout
          </button>
          <Link to="/products" className="btn-secondary w-full px-4 py-3 mt-2 text-sm text-center block">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
