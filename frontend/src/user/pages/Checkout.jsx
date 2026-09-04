import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Navigation,
  CheckCircle2,
  Copy,
  Check,
  UploadCloud,
  X,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Truck,
  Phone,
  User,
  Building,
  Loader2,
  FileCheck,
  Edit3
} from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { validateEthiopianPhone, formatEthiopianPhoneInput } from '../../utils/ethiopianPhone';
import {
  detectCurrentLocation,
  ETHIOPIAN_REGIONS_AND_CITIES,
  ETHIOPIAN_CITIES,
  matchEthiopianCity,
} from '../../utils/locationService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const steps = ['Delivery & Location', 'Payment Method', 'Review & Confirm'];

// Ethiopian provider color/badge themes
const PROVIDER_THEMES = {
  telebirr: {
    badgeColor: 'from-[#e57e25] to-[#f9a03f]',
    textColor: 'text-[#e57e25]',
    tag: 'Ethio Telecom Mobile Wallet',
    logo: '📱',
  },
  cbe: {
    badgeColor: 'from-[#732282] to-[#9933ad]',
    textColor: 'text-[#9933ad]',
    tag: 'Commercial Bank of Ethiopia',
    logo: '🏦',
  },
  awash: {
    badgeColor: 'from-[#005a9c] to-[#0088cc]',
    textColor: 'text-[#0088cc]',
    tag: 'Awash International Bank',
    logo: '🏛️',
  },
  senke: {
    badgeColor: 'from-[#059669] to-[#10b981]',
    textColor: 'text-[#10b981]',
    tag: 'Senke Bank Escrow Service',
    logo: '🏛️',
  },
  boa: {
    badgeColor: 'from-[#c29b38] to-[#dfb850]',
    textColor: 'text-[#dfb850]',
    tag: 'Bank of Abyssinia (Apollo)',
    logo: '💳',
  },
};

