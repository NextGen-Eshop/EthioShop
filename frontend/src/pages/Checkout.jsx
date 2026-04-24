import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { createOrder } from '../services/ordersService';
import { displayName } from '../lib/displayName';

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const steps = ['Delivery', 'Review'];

export default function Checkout() {
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [placed, setPlaced] = useState(false);
  const [lastOrderId, setLastOrderId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [delivery, setDelivery] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
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
        <div className="text-5xl mb-4" aria-hidden>🛒</div>
        <h2 className="text-2xl font-bold text-[#111827] mb-2">Your cart is empty</h2>
        <p className="text-[#5b6475] mb-6">Add some products before checking out.</p>
        <Link to="/products" className="btn-primary px-8 py-3 text-sm">Browse products</Link>
      </div>
    );
  }

  if (placed && lastOrderId) {
    return (
      <div className="container-shell flex flex-col items-center justify-center py-24 text-center max-w-lg">
        <div className="w-20 h-20 rounded-full bg-[#e8f8f5] flex items-center justify-center text-[#00a98f] mb-6 mx-auto">
          <CheckIcon />
        </div>
        <h1 className="text-3xl font-bold text-[#111827] mb-2">Order created</h1>
        <p className="text-[#5b6475] mb-2">
          Thank you, <strong>{delivery.firstName}</strong>! Complete your purchase by uploading a
          bank-transfer screenshot.
        </p>
        <p className="text-xs text-[#5b6475] mb-8">
          We sent a confirmation to <strong>{delivery.email}</strong> when email is configured on the
          server.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            to={`/orders/${lastOrderId}/payment`}
            className="btn-primary flex-1 px-6 py-3 text-sm text-center"
          >
            Upload payment proof
          </Link>
          <Link to="/account" className="btn-secondary flex-1 px-6 py-3 text-sm text-center" onClick={clearCart}>
            View my orders
          </Link>
        </div>
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
    if (step < steps.length - 1) setStep((s) => s + 1);
  };

  const handlePlaceOrder = async () => {
    if (!validateDelivery()) {
      setStep(0);
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await createOrder({
        items: items.map((i) => ({
          product: i.id,
          quantity: i.quantity,
        })),
        deliveryAddress: {
          firstName: delivery.firstName,
          lastName: delivery.lastName,
          email: delivery.email,
          phone: delivery.phone,
          address: delivery.address,
          city: delivery.city,
          note: delivery.note,
        },
        paymentMethod: 'bank_transfer',
        totalPrice: total,
        shipping,
      });
      const id = data?.data?._id;
      if (!id) {
        throw new Error('No order id returned');
      }
      setLastOrderId(id);
      setPlaced(true);
      clearCart();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Could not place order');
    } finally {
      setSubmitting(false);
    }
  };

  const set = (field) => (e) => {
    setDelivery((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  return (
    <div className="container-shell py-10">
      <div className="flex items-center justify-center gap-0 mb-10 flex-wrap">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                i === step
                  ? 'bg-[#3857d6] text-white'
                  : i < step
                    ? 'bg-[#e8f8f5] text-[#00a98f]'
                    : 'bg-[#eef2fb] text-[#5b6475]'
              }`}
            >
              {i < step ? <CheckIcon /> : <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs">{i + 1}</span>}
              {s}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-6 sm:w-8 h-[2px] ${i < step ? 'bg-[#00a98f]' : 'bg-[#d8deed]'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="panel p-6 md:p-8">
          {step === 0 && (
            <div>
              <h2 className="text-xl font-bold text-[#111827] mb-6">Delivery</h2>
              <p className="text-sm text-[#5b6475] mb-4">
                Signed in as <strong>{displayName(user)}</strong>
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: 'First name', field: 'firstName', type: 'text' },
                  { label: 'Last name', field: 'lastName', type: 'text' },
                  { label: 'Email', field: 'email', type: 'email', full: true },
                  { label: 'Phone', field: 'phone', type: 'tel' },
                  { label: 'Address', field: 'address', type: 'text', full: true },
                  { label: 'City', field: 'city', type: 'text' },
                ].map(({ label, field, type, full }) => (
                  <div key={field} className={full ? 'sm:col-span-2' : ''}>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6475]">
                      {label}
                    </label>
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
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6475]">Note (optional)</label>
                  <textarea rows={2} value={delivery.note} onChange={set('note')} className="field resize-none" placeholder="Delivery instructions" />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-[#111827] mb-4">Review</h2>
              <div className="p-4 bg-[#f4f6fb] rounded-xl text-sm">
                <p className="text-xs font-bold text-[#5b6475] uppercase tracking-widest mb-2">How you’ll pay</p>
                <p className="font-semibold text-[#111827]">Bank transfer (manual review)</p>
                <p className="text-xs text-[#5b6475] mt-1">
                  After you place the order, you’ll upload a screenshot of your payment. Our team will verify it
                  before we ship.
                </p>
              </div>
              <div className="mt-4 p-4 bg-[#f4f6fb] rounded-xl text-sm">
                <p className="text-xs font-bold text-[#5b6475] uppercase tracking-widest mb-2">Ship to</p>
                <p className="font-semibold text-[#111827]">
                  {delivery.firstName} {delivery.lastName}
                </p>
                <p className="text-[#5b6475]">
                  {delivery.address}, {delivery.city}
                </p>
                <p className="text-[#5b6475]">
                  {delivery.phone} · {delivery.email}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="btn-secondary px-6 py-3 text-sm">
                Back
              </button>
            )}
            {step < steps.length - 1 ? (
              <button type="button" onClick={handleNext} className="btn-primary flex-1 px-6 py-3 text-sm">
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="btn-primary flex-1 px-6 py-3 text-sm disabled:opacity-60"
              >
                {submitting ? 'Placing order…' : `Place order — ETB ${total.toLocaleString()}`}
              </button>
            )}
          </div>
        </div>

        <div className="panel p-5 h-fit sticky top-24">
          <h3 className="text-sm font-bold text-[#111827] mb-4">Order summary</h3>
          <div className="space-y-3 mb-4">
            {items.map((i) => (
              <div key={i.id} className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img src={i.image} alt={i.name} className="w-12 h-12 rounded-lg object-cover" />
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#3857d6] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {i.quantity}
                  </span>
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
              <span>Subtotal</span>
              <span className="font-semibold text-[#111827]">ETB {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#5b6475]">
              <span>Shipping</span>
              <span className={`font-semibold ${shipping === 0 ? 'text-[#00a98f]' : 'text-[#111827]'}`}>
                {shipping === 0 ? 'Free' : `ETB ${shipping}`}
              </span>
            </div>
            <div className="flex justify-between font-bold text-[#111827] pt-2 border-t border-[#d8deed]">
              <span>Total</span>
              <span>ETB {total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
