import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Navigation, CheckCircle2, Copy, Check,
  UploadCloud, X, CreditCard, ShieldCheck,
  AlertCircle, Clock, Sparkles, ArrowRight, ChevronRight
} from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

const steps = ['Delivery & Location', 'Payment & Transfer', 'Review & Confirm'];

// Ethiopian Payment Provider Accounts Info
const ETHIOPIAN_PROVIDERS = [
  {
    id: 'telebirr',
    name: 'Telebirr',
    tag: 'Ethio Telecom',
    badgeColor: 'from-[#e57e25] to-[#f9a03f]',
    textColor: 'text-[#e57e25]',
    accountLabel: 'Merchant / Phone Number',
    accountNumber: '+251 911 234 567',
    accountName: 'EthioShop Enterprise (Telebirr Merchant)',
    shortCode: '987654',
    logoEmoji: '📱',
    instructions: [
      'Open your Telebirr App or dial *127#',
      'Select "Send Money" or "Pay Merchant (987654)"',
      'Enter phone number 0911234567 or shortcode',
      'Enter the exact order amount and complete transfer',
      'Take a screenshot of the confirmation and enter the Transaction ID below',
    ],
  },
  {
    id: 'cbe',
    name: 'Commercial Bank of Ethiopia (CBE)',
    tag: 'CBE Birr / Mobile Banking',
    badgeColor: 'from-[#732282] to-[#9933ad]',
    textColor: 'text-[#9933ad]',
    accountLabel: 'CBE Account Number',
    accountNumber: '1000 4589 12345',
    accountName: 'EthioShop Private Limited Company',
    logoEmoji: '🏦',
    instructions: [
      'Open CBE Mobile Banking App or CBE Birr',
      'Select Transfer to Account / CBE Birr',
      'Enter Account Number: 1000458912345',
      'Confirm recipient name: "EthioShop Private Limited Company"',
      'Take a screenshot of the digital receipt and upload it below',
    ],
  },
  {
    id: 'awash',
    name: 'Awash Bank',
    tag: 'Awash Birr / Mobile',
    badgeColor: 'from-[#005a9c] to-[#0088cc]',
    textColor: 'text-[#0088cc]',
    accountLabel: 'Awash Account Number',
    accountNumber: '0132 0891 2450 00',
    accountName: 'EthioShop Trading PLC (Awash Bank)',
    logoEmoji: '🏛️',
    instructions: [
      'Open Awash Mobile Banking App or Awash Birr',
      'Select Transfer -> Within Awash Bank',
      'Enter Account Number: 01320891245000',
      'Verify account name "EthioShop Trading PLC"',
      'Submit the transfer confirmation screenshot below',
    ],
  },
  {
    id: 'boa',
    name: 'Bank of Abyssinia',
    tag: 'BOA / Apollo',
    badgeColor: 'from-[#c29b38] to-[#dfb850]',
    textColor: 'text-[#dfb850]',
    accountLabel: 'BOA Account Number',
    accountNumber: '8765 4321 0987 11',
    accountName: 'EthioShop E-Commerce Solutions',
    logoEmoji: '💳',
    instructions: [
      'Open BOA Mobile Banking or Apollo app',
      'Choose Transfer to Bank of Abyssinia Account',
      'Enter Account Number: 87654321098711',
      'Enter order total amount and proceed',
      'Upload the completed transfer slip or screenshot below',
    ],
  },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const fileInputRef = useRef(null);
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const [step, setStep] = useState(0);
  const [placed, setPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delivery & Location States
  const [delivery, setDelivery] = useState({
    firstName: user?.firstName || user?.name?.split(' ')[0] || '',
    lastName: user?.lastName || user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    city: 'Addis Ababa',
    subCity: 'Bole Sub-City',
    address: '',
    landmark: '',
    note: '',
  });

  const [locationMode, setLocationMode] = useState('sensed'); // 'sensed' | 'custom'
  const [sensedLocation, setSensedLocation] = useState(null);
  const [sensingLocation, setSensingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Payment states
  const [mainPayMethod, setMainPayMethod] = useState('ethiopian'); // 'ethiopian' | 'card' | 'cod'
  const [selectedProvider, setSelectedProvider] = useState('telebirr');
  const [transferDetails, setTransferDetails] = useState({
    transactionId: '',
    senderPhone: '',
    senderName: '',
    receiptImage: '',
    receiptFileName: '',
  });

  const [copiedField, setCopiedField] = useState('');
  const [errors, setErrors] = useState({});

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 2000 ? 0 : 150;
  const total = subtotal + shipping;

  // Auto-detect geolocation
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('GPS geolocation is not supported by your browser.');
      setLocationMode('custom');
      return;
    }

    setSensingLocation(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        let districtName = 'Bole Medhanialem / Atlas, Addis Ababa';
        if (latitude > 9.02) districtName = 'Yeka / CMC Area, Addis Ababa';
        else if (latitude < 8.98) districtName = 'Nifas Silk / Lafto, Addis Ababa';

        const locationData = {
          latitude: latitude.toFixed(4),
          longitude: longitude.toFixed(4),
          accuracy: Math.round(accuracy),
          placeName: districtName,
          timestamp: new Date().toLocaleTimeString(),
        };

        setSensedLocation(locationData);
        setSensingLocation(false);

        setDelivery((prev) => ({
          ...prev,
          city: 'Addis Ababa',
          subCity: districtName.split(',')[0].trim(),
          address: prev.address || `${districtName} (Detected GPS: ${locationData.latitude}, ${locationData.longitude})`,
        }));
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setSensingLocation(false);
        setLocationError('Could not detect exact GPS. You can type your delivery destination below.');
        setLocationMode('custom');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2500);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, receipt: 'File size must be under 5MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setTransferDetails((prev) => ({
        ...prev,
        receiptImage: reader.result,
        receiptFileName: file.name,
      }));
      setErrors((p) => ({ ...p, receipt: '' }));
    };
    reader.readAsDataURL(file);
  };

  const removeReceiptImage = () => {
    setTransferDetails((prev) => ({
      ...prev,
      receiptImage: '',
      receiptFileName: '',
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (items.length === 0 && !placed) {
    return (
      <div className="container-shell flex flex-col items-center justify-center py-32 text-center">
        <div className="text-5xl mb-4">🛒</div>
        <h2 className="text-2xl font-black mb-2" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Your cart is empty</h2>
        <p className="text-sm mb-6" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Add some products before checking out.</p>
        <Link to="/products" className="btn-neon-primary px-8 py-3 text-sm">Browse Products</Link>
      </div>
    );
  }

  // ORDER SUCCESS CONFIRMATION
  if (placed) {
    const activeProvider = ETHIOPIAN_PROVIDERS.find((p) => p.id === selectedProvider);

    return (
      <div style={{ background: isDark ? '#080A12' : '#F8FAFC', minHeight: '100vh' }} className="py-16">
        <div className="container-shell max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 md:p-10 text-center shadow-2xl rounded-3xl"
            style={{
              background: isDark ? '#111522' : '#FFFFFF',
              border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
            }}
          >
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 mx-auto shadow-lg">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h1 className="text-3xl font-black mb-2" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Order Confirmed!</h1>
            <p className="mb-6 text-sm" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              Thank you, <strong style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{delivery.firstName}</strong>! Your order has been placed and is being verified.
            </p>

            {/* Delivery & Location Badge */}
            <div
              className="p-4 rounded-2xl text-left mb-6 space-y-2"
              style={{
                background: isDark ? '#171B2B' : '#F8FAFC',
                border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
              }}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                <MapPin className="w-4 h-4" />
                <span>Delivery Destination ({locationMode === 'sensed' ? 'Auto-Sensed GPS' : 'Custom Destination'})</span>
              </div>
              <p className="text-sm font-semibold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{delivery.address}</p>
              <p className="text-xs" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                City: {delivery.city} {delivery.subCity ? `· ${delivery.subCity}` : ''} {delivery.landmark ? `· Landmark: ${delivery.landmark}` : ''}
              </p>
              {sensedLocation && locationMode === 'sensed' && (
                <p className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg inline-block">
                  📍 Coordinates: {sensedLocation.latitude}, {sensedLocation.longitude} (±{sensedLocation.accuracy}m)
                </p>
              )}
            </div>

            {/* Payment Method Details */}
            <div
              className="p-4 rounded-2xl text-left mb-6"
              style={{
                background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.12)',
                border: '1px solid rgba(245,158,11,0.3)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: '#F59E0B' }}>
                  <Clock className="w-3.5 h-3.5" />
                  Payment Verification: {mainPayMethod === 'ethiopian' ? activeProvider?.name : mainPayMethod.toUpperCase()}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Pending Verification
                </span>
              </div>
              {mainPayMethod === 'ethiopian' && transferDetails.transactionId && (
                <p className="text-xs mt-2" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  Transaction Ref: <strong className="font-mono text-purple-400">{transferDetails.transactionId}</strong>
                </p>
              )}
              {transferDetails.receiptFileName && (
                <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Screenshot attached: {transferDetails.receiptFileName}
                </p>
              )}
            </div>

            {/* Items Summary */}
            <div
              className="p-4 rounded-2xl text-left mb-8"
              style={{
                background: isDark ? '#171B2B' : '#F8FAFC',
                border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
              }}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>Purchased Items</p>
              {items.map((i) => (
                <div key={i.id} className="flex justify-between text-sm py-1.5" style={{ borderBottom: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>
                  <span style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{i.name} × {i.quantity}</span>
                  <span className="font-bold text-gradient-brand">ETB {(i.price * i.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between text-base font-black mt-3 pt-2" style={{ borderTop: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>
                <span style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Grand Total</span>
                <span className="text-gradient-brand">ETB {total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/home"
                onClick={clearCart}
                className="btn-neon-primary px-8 py-3 text-xs flex items-center justify-center gap-2"
              >
                <span>Back to Storefront</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/account"
                onClick={clearCart}
                className="btn-neon-secondary px-8 py-3 text-xs flex items-center justify-center"
              >
                View Order History
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const validateDelivery = () => {
    const e = {};
    if (!delivery.firstName.trim()) e.firstName = 'First name is required';
    if (!delivery.lastName.trim()) e.lastName = 'Last name is required';
    if (!delivery.email || !/\S+@\S+\.\S+/.test(delivery.email)) e.email = 'Valid email is required';
    if (!delivery.phone.trim()) e.phone = 'Phone number is required (e.g. 0911234567)';
    if (!delivery.address.trim()) e.address = 'Delivery address is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePayment = () => {
    const e = {};
    if (mainPayMethod === 'ethiopian') {
      if (!transferDetails.transactionId.trim()) {
        e.transactionId = 'Please enter your Transaction Reference / SMS Confirmation code';
      }
      if (!transferDetails.receiptImage) {
        e.receipt = 'Please upload a screenshot or photo of your payment receipt';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && !validateDelivery()) return;
    if (step === 1 && !validatePayment()) return;
    if (step < steps.length - 1) setStep((s) => s + 1);
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setPlaced(true);
      setIsSubmitting(false);
    }, 600);
  };

  const setField = (field) => (e) => {
    setDelivery((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  const currentProviderData = ETHIOPIAN_PROVIDERS.find((p) => p.id === selectedProvider);

  return (
    <div style={{ background: isDark ? '#080A12' : '#F8FAFC', minHeight: '100vh' }} className="transition-colors duration-300">
      <div className="container-shell py-10 max-w-6xl mx-auto px-4">
        {/* ── Progress Step Bar ── */}
        <div className="flex items-center justify-center gap-0 mb-10 overflow-x-auto no-scrollbar py-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center shrink-0">
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md"
                style={{
                  background: i === step
                    ? 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
                    : i < step
                    ? 'rgba(34,197,94,0.15)'
                    : (isDark ? '#111522' : '#F1F5F9'),
                  color: i === step
                    ? '#FFFFFF'
                    : i < step
                    ? '#22C55E'
                    : (isDark ? '#94A3B8' : '#64748B'),
                  border: `1px solid ${i === step ? 'transparent' : (isDark ? '#252A3A' : '#E2E8F0')}`,
                }}
              >
                {i < step ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-[10px]">
                    {i + 1}
                  </span>
                )}
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className="w-6 sm:w-12 h-[2px] mx-1.5"
                  style={{ background: i < step ? '#22C55E' : (isDark ? '#252A3A' : '#CBD5E1') }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
          {/* ── Left Step Content ── */}
          <div
            className="p-6 md:p-8 rounded-3xl shadow-xl transition-all"
            style={{
              background: isDark ? '#111522' : '#FFFFFF',
              border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
            }}
          >

            {/* ═══════════════════════════════════════════════════════════════
                STEP 0: DELIVERY & LOCATION
               ═══════════════════════════════════════════════════════════════ */}
            {step === 0 && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4" style={{ borderBottom: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>
                  <div>
                    <h2 className="text-xl font-black tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                      Delivery & Destination
                    </h2>
                    <p className="text-xs" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                      Select auto-sensed GPS or provide custom delivery destination
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={sensingLocation}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer w-fit"
                    style={{
                      background: isDark ? '#171B2B' : '#F1F5F9',
                      border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                      color: '#8B5CF6',
                    }}
                  >
                    <Navigation className={`w-3.5 h-3.5 ${sensingLocation ? 'animate-spin' : ''}`} />
                    <span>{sensingLocation ? 'Sensing GPS...' : 'Re-Detect GPS'}</span>
                  </button>
                </div>

                {/* Location Detection Selector Box */}
                <div
                  className="rounded-2xl p-5 space-y-4 shadow-sm"
                  style={{
                    background: isDark ? '#171B2B' : '#F8FAFC',
                    border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Customer Location Detection</h4>
                      <p className="text-xs" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Choose how you would like our couriers to locate you</p>
                    </div>
                  </div>

                  {/* Toggle: Sensed Location vs Custom Destination */}
                  <div className="grid sm:grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setLocationMode('sensed');
                        if (sensedLocation) {
                          setDelivery((p) => ({
                            ...p,
                            city: 'Addis Ababa',
                            subCity: sensedLocation.placeName.split(',')[0].trim(),
                            address: `${sensedLocation.placeName} (Coordinates: ${sensedLocation.latitude}, ${sensedLocation.longitude})`,
                          }));
                        }
                      }}
                      className="flex items-start gap-3 p-4 rounded-xl text-left transition-all cursor-pointer"
                      style={{
                        background: locationMode === 'sensed' ? (isDark ? '#111522' : '#FFFFFF') : 'transparent',
                        border: `2px solid ${locationMode === 'sensed' ? '#8B5CF6' : (isDark ? '#252A3A' : '#E2E8F0')}`,
                        boxShadow: locationMode === 'sensed' ? '0 0 15px rgba(139,92,246,0.2)' : 'none',
                      }}
                    >
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 rounded-full border-2 items-center justify-center"
                        style={{ borderColor: locationMode === 'sensed' ? '#8B5CF6' : (isDark ? '#4B5563' : '#CBD5E1') }}>
                        {locationMode === 'sensed' && <div className="h-2 w-2 rounded-full bg-purple-500" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold flex items-center gap-1.5" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                          <span>📍 Use Sensed Location</span>
                          {sensedLocation && <span className="text-[9px] text-emerald-400 font-black bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">Live</span>}
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                          {sensedLocation ? sensedLocation.placeName : 'Detecting GPS position...'}
                        </p>
                        {sensedLocation && (
                          <p className="text-[10px] font-mono text-purple-400 mt-1">
                            {sensedLocation.latitude}, {sensedLocation.longitude} (±{sensedLocation.accuracy}m)
                          </p>
                        )}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLocationMode('custom')}
                      className="flex items-start gap-3 p-4 rounded-xl text-left transition-all cursor-pointer"
                      style={{
                        background: locationMode === 'custom' ? (isDark ? '#111522' : '#FFFFFF') : 'transparent',
                        border: `2px solid ${locationMode === 'custom' ? '#8B5CF6' : (isDark ? '#252A3A' : '#E2E8F0')}`,
                        boxShadow: locationMode === 'custom' ? '0 0 15px rgba(139,92,246,0.2)' : 'none',
                      }}
                    >
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 rounded-full border-2 items-center justify-center"
                        style={{ borderColor: locationMode === 'custom' ? '#8B5CF6' : (isDark ? '#4B5563' : '#CBD5E1') }}>
                        {locationMode === 'custom' && <div className="h-2 w-2 rounded-full bg-purple-500" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>✏️ Custom Destination Address</p>
                        <p className="text-[11px] mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Specify your street, landmark, house number, or delivery notes</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>First Name *</label>
                    <input
                      type="text"
                      value={delivery.firstName}
                      onChange={setField('firstName')}
                      placeholder="e.g. Yehwala"
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none"
                      style={{
                        background: isDark ? '#171B2B' : '#F1F5F9',
                        border: `1px solid ${errors.firstName ? '#F43F5E' : (isDark ? '#252A3A' : '#E2E8F0')}`,
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                    />
                    {errors.firstName && <p className="text-xs text-rose-500 mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Last Name *</label>
                    <input
                      type="text"
                      value={delivery.lastName}
                      onChange={setField('lastName')}
                      placeholder="e.g. Obssi"
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none"
                      style={{
                        background: isDark ? '#171B2B' : '#F1F5F9',
                        border: `1px solid ${errors.lastName ? '#F43F5E' : (isDark ? '#252A3A' : '#E2E8F0')}`,
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                    />
                    {errors.lastName && <p className="text-xs text-rose-500 mt-1">{errors.lastName}</p>}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Phone Number (for Courier & SMS) *</label>
                    <input
                      type="tel"
                      value={delivery.phone}
                      onChange={setField('phone')}
                      placeholder="0911 234 567"
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none"
                      style={{
                        background: isDark ? '#171B2B' : '#F1F5F9',
                        border: `1px solid ${errors.phone ? '#F43F5E' : (isDark ? '#252A3A' : '#E2E8F0')}`,
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                    />
                    {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Email Address *</label>
                    <input
                      type="email"
                      value={delivery.email}
                      onChange={setField('email')}
                      placeholder="yehwalaobssi@gmail.com"
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none"
                      style={{
                        background: isDark ? '#171B2B' : '#F1F5F9',
                        border: `1px solid ${errors.email ? '#F43F5E' : (isDark ? '#252A3A' : '#E2E8F0')}`,
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                    />
                    {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>City / Region</label>
                    <input
                      type="text"
                      value={delivery.city}
                      onChange={setField('city')}
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none"
                      style={{
                        background: isDark ? '#171B2B' : '#F1F5F9',
                        border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Sub-City / Area</label>
                    <select
                      value={delivery.subCity}
                      onChange={setField('subCity')}
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none cursor-pointer"
                      style={{
                        background: isDark ? '#171B2B' : '#F1F5F9',
                        border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                    >
                      <option value="Bole Sub-City">Bole Sub-City (Atlas, Medhanialem, Gerji)</option>
                      <option value="Yeka Sub-City">Yeka Sub-City (CMC, Megenagna, Ayat)</option>
                      <option value="Kirkos Sub-City">Kirkos Sub-City (Kazanchis, Mexico, Meskel)</option>
                      <option value="Arada Sub-City">Arada Sub-City (Piassa, 4 Kilo, 6 Kilo)</option>
                      <option value="Nifas Silk Sub-City">Nifas Silk / Lafto (Sarbet, Jemo, Gotera)</option>
                      <option value="Other Regional City">Other Regional City (Hawassa, Bahir Dar, etc.)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Delivery Destination / Detailed Street Address *</label>
                    <input
                      type="text"
                      value={delivery.address}
                      onChange={setField('address')}
                      placeholder="Bole Medhanialem / Atlas, Addis Ababa"
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none"
                      style={{
                        background: isDark ? '#171B2B' : '#F1F5F9',
                        border: `1px solid ${errors.address ? '#F43F5E' : (isDark ? '#252A3A' : '#E2E8F0')}`,
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                    />
                    {errors.address && <p className="text-xs text-rose-500 mt-1">{errors.address}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Prominent Landmark & Instructions (Optional)</label>
                    <input
                      type="text"
                      value={delivery.landmark}
                      onChange={setField('landmark')}
                      placeholder="e.g. Behind Friendship Building, opposite to Awash Bank"
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none"
                      style={{
                        background: isDark ? '#171B2B' : '#F1F5F9',
                        border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                STEP 1: PAYMENT (TELEBIRR, CBE, AWASH BANK, RECEIPT UPLOAD)
               ═══════════════════════════════════════════════════════════════ */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="pb-4" style={{ borderBottom: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>
                  <h2 className="text-xl font-black tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                    Payment & Bank Transfer
                  </h2>
                  <p className="text-xs" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                    Select your preferred Ethiopian payment option and transfer details
                  </p>
                </div>

                {/* Main Method Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'ethiopian', label: 'Ethiopian Transfer', sub: 'Telebirr, CBE, Awash, BOA', icon: '🇪🇹' },
                    { id: 'card', label: 'Credit / Debit Card', sub: 'Visa & Mastercard', icon: '💳' },
                    { id: 'cod', label: 'Cash on Delivery', sub: 'Pay in cash on arrival', icon: '💵' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setMainPayMethod(opt.id)}
                      className="flex flex-col p-4 rounded-2xl text-left transition-all cursor-pointer shadow-sm"
                      style={{
                        background: mainPayMethod === opt.id ? (isDark ? '#171B2B' : '#FFFFFF') : 'transparent',
                        border: `2px solid ${mainPayMethod === opt.id ? '#8B5CF6' : (isDark ? '#252A3A' : '#E2E8F0')}`,
                        boxShadow: mainPayMethod === opt.id ? '0 0 15px rgba(139,92,246,0.25)' : 'none',
                      }}
                    >
                      <span className="text-2xl mb-1">{opt.icon}</span>
                      <span className="text-xs font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{opt.label}</span>
                      <span className="text-[11px] mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{opt.sub}</span>
                    </button>
                  ))}
                </div>

                {/* ETHIOPIAN PROVIDER CHOICES (Telebirr, CBE, Awash Bank, BOA) */}
                {mainPayMethod === 'ethiopian' && (
                  <div className="space-y-6 pt-2">
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                        Select Payment Provider (Telebirr, CBE, Awash Bank, BOA):
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {ETHIOPIAN_PROVIDERS.map((provider) => (
                          <button
                            key={provider.id}
                            type="button"
                            onClick={() => setSelectedProvider(provider.id)}
                            className="flex flex-col items-center text-center p-3.5 rounded-2xl transition-all cursor-pointer shadow-sm"
                            style={{
                              background: selectedProvider === provider.id ? (isDark ? '#171B2B' : '#FFFFFF') : 'transparent',
                              border: `2px solid ${selectedProvider === provider.id ? '#8B5CF6' : (isDark ? '#252A3A' : '#E2E8F0')}`,
                              boxShadow: selectedProvider === provider.id ? '0 0 15px rgba(139,92,246,0.25)' : 'none',
                            }}
                          >
                            <span className="text-2xl mb-1">{provider.logoEmoji}</span>
                            <span className="text-xs font-bold line-clamp-1" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{provider.name}</span>
                            <span className="text-[10px]" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{provider.tag}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ACTIVE PROVIDER TRANSFER INSTRUCTIONS & ACCOUNT INFO */}
                    {currentProviderData && (
                      <motion.div
                        key={currentProviderData.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 sm:p-6 rounded-3xl space-y-4 shadow-lg"
                        style={{
                          background: isDark ? '#171B2B' : '#F8FAFC',
                          border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                        }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3" style={{ borderBottom: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{currentProviderData.logoEmoji}</span>
                            <div>
                              <h3 className="text-sm font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                                Transfer to {currentProviderData.name}
                              </h3>
                              <p className="text-xs" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Pay recipient account details</p>
                            </div>
                          </div>
                          <span
                            className="px-3.5 py-1 rounded-full text-xs font-black text-white self-start sm:self-auto shadow-md"
                            style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)' }}
                          >
                            Amount: ETB {total.toLocaleString()}
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
                              {currentProviderData.accountLabel}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-base font-black font-mono" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                                {currentProviderData.accountNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(currentProviderData.accountNumber.replace(/\s+/g, ''), 'acc')}
                                className="p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                                style={{
                                  background: isDark ? '#171B2B' : '#F1F5F9',
                                  color: '#8B5CF6',
                                  border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                                }}
                                title="Copy account number"
                              >
                                {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span className="text-[10px]">{copiedField === 'acc' ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                          </div>

                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
                              Account / Merchant Name
                            </p>
                            <p className="text-xs font-bold mt-1" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                              {currentProviderData.accountName}
                            </p>
                          </div>
                        </div>

                        {/* Instructions steps */}
                        <div>
                          <p className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: '#8B5CF6' }}>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Quick Transfer Guide:</span>
                          </p>
                          <ol className="space-y-1.5 text-xs list-decimal list-inside pl-1 font-medium leading-relaxed" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                            {currentProviderData.instructions.map((inst, idx) => (
                              <li key={idx}>{inst}</li>
                            ))}
                          </ol>
                        </div>

                        {/* SUBMIT TRANSACTION ID & RECEIPT SCREENSHOT */}
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
                                value={transferDetails.transactionId}
                                onChange={(e) => {
                                  setTransferDetails((p) => ({ ...p, transactionId: e.target.value }));
                                  setErrors((p) => ({ ...p, transactionId: '' }));
                                }}
                                placeholder="e.g. FT2408281987 or TB-98762"
                                className="w-full px-4 py-3 rounded-xl text-sm font-mono uppercase focus:outline-none"
                                style={{
                                  background: isDark ? '#111522' : '#FFFFFF',
                                  border: `1px solid ${errors.transactionId ? '#F43F5E' : (isDark ? '#252A3A' : '#E2E8F0')}`,
                                  color: isDark ? '#F8FAFC' : '#0F172A',
                                }}
                              />
                              {errors.transactionId && (
                                <p className="text-xs text-rose-500 mt-1">{errors.transactionId}</p>
                              )}
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-bold" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                                Sender Phone Number or Name
                              </label>
                              <input
                                type="text"
                                value={transferDetails.senderPhone}
                                onChange={(e) => setTransferDetails((p) => ({ ...p, senderPhone: e.target.value }))}
                                placeholder="e.g. 0911 234 567"
                                className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none"
                                style={{
                                  background: isDark ? '#111522' : '#FFFFFF',
                                  border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                                  color: isDark ? '#F8FAFC' : '#0F172A',
                                }}
                              />
                            </div>
                          </div>

                          {/* Screenshot File Upload */}
                          <div>
                            <label className="mb-1 block text-xs font-bold" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                              Upload Transfer Receipt / Screenshot *
                            </label>

                            {transferDetails.receiptImage ? (
                              <div
                                className="relative flex items-center gap-3 p-3.5 rounded-2xl"
                                style={{
                                  background: 'rgba(34,197,94,0.12)',
                                  border: '1px solid rgba(34,197,94,0.3)',
                                }}
                              >
                                <img
                                  src={transferDetails.receiptImage}
                                  alt="Receipt preview"
                                  className="h-16 w-16 rounded-xl object-cover border border-emerald-500/30"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-emerald-400 line-clamp-1">
                                    {transferDetails.receiptFileName || 'payment_receipt.png'}
                                  </p>
                                  <p className="text-[11px] text-emerald-300 mt-0.5 flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5" /> Screenshot successfully attached
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={removeReceiptImage}
                                  className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
                                  title="Remove screenshot"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all"
                                style={{
                                  background: isDark ? '#111522' : '#FFFFFF',
                                  borderColor: errors.receipt ? '#F43F5E' : (isDark ? '#252A3A' : '#E2E8F0'),
                                }}
                              >
                                <UploadCloud className="h-8 w-8 text-purple-400 mb-2" />
                                <p className="text-xs font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                                  Click to upload payment confirmation screenshot
                                </p>
                                <p className="text-[11px] mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                                  PNG, JPG, or PDF up to 5MB
                                </p>
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                />
                              </div>
                            )}
                            {errors.receipt && (
                              <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" /> {errors.receipt}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* CARD PAYMENT */}
                {mainPayMethod === 'card' && (
                  <div
                    className="p-5 rounded-2xl space-y-3"
                    style={{
                      background: isDark ? '#171B2B' : '#F8FAFC',
                      border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                    }}
                  >
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Card Number</label>
                      <input className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none" style={{ background: isDark ? '#111522' : '#FFFFFF', border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`, color: isDark ? '#F8FAFC' : '#0F172A' }} placeholder="1234 5678 9012 3456" maxLength={19} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Expiry</label>
                        <input className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none" style={{ background: isDark ? '#111522' : '#FFFFFF', border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`, color: isDark ? '#F8FAFC' : '#0F172A' }} placeholder="MM / YY" maxLength={7} />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>CVV</label>
                        <input className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none" style={{ background: isDark ? '#111522' : '#FFFFFF', border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`, color: isDark ? '#F8FAFC' : '#0F172A' }} placeholder="•••" maxLength={4} type="password" />
                      </div>
                    </div>
                  </div>
                )}

                {/* CASH ON DELIVERY */}
                {mainPayMethod === 'cod' && (
                  <div
                    className="p-5 rounded-2xl space-y-1 text-xs"
                    style={{
                      background: 'rgba(34,197,94,0.12)',
                      border: '1px solid rgba(34,197,94,0.3)',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    }}
                  >
                    <p className="font-bold text-sm text-emerald-400">💵 Cash on Delivery Selected</p>
                    <p style={{ color: isDark ? '#94A3B8' : '#64748B' }}>You can pay in cash to the courier upon receiving and inspecting your items.</p>
                  </div>
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                STEP 2: REVIEW & CONFIRM
               ═══════════════════════════════════════════════════════════════ */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="pb-4" style={{ borderBottom: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>
                  <h2 className="text-xl font-black tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                    Review & Place Order
                  </h2>
                  <p className="text-xs" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                    Verify your delivery destination and payment details before finalizing
                  </p>
                </div>

                {/* Delivery Destination review card */}
                <div
                  className="p-5 rounded-2xl space-y-2 shadow-sm"
                  style={{
                    background: isDark ? '#171B2B' : '#F8FAFC',
                    border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      Delivery Destination ({locationMode === 'sensed' ? 'Auto-Sensed GPS' : 'Custom Address'})
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className="text-xs font-bold text-purple-400 hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-sm font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                    {delivery.firstName} {delivery.lastName}
                  </p>
                  <p className="text-xs" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{delivery.address}</p>
                  <p className="text-xs" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
                    {delivery.city} {delivery.subCity ? `· ${delivery.subCity}` : ''} {delivery.landmark ? `· Near ${delivery.landmark}` : ''}
                  </p>
                  <p className="text-xs" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
                    📞 {delivery.phone} · ✉️ {delivery.email}
                  </p>
                </div>

                {/* Payment review card */}
                <div
                  className="p-5 rounded-2xl space-y-2 shadow-sm"
                  style={{
                    background: isDark ? '#171B2B' : '#F8FAFC',
                    border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4" />
                      Payment Method
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-bold text-purple-400 hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-sm font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                    {mainPayMethod === 'ethiopian'
                      ? `Ethiopian Transfer via ${currentProviderData?.name}`
                      : mainPayMethod === 'cod'
                      ? 'Cash on Delivery (COD)'
                      : 'Credit / Debit Card'}
                  </p>
                  {mainPayMethod === 'ethiopian' && (
                    <div className="space-y-1 text-xs" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                      <p>
                        Transaction ID: <span className="font-mono font-bold text-purple-400">{transferDetails.transactionId}</span>
                      </p>
                      {transferDetails.receiptFileName && (
                        <p className="text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Screenshot: {transferDetails.receiptFileName}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Items Card */}
                <div
                  className="p-5 rounded-2xl space-y-3 shadow-sm"
                  style={{
                    background: isDark ? '#171B2B' : '#F8FAFC',
                    border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                  }}
                >
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
                    Order Items ({items.length})
                  </p>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {items.map((i) => (
                      <div key={i.id} className="flex items-center gap-3">
                        <img src={i.image} alt={i.name} className="w-10 h-10 rounded-xl object-cover" style={{ background: isDark ? '#111522' : '#FFFFFF' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold line-clamp-1" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{i.name}</p>
                          <p className="text-[11px]" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>Qty: {i.quantity}</p>
                        </div>
                        <p className="text-xs font-bold text-gradient-brand">ETB {(i.price * i.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Action Buttons ── */}
            <div className="flex items-center gap-3 mt-8 pt-4" style={{ borderTop: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="btn-neon-secondary px-6 py-3 text-xs font-bold cursor-pointer"
                >
                  Back
                </button>
              )}
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-neon-primary flex-1 px-6 py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <span>Continue to {steps[step + 1]}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handlePlaceOrder}
                  className="btn-neon-primary flex-1 px-6 py-3.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xl"
                  style={{
                    background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                    boxShadow: '0 0 25px rgba(34,197,94,0.4)',
                  }}
                >
                  <span>{isSubmitting ? 'Placing Order...' : `Confirm & Place Order — ETB ${total.toLocaleString()}`}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* ── Right Order Summary Sticky Box (Scrollable) ── */}
          <div
            className="p-6 rounded-3xl sticky top-24 space-y-4 shadow-xl max-h-[calc(100vh-7rem)] overflow-y-auto flex flex-col"
            style={{
              background: isDark ? '#111522' : '#FFFFFF',
              border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
            }}
          >
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>
              <h3 className="text-sm font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                Order Summary
              </h3>
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

            {/* Scrollable Products List in Summary */}
            <div
              className="space-y-3 max-h-56 sm:max-h-64 lg:max-h-72 overflow-y-auto pr-1.5 focus:outline-none"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: isDark ? '#252A3A transparent' : '#CBD5E1 transparent',
              }}
            >
              {items.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center gap-3 p-2 rounded-2xl transition-all"
                  style={{
                    background: isDark ? '#171B2B' : '#F8FAFC',
                    border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                  }}
                >
                  <div className="relative shrink-0">
                    <img src={i.image} alt={i.name} className="w-12 h-12 rounded-xl object-cover" style={{ background: isDark ? '#111522' : '#FFFFFF' }} />
                    <span
                      className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-md"
                      style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)' }}
                    >
                      {i.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold line-clamp-1" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{i.name}</p>
                    <p className="text-[11px]" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>ETB {i.price.toLocaleString()}</p>
                  </div>
                  <p className="text-xs font-bold text-gradient-brand shrink-0">
                    ETB {(i.price * i.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-3 space-y-2 text-xs mt-auto" style={{ borderTop: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>
              <div className="flex justify-between" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                <span>Subtotal</span>
                <span className="font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>ETB {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                <span>Shipping Fee</span>
                <span className="font-bold text-emerald-400">
                  {shipping === 0 ? 'Free Delivery' : `ETB ${shipping}`}
                </span>
              </div>
              <div className="flex justify-between font-black text-base pt-2" style={{ color: isDark ? '#F8FAFC' : '#0F172A', borderTop: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>
                <span>Total Amount</span>
                <span className="text-gradient-brand">ETB {total.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2">
              <div
                className="p-3 rounded-2xl text-[11px] font-bold flex items-center gap-2"
                style={{
                  background: 'rgba(34,197,94,0.12)',
                  color: isDark ? '#22C55E' : '#15803D',
                  border: '1px solid rgba(34,197,94,0.25)',
                }}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>100% Secure Checkout & Escrow Protection</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
