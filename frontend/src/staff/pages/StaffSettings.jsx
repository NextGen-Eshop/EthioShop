import { useState, useRef } from 'react';
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
  Camera,
  Trash2,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Building,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useStaffStore } from '../store/staffStore';
import Avatar from '../../components/ui/Avatar';

export default function StaffSettings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { staffAvatar, setStaffAvatar } = useStaffStore();

  const fileInputRef = useRef(null);
  const [saved, setSaved] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

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

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setStaffAvatar(ev.target.result);
      setShowUrlInput(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleApplyUrl = () => {
    if (avatarUrlInput.trim()) {
      setStaffAvatar(avatarUrlInput.trim());
      setAvatarUrlInput('');
      setShowUrlInput(false);
    }
  };

  const handleRemoveAvatar = () => {
    setStaffAvatar(null);
    setAvatarUrlInput('');
  };

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
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Staff Account & Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your circular profile photo, operational details, notification channels, and active branch.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSignOut}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100/70 text-rose-600 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
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
            className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-xs"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>Staff operational preferences and profile settings saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ── Card 1: Circular Profile Photo Management ── */}
        <div className="panel p-6 bg-white border border-slate-200/90 shadow-2xs space-y-5 rounded-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-black text-slate-900">Staff Profile Photo</h2>
              <p className="text-xs text-slate-400">Displayed across the dashboard and order dispatch slips</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Standard Circular Avatar</span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-1">
            {/* Prominent Circular Avatar */}
            <div className="flex flex-col items-center gap-2">
              <Avatar
                src={activeAvatar}
                name={profile.name}
                size="2xl"
                editable={true}
                onImageChange={(data) => setStaffAvatar(data)}
                showBadge={true}
                badgeColor="bg-emerald-500"
              />
              <span className="text-[11px] text-slate-400 font-medium">Click photo to change</span>
            </div>

            {/* Photo Action Controls */}
            <div className="flex-1 space-y-3 w-full">
              <div className="flex flex-wrap items-center gap-2.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3857d6] hover:bg-[#2b44ac] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload from Device</span>
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowUrlInput((v) => !v)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <LinkIcon className="h-3.5 w-3.5 text-slate-500" />
                  <span>{showUrlInput ? 'Hide URL Input' : 'Use Image URL'}</span>
                </motion.button>

                {staffAvatar && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRemoveAvatar}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Reset to Initials</span>
                  </motion.button>
                )}
              </div>

              {/* URL Input collapse */}
              <AnimatePresence>
                {showUrlInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 pt-1"
                  >
                    <input
                      type="url"
                      value={avatarUrlInput}
                      onChange={(e) => setAvatarUrlInput(e.target.value)}
                      placeholder="Paste image URL (https://...)"
                      className="flex-1 h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono focus:bg-white focus:border-[#3857d6] focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleApplyUrl}
                      className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      Apply
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Accepted formats: JPG, PNG, WebP or direct HTTPS image URLs. Image will automatically be displayed in standard circular format.
              </p>
            </div>
          </div>
        </div>

        {/* ── Card 2: Operational Profile Information ── */}
        <div className="panel p-6 bg-white border border-slate-200/90 shadow-2xs space-y-4 rounded-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-black text-slate-900">Operational Profile</h2>
            <span className="text-xs text-slate-400">Assigned Branch & Logistics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Full Legal Name *</span>
              </label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900 focus:bg-white focus:border-[#3857d6] focus:ring-2 focus:ring-[#3857d6]/10 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>Registered Staff Email</span>
              </label>
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-100/80 font-mono text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>Direct Contact Phone *</span>
              </label>
              <input
                type="text"
                required
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900 focus:bg-white focus:border-[#3857d6] focus:ring-2 focus:ring-[#3857d6]/10 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-slate-400" />
                <span>Assigned Fulfillment Branch *</span>
              </label>
              <input
                type="text"
                required
                value={profile.branch}
                onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900 focus:bg-white focus:border-[#3857d6] focus:ring-2 focus:ring-[#3857d6]/10 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* ── Card 3: Notifications & Dispatch Schedule ── */}
        <div className="panel p-6 bg-white border border-slate-200/90 shadow-2xs space-y-4 rounded-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-black text-slate-900">Fulfillment Alerts & Operating Hours</h2>
            <Clock className="h-4 w-4 text-slate-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Operating / Dispatch Hours</label>
              <input
                type="text"
                value={profile.workingHours}
                onChange={(e) => setProfile({ ...profile, workingHours: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900 focus:bg-white focus:border-[#3857d6] focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <label className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer select-none">
              <input
                type="checkbox"
                checked={profile.notifySms}
                onChange={(e) => setProfile({ ...profile, notifySms: e.target.checked })}
                className="h-4 w-4 rounded accent-[#3857d6] cursor-pointer"
              />
              <div>
                <span className="font-bold text-slate-800">SMS Notification on Incoming Orders</span>
                <p className="text-[11px] text-slate-500">Receive instant SMS alert when a customer orders your product.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer select-none">
              <input
                type="checkbox"
                checked={profile.notifyLowStock}
                onChange={(e) => setProfile({ ...profile, notifyLowStock: e.target.checked })}
                className="h-4 w-4 rounded accent-[#3857d6] cursor-pointer"
              />
              <div>
                <span className="font-bold text-slate-800">Low & Out-of-Stock Alerts</span>
                <p className="text-[11px] text-slate-500">Immediate email notification when inventory drops below threshold (≤5 units).</p>
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
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3857d6] hover:bg-[#2b44ac] text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save All Settings</span>
          </motion.button>
        </div>
      </form>
    </div>
  );
}
