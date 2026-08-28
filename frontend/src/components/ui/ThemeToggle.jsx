import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

export default function ThemeToggle({ className = '', showLabel = false }) {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={toggleTheme}
      className={`relative flex items-center justify-center rounded-full transition-all cursor-pointer select-none ${className}`}
      style={{
        width: showLabel ? 'auto' : '2.5rem',
        height: '2.5rem',
        padding: showLabel ? '0 1rem' : '0',
        background: isDark ? '#111522' : '#FFFFFF',
        border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
        boxShadow: isDark
          ? '0 0 15px rgba(139,92,246,0.15)'
          : '0 2px 8px rgba(0,0,0,0.06)',
      }}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="flex items-center gap-2">
        <motion.div
          key={theme}
          initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <Moon className="h-4.5 w-4.5 text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
          ) : (
            <Sun className="h-4.5 w-4.5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          )}
        </motion.div>
        {showLabel && (
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
          >
            {isDark ? 'Dark' : 'Light'}
          </span>
        )}
      </div>
    </motion.button>
  );
}
