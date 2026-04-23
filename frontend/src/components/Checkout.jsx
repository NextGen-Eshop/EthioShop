import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);

  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = totalPrice >= 2000 ? 0 : 150;
  const grandTotal = totalPrice + shipping;

  const handleChapaPayment = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    setLoading(true);

    // Simulate payment processing (1.5s delay)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate 90% success rate
    const success = Math.random() > 0.1;

    if (success) {
      clearCart();
      toast.success(
        (t) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm">Payment Successful!</p>
              <p className="text-xs text-gray-500">Your order has been confirmed.</p>
            </div>
          </div>
        ),
        { duration: 4000 }
      );
      setTimeout(() => navigate('/home'), 1500);
    } else {
      toast.error(
        (t) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm">Payment Failed</p>
              <p className="text-xs text-gray-500">Please try again or use a different method.</p>
            </div>
          </div>
        ),
        { duration: 4000 }
      );
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Order Summary</h3>
        </div>
        <div className="px-6 py-4 space-y-3">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-400">Qty: {quantity}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-900 shrink-0">
                ETB {(product.price * quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="px-6 py-4 border-t border-gray-100 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium text-gray-900">ETB {totalPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Shipping</span>
            <span className={`font-medium ${shipping === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
              {shipping === 0 ? 'Free' : `ETB ${shipping.toLocaleString()}`}
            </span>
          </div>
          <div className="flex justify-between text-base pt-2 border-t border-gray-100">
            <span className="font-bold text-gray-900">Total</span>
            <span className="font-bold text-gray-900">ETB {grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Pay with Chapa Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleChapaPayment}
        disabled={loading || items.length === 0}
        className="w-full flex items-center justify-center gap-3 py-4 bg-[#0D7C66] hover:bg-[#0a6654] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#0D7C66]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
            </svg>
            Processing Payment...
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            Pay with Chapa — ETB {grandTotal.toLocaleString()}
          </>
        )}
      </motion.button>

      {/* Trust note */}
      <p className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1.5">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        Secured by Chapa Payment Gateway. Your data is encrypted.
      </p>
    </div>
  );
}
