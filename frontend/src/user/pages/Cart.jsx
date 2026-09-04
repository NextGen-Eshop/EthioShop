import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useThemeStore } from '../../store/themeStore';

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, addItem, decrementItem, clearCart } = useCartStore();
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Respect product-level shipping configuration
  const hasOnlyFreeShipping = items.length > 0 && items.every((i) => i.isFreeShipping === true || Number(i.shippingFee) === 0 || Number(i.deliveryFee) === 0);
  const maxItemShippingFee = items.reduce((max, i) => {
    const fee = i.shippingFee !== undefined && i.shippingFee !== null
      ? Number(i.shippingFee)
      : (i.deliveryFee !== undefined ? Number(i.deliveryFee) : 0);
    return Math.max(max, fee);
  }, 0);

  const shipping = hasOnlyFreeShipping
    ? 0
    : (maxItemShippingFee > 0 ? maxItemShippingFee : (subtotal >= 2000 ? 0 : 150));
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="container-shell flex flex-col items-center justify-center py-32 text-center">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-3xl mb-6 text-4xl"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
            boxShadow: isDark ? '0 0 30px rgba(139,92,246,0.15)' : '0 10px 30px rgba(0,0,0,0.05)',
          }}
        >
          <ShoppingBag className="h-10 w-10 text-pink-500" />
        </div>
        <h2 className="text-2xl font-black mb-2" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
          Your cart is empty
        </h2>
        <p className="text-sm mb-8 max-w-xs" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link to="/products" className="btn-neon-primary px-8 py-3.5 text-sm inline-flex items-center gap-2">
          Browse Products <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-shell py-10 max-w-[1200px] mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            Shopping <span className="text-gradient-brand">Cart</span>
          </h1>
          <p className="text-xs mt-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
            {items.reduce((s, i) => s + i.quantity, 0)} items in your cart
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          style={{ color: '#F43F5E', background: 'rgba(244,63,94,0.1)' }}
        >
          Clear all
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
        {/* Items List */}
        <div className="space-y-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-4 p-4 rounded-2xl transition-all"
                style={{
                  background: isDark ? '#111522' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                  boxShadow: isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.03)',
                }}
              >
                <Link to={`/products/${item.id}`} className="shrink-0 w-20 h-20 rounded-xl overflow-hidden" style={{ background: isDark ? '#171B2B' : '#F1F5F9' }}>
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.id}`}>
                    <p
                      className="text-sm font-bold transition-colors line-clamp-2"
                      style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                    >
                      {item.name}
                    </p>
                  </Link>
                  <p className="text-base font-black text-gradient-brand mt-1">
                    ETB {(item.price * item.quantity).toLocaleString()}
                  </p>
                  <p className="text-xs" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
                    ETB {item.price.toLocaleString()} each
                  </p>
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => decrementItem(item.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                    style={{
                      background: isDark ? '#171B2B' : '#F1F5F9',
                      border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    }}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </motion.button>
                  <span className="w-6 text-center text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                    {item.quantity}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => addItem({ ...item }, 1)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                    style={{
                      background: isDark ? '#171B2B' : '#F1F5F9',
                      border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => removeItem(item.id)}
                  className="p-2 rounded-xl transition-all shrink-0 cursor-pointer"
                  style={{ color: '#F43F5E' }}
                  aria-label="Remove"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary Panel */}
        <div
          className="p-6 rounded-2xl sticky top-24 shadow-xl max-h-[calc(100vh-7rem)] overflow-y-auto"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              Order Summary
            </h2>
            <span
              className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
              style={{
                background: isDark ? '#171B2B' : '#F1F5F9',
                color: '#8B5CF6',
                border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
              }}
            >
              {items.reduce((s, i) => s + i.quantity, 0)} {items.reduce((s, i) => s + i.quantity, 0) === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              <span>Subtotal</span>
              <span className="font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                ETB {subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              <span>Shipping Cost</span>
              <span className="font-bold" style={{ color: shipping === 0 ? '#22C55E' : (isDark ? '#F8FAFC' : '#0F172A') }}>
                {shipping === 0 ? 'Free Delivery (ETB 0)' : `ETB ${shipping}`}
              </span>
            </div>
            {shipping > 0 && subtotal < 2000 && !hasOnlyFreeShipping && (
              <div
                className="text-xs rounded-xl px-3.5 py-2 font-medium"
                style={{
                  background: isDark ? '#171B2B' : '#F1F5F9',
                  color: isDark ? '#94A3B8' : '#64748B',
                }}
              >
                Add ETB {(2000 - subtotal).toLocaleString()} more for free shipping
              </div>
            )}
            <div className="pt-3.5 flex justify-between items-baseline" style={{ borderTop: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>
              <span className="font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Total</span>
              <span className="font-black text-2xl text-gradient-brand">
                ETB {total.toLocaleString()}
              </span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/checkout')}
            className="btn-neon-primary w-full px-4 py-3.5 mt-6 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="h-4 w-4" />
          </motion.button>
          <Link
            to="/products"
            className="btn-neon-secondary w-full px-4 py-3 mt-2.5 text-xs text-center block font-bold"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