function getProviderTheme(name = '', type = '') {
  const n = name.toLowerCase();
  if (n.includes('telebirr')) return PROVIDER_THEMES.telebirr;
  if (n.includes('cbe') || n.includes('commercial')) return PROVIDER_THEMES.cbe;
  if (n.includes('awash')) return PROVIDER_THEMES.awash;
  if (n.includes('senke')) return PROVIDER_THEMES.senke;
  if (n.includes('abyssinia') || n.includes('boa')) return PROVIDER_THEMES.boa;
  return {
    badgeColor: 'from-[#8B5CF6] to-[#EC4899]',
    textColor: 'text-purple-400',
    tag: type === 'mobile_wallet' ? 'Mobile Wallet' : 'Bank Transfer',
    logo: '🏦',
  };
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);
  const [error, setError] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Delivery Destination Mode: 'sensed' (Auto-detected location) vs 'manual' (User-specified destination)
  const [destinationMode, setDestinationMode] = useState('sensed');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [sensedData, setSensedData] = useState(null);

  // Shipping form fields
  const [shippingForm, setShippingForm] = useState({
    fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
    phoneNumber: '',
    city: 'Addis Ababa',
    region: 'Addis Ababa',
    subCity: 'Bole Sub-City',
    address: '',
    landmark: '',
    note: '',
  });

  const [phoneValidation, setPhoneValidation] = useState({ isValid: true, message: '' });

  // Delivery Option: 'free' (Cost: 0) vs 'paid' (Cost: Fee)
  const [deliverySpeed, setDeliverySpeed] = useState('free');

  // Real Payment Methods from DB
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [selectedMethodId, setSelectedMethodId] = useState(null);

  // Transfer Proof & Receipt
  const [paymentProof, setPaymentProof] = useState({
    transactionId: '',
    senderName: '',
    senderPhone: '',
    receiptImage: '',
  });

  const fileInputRef = useRef(null);

  // Load Payment Methods from DB
  useEffect(() => {
    async function loadMethods() {
      try {
        setLoadingMethods(true);
        const res = await fetch(`${API_URL}/api/user/payment-methods`);
        if (res.ok) {
          const json = await res.json();
          const methods = json.data || [];
          setPaymentMethods(methods);
          if (methods.length > 0) {
            setSelectedMethodId(methods[0]._id);
          }
        }
      } catch (err) {
        console.error('Error loading payment methods:', err);
      } finally {
        setLoadingMethods(false);
      }
    }
    loadMethods();
  }, []);

  // Auto-detect location on load
  useEffect(() => {
    handleRunLocationDetection();
  }, []);

  const handleRunLocationDetection = async () => {
    setDetectingLocation(true);
    try {
      const loc = await detectCurrentLocation();
      setSensedData(loc);
      if (destinationMode === 'sensed' && loc.isDetected) {
        setShippingForm((prev) => ({
          ...prev,
          city: loc.city || prev.city,
          region: loc.region || prev.region,
          subCity: loc.subCity || prev.subCity,
          address: prev.address || (loc.locality ? loc.locality : prev.address),
        }));
      }
    } catch (err) {
      console.warn('Location detection failed:', err);
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleModeChange = (mode) => {
    setDestinationMode(mode);
    if (mode === 'sensed' && sensedData && sensedData.isDetected) {
      setShippingForm((prev) => ({
        ...prev,
        city: sensedData.city || prev.city,
        region: sensedData.region || prev.region,
        subCity: sensedData.subCity || prev.subCity,
        address: prev.address || (sensedData.locality ? sensedData.locality : prev.address),
      }));
    }
  };

  const handleCitySelect = (cityName) => {
    const matched = matchEthiopianCity(cityName);
    setShippingForm((prev) => ({
      ...prev,
      city: matched.name,
      region: matched.region,
    }));
  };

  const handlePhoneChange = (e) => {
    const val = formatEthiopianPhoneInput(e.target.value);
    setShippingForm((prev) => ({ ...prev, phoneNumber: val }));
    if (val.length >= 9) {
      const check = validateEthiopianPhone(val);
      setPhoneValidation(check);
    } else {
      setPhoneValidation({ isValid: true, message: '' });
    }
  };

  const handleReceiptUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentProof((prev) => ({ ...prev, receiptImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleCopyAccount = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2200);
  };

  // Calculations: STRICT consistency with product delivery/shipping configuration
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const matchedCityInfo = matchEthiopianCity(shippingForm.city);

  // Check product-level shipping configuration across cart items
  const hasOnlyFreeShipping = items.length > 0 && items.every(
    (i) => i.isFreeShipping === true || Number(i.shippingFee) === 0 || Number(i.deliveryFee) === 0
  );
  const maxProductShippingFee = items.reduce((max, i) => {
    const fee = i.shippingFee !== undefined && i.shippingFee !== null
      ? Number(i.shippingFee)
      : (i.deliveryFee !== undefined ? Number(i.deliveryFee) : 0);
    return Math.max(max, fee);
  }, 0);

  // Base standard delivery: 0 ETB if free shipping product/cart, else product shipping fee or standard fee
  const baseStandardFee = hasOnlyFreeShipping
    ? 0
    : (maxProductShippingFee > 0 ? maxProductShippingFee : (subtotal >= 2000 ? 0 : 150));

  // If user chooses standard ('free'), fee is baseStandardFee. If express ('paid'), adds express tier
  const calculatedDeliveryFee = deliverySpeed === 'free'
    ? baseStandardFee
    : (baseStandardFee + 100);

  const finalGrandTotal = subtotal + calculatedDeliveryFee;

  const selectedMethod = paymentMethods.find((m) => m._id === selectedMethodId);

  const handleValidateStep1 = () => {
    if (!shippingForm.fullName.trim()) {
      setError('Please provide the recipient full name for delivery.');
      return;
    }
    const check = validateEthiopianPhone(shippingForm.phoneNumber);
    if (!check.isValid) {
      setPhoneValidation(check);
      setError(check.message);
      return;
    }
    if (!shippingForm.address.trim()) {
      setError('Please enter a delivery destination address or landmark.');
      return;
    }

    setError('');
    setStep(1);
  };

  const handleValidateStep2 = () => {
    if (!selectedMethod) {
      setError('Please select an approved payment method.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleCompleteOrder = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const orderPayload = {
        items: items.map((i) => ({
          product: i._id || i.id,
          name: i.name,
          // Send URL-based image only — never base64 to keep payload small
          image: i.image && !i.image.startsWith('data:') ? i.image : (i.imageUrl || ''),
          quantity: i.quantity,
          price: i.price,
        })),
        subtotal,
        deliveryFee: calculatedDeliveryFee,
        deliveryType: deliverySpeed === 'free' ? 'free' : 'paid',
        totalPrice: finalGrandTotal,
        paymentMethod: selectedMethod?.name || 'Bank Transfer',
        paymentMethodRef: selectedMethod?._id,
        paymentDetails: {
          provider: selectedMethod?.type || 'bank_transfer',
          accountNumber: selectedMethod?.accountNumber,
          senderName: paymentProof.senderName || shippingForm.fullName,
          senderPhone: paymentProof.senderPhone || shippingForm.phoneNumber,
          transactionId: paymentProof.transactionId,
          receiptImage: paymentProof.receiptImage || null, // base64 screenshot (server supports up to 20mb)
        },
        shippingAddress: {
          fullName: shippingForm.fullName,
          phoneNumber: shippingForm.phoneNumber,
          city: shippingForm.city,
          address: `${shippingForm.subCity ? shippingForm.subCity + ', ' : ''}${shippingForm.address}`,
          note: shippingForm.note,
        },
        deliveryLocation: {
          useSensedLocation: destinationMode === 'sensed' && Boolean(sensedData?.isDetected),
          sensedCoords: destinationMode === 'sensed' && sensedData
            ? {
                latitude: sensedData.latitude,
                longitude: sensedData.longitude,
                accuracy: sensedData.accuracy,
                placeName: sensedData.placeName,
              }
            : undefined,
          destinationAddress: `${shippingForm.city} - ${shippingForm.address}`,
          landmark: shippingForm.landmark,
        },
      };

      const res = await fetch(`${API_URL}/api/user/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify(orderPayload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to place order in database');
      }

      setOrderComplete(json.data);
      clearCart();
    } catch (err) {
      setError(err.message || 'An error occurred while finalizing your order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl bg-purple-500/10">
          🛒
        </div>
        <h1 className="text-2xl font-black mb-3" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
          Your Cart is Empty
        </h1>
        <p className="text-xs sm:text-sm mb-6 max-w-sm mx-auto text-slate-400">
          Add items to your cart before proceeding to checkout.
        </p>
        <Link to="/products" className="btn-neon-primary px-6 py-3 text-xs inline-flex items-center gap-2">
          <ArrowRight className="h-4 w-4" /> Browse Catalog
        </Link>
      </div>
    );
  }

  // ── ORDER SUCCESS CONFIRMATION ──
  if (orderComplete) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-8 rounded-3xl relative overflow-hidden"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
            boxShadow: isDark ? '0 25px 50px rgba(0,0,0,0.5)' : '0 20px 40px rgba(0,0,0,0.06)',
          }}
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            Order Placed Successfully!
          </h2>

          <p className="text-xs sm:text-sm mt-2 text-slate-400">
            Order Reference: <span className="font-bold text-purple-400 font-mono">#{orderComplete._id}</span>
          </p>

          <div
            className="my-6 p-4 rounded-2xl text-left space-y-2.5 text-xs"
            style={{
              background: isDark ? '#171B2B' : '#F8FAFC',
              border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
            }}
          >
            <div className="flex justify-between font-bold">
              <span className="text-slate-400">Delivery Destination:</span>
              <span>{orderComplete.shippingAddress?.city} ({orderComplete.shippingAddress?.address})</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-slate-400">Delivery Speed:</span>
              <span className={orderComplete.deliveryType === 'free' ? 'text-emerald-400' : 'text-purple-400'}>
                {orderComplete.deliveryType === 'free' ? 'Free Standard Delivery (ETB 0)' : `Express Delivery (ETB ${orderComplete.deliveryFee})`}
              </span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-slate-400">Payment Channel:</span>
              <span className="text-purple-400">{orderComplete.paymentMethod}</span>
            </div>
            <div className="flex justify-between font-black text-sm pt-2 border-t" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
              <span>Total Paid / Due:</span>
              <span className="text-emerald-400">ETB {Number(orderComplete.totalPrice).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Link to="/account" className="btn-neon-primary px-6 py-3 text-xs font-bold">
              View Order in Account
            </Link>
            <Link
              to="/products"
              className="px-6 py-3 text-xs font-bold rounded-2xl border"
              style={{
                background: isDark ? '#171B2B' : '#F1F5F9',
                borderColor: isDark ? '#252A3A' : '#E2E8F0',
                color: isDark ? '#F8FAFC' : '#0F172A',
              }}
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ── STEP HEADER ── */}
      <div className="flex items-center justify-center gap-4">
        {steps.map((st, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all"
              style={{
                background: step === idx
                  ? 'linear-gradient(135deg, #8B5CF6, #EC4899)'
                  : step > idx
                  ? '#10B981'
                  : isDark ? '#171B2B' : '#E2E8F0',
                color: '#FFFFFF',
              }}
            >
              {step > idx ? <Check className="h-4 w-4" /> : idx + 1}
            </div>
            <span
              className="text-xs font-bold hidden sm:inline"
              style={{
                color: step === idx ? '#8B5CF6' : isDark ? '#94A3B8' : '#64748B',
              }}
            >
              {st}
            </span>
            {idx < steps.length - 1 && (
              <div className="w-8 h-[1px] bg-slate-700 hidden sm:block" />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── MAIN CHECKOUT GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Step Forms */}
        <div className="lg:col-span-8 space-y-6">
          {/* ════════════════════════════════════════════════════════════════
              STEP 0: LOCATION & DELIVERY DESTINATION
             ════════════════════════════════════════════════════════════════ */}
          {step === 0 && (
            <div
              className="p-6 sm:p-8 rounded-3xl space-y-6"
              style={{
                background: isDark ? '#111522' : '#FFFFFF',
                border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
              }}
            >
              <div>
                <h2 className="text-xl font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  1. Delivery Destination & Address
                </h2>
                <p className="text-xs mt-0.5 text-slate-400">
                  Select whether to use your automatically detected location or enter a custom destination.
                </p>
              </div>

              {/* Destination Mode Selector Tabs */}
              <div
                className="p-1 rounded-2xl grid grid-cols-2 gap-2"
                style={{ background: isDark ? '#171B2B' : '#F1F5F9' }}
              >
                <button
                  type="button"
                  onClick={() => handleModeChange('sensed')}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                  style={{
                    background: destinationMode === 'sensed'
                      ? (isDark ? '#111522' : '#FFFFFF')
                      : 'transparent',
                    color: destinationMode === 'sensed' ? '#8B5CF6' : (isDark ? '#94A3B8' : '#64748B'),
                    boxShadow: destinationMode === 'sensed' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  <Navigation className="h-3.5 w-3.5" />
                  <span>Use My Detected Location</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange('manual')}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                  style={{
                    background: destinationMode === 'manual'
                      ? (isDark ? '#111522' : '#FFFFFF')
                      : 'transparent',
                    color: destinationMode === 'manual' ? '#8B5CF6' : (isDark ? '#94A3B8' : '#64748B'),
                    boxShadow: destinationMode === 'manual' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Deliver to Different Address</span>
                </button>
              </div>

              {/* Mode 1: Sensed Location Info Card */}
              {destinationMode === 'sensed' && (
                <div
                  className="p-4 rounded-2xl space-y-2.5 border"
                  style={{
                    background: isDark ? 'rgba(139,92,246,0.08)' : '#F5F3FF',
                    borderColor: isDark ? 'rgba(139,92,246,0.25)' : '#DDD6FE',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>
                        {sensedData?.isDetected
                          ? `Detected: ${sensedData.mostSpecific || sensedData.city || 'Detected Location'}`
                          : (detectingLocation ? 'Detecting device GPS & IP...' : 'Manual Selection Recommended')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleRunLocationDetection}
                      disabled={detectingLocation}
                      className="text-[11px] font-bold text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Navigation className={`h-3 w-3 ${detectingLocation ? 'animate-spin' : ''}`} />
                      <span>{detectingLocation ? 'Detecting...' : 'Refresh Location'}</span>
                    </button>
                  </div>

                  {sensedData?.isDetected && sensedData?.hierarchy && sensedData.hierarchy.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {sensedData.hierarchy.map((step, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-semibold"
                          style={{
                            background: isDark ? '#171B2B' : '#FFFFFF',
                            color: isDark ? '#CBD5E1' : '#334155',
                            border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                          }}
                        >
                          <span className="text-slate-400 text-[9px] uppercase">{step.level}:</span>
                          <span className="font-bold">{step.name}</span>
                          {idx < sensedData.hierarchy.length - 1 && <span className="text-purple-400 font-bold ml-1">→</span>}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400">
                    {sensedData?.isDetected
                      ? `Source: ${sensedData.detectionSource}. You can refine your specific street, sub-city, or landmark below.`
                      : (sensedData?.error || 'GPS or IP location detection assists in estimating your destination. You can freely edit below.')}
                  </p>
                </div>
              )}

              {/* Mode 2: Manual City Selection (Covering ALL 14 Ethiopian Regions) */}
              {destinationMode === 'manual' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                    Select Destination City / Region *
                  </label>
                  <select
                    value={shippingForm.city}
                    onChange={(e) => handleCitySelect(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none cursor-pointer"
                    style={{
                      background: isDark ? '#171B2B' : '#F8FAFC',
                      border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    }}
                  >
                    {ETHIOPIAN_REGIONS_AND_CITIES.map((reg) => (
                      <optgroup key={reg.region} label={`${reg.region} (${reg.type})`}>
                        {reg.cities.map((cityName) => (
                          <option
                            key={cityName}
                            value={cityName}
                            style={{ background: isDark ? '#111522' : '#FFF' }}
                          >
                            {cityName} — {reg.region}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              )}

              {/* Delivery Speed / Fee Tier Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  Delivery Option * (Choose One)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option A: Standard Delivery */}
                  <div
                    onClick={() => setDeliverySpeed('free')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      deliverySpeed === 'free'
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-md'
                        : isDark ? 'border-slate-800' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-black text-emerald-400">
                          {baseStandardFee === 0 ? 'Free Standard Delivery' : 'Standard Delivery'}
                        </span>
                      </div>
                      <span className="text-xs font-black text-emerald-400">
                        {baseStandardFee === 0 ? 'ETB 0' : `ETB ${baseStandardFee}`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {baseStandardFee === 0
                        ? 'Product Free Delivery applied. Dispatched via standard domestic courier (2-4 Days).'
                        : `Standard delivery fee based on product logistics (ETB ${baseStandardFee}).`}
                    </p>
                  </div>

                  {/* Option B: Paid Express Delivery */}
                  <div
                    onClick={() => setDeliverySpeed('paid')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      deliverySpeed === 'paid'
                        ? 'border-purple-500 bg-purple-500/10 shadow-md'
                        : isDark ? 'border-slate-800' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-400" />
                        <span className="text-xs font-black text-purple-400">Express Priority Delivery</span>
                      </div>
                      <span className="text-xs font-black text-purple-400">
                        ETB {baseStandardFee + 100}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Same-day / next-day priority dispatch with direct phone coordination.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                    Full Recipient Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Abebe Bikila"
                    value={shippingForm.fullName}
                    onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none"
                    style={{
                      background: isDark ? '#171B2B' : '#F8FAFC',
                      border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                    Ethiopian Phone Number *
                  </label>
                  <input
                    type="text"
                    placeholder="0911 234 567 or +251 9..."
                    value={shippingForm.phoneNumber}
                    onChange={handlePhoneChange}
                    className="w-full px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none"
                    style={{
                      background: isDark ? '#171B2B' : '#F8FAFC',
                      border: `1px solid ${phoneValidation.isValid ? (isDark ? '#252A3A' : '#E2E8F0') : '#EF4444'}`,
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    }}
                  />
                  {!phoneValidation.isValid && (
                    <p className="text-[11px] text-rose-500 mt-1">{phoneValidation.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                    Sub-City / District / Zone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bole / Kazanchis / Central"
                    value={shippingForm.subCity}
                    onChange={(e) => setShippingForm({ ...shippingForm, subCity: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none"
                    style={{
                      background: isDark ? '#171B2B' : '#F8FAFC',
                      border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                    Specific Street / House / Landmark *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Medhanialem Church, House 24B"
                    value={shippingForm.address}
                    onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none"
                    style={{
                      background: isDark ? '#171B2B' : '#F8FAFC',
                      border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleValidateStep1}
                className="btn-neon-primary w-full py-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-4"
              >
                <span>Continue to Payment Method</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              STEP 1: PAYMENT METHOD — Original Card Grid + Expanded Details
             ════════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div
              className="p-6 sm:p-8 rounded-3xl space-y-6"
              style={{
                background: isDark ? '#111522' : '#FFFFFF',
                border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
              }}
            >
              <div className="pb-4" style={{ borderBottom: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>
                <h2 className="text-xl font-black tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  Payment & Bank Transfer
                </h2>
                <p className="text-xs mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  Select your preferred Ethiopian payment option and transfer details
                </p>
              </div>

              {loadingMethods ? (
                <div className="py-10 text-center">
                  <Loader2 className="h-7 w-7 animate-spin text-purple-500 mx-auto" />
                </div>
              ) : (
                <div className="space-y-5">
                  {/* ── Provider Icon-Card Grid ── */}
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                      Select Payment Provider:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {paymentMethods.map((method) => {
                        const isSelected = selectedMethodId === method._id;
                        const brand = getProviderTheme(method.name, method.type);
                        return (
                          <button
                            key={method._id}
                            type="button"
                            onClick={() => setSelectedMethodId(method._id)}
                            className="flex flex-col items-center text-center p-3.5 rounded-2xl transition-all cursor-pointer shadow-sm"
                            style={{
                              background: isSelected ? (isDark ? '#171B2B' : '#FFFFFF') : 'transparent',
                              border: `2px solid ${isSelected ? '#8B5CF6' : (isDark ? '#252A3A' : '#E2E8F0')}`,
                              boxShadow: isSelected ? '0 0 15px rgba(139,92,246,0.25)' : 'none',
                            }}
                          >
                            <span className="text-2xl mb-1">{method.logoEmoji || brand.logo}</span>
                            <span className="text-xs font-bold line-clamp-1" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                              {method.name}
                            </span>
                            <span className="text-[10px] mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                              {brand.tag}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Active Provider Expanded Transfer Card ── */}
                  {selectedMethod && (
                    <motion.div
                      key={selectedMethod._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 sm:p-6 rounded-3xl space-y-4 shadow-lg"
                      style={{
                        background: isDark ? '#171B2B' : '#F8FAFC',
                        border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                      }}
                    >
                      {/* Card Header */}
                      <div
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3"
                        style={{ borderBottom: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{selectedMethod.logoEmoji || getProviderTheme(selectedMethod.name).logo}</span>
                          <div>
                            <h3 className="text-sm font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                              Transfer to {selectedMethod.name}
                            </h3>
                            <p className="text-xs" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                              Pay to recipient account details below
                            </p>
                          </div>
                        </div>
                        <span
                          className="px-3.5 py-1 rounded-full text-xs font-black text-white self-start sm:self-auto shadow-md"
                          style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)' }}
                        >
                          Amount: ETB {finalGrandTotal.toLocaleString()}
                        </span>
                      </div>

                      {/* Account Number Box with One-Click Copy */}
                      <div
                        className="grid sm:grid-cols-2 gap-3 p-4 rounded-2xl shadow-sm"
                        style={{
                          background: isDark ? '#111522' : '#FFFFFF',
                          border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                        }}
                      >
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
                            {selectedMethod.type === 'mobile_wallet' ? 'Merchant / Phone Number' : 'Account Number'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-base font-black font-mono" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                              {selectedMethod.accountNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyAccount(selectedMethod.accountNumber)}
                              className="p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                              style={{
                                background: isDark ? '#171B2B' : '#F1F5F9',
                                color: '#8B5CF6',
                                border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                              }}
                              title="Copy account number"
                            >
                              {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span className="text-[10px]">{copiedAccount ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
                            Account / Merchant Name
                          </p>
                          <p className="text-xs font-bold mt-1" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                            {selectedMethod.accountName}
                          </p>
                        </div>
                      </div>

                      {/* Step-by-step Numbered Transfer Guide */}
                      <div
                        className="p-4 rounded-2xl border space-y-2.5 shadow-xs"
                        style={{
                          background: isDark ? '#111522' : '#FFFFFF',
                          borderColor: isDark ? '#252A3A' : '#E2E8F0',
                        }}
                      >
                        <p className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-purple-400">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Step-by-Step Payment Transfer Guide:</span>
                        </p>
                        <div className="space-y-2 text-xs font-medium leading-relaxed">
                          {(() => {
                            let steps = [];
                            if (selectedMethod.guideSteps && selectedMethod.guideSteps.length > 0) {
                              steps = selectedMethod.guideSteps;
                            } else if (selectedMethod.instructions) {
                              steps = Array.isArray(selectedMethod.instructions)
                                ? selectedMethod.instructions
                                : selectedMethod.instructions.split('\n').filter(Boolean);
                            } else {
                              steps = [
                                `Open your ${selectedMethod.name} application or mobile banking portal.`,
                                `Select transfer/pay and input account number "${selectedMethod.accountNumber || selectedMethod.phoneNumber || 'Pending'}".`,
                                `Verify the recipient name matches "${selectedMethod.accountName || 'EthioShop PLC'}" and amount is ETB ${finalGrandTotal.toLocaleString()}.`,
                                `Complete the transfer, then provide your Transaction ID or upload your receipt below.`,
                              ];
                            }

                            return steps.map((rawStep, idx) => {
                              const cleanText = rawStep.replace(/^\d+[\.\)]\s*/, '').trim();
                              return (
                                <div key={idx} className="flex items-start gap-2.5">
                                  <span
                                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white shadow-xs"
                                    style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
                                  >
                                    {idx + 1}
                                  </span>
                                  <span className="pt-0.5" style={{ color: isDark ? '#CBD5E1' : '#334155' }}>
                                    {cleanText}
                                  </span>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>

                      {/* Transfer amount reminder */}
                      <div
                        className="flex items-center justify-between p-3 rounded-xl"
                        style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}
                      >
                        <span className="text-xs font-bold text-purple-300">Transfer Exactly:</span>
                        <span
                          className="text-sm font-black text-white px-3 py-1 rounded-lg"
                          style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)' }}
                        >
                          ETB {finalGrandTotal.toLocaleString()}
                        </span>
                      </div>

                      {/* Proof of Transfer Fields — inside the expanded card */}
                      <div className="pt-3 space-y-4" style={{ borderTop: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>
                        <h4 className="text-xs font-black uppercase tracking-wider" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                          Step 2: Submit Proof of Transfer
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-xs font-bold" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                              Transaction ID / Reference Number *
                            </label>
                            <input
                              type="text"
                              value={paymentProof.transactionId}
                              onChange={(e) => setPaymentProof({ ...paymentProof, transactionId: e.target.value })}
                              placeholder="e.g. FT2408281987 or TB-98762"
                              className="w-full px-4 py-3 rounded-xl text-sm font-mono uppercase focus:outline-none"
                              style={{
                                background: isDark ? '#111522' : '#FFFFFF',
                                border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                                color: isDark ? '#F8FAFC' : '#0F172A',
                              }}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-bold" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                              Sender Phone Number or Name
                            </label>
                            <input
                              type="text"
                              value={paymentProof.senderPhone}
                              onChange={(e) => setPaymentProof({ ...paymentProof, senderPhone: e.target.value })}
                              placeholder="e.g. 0911 234 567 or Abebe Bikila"
                              className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none"
                              style={{
                                background: isDark ? '#111522' : '#FFFFFF',
                                border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                                color: isDark ? '#F8FAFC' : '#0F172A',
                              }}
                            />
                          </div>
                        </div>
                        {/* Screenshot Upload */}
                        <div>
                          <label className="mb-1 block text-xs font-bold" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                            Upload Receipt Screenshot *
                          </label>
                          <label
                            htmlFor="receipt-upload"
                            className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all"
                            style={{
                              borderColor: paymentProof.receiptImage ? '#10B981' : (isDark ? '#252A3A' : '#CBD5E1'),
                              background: paymentProof.receiptImage
                                ? 'rgba(16,185,129,0.08)'
                                : (isDark ? '#111522' : '#FFFFFF'),
                            }}
                          >
                            {paymentProof.receiptImage ? (
                              <>
                                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                                <span className="text-xs font-bold text-emerald-400">Screenshot attached successfully! ✓</span>
                                <span className="text-[10px] text-slate-400">Click to replace</span>
                              </>
                            ) : (
                              <>
                                <UploadCloud className="h-6 w-6 text-slate-400" />
                                <span className="text-xs font-bold text-slate-400">Click to upload payment screenshot</span>
                                <span className="text-[10px] text-slate-500">JPG, PNG, or WEBP — max 5MB</span>
                              </>
                            )}
                          </label>
                          <input
                            id="receipt-upload"
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleReceiptUpload}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="px-6 py-3.5 rounded-2xl text-xs font-bold"
                  style={{ background: isDark ? '#171B2B' : '#F1F5F9', color: isDark ? '#94A3B8' : '#64748B' }}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleValidateStep2}
                  className="btn-neon-primary flex-1 py-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <span>Review & Confirm Order</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              STEP 2: REVIEW & COMPLETE
             ════════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div
              className="p-6 sm:p-8 rounded-3xl space-y-6"
              style={{
                background: isDark ? '#111522' : '#FFFFFF',
                border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
              }}
            >
              <div>
                <h2 className="text-xl font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  3. Final Order Summary
                </h2>
                <p className="text-xs mt-0.5 text-slate-400">
                  Confirm your order details before final submission.
                </p>
              </div>

              {/* Order Recap with Edit buttons */}
              <div
                className="rounded-2xl overflow-hidden text-xs"
                style={{
                  background: isDark ? '#171B2B' : '#F8FAFC',
                  border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                }}
              >
                {/* Delivery Section Header */}
                <div
                  className="flex items-center justify-between px-4 py-2.5"
                  style={{ borderBottom: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`, background: isDark ? '#111522' : '#F1F5F9' }}
                >
                  <span className="font-black uppercase tracking-wider text-[10px]" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Delivery Details</span>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all hover:opacity-80"
                    style={{ background: 'rgba(139,92,246,0.12)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.25)' }}
                  >
                    <Edit3 className="h-2.5 w-2.5" />
                    Edit
                  </button>
                </div>
                <div className="px-4 py-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recipient:</span>
                    <span className="font-bold">{shippingForm.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <span className="font-mono font-bold text-purple-400">{shippingForm.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Delivery Destination:</span>
                    <span className="font-bold text-right max-w-[60%]">{shippingForm.city}{shippingForm.address ? ` — ${shippingForm.address}` : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Delivery Mode:</span>
                    <span className={calculatedDeliveryFee === 0 ? 'text-emerald-400 font-bold' : 'text-purple-400 font-bold'}>
                      {calculatedDeliveryFee === 0 ? 'Free Delivery (ETB 0)' : `${deliverySpeed === 'paid' ? 'Express Priority' : 'Standard Delivery'} (ETB ${calculatedDeliveryFee})`}
                    </span>
                  </div>
                </div>

                {/* Payment Section Header */}
                <div
                  className="flex items-center justify-between px-4 py-2.5"
                  style={{ borderTop: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`, borderBottom: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`, background: isDark ? '#111522' : '#F1F5F9' }}
                >
                  <span className="font-black uppercase tracking-wider text-[10px]" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Payment</span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all hover:opacity-80"
                    style={{ background: 'rgba(139,92,246,0.12)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.25)' }}
                  >
                    <Edit3 className="h-2.5 w-2.5" />
                    Edit
                  </button>
                </div>
                <div className="px-4 py-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment Channel:</span>
                    <span className="font-bold text-emerald-400">{selectedMethod?.name}</span>
                  </div>
                  {paymentProof.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Transaction ID:</span>
                      <span className="font-mono font-bold text-purple-400">{paymentProof.transactionId}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3.5 rounded-2xl text-xs font-bold"
                  style={{ background: isDark ? '#171B2B' : '#F1F5F9', color: isDark ? '#94A3B8' : '#64748B' }}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleCompleteOrder}
                  disabled={submitting}
                  className="btn-neon-primary flex-1 py-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xl disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving Order in Database...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Place Order • ETB {finalGrandTotal.toLocaleString()}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Cost Breakdown */}
        <div className="lg:col-span-4">
          <div
            className="p-6 rounded-3xl sticky top-24 space-y-5"
            style={{
              background: isDark ? '#111522' : '#FFFFFF',
              border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
            }}
          >
            <h3 className="text-base font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              Order Breakdown
            </h3>

            {/* Cart Items List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item._id || item.id} className="flex items-center gap-3">
                  <img
                    src={item.image || item.imageUrl}
                    alt={item.name}
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-black">
                    ETB {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2.5 pt-4 border-t text-xs" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
              <div className="flex justify-between text-slate-400">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  ETB {subtotal.toLocaleString()}
                </span>
              </div>

              {/* Distinct Delivery Fee Line */}
              <div className="flex justify-between text-slate-400">
                <span>Shipping Cost</span>
                <span className={`font-bold ${calculatedDeliveryFee === 0 ? 'text-emerald-400' : 'text-purple-400'}`}>
                  {calculatedDeliveryFee === 0 ? 'Free Delivery (ETB 0)' : `ETB ${calculatedDeliveryFee}`}
                </span>
              </div>

              <div
                className="flex justify-between text-base font-black pt-3 border-t"
                style={{
                  borderColor: isDark ? '#252A3A' : '#E2E8F0',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                }}
              >
                <span>Final Total</span>
                <span className="text-gradient-brand">
                  ETB {finalGrandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
