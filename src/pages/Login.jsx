import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
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

export default function Login() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate login
    setTimeout(() => {
      setLoading(false);
      navigate('/home');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex flex-1 flex-col lg:flex-row">
        
        {/* LEFT — Brand Panel */}
        <div className="hidden lg:flex flex-1 flex-col justify-between px-12 xl:px-16 py-14 bg-indigo-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>
          
          <div className="relative z-10 text-white">
            <Link to="/home" className="flex items-center gap-2 mb-12">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 font-black text-xl">E</div>
              <span className="text-2xl font-black tracking-tight">EthioShop</span>
            </Link>
            
            <h1 className="text-5xl xl:text-6xl font-bold leading-tight mb-6">
              Welcome back to <br /> <span className="text-indigo-200">EthioShop.</span>
            </h1>
            <p className="text-lg text-indigo-100/80 leading-relaxed max-w-sm font-medium">
              Access your personalized dashboard, manage your orders, and explore the latest premium collections.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 text-white/60 text-xs font-semibold uppercase tracking-widest">
            <span>Quality</span>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <span>Service</span>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <span>Style</span>
          </div>
        </div>

        {/* RIGHT — Auth Card */}
        <div className="flex flex-1 items-center justify-center px-4 sm:px-6 py-16 lg:px-10 bg-white lg:bg-gray-50">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm bg-white rounded-[2rem] shadow-2xl shadow-indigo-100/50 p-6 sm:p-10 border border-gray-100"
          >
            <div className="mb-6">
              <div className="lg:hidden mb-4">
                <h1 className="text-2xl font-black text-gray-900 leading-tight">
                  Welcome back to <br /><span className="text-indigo-600">EthioShop.</span>
                </h1>
                <p className="text-xs text-gray-500 mt-2 font-medium">
                  Access your personalized dashboard and explore the latest premium collections.
                </p>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1 tracking-tight hidden lg:block">Sign In</h2>
              <p className="text-xs sm:text-sm text-gray-400 font-medium hidden lg:block">Enter your credentials to continue.</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 mb-6">
              <button className="pb-3 text-sm font-black text-gray-900 border-b-2 border-indigo-600 mr-6">
                Login
              </button>
              <Link to="/register" className="pb-3 text-sm font-bold text-gray-400 border-b-2 border-transparent hover:text-gray-600 transition-all">
                Sign Up
              </Link>
            </div>

            {/* Social Login */}
            <button className="w-full flex items-center justify-center gap-3 py-3.5 border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 active:scale-[0.98] transition-all mb-6">
              <GoogleIcon />
              Sign in with Google
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">OR EMAIL</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-medium text-gray-900"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                  <Link to="#" className="text-[10px] font-bold text-indigo-600 hover:underline tracking-wide uppercase">Forgot?</Link>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-medium text-gray-900 text-lg tracking-widest placeholder:tracking-normal"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    <EyeIcon open={showPw} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                <label htmlFor="remember" className="text-xs font-bold text-gray-500 cursor-pointer select-none">Remember me for 30 days</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  'Sign In to Account'
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-gray-400 font-bold">
              Don't have an account yet? {' '}
              <Link to="/register" className="text-indigo-600 hover:underline">Get Started</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
