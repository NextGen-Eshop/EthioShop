import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, Zap, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

export default function ForgotPassword() {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address format.');
      return;
    }
    setError('');
    setIsLoading(true);

    // Simulate API delay for password reset dispatch
    setTimeout(() => {
      setIsLoading(false);
      setSent(true);
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 transition-colors duration-300 relative overflow-hidden"
      style={{
        background: isDark ? '#080A12' : '#F8FAFC',
        color: isDark ? '#F8FAFC' : '#0F172A',
      }}
    >
      {/* Background Glow */}
      <div
        className="absolute top-1/3 -left-20 w-96 h-96 rounded-full pointer-events-none opacity-35 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-md mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="p-6 sm:p-8 rounded-3xl shadow-2xl relative"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
          }}
        >
          {/* Brand header */}
          <div className="flex items-center justify-between mb-8">
            <Link to="/home" className="inline-flex items-center gap-2 group">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
              >
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-black text-lg">
                <span>Ethio</span>
                <span className="text-gradient-brand">Shop</span>
              </span>
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold transition-colors hover:underline"
              style={{ color: isDark ? '#94A3B8' : '#64748B' }}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </Link>
          </div>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4 space-y-4"
            >
              <div
                className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center text-emerald-400"
                style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}
              >
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div>
                <h2 className="text-2xl font-black mb-1.5" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  Check your inbox
                </h2>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  If an account exists for <strong style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{email}</strong>, you will receive a secure password reset link shortly.
                </p>
              </div>

              <div className="pt-4">
                <Link
                  to="/login"
                  className="btn-neon-primary w-full py-3.5 text-xs font-bold inline-flex items-center justify-center gap-2"
                >
                  <span>Return to Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="mb-6">
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3"
                  style={{
                    background: 'rgba(139,92,246,0.12)',
                    color: '#8B5CF6',
                    border: '1px solid rgba(139,92,246,0.3)',
                  }}
                >
                  <Sparkles className="h-3 w-3" />
                  Account Recovery
                </div>
                <h2 className="text-2xl font-black tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  Reset password
                </h2>
                <p className="mt-1 text-xs sm:text-sm" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  Enter your registered email address and we'll send you recovery instructions.
                </p>
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="mb-4 p-3 rounded-2xl flex items-start gap-2 text-xs font-medium"
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

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label
                    htmlFor="reset-email"
                    className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                    style={{ color: isDark ? '#94A3B8' : '#64748B' }}
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                      style={{ color: isDark ? '#64748B' : '#94A3B8' }}
                    />
                    <input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="name@example.com"
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium focus:outline-none transition-all duration-200"
                      style={{
                        background: isDark ? '#171B2B' : '#F8FAFC',
                        border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#8B5CF6';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.18)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = isDark ? '#252A3A' : '#E2E8F0';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="btn-neon-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-2 mt-4 cursor-pointer shadow-lg disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending Instructions...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </motion.button>

                <p className="text-center text-xs pt-3" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  Remember your password?{' '}
                  <Link to="/login" className="font-bold text-purple-400 hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
