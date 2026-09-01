import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, X, Download, CheckCircle2, Truck, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function PackingSlipModal({ order, isOpen, onClose, isDark = false }) {
  const slipRef = useRef(null);

  if (!isOpen || !order) return null;

  const orderId = order._id ? order._id.toString().slice(-6).toUpperCase() : order.id;
  const customerName =
    order.shippingAddress?.fullName ||
    order.customer?.name ||
    (order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : 'Valued Customer');

  const customerPhone = order.shippingAddress?.phoneNumber || order.customer?.phone || '—';
  const customerAddress = order.shippingAddress?.address || order.customer?.address || '—';
  const customerCity = order.shippingAddress?.city || order.customer?.city || 'Addis Ababa';
  const customerSubCity = order.shippingAddress?.subCity || order.shippingAddress?.district || order.customer?.subCity || '';

  const items = order.items || [];
  const differentProductTypesCount = items.length;
  const totalQuantity = items.reduce((sum, it) => sum + (it.quantity || it.qty || 1), 0);

  const subtotal = order.subtotal || items.reduce((sum, it) => sum + (it.price * (it.quantity || it.qty || 1)), 0);
  const deliveryFee = order.deliveryFee !== undefined ? order.deliveryFee : (order.deliverySpeed === 'paid' ? 150 : 0);
  const discountAmount = order.discountAmount || 0;
  const totalPrice = order.totalPrice || order.totalAmount || (subtotal + deliveryFee - discountAmount);

  const carrier = order.carrier || 'EthioPost Express';
  const trackingNumber = order.trackingNumber || 'ETP-' + (order._id ? order._id.toString().slice(-8).toUpperCase() : '982143');
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : order.date || 'Today';

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
            maxHeight: '92vh',
          }}
        >
          {/* Action Header Bar (No-Print) */}
          <div
            className="p-4 sm:px-6 flex items-center justify-between border-b print:hidden"
            style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}
          >
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-black text-white bg-gradient-to-r from-purple-600 to-pink-600">
                Official Document
              </span>
              <h2 className="text-sm sm:text-base font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                Order #{orderId} Packing Slip
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="btn-neon-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Packing Slip</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Printable Packing Slip Sheet */}
          <div
            ref={slipRef}
            className="p-6 sm:p-10 overflow-y-auto space-y-6 text-slate-800 bg-white"
            style={{ color: '#0F172A', background: '#FFFFFF' }}
          >
            {/* Header: EthioShopping Logo & Brand Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-slate-900">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-400 flex items-center justify-center text-white text-2xl font-black shadow-md">
                  🇪🇹
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">
                    EthioShopping
                  </h1>
                  <p className="text-xs font-bold text-purple-600 tracking-wider uppercase mt-1">
                    Official Fulfillment Packing Slip
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-0.5">
                <p className="text-xs font-mono font-black text-slate-900">
                  SLIP #: ES-PKG-{orderId}
                </p>
                <p className="text-xs text-slate-500">Order Placed: {orderDate}</p>
                <p className="text-xs font-bold text-emerald-600">
                  Status: SHIPPED & DISPATCHED
                </p>
              </div>
            </div>

            {/* Recipient / Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Customer / Deliver To:
                </span>
                <p className="text-base font-black text-slate-900">{customerName}</p>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">📞 {customerPhone}</p>
                <p className="text-xs text-slate-600 font-medium">
                  📍 {customerCity}{customerSubCity ? `, ${customerSubCity}` : ''}
                </p>
                <p className="text-xs text-slate-600">{customerAddress}</p>
              </div>

              <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-6">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Dispatch & Carrier Information:
                </span>
                <p className="text-xs font-bold text-slate-900">
                  Carrier: <span className="text-purple-700">{carrier}</span>
                </p>
                <p className="text-xs font-mono font-bold text-slate-700">
                  Tracking #: {trackingNumber}
                </p>
                <p className="text-xs text-slate-600">
                  Payment Method: <span className="font-semibold">{order.paymentMethodRef?.name || order.paymentMethod || 'Bank Transfer'}</span>
                </p>
                <p className="text-xs font-bold text-emerald-600 mt-1">
                  Verification: Escrow Verified & Packed
                </p>
              </div>
            </div>

            {/* Product Summary Header Counts */}
            <div className="flex items-center justify-between px-1 text-xs">
              <span className="font-bold text-slate-700">
                Number of Product Types: <strong className="text-slate-900">{differentProductTypesCount}</strong>
              </span>
              <span className="font-bold text-slate-700">
                Total Items Quantity: <strong className="text-purple-700">{totalQuantity} units</strong>
              </span>
            </div>

            {/* Ordered Products Table */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-black uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Item & Image</th>
                    <th className="py-3 px-3 text-center">Qty</th>
                    <th className="py-3 px-3 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item, idx) => {
                    const itImg = item.image || item.product?.image || '';
                    const itName = item.name || item.product?.name || 'Item';
                    const itPrice = Number(item.price || item.product?.price || 0);
                    const itQty = Number(item.quantity || item.qty || 1);
                    const itTotal = itPrice * itQty;

                    return (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {itImg ? (
                              <img
                                src={itImg}
                                alt={itName}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0">
                                🛍️
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900 leading-snug">{itName}</p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                SKU: {item.sku || `ES-${(item.product?._id || idx).toString().slice(-4).toUpperCase()}`}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-800">
                          {itQty}
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-slate-600">
                          ETB {itPrice.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          ETB {itTotal.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial Totals Calculation Box */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
              <div className="text-[11px] text-slate-500 space-y-0.5">
                <p>✓ All items inspected for quality assurance.</p>
                <p>✓ Securely sealed under EthioShopping packaging standards.</p>
              </div>

              <div className="w-full sm:w-64 space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Products Subtotal:</span>
                  <span className="font-bold">ETB {Number(subtotal).toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Delivery / Shipping Fee:</span>
                  <span className="font-bold text-emerald-700">
                    {deliveryFee > 0 ? `ETB ${Number(deliveryFee).toLocaleString()}` : 'Shipping Free'}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount Applied:</span>
                    <span className="font-bold">-ETB {Number(discountAmount).toLocaleString()}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-300 flex justify-between font-black text-sm text-slate-900">
                  <span>Total Amount Paid:</span>
                  <span className="text-purple-700 font-extrabold">
                    ETB {Number(totalPrice).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Mandatory Requirement: Bottom Footer */}
            <div className="pt-6 border-t-2 border-slate-900 text-center space-y-1">
              <p className="text-sm font-black tracking-wider uppercase text-slate-900">
                EthioShopping for Ever.
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                Thank you for choosing Ethiopia’s Premier Marketplace • www.ethioshopping.com
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
