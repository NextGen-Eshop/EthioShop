import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

const EyeIcon = ({ open }) =>
  open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

const ErrorMsg = ({ msg }) => (
  <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1">
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
    </svg>
    {msg}
  </p>
);

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const user = useAuthStore((s) => s.user);
  const [showPw, setShowPw]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});

  // Redirect if already logged in
  if (user) { navigate('/home', { replace: true }); return null; }

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim())  e.lastName  = 'Last name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    else if (!/(?=.*[A-Z])/.test(form.password)) e.password = 'Must contain at least one uppercase letter';
    else if (!/(?=.*\d)/.test(form.password))    e.password = 'Must contain at least one number';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const result = register(form);
    if (result.success) {
      toast.success(`Welcome to EthioShop, ${result.user.name}!`);
      navigate('/home');
    } else {
      toast.error(result.error);
    }
  };

  const handleGoogle = () => toast('Google sign-up requires the backend to be connected.', { icon: 'ℹ️' });
  const handleApple  = () => toast('Apple sign-up requires the backend to be connected.', { icon: 'ℹ️' });

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: '' }));
  };

  // Password strength indicator
  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6)          s++;
    if (/[A-Z]/.test(p))        s++;
    if (/\d/.test(p))           s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'][strength];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* Toast handled by react-hot-toast Toaster in App.jsx */}

      {/* ── Main ── */}
      <div className="flex flex-1 flex-col lg:flex-row">

        {/* ── LEFT — dark hero panel ── */}
        <div className="hidden lg:flex flex-1 flex-col justify-between px-12 xl:px-16 py-14 bg-gray-50">
          <div>
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight text-gray-900 mb-4">
              Join The <span className="text-indigo-600">E-Shop</span><br />Community.
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Create your account to browse products, manage your cart, and place orders securely.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden w-full shadow-sm" style={{ aspectRatio: '4/3' }}>
            <img
              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&q=80"
              alt="E-Shop showcase"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* ── RIGHT — auth card ── */}
        <div className="flex flex-1 items-center justify-center px-4 sm:px-6 py-10 lg:px-10 bg-white lg:bg-transparent">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 sm:p-8">

            {/* Mobile brand */}
            <div className="lg:hidden mb-6 text-center">
              <p className="text-xl font-bold text-gray-900">
                Join <span className="text-indigo-600">E-Shop</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">Create your free account</p>
            </div>

            {/* Desktop brand */}
            <p className="hidden lg:block text-xs font-semibold text-indigo-600 tracking-widest mb-5 uppercase">
              E-Shop
            </p>

            {/* ── Tabs ── */}
            <div className="flex border-b border-gray-200 mb-5">
              <Link
                to="/login"
                className="pb-3 mr-6 text-sm font-medium text-gray-400 border-b-2 border-transparent -mb-px hover:text-gray-600 transition-colors"
              >
                Login
              </Link>
              <button className="pb-3 text-sm font-semibold text-gray-900 border-b-2 border-gray-900 -mb-px">
                Sign Up
              </button>
            </div>

            {/* ── Social ── */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={handleGoogle}
                className="flex flex-1 items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all cursor-pointer"
              >
                <GoogleIcon /> Google
              </button>
              <button
                onClick={handleApple}
                className="flex flex-1 items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all cursor-pointer"
              >
                <AppleIcon /> Apple
              </button>
            </div>

            {/* ── Divider ── */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[10px] font-semibold text-gray-400 tracking-widest">OR USE EMAIL</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} noValidate>

              {/* Name row */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 tracking-widest mb-1.5">FIRST NAME</label>
                  <input
                    type="text"
                    placeholder="First"
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={set('firstName')}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg outline-none transition-all placeholder-gray-300 text-gray-900 ${
                      errors.firstName
                        ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                    }`}
                  />
                  {errors.firstName && <ErrorMsg msg={errors.firstName} />}
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 tracking-widest mb-1.5">LAST NAME</label>
                  <input
                    type="text"
                    placeholder="Last"
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={set('lastName')}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg outline-none transition-all placeholder-gray-300 text-gray-900 ${
                      errors.lastName
                        ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                    }`}
                  />
                  {errors.lastName && <ErrorMsg msg={errors.lastName} />}
                </div>
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="block text-[10px] font-semibold text-gray-400 tracking-widest mb-1.5">IDENTITY</label>
                <input
                  type="email"
                  placeholder="Email Address"
                  autoComplete="email"
                  value={form.email}
                  onChange={set('email')}
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg outline-none transition-all placeholder-gray-300 text-gray-900 ${
                    errors.email
                      ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100'
                      : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                  }`}
                />
                {errors.email && <ErrorMsg msg={errors.email} />}
              </div>

              {/* Password */}
              <div className="mb-1">
                <label className="block text-[10px] font-semibold text-gray-400 tracking-widest mb-1.5">CREDENTIAL</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={set('password')}
                    className={`w-full px-3 py-2.5 pr-10 text-sm border rounded-lg outline-none transition-all placeholder-gray-300 text-gray-900 ${
                      errors.password
                        ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100'
                        : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon open={showPw} />
                  </button>
                </div>
                {errors.password && <ErrorMsg msg={errors.password} />}
              </div>

              {/* Password strength bar */}
              {form.password && (
                <div className="mb-3 mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400">
                    Strength: <span className="font-semibold text-gray-600">{strengthLabel}</span>
                  </p>
                </div>
              )}

              {/* Confirm Password */}
              <div className="mb-4">
                <label className="block text-[10px] font-semibold text-gray-400 tracking-widest mb-1.5">CONFIRM PASSWORD</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={set('confirmPassword')}
                    className={`w-full px-3 py-2.5 pr-10 text-sm border rounded-lg outline-none transition-all placeholder-gray-300 text-gray-900 ${
                      errors.confirmPassword
                        ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100'
                        : form.confirmPassword && form.password === form.confirmPassword
                          ? 'border-green-400 focus:ring-2 focus:ring-green-100'
                          : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
                {errors.confirmPassword && <ErrorMsg msg={errors.confirmPassword} />}
                {!errors.confirmPassword && form.confirmPassword && form.password === form.confirmPassword && (
                  <p className="flex items-center gap-1 text-[11px] text-green-600 mt-1">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                    Passwords match
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-sm font-semibold rounded-lg transition-all mb-4 cursor-pointer shadow-sm shadow-indigo-200"
              >
                Create Account
              </button>
            </form>

            {/* Terms */}
            <p className="text-[11px] text-gray-400 text-center leading-relaxed">
              By registering, you agree to our{' '}
              <a href="#" className="font-semibold text-gray-600 hover:underline">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="font-semibold text-gray-600 hover:underline">Privacy Policy</a>.
            </p>

            {/* Mobile login link */}
            <p className="lg:hidden text-center text-xs text-gray-400 mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="flex flex-col sm:flex-row items-center justify-between gap-2 px-6 sm:px-10 lg:px-14 py-4 border-t border-gray-200 bg-white">
        <div>
          <span className="text-sm font-semibold text-gray-700">E-Shop</span>
          <span className="hidden sm:inline text-xs text-gray-400 ml-3">© {new Date().getFullYear()} E-Shop E-Commerce. All rights reserved.</span>
        </div>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {['Privacy', 'Terms', 'Support', 'Contact'].map((l) => (
            <a key={l} href="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">{l}</a>
          ))}
        </div>
        <p className="sm:hidden text-[10px] text-gray-400">© {new Date().getFullYear()} E-Shop. All rights reserved.</p>
      </footer>
    </div>
  );
}
