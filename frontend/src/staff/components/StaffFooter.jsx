import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  CreditCard,
  Settings,
  ShieldCheck,
  Clock,
  Mail,
  ExternalLink,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

const footerLinks = [
  { to: '/staff/overview', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/staff/products', label: 'My Products', icon: Package },
  { to: '/staff/orders', label: 'Orders & Delivery', icon: ShoppingBag },
  { to: '/staff/payments', label: 'Chapa Payouts', icon: CreditCard },
  { to: '/staff/settings', label: 'Store Settings', icon: Settings },
];

export default function StaffFooter() {
  const year = new Date().getFullYear();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <footer
      className="w-full mt-12 border-t transition-colors duration-300"
      style={{
        background: isDark ? '#0D0F1C' : '#F1F5F9',
        borderTop: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
        color: isDark ? '#94A3B8' : '#64748B',
      }}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Column 1: Brand & Status */}
          <div className="space-y-3.5">
            <Link to="/staff/overview" className="inline-flex items-center gap-3 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
                <ShoppingBag className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className={`font-extrabold text-sm leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ShopEase <span className="text-purple-500">EthioShop</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">Staff Operations Hub</p>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Real-time inventory control, order fulfillment, delivery tracking, and Chapa instant wallet payouts.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold">All Systems Operational · Chapa Gateway Active</span>
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="space-y-3">
            <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              Quick Hub Links
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {footerLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2 py-1.5 px-2 rounded-lg font-medium transition-colors ${
                      isDark
                        ? 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Column 3: Staff Support & Payout info */}
          <div className="space-y-3 text-xs">
            <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              Staff Support
            </h4>
            <div className="space-y-2 text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>Operating Hours: Mon – Sat (8:30 AM – 6:00 PM EAT)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                <span>Support: <a href="mailto:staff@ethioshop.et" className="text-purple-400 hover:underline">staff@ethioshop.et</a></span>
              </div>
              <div className="pt-1">
                <a
                  href="https://chapa.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-colors ${
                    isDark
                      ? 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span>Chapa Financial Technologies</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className={`mt-8 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] ${
          isDark ? 'border-white/[0.06] text-slate-500' : 'border-slate-200 text-slate-500'
        }`}>
          <span>© {year} ShopEase / EthioShop E-Commerce Operations. All rights reserved.</span>
          <div className="flex items-center gap-3">
            <Link to="/staff/overview" className="hover:underline">Dashboard</Link>
            <span>·</span>
            <Link to="/staff/products" className="hover:underline">Products</Link>
            <span>·</span>
            <Link to="/staff/orders" className="hover:underline">Orders</Link>
            <span>·</span>
            <span className="font-semibold text-purple-400">Staff Portal v2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
