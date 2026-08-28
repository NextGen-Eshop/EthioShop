import { Shield, Check, Minus } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

const permissions = [
  { feature: 'Browse Products', user: true, staff: true, admin: true },
  { feature: 'Shopping Cart & Wishlist', user: true, staff: false, admin: false },
  { feature: 'Purchase Products', user: true, staff: false, admin: false },
  { feature: 'Write Product Reviews', user: true, staff: false, admin: false },
  { feature: 'Manage Own Products', user: false, staff: true, admin: true },
  { feature: 'Manage Inventory & Stock', user: false, staff: true, admin: true },
  { feature: 'Process & Fulfill Orders', user: false, staff: true, admin: true },
  { feature: 'Manage Own Chapa Payouts', user: false, staff: true, admin: true },
  { feature: 'View All Users', user: false, staff: false, admin: true },
  { feature: 'Manage User Accounts', user: false, staff: false, admin: true },
  { feature: 'Manage Staff Accounts', user: false, staff: false, admin: true },
  { feature: 'Manage All Products', user: false, staff: false, admin: true },
  { feature: 'Manage All Orders', user: false, staff: false, admin: true },
  { feature: 'Manage All Payments', user: false, staff: false, admin: true },
  { feature: 'Manage Categories', user: false, staff: false, admin: true },
  { feature: 'System Settings', user: false, staff: false, admin: true },
  { feature: 'Reports & Analytics', user: false, staff: false, admin: true },
];

const roles = [
  {
    key: 'user',
    label: 'User',
    color: 'bg-blue-500',
    darkTag: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    lightTag: 'bg-blue-50 text-blue-700 border-blue-200',
    desc: 'Registered shoppers who browse, purchase, and review products.',
  },
  {
    key: 'staff',
    label: 'Staff',
    color: 'bg-violet-500',
    darkTag: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    lightTag: 'bg-purple-50 text-purple-700 border-purple-200',
    desc: 'Store operators managing products, orders, inventory, and payouts for their assigned items.',
  },
  {
    key: 'admin',
    label: 'Admin',
    color: 'bg-pink-600',
    darkTag: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
    lightTag: 'bg-pink-50 text-pink-700 border-pink-200',
    desc: 'Full system access including user management, staff control, analytics, and all settings.',
  },
];

function Tick({ has, isDark }) {
  return has ? (
    <div className="flex items-center justify-center">
      <div
        className="h-6 w-6 rounded-full flex items-center justify-center border"
        style={{
          background: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5',
          borderColor: isDark ? 'rgba(16,185,129,0.3)' : '#A7F3D0',
        }}
      >
        <Check className="h-3.5 w-3.5 text-emerald-400" />
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center">
      <div
        className="h-6 w-6 rounded-full flex items-center justify-center border"
        style={{
          background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
          borderColor: isDark ? '#252A3A' : '#E2E8F0',
        }}
      >
        <Minus className="h-3.5 w-3.5 text-slate-500 opacity-60" />
      </div>
    </div>
  );
}

export default function Roles() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-md shrink-0"
          style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' }}
        >
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            Roles & Permissions
          </h1>
          <p className="text-xs mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
            Overview of access control across all role levels
          </p>
        </div>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div
            key={role.key}
            className="rounded-2xl p-5 shadow-xs border transition-all"
            style={{
              background: isDark ? '#111522' : '#FFFFFF',
              borderColor: isDark ? '#252A3A' : '#E2E8F0',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center shadow-md shrink-0"
                style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' }}
              >
                <Shield className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                    isDark ? role.darkTag : role.lightTag
                  }`}
                >
                  {role.label}
                </span>
              </div>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              {role.desc}
            </p>
            <div className="mt-3 pt-3 border-t" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {permissions.filter((p) => p[role.key]).length} active permissions
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Permissions Matrix */}
      <div
        className="rounded-2xl shadow-xs overflow-hidden border"
        style={{
          background: isDark ? '#111522' : '#FFFFFF',
          borderColor: isDark ? '#252A3A' : '#E2E8F0',
        }}
      >
        <div className="px-6 py-4 border-b" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0', background: isDark ? '#151928' : '#F8FAFC' }}>
          <h2 className="text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Permission Matrix</h2>
          <p className="text-xs text-slate-400 mt-0.5">Read-only overview — role permissions are enforced at the API layer</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[500px]">
            <thead className="border-b" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-400">Feature / Scope</th>
                {roles.map((r) => (
                  <th key={r.key} className="px-6 py-3.5 text-center">
                    <span className={`text-[11px] font-black px-3 py-1 rounded-full border ${isDark ? r.darkTag : r.lightTag}`}>
                      {r.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#252A3A]' : 'divide-slate-100'}`}>
              {permissions.map((perm, i) => (
                <tr key={i} className="transition-colors" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  <td className="px-6 py-3.5 font-medium">{perm.feature}</td>
                  <td className="px-6 py-3.5 text-center"><Tick has={perm.user} isDark={isDark} /></td>
                  <td className="px-6 py-3.5 text-center"><Tick has={perm.staff} isDark={isDark} /></td>
                  <td className="px-6 py-3.5 text-center"><Tick has={perm.admin} isDark={isDark} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
