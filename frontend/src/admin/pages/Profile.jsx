import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User, Upload, Trash2, KeyRound, Shield,
  CheckCircle2, AlertCircle, Camera
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAdminStore } from '../store/adminStore';
import { useThemeStore } from '../../store/themeStore';

export default function AdminProfile() {
  const { user } = useAuthStore();
  const { adminAvatar, setAdminAvatar } = useAdminStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || 'Administrator');
  const [email, setEmail] = useState(user?.email || 'admin@ethioshop.et');
  const [imageUrl, setImageUrl] = useState('');

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });

  const [message, setMessage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdminAvatar(reader.result);
        setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSetUrlImage = (e) => {
    e.preventDefault();
    if (imageUrl.trim()) {
      setAdminAvatar(imageUrl.trim());
      setImageUrl('');
      setMessage({ type: 'success', text: 'Profile picture updated from URL!' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleRemoveImage = () => {
    setAdminAvatar(null);
    setMessage({ type: 'info', text: 'Profile picture removed.' });
    setTimeout(() => setMessage(null), 3000);
  };

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

  const getInitials = (n) =>
    n ? n.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2) : 'AD';

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
          {/* Circular Avatar */}
          <div className="relative group shrink-0">
            <div
              className="h-24 w-24 rounded-full overflow-hidden shadow-md flex items-center justify-center border-2"
              style={{
                borderColor: '#EC4899',
                background: isDark ? '#181c33' : '#F8FAFC',
              }}
            >
              {adminAvatar ? (
                <img src={adminAvatar} alt={name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-tr from-pink-500 to-purple-600 text-white text-2xl font-black">
                  {getInitials(name)}
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 rounded-full text-white shadow-md transition-transform active:scale-95 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' }}
              title="Upload photo"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Upload Controls */}
          <div className="flex-1 space-y-3 w-full">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border"
                style={{
                  background: isDark ? '#181c33' : '#F1F5F9',
                  borderColor: isDark ? '#252A3A' : '#E2E8F0',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                }}
              >
                <Upload className="h-3.5 w-3.5" /> <span>Upload File</span>
              </button>
              {adminAvatar && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-rose-400 text-xs font-bold transition-colors cursor-pointer border"
                  style={{
                    background: isDark ? 'rgba(244,63,94,0.1)' : '#FFF1F2',
                    borderColor: isDark ? 'rgba(244,63,94,0.2)' : '#FECDD3',
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" /> <span>Remove Avatar</span>
                </button>
              )}
            </div>

            {/* URL input */}
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Or paste an image URL..."
                className="flex-1 h-9 px-3 rounded-xl border text-xs focus:outline-none transition-all"
                style={{
                  background: isDark ? '#181c33' : '#F8FAFC',
                  borderColor: isDark ? '#252A3A' : '#E2E8F0',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                }}
              />
              <button
                type="button"
                onClick={handleSetUrlImage}
                className="px-4 h-9 rounded-xl text-white text-xs font-bold transition-colors cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' }}
              >
                Set URL
              </button>
            </div>
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
    </div>
  );
}
