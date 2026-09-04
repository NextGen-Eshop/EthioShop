import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, KeyRound, Shield,
  CheckCircle2, AlertCircle, Camera
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAdminStore } from '../store/adminStore';
import { useThemeStore } from '../../store/themeStore';
import ProfileImageModal from '../../components/profile/ProfileImageModal';

export default function AdminProfile() {
  const { user } = useAuthStore();
  const { adminAvatar, setAdminAvatar } = useAdminStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const [name, setName] = useState(user?.name || user?.firstName ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() : 'Administrator');
  const [email, setEmail] = useState(user?.email || 'admin@ethioshop.et');
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });

  const [message, setMessage] = useState(null);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setMessage({ type: 'success', text: 'Profile details saved successfully!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }
    if (passwords.newPass.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    setPasswords({ current: '', newPass: '', confirm: '' });
    setMessage({ type: 'success', text: 'Password changed successfully!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const firstName = user?.firstName || name.split(' ').filter(Boolean)[0] || 'Admin';

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-md shrink-0"
          style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' }}
        >
          <User className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            Admin Profile
          </h1>
          <p className="text-xs mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
            Manage credentials, circular avatar, and account security
          </p>
        </div>
      </div>

      {/* Notification Toast */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-bold"
          style={{
            background:
              message.type === 'success'
                ? isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5'
                : message.type === 'error'
                ? isDark ? 'rgba(244,63,94,0.15)' : '#FFF1F2'
                : isDark ? 'rgba(59,130,246,0.15)' : '#EFF6FF',
            borderColor:
              message.type === 'success'
                ? isDark ? 'rgba(16,185,129,0.3)' : '#A7F3D0'
                : message.type === 'error'
                ? isDark ? 'rgba(244,63,94,0.3)' : '#FECDD3'
                : isDark ? 'rgba(59,130,246,0.3)' : '#BFDBFE',
            color:
              message.type === 'success'
                ? '#10B981'
                : message.type === 'error'
                ? '#F43F5E'
                : '#3B82F6',
          }}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </motion.div>
      )}

      {/* Profile Avatar Card */}
      <div
        className="rounded-2xl p-6 shadow-xs border"
        style={{
          background: isDark ? '#111522' : '#FFFFFF',
          borderColor: isDark ? '#252A3A' : '#E2E8F0',
        }}
      >
        <h2 className="text-sm font-bold mb-4" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
          Profile Avatar
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Circular Avatar with Hover Camera Interaction */}
          <div
            className="relative group shrink-0 cursor-pointer"
            onClick={() => setProfileModalOpen(true)}
            title="Hover and click to manage profile photo"
          >
            <div
              className="h-24 w-24 rounded-full overflow-hidden shadow-md flex items-center justify-center border-2 text-center px-1"
              style={{
                borderColor: '#EC4899',
                background: isDark ? '#181c33' : '#F8FAFC',
              }}
            >
              {adminAvatar ? (
                <img src={adminAvatar} alt={name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-tr from-pink-500 to-purple-600 text-white text-3xl font-black text-center select-none">
                  <span>{(name ? name.trim().charAt(0) : 'A').toUpperCase()}</span>
                </div>
              )}
            </div>

            {/* Hover Camera Overlay */}
            <div
              className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              title="Manage Profile Photo"
            >
              <Camera className="h-5 w-5 text-white drop-shadow-md" />
            </div>
          </div>

          <div className="flex-1 space-y-1 text-xs text-slate-400 text-center sm:text-left">
            <p className="font-semibold" style={{ color: isDark ? '#CBD5E1' : '#475569' }}>Profile Photo Management</p>
            <p className="text-[11px] leading-relaxed">
              Hover over your profile photo and click the camera icon to update or remove your picture. If no picture is set, only the first letter of your name will be displayed as the fallback avatar.
            </p>
          </div>
        </div>
      </div>

      {/* Account Info Form */}
      <div
        className="rounded-2xl p-6 shadow-xs border"
        style={{
          background: isDark ? '#111522' : '#FFFFFF',
          borderColor: isDark ? '#252A3A' : '#E2E8F0',
        }}
      >
        <h2 className="text-sm font-bold mb-4" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
          Account Information
        </h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                Full Name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-xl border text-xs font-semibold focus:outline-none transition-all"
                style={{
                  background: isDark ? '#181c33' : '#F8FAFC',
                  borderColor: isDark ? '#252A3A' : '#E2E8F0',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                }}
              />
            </label>
            <label className="block">
              <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                Email Address
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-xl border text-xs font-semibold focus:outline-none transition-all"
                style={{
                  background: isDark ? '#181c33' : '#F8FAFC',
                  borderColor: isDark ? '#252A3A' : '#E2E8F0',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                }}
              />
            </label>
          </div>

          <div
            className="flex items-center gap-2 p-3 rounded-xl border text-xs"
            style={{
              background: isDark ? 'rgba(236,72,153,0.08)' : 'rgba(236,72,153,0.04)',
              borderColor: isDark ? 'rgba(236,72,153,0.2)' : 'rgba(236,72,153,0.2)',
              color: isDark ? '#F8FAFC' : '#0F172A',
            }}
          >
            <Shield className="h-4 w-4 text-pink-400 shrink-0" />
            <span>
              Role: <strong className="text-pink-400">Master Administrator</strong> (Full system permissions)
            </span>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer transition-all"
              style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' }}
            >
              Update Information
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div
        className="rounded-2xl p-6 shadow-xs border"
        style={{
          background: isDark ? '#111522' : '#FFFFFF',
          borderColor: isDark ? '#252A3A' : '#E2E8F0',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="h-4 w-4 text-pink-400" />
          <h2 className="text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            Change Password
          </h2>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="block">
              <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                Current Password
              </span>
              <input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                required
                className="w-full h-10 px-3 rounded-xl border text-xs font-semibold focus:outline-none transition-all"
                style={{
                  background: isDark ? '#181c33' : '#F8FAFC',
                  borderColor: isDark ? '#252A3A' : '#E2E8F0',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                }}
              />
            </label>
            <label className="block">
              <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                New Password
              </span>
              <input
                type="password"
                value={passwords.newPass}
                onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))}
                required
                className="w-full h-10 px-3 rounded-xl border text-xs font-semibold focus:outline-none transition-all"
                style={{
                  background: isDark ? '#181c33' : '#F8FAFC',
                  borderColor: isDark ? '#252A3A' : '#E2E8F0',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                }}
              />
            </label>
            <label className="block">
              <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                Confirm Password
              </span>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                required
                className="w-full h-10 px-3 rounded-xl border text-xs font-semibold focus:outline-none transition-all"
                style={{
                  background: isDark ? '#181c33' : '#F8FAFC',
                  borderColor: isDark ? '#252A3A' : '#E2E8F0',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                }}
              />
            </label>
          </div>
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer transition-all"
              style={{ background: isDark ? '#252A3A' : '#0F172A' }}
            >
              Change Password
            </button>
          </div>
        </form>
      </div>

      {/* Profile Image Management Modal */}
      <ProfileImageModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        currentAvatar={adminAvatar}
        onAvatarUpdated={(newAvatar) => setAdminAvatar(newAvatar)}
        isDark={isDark}
      />
    </div>
  );
}
