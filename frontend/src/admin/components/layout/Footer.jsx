import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Package,
  ShoppingBag,
  CreditCard,
  BarChart3,
  Settings,
  Shield,
  Clock,
  Mail,
  ExternalLink,
  Sparkles,
  Zap,
  Megaphone,
} from 'lucide-react';
import { useThemeStore } from '../../../store/themeStore';

const adminFooterLinks = [
  { to: '/admin/overview', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/staff', label: 'Staff Team', icon: UserCog },
  { to: '/admin/products', label: 'Catalog', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/promotions', label: 'Discounts', icon: Sparkles },
  { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminFooter() {
  const year = new Date().getFullYear();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <footer
      className="w-full mt-14 border-t transition-colors duration-300"
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
            <Link to="/admin/overview" className="inline-flex items-center gap-3 group">
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
                  boxShadow: '0 0 16px rgba(236,72,153,0.35)',
                }}
              >
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className={`font-extrabold text-sm leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  EthioShop <span className="text-pink-500">Admin Control</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">Enterprise Management Platform</p>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Real-time platform operations, role permissions, inventory tracking, Chapa transactions, and advanced financial analytics.
            </p>

            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
              style={{
                background: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5',
                border: `1px solid ${isDark ? 'rgba(16,185,129,0.25)' : '#A7F3D0'}`,
                color: '#10B981',
              }}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold">All Systems Operational · Chapa Gateway Active</span>
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="space-y-3">
            <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              Management Links
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {adminFooterLinks.map((link) => {
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
                    <Icon className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Column 3: Administration Support */}
          <div className="space-y-3 text-xs">
            <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              System Support & Integration
            </h4>
            <div className="space-y-2 text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>Operating Hours: 24/7 Real-Time Platform Monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                <span>
                  Admin Contact:{' '}
                  <a href="mailto:admin@ethioshop.et" className="text-pink-400 hover:underline font-semibold">
                    admin@ethioshop.et
                  </a>
                </span>
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
        <div
          className={`mt-8 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] ${
            isDark ? 'border-white/[0.06] text-slate-500' : 'border-slate-200 text-slate-500'
          }`}
        >
          <span>© {year} EthioShop E-Commerce Platform. All rights reserved.</span>
          <div className="flex items-center gap-3">
            <Link to="/admin/overview" className="hover:text-pink-400 transition-colors">Dashboard</Link>
            <span>·</span>
            <Link to="/admin/products" className="hover:text-pink-400 transition-colors">Catalog</Link>
            <span>·</span>
            <Link to="/admin/orders" className="hover:text-pink-400 transition-colors">Orders</Link>
            <span>·</span>
            <span className="font-bold text-pink-400">Admin Control v2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
