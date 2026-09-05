import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, LogIn, UserPlus, X } from 'lucide-react';
import { useAuthPromptStore } from '../../store/authPromptStore';
import { useThemeStore } from '../../store/themeStore';

export default function AuthPromptModal() {
  const { isOpen, message, redirectUrl, closeAuthPrompt } = useAuthPromptStore();
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const targetRedirect = redirectUrl || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/home');
  const loginLink = `/login?redirect=${encodeURIComponent(targetRedirect)}`;
  const signupLink = `/register?redirect=${encodeURIComponent(targetRedirect)}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthPrompt}
          className="fixed inset-0 bg-black/65 backdrop-blur-xs cursor-pointer"
        />

        {/* Dialog Body */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl z-10 border transition-all"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #111522 0%, #171B2B 100%)'
              : 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
            borderColor: isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)',
            boxShadow: isDark
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(139, 92, 246, 0.15)'
              : '0 20px 40px -12px rgba(139, 92, 246, 0.15), 0 4px 12px rgba(0,0,0,0.05)',
          }}
        >
          {/* Close button */}
          <button
            onClick={closeAuthPrompt}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col items-center text-center space-y-4">
            {/* Icon */}
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' }}
            >
              <Lock className="h-7 w-7 text-white" />
            </div>

            {/* Title & Exact Message */}
            <div className="space-y-1.5">
              <h3
                className="text-lg sm:text-xl font-black tracking-tight"
                style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
              >
                Authentication Required
              </h3>
              <p
                className="text-sm font-semibold leading-relaxed"
                style={{ color: isDark ? '#E2E8F0' : '#334155' }}
              >
                {message || 'Please login or signup to proceed'}
              </p>
            </div>

            {/* Actions: Clickable Login Link & Signup */}
            <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
              <Link
                to={loginLink}
                onClick={closeAuthPrompt}
                id="auth-prompt-login-link"
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-md hover:opacity-95 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}
              >
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Link>

              <Link
                to={signupLink}
                onClick={closeAuthPrompt}
                id="auth-prompt-signup-link"
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm border flex items-center justify-center gap-2 transition-all cursor-pointer"
                style={{
                  borderColor: isDark ? '#252A3A' : '#E2E8F0',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                }}
              >
                <UserPlus className="h-4 w-4" />
                <span>Sign Up</span>
              </Link>
            </div>

            <p className="text-[11px] text-slate-400">
              Shopping cart and favorite wishlist are exclusive to registered customer accounts.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
