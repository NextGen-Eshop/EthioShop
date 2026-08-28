import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option...',
  label,
  icon: Icon,
  disabled = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  // Normalize options to { value, label, icon, badge }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Handle clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative w-full text-left ${className}`} ref={dropdownRef}>
      {label && (
        <label className={`block text-xs font-bold mb-1.5 flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
          {Icon && <Icon className="h-3.5 w-3.5 text-slate-400" />}
          <span>{label}</span>
        </label>
      )}

      {/* Trigger Button */}
      <motion.button
        type="button"
        disabled={disabled}
        whileTap={{ scale: disabled ? 1 : 0.99 }}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full h-10 px-3.5 flex items-center justify-between gap-2 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer select-none ${
          disabled
            ? isDark
              ? 'opacity-50 cursor-not-allowed bg-[#151828] border-white/10 text-slate-400'
              : 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400'
            : isOpen
            ? isDark
              ? 'border-purple-500 bg-[#181c33] ring-2 ring-purple-500/20 text-white shadow-sm'
              : 'border-purple-600 bg-white ring-2 ring-purple-600/15 text-slate-900 shadow-sm'
            : isDark
            ? 'border-white/10 bg-[#181c33] text-slate-200 hover:border-purple-500/50 hover:bg-[#1e2344]'
            : 'border-slate-200 bg-slate-50/90 text-slate-800 hover:border-slate-300 hover:bg-white hover:shadow-xs'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && (
            <span className="shrink-0 text-slate-400">{selectedOption.icon}</span>
          )}
          <span className={
            selectedOption
              ? isDark ? 'text-white font-bold' : 'text-slate-900 font-bold'
              : isDark ? 'text-slate-500 font-normal' : 'text-slate-400 font-normal'
          }>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="text-slate-400 shrink-0 ml-1"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border p-1.5 shadow-xl focus:outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
              isDark
                ? 'bg-[#151828] border-white/10 shadow-black/40'
                : 'bg-white/95 border-slate-200 shadow-slate-900/10 backdrop-blur-xl'
            }`}
          >
            <div className="space-y-0.5">
              {normalizedOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <motion.button
                    key={opt.value}
                    type="button"
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? isDark
                          ? 'bg-purple-600/20 text-purple-300 font-bold'
                          : 'bg-purple-50 text-purple-700 font-bold shadow-2xs'
                        : isDark
                        ? 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                        : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {opt.icon && <span className="text-slate-400 shrink-0">{opt.icon}</span>}
                      <span>{opt.label}</span>
                      {opt.badge && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {opt.badge}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={isDark ? 'text-purple-400 shrink-0' : 'text-purple-600 shrink-0'}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
