import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import Checkout from '../components/Checkout';
import PageTransition from '../components/PageTransition';

export default function CheckoutPage() {
  const { items } = useCartStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '' });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <PageTransition>
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link to="/home" className="hover:text-gray-600 transition-colors">Home</Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
          <Link to="/cart" className="hover:text-gray-600 transition-colors">Cart</Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
          <span className="text-gray-900 font-medium">Checkout</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-8">Checkout</h1>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-6 text-4xl">🛒</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Nothing to checkout</h2>
            <p className="text-sm text-gray-400 mb-8">Your cart is empty. Add some products first.</p>
            <Link to="/products" className="px-8 py-3.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 inline-block">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Shipping Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
                <h2 className="text-base font-bold text-gray-900 mb-6">Shipping Information</h2>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 tracking-widest mb-1.5">FULL NAME</label>
                      <input type="text" value={form.name} onChange={set('name')} placeholder="John Doe"
                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 tracking-widest mb-1.5">EMAIL</label>
                      <input type="email" value={form.email} onChange={set('email')} placeholder="john@example.com"
                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 tracking-widest mb-1.5">PHONE</label>
                    <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+251 9XX XXX XXX"
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 tracking-widest mb-1.5">ADDRESS</label>
                    <input type="text" value={form.address} onChange={set('address')} placeholder="Street address"
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 tracking-widest mb-1.5">CITY</label>
                    <input type="text" value={form.city} onChange={set('city')} placeholder="Addis Ababa"
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start">
              <Checkout />
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
