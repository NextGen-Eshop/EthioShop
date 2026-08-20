import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  CreditCard,
  Settings,
  Shield,
  Clock,
  Mail,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

const footerLinks = [
  { to: '/staff/overview', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/staff/products', label: 'My Products', icon: Package },
  { to: '/staff/orders', label: 'Orders & Delivery', icon: ShoppingBag },
  { to: '/staff/payments', label: 'Chapa Payouts', icon: CreditCard },
  { to: '/staff/settings', label: 'Store Settings', icon: Settings },
];

export default function StaffFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-gradient-to-b from-[#0f172a] to-[#0a0f1e] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14">

          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Link to="/staff/overview" className="inline-flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.08, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#312e81] via-[#3857d6] to-[#818cf8] shadow-lg shadow-indigo-500/30"
              >
                <span className="font-black text-sm font-mono text-white">S</span>
                <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-amber-300 drop-shadow" />
              </motion.div>
              <div>
                <p className="font-extrabold text-white text-sm leading-none">EthioShop</p>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Staff Operations Hub</p>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Manage product inventory, verify customer deliveries, and process secure Chapa payouts across Ethiopia.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
              <Shield className="h-3.5 w-3.5 shrink-0" />
              <span className="text-[11px] font-semibold">Authorized Staff Portal · Powered by <strong>Chapa</strong></span>
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Quick Navigation</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
              {footerLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-medium transition-colors duration-150 py-1.5 px-2 rounded-lg hover:bg-white/5 group w-full"
                    >
                      <Icon className="h-3.5 w-3.5 text-slate-600 group-hover:text-[#818cf8] transition-colors shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Staff Support</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 text-slate-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-slate-200 text-[11px]">Fulfillment Hours</p>
                  <p className="text-[11px] text-slate-500">Mon – Sat · 8:30 AM – 6:00 PM EAT</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-[#818cf8] mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-slate-200 text-[11px]">Direct Staff Email</p>
                  <a
                    href="mailto:staff-support@ethioshop.et"
                    className="text-[11px] font-semibold text-[#818cf8] hover:text-indigo-300 hover:underline transition-colors"
                  >
                    staff-support@ethioshop.et
                  </a>
                </div>
              </div>

              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="https://chapa.co"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-bold transition-colors mt-1"
              >
                <span>Chapa Financial Technologies</span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
              </motion.a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-600">
          <span>© {year} EthioShop E-Commerce. All rights reserved.</span>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link to="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-slate-400 transition-colors">Terms of Operations</Link>
            <span>·</span>
            <span className="text-slate-600 font-semibold">Staff Portal v1.2</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
