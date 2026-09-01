import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Trash2, Upload, X, Check, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ProfileImageModal({ isOpen, onClose, currentAvatar, onAvatarUpdated, isDark = false }) {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(currentAvatar || '');
  const [selectedFileBase64, setSelectedFileBase64] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 5MB limit.');
      return;
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      setSelectedFileBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    if (!selectedFileBase64) {
      setErrorMsg('Please choose an image file to upload.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const res = await fetch(`${API_URL}/api/auth/avatar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ avatar: selectedFileBase64 }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update profile picture');

      if (updateUser) {
        updateUser({ ...user, avatar: json.data?.avatar || selectedFileBase64 });
      }

      if (onAvatarUpdated) {
        onAvatarUpdated(json.data?.avatar || selectedFileBase64);
      }

      setSuccessMsg('Profile picture updated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Error updating avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const res = await fetch(`${API_URL}/api/auth/avatar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ avatar: '' }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to remove profile picture');

      if (updateUser) {
        updateUser({ ...user, avatar: '' });
      }

      if (onAvatarUpdated) {
        onAvatarUpdated('');
      }

      setPreview('');
      setSelectedFileBase64(null);
      setSuccessMsg('Profile picture removed.');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Error removing avatar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md rounded-3xl p-6 shadow-2xl border relative overflow-hidden"
          style={{
            background: isDark ? '#111522' : '#FFFFFF',
            borderColor: isDark ? '#252A3A' : '#E2E8F0',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Camera className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                Profile Photo Management
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="py-6 space-y-6 text-center">
            {/* Avatar Preview */}
            <div className="relative mx-auto w-28 h-28">
              {preview ? (
                <img
                  src={preview}
                  alt="Avatar Preview"
                  className="w-28 h-28 rounded-full object-cover border-4 shadow-xl"
                  style={{ borderColor: isDark ? '#8B5CF6' : '#A855F7' }}
                />
              ) : (
                <div
                  className="w-28 h-28 rounded-full flex items-center justify-center text-sm font-black text-white shadow-xl text-center px-2"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
                >
                  <span className="truncate max-w-full">
                    {user?.firstName || user?.name?.split(' ')[0] || 'User'}
                  </span>
                </div>
              )}
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                {errorMsg}
              </p>
            )}

            {successMsg && (
              <p className="text-xs font-bold text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 flex items-center justify-center gap-1.5">
                <Check className="h-4 w-4" />
                <span>{successMsg}</span>
              </p>
            )}

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Action Buttons */}
            <div className="space-y-2.5 text-xs font-bold">
              {/* Add / Change Profile Image */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 rounded-2xl btn-neon-primary flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Upload className="h-4 w-4" />
                <span>{preview ? 'Change Profile Image' : 'Add Profile Image'}</span>
              </button>

              {/* Save changes if new file chosen */}
              {selectedFileBase64 && (
                <button
                  type="button"
                  onClick={handleSaveAvatar}
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  <span>Save New Photo</span>
                </button>
              )}

              {/* Remove Profile Image */}
              {(preview || user?.avatar) && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={loading}
                  className="w-full py-2.5 rounded-2xl text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Remove Profile Image</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
