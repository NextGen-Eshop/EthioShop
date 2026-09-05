import { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  AlertCircle,
  Loader2,
  Check,
  X,
  ShieldAlert
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { signInWithGoogle } from '../../utils/googleSignIn';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const registerEmail = useAuthStore((state) => state.registerEmail);
  const signInGoogle = useAuthStore((state) => state.signInGoogle);
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const redirectParam = new URLSearchParams(location.search).get('redirect');

  const getDestination = (registeredUser) => {
    const role = (registeredUser?.role || '').toLowerCase().trim();
    if (role === 'admin') {
      if (redirectParam && redirectParam.startsWith('/admin')) {
        return redirectParam;
      }
      return '/admin/overview';
    }
    if (role === 'staff') {
      if (redirectParam && redirectParam.startsWith('/staff')) {
        return redirectParam;
      }
      return '/staff/overview';
    }
    // Strictly customer user role: cannot access admin or staff URLs
    if (redirectParam && !redirectParam.startsWith('/admin') && !redirectParam.startsWith('/staff')) {
      return redirectParam;
    }
    return '/home';
  };

  // Strong Password Requirement Checks
  const passwordCriteria = useMemo(() => {
    const p = form.password;
    return {
      hasMinLength: p.length >= 8,
      hasUpper: /[A-Z]/.test(p),
      hasLower: /[a-z]/.test(p),
      hasNumber: /[0-9]/.test(p),
      hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p),
    };
  }, [form.password]);

  // Calculate score out of 5
  const passwordScore = useMemo(() => {
    let score = 0;
    if (passwordCriteria.hasMinLength) score += 1;
    if (passwordCriteria.hasUpper) score += 1;
    if (passwordCriteria.hasLower) score += 1;
    if (passwordCriteria.hasNumber) score += 1;
    if (passwordCriteria.hasSpecial) score += 1;
    return score;
  }, [passwordCriteria]);

  const strengthLabel = useMemo(() => {
    if (!form.password) return { label: 'None', color: '#64748B', percent: 0 };
    if (passwordScore <= 2) return { label: 'Weak', color: '#F43F5E', percent: 30 };
    if (passwordScore <= 3) return { label: 'Fair', color: '#F59E0B', percent: 60 };
    if (passwordScore === 4) return { label: 'Good', color: '#3B82F6', percent: 80 };
    return { label: 'Strong', color: '#22C55E', percent: 100 };
  }, [form.password, passwordScore]);

  const isPasswordStrong = passwordScore === 5;

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) {
      errors.name = 'Full name is required.';
    } else if (form.name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters.';
    }

    if (!form.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!form.password) {
      errors.password = 'Password is required.';
    } else if (!isPasswordStrong) {
      errors.password = 'Password is not strong enough. Please satisfy all 5 security requirements.';
    }

    if (!form.confirmPassword) {
      errors.confirmPassword = 'Confirm password is required.';
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!form.agreeTerms) {
      errors.agreeTerms = 'You must agree to the Terms of Service and Privacy Policy.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setError('');
    setIsLoading(true);
    try {
      const nameParts = form.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || nameParts[0];

      const userData = await registerEmail({
        firstName,
        lastName,
        email: form.email.trim(),
        password: form.password,
      });

      navigate(getDestination(userData), { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information and retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      const credential = await signInWithGoogle();
      const userData = await signInGoogle(credential);
      navigate(getDestination(userData), { replace: true });
    } catch (err) {
      setError(err.message || 'Google sign-up was cancelled or failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex items-center justify-center p-3 sm:p-6 md:p-8 transition-colors duration-300 relative overflow-hidden"
      style={{
        background: isDark ? '#080A12' : '#F8FAFC',
        color: isDark ? '#F8FAFC' : '#0F172A',
      }}
    >
      {/* Background Glow Orbs */}
      <div
        className="absolute top-1/4 -right-20 w-96 h-96 rounded-full pointer-events-none opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.25) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-1/4 -left-20 w-96 h-96 rounded-full pointer-events-none opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1.05fr_1.15fr] gap-6 md:gap-8 items-center relative z-10 py-4 sm:py-6">
        
        {/* Brand Showcase Panel (Rendered Vertically on Small Screens & Side-by-Side on Desktop) */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col justify-between p-5 sm:p-8 lg:p-12 rounded-3xl relative overflow-hidden"
          style={{
            background: isDark ? 'linear-gradient(145deg, #111522 0%, #171B2B 100%)' : 'linear-gradient(145deg, #FFFFFF 0%, #F1F5F9 100%)',
            border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
            boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.5)' : '0 20px 40px rgba(0,0,0,0.06)',
          }}
        >
          <div>
            <Link to="/home" className="inline-flex items-center gap-2.5 mb-5 sm:mb-8 group">
              <div
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl transition-transform group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                  boxShadow: '0 0 20px rgba(139,92,246,0.4)',
                }}
              >
                <Zap className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="font-black text-lg sm:text-xl tracking-tight" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
                <span style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Ethio</span>
                <span className="text-gradient-brand">Shop</span>
              </span>
            </Link>

            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4"
              style={{
                background: 'rgba(236,72,153,0.12)',
                color: '#EC4899',
                border: '1px solid rgba(236,72,153,0.3)',
              }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Join EthioShop
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              Create your <span className="text-gradient-brand">shopper account.</span>
            </h1>

            <p className="mt-2.5 sm:mt-4 text-xs sm:text-sm leading-relaxed" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              Unlock one-click reordering, saved delivery destinations with GPS sensing, and exclusive member discounts across electronics and lifestyle goods.
            </p>
          </div>

          <div className="space-y-3 pt-5 sm:pt-8 mt-5 sm:mt-6" style={{ borderTop: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>
            {[
              { title: 'End-to-End Account Security', desc: 'Strict password standards and encrypted credentials' },
              { title: 'Verified Ethiopian Gateways', desc: 'Protected checkout with Telebirr, CBE Birr & Awash Bank' },
              { title: 'Express Delivery Logistics', desc: '1–2 business day dispatch in Addis Ababa & nationwide' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 sm:gap-3">
                <div
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                  style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6' }}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{item.title}</p>
                  <p className="text-[11px]" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Side: Registration Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="p-5 sm:p-8 lg:p-10 rounded-3xl shadow-2xl relative"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
          }}
        >
          <div className="mb-5 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              Sign Up
            </h2>
            <p className="mt-1 text-xs sm:text-sm" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              Create your account with a secure, strong password.
            </p>
          </div>

          {/* Google Sign In Button */}
          <motion.button
            whileHover={{ scale: 1.015, y: -1 }}
            whileTap={{ scale: 0.985 }}
            type="button"
            onClick={handleGoogle}
            disabled={isGoogleLoading || isLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs disabled:opacity-60"
            style={{
              background: isDark ? '#171B2B' : '#FFFFFF',
              border: `1px solid ${isDark ? '#252A3A' : '#CBD5E1'}`,
              color: isDark ? '#F8FAFC' : '#0F172A',
            }}
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-pink-400" />
            ) : (
              <GoogleIcon />
            )}
            <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </motion.button>

          {/* OR Divider */}
          <div className="relative my-5 sm:my-6 flex items-center justify-center">
            <div className="w-full border-t" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }} />
            <span
              className="absolute px-3 text-[10px] sm:text-[11px] font-black uppercase tracking-wider"
              style={{
                background: isDark ? '#111522' : '#FFFFFF',
                color: isDark ? '#64748B' : '#94A3B8',
              }}
            >
              or register with email
            </span>
          </div>

          {/* Error Banner */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="mb-5 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs font-medium"
                style={{
                  background: 'rgba(244,63,94,0.12)',
                  color: '#F43F5E',
                  border: '1px solid rgba(244,63,94,0.3)',
                }}
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="register-name"
                className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                style={{ color: isDark ? '#94A3B8' : '#64748B' }}
              >
                Full Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                  style={{ color: fieldErrors.name ? '#F43F5E' : (isDark ? '#64748B' : '#94A3B8') }}
                />
                <input
                  id="register-name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, name: e.target.value }));
                    if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: '' }));
                    if (error) setError('');
                  }}
                  placeholder="Abebe Kebede"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium focus:outline-none transition-all duration-200"
                  style={{
                    background: isDark ? '#171B2B' : '#F8FAFC',
                    border: `1px solid ${fieldErrors.name ? '#F43F5E' : (isDark ? '#252A3A' : '#E2E8F0')}`,
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    boxShadow: fieldErrors.name ? '0 0 0 3px rgba(244,63,94,0.15)' : 'none',
                  }}
                  onFocus={(e) => {
                    if (!fieldErrors.name) {
                      e.currentTarget.style.borderColor = '#8B5CF6';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.18)';
                    }
                  }}
                  onBlur={(e) => {
                    if (!fieldErrors.name) {
                      e.currentTarget.style.borderColor = isDark ? '#252A3A' : '#E2E8F0';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1 pl-1">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="register-email"
                className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                style={{ color: isDark ? '#94A3B8' : '#64748B' }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                  style={{ color: fieldErrors.email ? '#F43F5E' : (isDark ? '#64748B' : '#94A3B8') }}
                />
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, email: e.target.value }));
                    if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: '' }));
                    if (error) setError('');
                  }}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium focus:outline-none transition-all duration-200"
                  style={{
                    background: isDark ? '#171B2B' : '#F8FAFC',
                    border: `1px solid ${fieldErrors.email ? '#F43F5E' : (isDark ? '#252A3A' : '#E2E8F0')}`,
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    boxShadow: fieldErrors.email ? '0 0 0 3px rgba(244,63,94,0.15)' : 'none',
                  }}
                  onFocus={(e) => {
                    if (!fieldErrors.email) {
                      e.currentTarget.style.borderColor = '#8B5CF6';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.18)';
                    }
                  }}
                  onBlur={(e) => {
                    if (!fieldErrors.email) {
                      e.currentTarget.style.borderColor = isDark ? '#252A3A' : '#E2E8F0';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1 pl-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password and Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="register-password"
                  className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: isDark ? '#94A3B8' : '#64748B' }}
                >
                  Password *
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                    style={{ color: fieldErrors.password ? '#F43F5E' : (isDark ? '#64748B' : '#94A3B8') }}
                  />
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, password: e.target.value }));
                      if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: '' }));
                      if (error) setError('');
                    }}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={(e) => {
                      setIsPasswordFocused(false);
                      if (!fieldErrors.password) {
                        e.currentTarget.style.borderColor = isDark ? '#252A3A' : '#E2E8F0';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                    placeholder="Create strong password"
                    className="w-full pl-11 pr-11 py-3.5 rounded-2xl text-sm font-medium focus:outline-none transition-all duration-200"
                    style={{
                      background: isDark ? '#171B2B' : '#F8FAFC',
                      border: `1px solid ${fieldErrors.password ? '#F43F5E' : (isDark ? '#252A3A' : '#E2E8F0')}`,
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      boxShadow: fieldErrors.password ? '0 0 0 3px rgba(244,63,94,0.15)' : 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xl text-xs transition-colors cursor-pointer"
                    style={{ color: isDark ? '#94A3B8' : '#64748B' }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <motion.div initial={false} animate={{ scale: [0.9, 1] }}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </motion.div>
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1 pl-1">{fieldErrors.password}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="register-confirm-password"
                  className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: isDark ? '#94A3B8' : '#64748B' }}
                >
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                    style={{ color: fieldErrors.confirmPassword ? '#F43F5E' : (isDark ? '#64748B' : '#94A3B8') }}
                  />
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, confirmPassword: e.target.value }));
                      if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: '' }));
                      if (error) setError('');
                    }}
                    placeholder="Repeat password"
                    className="w-full pl-11 pr-11 py-3.5 rounded-2xl text-sm font-medium focus:outline-none transition-all duration-200"
                    style={{
                      background: isDark ? '#171B2B' : '#F8FAFC',
                      border: `1px solid ${
                        fieldErrors.confirmPassword
                          ? '#F43F5E'
                          : form.confirmPassword && form.confirmPassword === form.password
                          ? '#22C55E'
                          : isDark ? '#252A3A' : '#E2E8F0'
                      }`,
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      boxShadow: fieldErrors.confirmPassword ? '0 0 0 3px rgba(244,63,94,0.15)' : 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xl text-xs transition-colors cursor-pointer"
                    style={{ color: isDark ? '#94A3B8' : '#64748B' }}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    <motion.div initial={false} animate={{ scale: [0.9, 1] }}>
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </motion.div>
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1 pl-1">{fieldErrors.confirmPassword}</p>
                )}
                {form.confirmPassword && form.confirmPassword === form.password && !fieldErrors.confirmPassword && (
                  <p className="text-[11px] text-emerald-400 font-semibold mt-1 pl-1 flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Passwords match
                  </p>
                )}
              </div>
            </div>

            {/* Real-time Password Strength Meter & Interactive Checklist */}
            {(form.password.length > 0 || isPasswordFocused) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-2xl space-y-3"
                style={{
                  background: isDark ? '#171B2B' : '#F8FAFC',
                  border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                }}
              >
                {/* Strength Header */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center gap-1.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                    <ShieldAlert className="h-3.5 w-3.5" style={{ color: strengthLabel.color }} />
                    Password Strength:
                  </span>
                  <span className="font-extrabold uppercase tracking-wider" style={{ color: strengthLabel.color }}>
                    {strengthLabel.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: isDark ? '#252A3A' : '#CBD5E1' }}>
                  <motion.div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${strengthLabel.percent}%`,
                      background: strengthLabel.color,
                      boxShadow: `0 0 10px ${strengthLabel.color}80`,
                    }}
                  />
                </div>

                {/* Checklist Requirements */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="flex items-center gap-2">
                    {passwordCriteria.hasMinLength ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 stroke-[3]" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                    )}
                    <span style={{ color: passwordCriteria.hasMinLength ? (isDark ? '#F8FAFC' : '#0F172A') : (isDark ? '#64748B' : '#94A3B8') }}>
                      At least 8 characters
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {passwordCriteria.hasUpper && passwordCriteria.hasLower ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 stroke-[3]" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                    )}
                    <span style={{ color: passwordCriteria.hasUpper && passwordCriteria.hasLower ? (isDark ? '#F8FAFC' : '#0F172A') : (isDark ? '#64748B' : '#94A3B8') }}>
                      Uppercase (A-Z) & Lowercase (a-z)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {passwordCriteria.hasNumber ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 stroke-[3]" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                    )}
                    <span style={{ color: passwordCriteria.hasNumber ? (isDark ? '#F8FAFC' : '#0F172A') : (isDark ? '#64748B' : '#94A3B8') }}>
                      At least 1 number (0-9)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {passwordCriteria.hasSpecial ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 stroke-[3]" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                    )}
                    <span style={{ color: passwordCriteria.hasSpecial ? (isDark ? '#F8FAFC' : '#0F172A') : (isDark ? '#64748B' : '#94A3B8') }}>
                      At least 1 symbol (!@#$%^&*)
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Terms and Conditions Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <div className="relative flex items-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={form.agreeTerms}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, agreeTerms: e.target.checked }));
                      if (fieldErrors.agreeTerms) setFieldErrors((p) => ({ ...p, agreeTerms: '' }));
                    }}
                    className="sr-only"
                  />
                  <div
                    className="h-5 w-5 rounded-lg flex items-center justify-center transition-all"
                    style={{
                      background: form.agreeTerms ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' : (isDark ? '#171B2B' : '#F8FAFC'),
                      border: `1.5px solid ${form.agreeTerms ? 'transparent' : (fieldErrors.agreeTerms ? '#F43F5E' : (isDark ? '#252A3A' : '#CBD5E1'))}`,
                      boxShadow: form.agreeTerms ? '0 0 10px rgba(139,92,246,0.35)' : 'none',
                    }}
                  >
                    {form.agreeTerms && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
                  </div>
                </div>
                <span className="text-xs leading-relaxed" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  I agree to the{' '}
                  <Link to="/terms" target="_blank" className="font-semibold text-purple-400 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" target="_blank" className="font-semibold text-pink-400 hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {fieldErrors.agreeTerms && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1 pl-8">{fieldErrors.agreeTerms}</p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="btn-neon-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-2 mt-6 cursor-pointer shadow-lg disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>

            <p className="text-center text-xs sm:text-sm pt-4" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-gradient-brand hover:underline transition-all"
              >
                Sign in
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
