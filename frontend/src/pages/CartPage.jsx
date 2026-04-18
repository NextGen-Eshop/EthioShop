import React, { useState } from 'react';
import { Trash2, Plus, Minus, AlertCircle, ShoppingBag, ArrowRight, ShieldCheck, Check, Package, X, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: "1",
      productId: "p1",
      name: "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
      category: "Electronics",
      description: "🎧 Immerse yourself in industry-leading noise cancellation. Features 30-hour battery life and ultra-comfortable lightweight design.",
      price: 299.99,
      quantity: 1,
      stock: 15,
      imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "2",
      productId: "p2",
      name: "Keychron K2 Mechanical Gaming Keyboard",
      category: "Accessories",
      description: "⌨️ Compact 75% layout wireless mechanical keyboard. Tactile brown switches and mesmerizing RGB backlight for the perfect setup.",
      price: 149.50,
      quantity: 2,
      stock: 4,
      imageUrl: "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "3",
      productId: "p3",
      name: "Samsung 32\" Ultra HD 4K Monitor",
      category: "Displays",
      description: "🖥️ Stunning 4K UHD resolution with 1 billion colors. Sleek bezel-less design perfect for serious multitasking and gaming.",
      price: 450.00,
      quantity: 1,
      stock: 0,
      imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=600&auto=format&fit=crop"
    }
  ]);

  const [promoCode, setPromoCode] = useState("");
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = () => {
    if (isCheckoutDisabled) return;
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setCartItems([]);
      setIsCheckoutSuccess(true);
    }, 1500);
  };

  const updateQuantity = (id, newQuantity) => {
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          const validatedQuantity = Math.max(1, Math.min(newQuantity, item.stock));
          return { ...item, quantity: validatedQuantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discount = isPromoApplied ? subtotal * 0.1 : 0; // 10% discount
  const tax = (subtotal - discount) * 0.15;
  const shipping = (subtotal - discount) > 500 ? 0 : 15.00;
  const total = subtotal - discount + tax + shipping;

  const hasOutOfStockItems = cartItems.some(item => item.stock === 0);
  const isCartEmpty = cartItems.length === 0;

  const isCheckoutDisabled = isCartEmpty || hasOutOfStockItems;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.toLowerCase() === 'discount10') {
      setIsPromoApplied(true);
    }
  };

  if (isCheckoutSuccess) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-200/40 to-teal-200/40 rounded-full blur-3xl -z-10 animate-pulse"></div>
        
        <div className="glass-panel p-12 rounded-[2rem] shadow-2xl text-center max-w-lg w-full relative z-10">
          <div className="w-32 h-32 bg-gradient-to-tr from-emerald-100 to-teal-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner relative">
            <Check size={56} className="animate-bounce" strokeWidth={3} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-4">Payment Successful!</h2>
          <p className="text-slate-500 mb-10 text-lg font-medium">Thank you for your purchase. Your elegant new items are being prepared for shipping.</p>
          <Link 
            to="/products" 
            onClick={() => setIsCheckoutSuccess(false)}
            className="w-full inline-flex items-center justify-center bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold py-4 px-8 rounded-2xl transition-all shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-1"
          >
            Continue Shopping
            <ArrowRight size={20} className="ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  if (isCartEmpty) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-200/40 to-purple-200/40 rounded-full blur-3xl -z-10 animate-pulse"></div>
        
        <div className="glass-panel p-12 rounded-[2rem] shadow-2xl text-center max-w-lg w-full relative z-10">
          <div className="w-32 h-32 bg-gradient-to-tr from-indigo-100 to-purple-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner relative">
            <ShoppingBag size={56} className="animate-float" />
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
              <span className="text-xl font-bold">0</span>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 mb-4">Your cart is empty</h2>
          <p className="text-slate-500 mb-10 text-lg font-medium">Looks like you haven't added anything to your cart yet. Let's find something special for you.</p>
          <Link
            to="/products"
            className="w-full inline-flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold py-4 px-8 rounded-2xl transition-all shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-1"
          >
            Start Shopping
            <ArrowRight size={20} className="ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 relative z-0 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50/60 to-transparent -z-10"></div>
      <div className="absolute top-10 -right-40 w-[30rem] h-[30rem] bg-purple-300/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute top-60 -left-20 w-[20rem] h-[20rem] bg-indigo-300/30 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Review Your Bag.
          </h1>
          <span className="text-sm font-bold text-slate-500 bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-100 flex items-center gap-2">
            <ShoppingBag size={18} /> {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-10 xl:gap-14">
          
          {/* Cart Items Section */}
          <div className="lg:w-2/3 space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="glass-panel rounded-3xl p-5 sm:p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-100 hover:border-indigo-200/50 group relative overflow-hidden">
                {/* Out of stock background slight fade */}
                {item.stock === 0 && (
                  <div className="absolute inset-0 bg-slate-50/40 backdrop-blur-[1px] z-10 pointer-events-none"></div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-8 relative z-20">
                  {/* Image Container */}
                  <div className="shrink-0 w-full sm:w-48 h-48 sm:h-auto rounded-[1.5rem] overflow-hidden relative shadow-md border border-slate-200/50 bg-white">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${item.stock === 0 ? 'opacity-50 grayscale' : ''}`}
                    />
                    {item.stock === 0 && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                        Sold Out
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <span className="text-[11px] font-black tracking-widest text-indigo-500 uppercase bg-indigo-50 px-2.5 py-1 rounded-md">{item.category}</span>
                        <Link to={`/products/${item.productId}`} className="block text-xl md:text-2xl font-bold text-slate-800 hover:text-indigo-600 transition-colors leading-tight pr-4 pt-2">
                          {item.name}
                        </Link>
                        <p className="text-sm font-medium text-slate-500 mt-2 line-clamp-2 pr-4 leading-relaxed">
                          {item.description}
                        </p>
                        
                        <div className="flex items-center gap-4 mt-3">
                          <p className="text-2xl font-black text-slate-900">${item.price.toFixed(2)}</p>
                          {item.stock > 0 && item.stock <= 5 && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                              Only {item.stock} left
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-3 rounded-full hover:bg-red-50 z-20 flex-shrink-0"
                        title="Remove item"
                      >
                        <Trash2 size={22} className="group-hover:scale-110 transition-transform" />
                      </button>
                    </div>

                    <div className="flex items-end justify-between mt-8 pt-6 border-t border-slate-100">
                      {/* Quantity Selector */}
                      <div className="flex items-center bg-white border border-slate-200 rounded-2xl overflow-hidden h-14 shadow-sm z-20">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || item.stock === 0}
                          className="w-14 h-full flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-indigo-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-600 transition-colors"
                        >
                          <Minus size={18} />
                        </button>
                        <span className="w-12 text-center font-bold text-slate-800 text-lg">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock || item.stock === 0}
                          className="w-14 h-full flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-indigo-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-600 transition-colors"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Total</p>
                        <p className="text-xl font-black text-slate-800">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {hasOutOfStockItems && (
              <div className="bg-red-50 rounded-[1.5rem] border border-red-100 p-6 flex items-start text-red-800 shadow-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={24} className="shrink-0 mr-4 text-red-500" />
                <div>
                  <h4 className="font-bold text-red-900 mb-1">Action Required</h4>
                  <p className="text-sm font-medium text-red-700">
                    One or more items in your cart are currently out of stock. Please remove them to proceed with your checkout.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Section */}
          <div className="lg:w-1/3">
            <div className="glass-panel rounded-[2rem] p-8 sticky top-28 shadow-2xl shadow-indigo-100/50 border-white">
              <h2 className="text-2xl font-black text-slate-800 mb-8"> Order Summary</h2>
              
              {/* Promo Code Input */}
              <div className="mb-8">
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Promo code: DISCOUNT10" 
                      className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-5 pr-10 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400 shadow-sm"
                      disabled={isPromoApplied}
                    />
                    {isPromoApplied && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                        <Check size={20} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <button 
                    type="submit"
                    disabled={!promoCode || isPromoApplied}
                    className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl text-sm font-bold hover:bg-slate-800 hover:shadow-lg disabled:opacity-50 disabled:hover:shadow-none transition-all"
                  >
                    Apply
                  </button>
                </form>
                {isPromoApplied && (
                  <div className="mt-3 flex items-center justify-between bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm font-bold border border-emerald-100 shadow-sm">
                    <span className="flex items-center gap-2"><Tag size={16} /> DISCOUNT10 Applied (-10%)</span>
                    <button onClick={() => setIsPromoApplied(false)} className="hover:text-emerald-900 bg-emerald-100 p-1 rounded-full transition-colors">
                      <X size={14} strokeWidth={3} />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4 text-slate-600 mb-8">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Subtotal</span>
                  <span className="font-black text-slate-800">${subtotal.toFixed(2)}</span>
                </div>
                {isPromoApplied && (
                  <div className="flex justify-between items-center text-emerald-600">
                    <span className="font-bold">Discount</span>
                    <span className="font-black">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="font-bold flex items-center gap-1.5">Shipping <Package size={16} className="text-slate-400" /></span>
                  <span className="font-black text-slate-800">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">Estimated Tax</span>
                  <span className="font-black text-slate-800">${tax.toFixed(2)}</span>
                </div>
              </div>
                
              <div className="pt-6 border-t border-slate-200 mb-8 pb-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-black text-slate-800">Total</span>
                  <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleCheckout}
                  disabled={isCheckoutDisabled || isProcessing}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-lg py-4.5 px-6 rounded-2xl shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_12px_25px_rgba(79,70,229,0.4)] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 group"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">Processing... <Package size={22} className="animate-spin" /></span>
                  ) : (
                    <>
                      Checkout
                      {!isCheckoutDisabled && <ArrowRight size={22} className="group-hover:translate-x-1.5 transition-transform" strokeWidth={2.5} />}
                    </>
                  )}
                </button>
                
                <div className="flex items-center justify-center gap-3 pt-3">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 py-2.5 px-4 rounded-xl w-full">
                    <ShieldCheck size={18} className="text-emerald-500" /> 
                    Secure Payment by Chapa
                  </div>
                </div>
              </div>
              
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;
