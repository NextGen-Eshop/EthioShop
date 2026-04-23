import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const steps = ['Delivery', 'Payment', 'Review'];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [placed, setPlaced] = useState(false);
  const [payMethod, setPayMethod] = useState('chapa');
  const [delivery, setDelivery] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: 'Addis Ababa',
    note: '',
  });
  const [errors, setErrors] = useState({});

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal >= 2000 ? 0 : 150;
  const total = subtotal + shipping;

  if (items.length === 0 && !placed) {
    return (
      <div className="container-shell flex flex-col items-center justify-center py-32 text-center">
        <div className="text-5xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-[#111827] mb-2">Your cart is empty</h2>
        <p className="text-[#5b6475] mb-6">Add some products before checking out.</p>
        <Link to="/products" className="btn-primary px-8 py-3 text-sm">Browse Products</Link>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="container-shell flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-6 mx-auto">
          <CheckIcon />
        </div>
        <h1 className="text-3xl font-bold text-[#111827] mb-2">Order Placed!</h1>
        <p className="text-[#5b6475] mb-2 max-w-sm">
          Thank you, <strong>{delivery.firstName}</strong>! Your order has been received and is being processed.
        </p>
        <p className="text-xs text-[#5b6475] mb-8">A confirmation will be sent to <strong>{delivery.email}</strong></p>
        <div className="panel p-5 mb-8 text-left w-full max-w-sm">
          <p className="text-xs font-bold text-[#5b6475] uppercase tracking-widest mb-3">Order Summary</p>
          {items.map(i => (
            <div key={i.id} className="flex justify-between text-sm py-1.5 border-b border-[#d8deed] last:border-0">
              <span className="text-[#111827]">{i.name} × {i.quantity}</span>
              <span className="font-semibold">ETB {(i.price * i.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-bold mt-3 pt-2">
            <span>Total</span>
            <span>ETB {total.toLocaleString()}</span>
          </div>
        </div>
        <Link to="/home" onClick={clearCart} className="btn-primary px-8 py-3 text-sm">Back to Home</Link>
      </div>
    );
  }

  const validateDelivery = () => {
    const e = {};
    if (!delivery.firstName.trim()) e.firstName = 'Required';
    if (!delivery.lastName.trim()) e.lastName = 'Required';
    if (!delivery.email || !/\S+@\S+\.\S+/.test(delivery.email)) e.email = 'Valid email required';
    if (!delivery.phone.trim()) e.phone = 'Required';
    if (!delivery.address.trim()) e.address = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && !validateDelivery()) return;
    if (step < steps.length - 1) setStep(s => s + 1);
  };

  const handlePlaceOrder = () => {
    // TODO: POST /api/orders with cart + delivery + payment
    setPlaced(true);
  };

  const set = (field) => (e) => {
    setDelivery(p => ({ ...p, [field]: e.target.value }));
    setErrors(p => ({ ...p, [field]: '' }));
  };

  return (
    <div className="container-shell py-10">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-0 mb-10">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              i === step ? 'bg-[#3857d6] text-white' :
              i < step ? 'bg-[#e8f8f5] text-[#00a98f]' :
              'bg-[#eef2fb] text-[#5b6475]'
            }`}>
              {i < step ? <CheckIcon /> : <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs">{i + 1}</span>}
              {s}
            </div>
            {i < steps.length - 1 && <div className={`w-8 h-[2px] ${i < step ? 'bg-[#00a98f]' : 'bg-[#d8deed]'}`} />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        {/* Left — step content */}
        <div className="panel p-6 md:p-8">

          {/* Step 0 — Delivery */}
          {step === 0 && (
            <div>
              <h2 className="text-xl font-bold text-[#111827] mb-6">Delivery Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: 'First Name', field: 'firstName', type: 'text' },
                  { label: 'Last Name', field: 'lastName', type: 'text' },
                  { label: 'Email Address', field: 'email', type: 'email', full: true },
                  { label: 'Phone Number', field: 'phone', type: 'tel' },
                  { label: 'Delivery Address', field: 'address', type: 'text', full: true },
                  { label: 'City', field: 'city', type: 'text' },
                ].map(({ label, field, type, full }) => (
                  <div key={field} className={full ? 'sm:col-span-2' : ''}>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6475]">{label}</label>
                    <input
                      type={type}
                      value={delivery[field]}
                      onChange={set(field)}
                      className={`field ${errors[field] ? 'field-error' : ''}`}
                    />
                    {errors[field] && <p className="text-xs text-[#c7414b] mt-1">{errors[field]}</p>}
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6475]">Order Note (optional)</label>
                  <textarea rows={2} value={delivery.note} onChange={set('note')} className="field resize-none" placeholder="Any special instructions..." />
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — Payment */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-[#111827] mb-6">Payment Method</h2>
              <div className="space-y-3">
                {[
                  { id: 'chapa', label: 'Chapa', sub: 'Pay with Telebirr, CBE Birr, or card via Chapa', emoji: '🇪🇹' },
                  { id: 'card', label: 'Credit / Debit Card', sub: 'Visa, Mastercard — secured by Stripe', emoji: '💳' },
                  { id: 'cod', label: 'Cash on Delivery', sub: 'Pay when your order arrives', emoji: '💵' },
                ].map(opt => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      payMethod === opt.id ? 'border-[#3857d6] bg-[#ecf1ff]' : 'border-[#d8deed] hover:border-[#b9c5e0]'
                    }`}
                  >
                    <input type="radio" name="payment" value={opt.id} checked={payMethod === opt.id} onChange={() => setPayMethod(opt.id)} className="sr-only" />
                    <span className="text-2xl">{opt.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#111827]">{opt.label}</p>
                      <p className="text-xs text-[#5b6475]">{opt.sub}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      payMethod === opt.id ? 'border-[#3857d6] bg-[#3857d6]' : 'border-[#d8deed]'
                    }`}>
                      {payMethod === opt.id && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </label>
                ))}
              </div>

              {payMethod === 'chapa' && (
                <div className="mt-4 p-4 bg-[#e8f8f5] rounded-xl text-sm text-[#0a6d5c]">
                  <p className="font-semibold mb-1">🔒 Secure Chapa Payment</p>
                  <p className="text-xs">You'll be redirected to Chapa's secure payment page to complete your transaction using Telebirr, CBE Birr, or bank card.</p>
                </div>
              )}
              {payMethod === 'card' && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6475]">Card Number</label>
                    <input className="field" placeholder="1234 5678 9012 3456" maxLength={19} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6475]">Expiry</label>
                      <input className="field" placeholder="MM / YY" maxLength={7} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6475]">CVV</label>
                      <input className="field" placeholder="•••" maxLength={4} type="password" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2 — Review */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-[#111827] mb-6">Review Your Order</h2>
              <div className="space-y-4">
                <div className="p-4 bg-[#f4f6fb] rounded-xl">
                  <p className="text-xs font-bold text-[#5b6475] uppercase tracking-widest mb-2">Delivery To</p>
                  <p className="text-sm font-semibold text-[#111827]">{delivery.firstName} {delivery.lastName}</p>
                  <p className="text-sm text-[#5b6475]">{delivery.address}, {delivery.city}</p>
                  <p className="text-sm text-[#5b6475]">{delivery.phone} · {delivery.email}</p>
                </div>
                <div className="p-4 bg-[#f4f6fb] rounded-xl">
                  <p className="text-xs font-bold text-[#5b6475] uppercase tracking-widest mb-2">Payment</p>
                  <p className="text-sm font-semibold text-[#111827] capitalize">{payMethod === 'cod' ? 'Cash on Delivery' : payMethod === 'chapa' ? 'Chapa' : 'Credit / Debit Card'}</p>
                </div>
                <div className="p-4 bg-[#f4f6fb] rounded-xl">
                  <p className="text-xs font-bold text-[#5b6475] uppercase tracking-widest mb-3">Items ({items.length})</p>
                  <div className="space-y-2">
                    {items.map(i => (
                      <div key={i.id} className="flex items-center gap-3">
                        <img src={i.image} alt={i.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#111827] line-clamp-1">{i.name}</p>
                          <p className="text-xs text-[#5b6475]">Qty: {i.quantity}</p>
                        </div>
                        <p className="text-xs font-bold text-[#111827]">ETB {(i.price * i.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="btn-secondary px-6 py-3 text-sm">
                Back
              </button>
            )}
            {step < steps.length - 1 ? (
              <button onClick={handleNext} className="btn-primary flex-1 px-6 py-3 text-sm">
                Continue to {steps[step + 1]}
              </button>
            ) : (
              <button onClick={handlePlaceOrder} className="btn-primary flex-1 px-6 py-3 text-sm">
                Place Order — ETB {total.toLocaleString()}
              </button>
            )}
          </div>
        </div>

        {/* Right — order summary */}
        <div className="panel p-5 h-fit sticky top-24">
          <h3 className="text-sm font-bold text-[#111827] mb-4">Order Summary</h3>
          <div className="space-y-3 mb-4">
            {items.map(i => (
              <div key={i.id} className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img src={i.image} alt={i.name} className="w-12 h-12 rounded-lg object-cover" />
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#3857d6] text-white text-[9px] font-bold rounded-full flex items-center justify-center">{i.quantity}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#111827] line-clamp-1">{i.name}</p>
                  <p className="text-xs text-[#5b6475]">ETB {i.price.toLocaleString()}</p>
                </div>
                <p className="text-xs font-bold text-[#111827] shrink-0">ETB {(i.price * i.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-[#d8deed] pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-[#5b6475]">
              <span>Subtotal</span><span className="font-semibold text-[#111827]">ETB {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#5b6475]">
              <span>Shipping</span>
              <span className={`font-semibold ${shipping === 0 ? 'text-[#00a98f]' : 'text-[#111827]'}`}>
                {shipping === 0 ? 'Free' : `ETB ${shipping}`}
              </span>
            </div>
            <div className="flex justify-between font-bold text-[#111827] pt-2 border-t border-[#d8deed]">
              <span>Total</span><span>ETB {total.toLocaleString()}</span>
            </div>
          </div>
          <p className="text-[10px] text-[#5b6475] mt-3 text-center">🔒 Secured checkout</p>
        </div>
      </div>
    </div>
  );
}
