import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  ShieldCheck,
  Bell,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  LogOut,
  Save,
  Sparkles,
  Building,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useStaffStore } from '../store/staffStore';
import { useThemeStore } from '../../store/themeStore';
import Avatar from '../../components/ui/Avatar';

export default function StaffSettings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { staffAvatar, setStaffAvatar } = useStaffStore();
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || 'Alemayehu Tadesse',
    email: user?.email || 'staff@ethioshop.et',
    phone: '+251 91 122 3344',
    branch: 'Bole Atlas Fulfillment Hub, Addis Ababa',
    workingHours: '8:30 AM - 6:00 PM (Mon - Sat)',
    notifySms: true,
    notifyEmail: true,
    notifyLowStock: true,
  });

  const activeAvatar = staffAvatar || user?.avatar || null;

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Staff Account & Settings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your circular profile photo, operational details, notification channels, and active branch.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSignOut}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto ${
            isDark
              ? 'border-rose-500/30 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300'
              : 'border-rose-200 bg-rose-50/70 hover:bg-rose-100/70 text-rose-600'
          }`}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </motion.button>
      </div>

      {/* ── Animated Success Banner ── */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className={`flex items-center gap-2.5 p-3.5 rounded-2xl text-xs font-bold border shadow-xs ${
              isDark ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>Staff operational preferences and profile settings saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ── Card 1: Circular Profile Photo Management ── */}
        <div className={`panel p-6 border shadow-2xs space-y-5 rounded-2xl ${
          isDark ? 'bg-[#0f1222] border-[#1b1f38] text-white' : 'bg-white border-slate-200/90 text-slate-900'
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
            <div>
              <h2 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Staff Profile Photo</h2>
              <p className="text-xs text-slate-400">Displayed across the dashboard and order dispatch slips</p>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
              isDark ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
            }`}>
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Standard Circular Avatar</span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-1">
            {/* Prominent Circular Avatar with Camera Hover */}
            <div className="flex flex-col items-center gap-2">
              <Avatar
                src={activeAvatar}
                name={profile.name}
                size="2xl"
                editable={true}
                onImageChange={(data) => setStaffAvatar(data)}
                onImageRemove={() => setStaffAvatar(null)}
                showBadge={true}
                badgeColor="bg-emerald-500"
              />
              <span className="text-[11px] text-slate-400 font-medium">Hover photo to change or remove</span>
            </div>

            <div className="flex-1 space-y-1 text-xs text-slate-400">
              <p className="font-semibold" style={{ color: isDark ? '#CBD5E1' : '#475569' }}>Profile Photo Management</p>
              <p className="text-[11px] leading-relaxed">
                Hover over your profile photo above and click the camera icon to upload a new picture or remove your existing photo. If no photo is uploaded, your first name will be displayed automatically.
              </p>
            </div>
          </div>
        </div>

        {/* ── Card 2: Operational Profile Information ── */}
        <div className={`panel p-6 border shadow-2xs space-y-4 rounded-2xl ${
          isDark ? 'bg-[#0f1222] border-[#1b1f38] text-white' : 'bg-white border-slate-200/90 text-slate-900'
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
            <h2 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Operational Profile</h2>
            <span className="text-xs text-slate-400">Assigned Branch & Logistics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className={`block font-bold mb-1.5 flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Full Legal Name *</span>
              </label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className={`w-full h-10 px-3.5 rounded-xl border font-semibold focus:outline-none transition-all ${
                  isDark
                    ? 'bg-[#181c33] border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500'
                    : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-purple-600'
                }`}
              />
            </div>

            <div>
              <label className={`block font-bold mb-1.5 flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>Registered Staff Email</span>
              </label>
              <input
                type="email"
                disabled
                value={profile.email}
                className={`w-full h-10 px-3.5 rounded-xl border font-mono cursor-not-allowed ${
                  isDark ? 'bg-[#14182c] border-white/5 text-slate-400' : 'border-slate-200 bg-slate-100/80 text-slate-500'
                }`}
              />
            </div>

            <div>
              <label className={`block font-bold mb-1.5 flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>Direct Contact Phone *</span>
              </label>
              <input
                type="text"
                required
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className={`w-full h-10 px-3.5 rounded-xl border font-semibold focus:outline-none transition-all ${
                  isDark
                    ? 'bg-[#181c33] border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500'
                    : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-purple-600'
                }`}
              />
            </div>

            <div>
              <label className={`block font-bold mb-1.5 flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                <Building className="h-3.5 w-3.5 text-slate-400" />
                <span>Assigned Fulfillment Branch *</span>
              </label>
              <input
                type="text"
                required
                value={profile.branch}
                onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
                className={`w-full h-10 px-3.5 rounded-xl border font-semibold focus:outline-none transition-all ${
                  isDark
                    ? 'bg-[#181c33] border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500'
                    : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-purple-600'
                }`}
              />
            </div>
          </div>
        </div>

        {/* ── Card 3: Notifications & Dispatch Schedule ── */}
        <div className={`panel p-6 border shadow-2xs space-y-4 rounded-2xl ${
          isDark ? 'bg-[#0f1222] border-[#1b1f38] text-white' : 'bg-white border-slate-200/90 text-slate-900'
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
            <h2 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Fulfillment Alerts & Operating Hours</h2>
            <Clock className="h-4 w-4 text-slate-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className={`block font-bold mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Operating / Dispatch Hours</label>
              <input
                type="text"
                value={profile.workingHours}
                onChange={(e) => setProfile({ ...profile, workingHours: e.target.value })}
                className={`w-full h-10 px-3.5 rounded-xl border font-semibold focus:outline-none transition-all ${
                  isDark
                    ? 'bg-[#181c33] border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500'
                    : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-purple-600'
                }`}
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <label className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors cursor-pointer select-none ${
              isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50'
            }`}>
              <input
                type="checkbox"
                checked={profile.notifySms}
                onChange={(e) => setProfile({ ...profile, notifySms: e.target.checked })}
                className="h-4 w-4 rounded accent-purple-600 cursor-pointer"
              />
              <div>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>SMS Notification on Incoming Orders</span>
                <p className="text-[11px] text-slate-400">Receive instant SMS alert when a customer orders your product.</p>
              </div>
            </label>

            <label className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors cursor-pointer select-none ${
              isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50'
            }`}>
              <input
                type="checkbox"
                checked={profile.notifyLowStock}
                onChange={(e) => setProfile({ ...profile, notifyLowStock: e.target.checked })}
                className="h-4 w-4 rounded accent-purple-600 cursor-pointer"
              />
              <div>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Low & Out-of-Stock Alerts</span>
                <p className="text-[11px] text-slate-400">Immediate email notification when inventory drops below threshold (≤5 units).</p>
              </div>
            </label>
          </div>
        </div>

        {/* ── Submit Action ── */}
        <div className="flex justify-end pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition-all cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save All Settings</span>
          </motion.button>
        </div>
      </form>
    </div>
  );
}
