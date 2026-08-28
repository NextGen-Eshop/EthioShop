import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon, Store, Phone, ShieldCheck,
  Bell, Save, CheckCircle2
} from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { useThemeStore } from '../../store/themeStore';

const tabs = [
  { id: 'store', label: 'Store Profile', icon: Store },
  { id: 'contact', label: 'Contact & Support', icon: Phone },
  { id: 'policies', label: 'Store Policies', icon: ShieldCheck },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function Settings() {
  const { settings, updateSettings } = useAdminStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState('store');
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-md shrink-0"
            style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' }}
          >
            <SettingsIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              System Settings
            </h1>
            <p className="text-xs mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              Manage store configuration, contact channels, and automated alert preferences
            </p>
          </div>
        </div>

        {saved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border"
            style={{
              background: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5',
              borderColor: isDark ? 'rgba(16,185,129,0.3)' : '#A7F3D0',
              color: '#10B981',
            }}
          >
            <CheckCircle2 className="h-4 w-4" /> Changes saved successfully!
          </motion.div>
        )}
      </div>

      {/* Tabs & Form Container */}
      <div
        className="rounded-2xl shadow-xs overflow-hidden border"
        style={{
          background: isDark ? '#111522' : '#FFFFFF',
          borderColor: isDark ? '#252A3A' : '#E2E8F0',
        }}
      >
        {/* Tab Navigation */}
        <div
          className="flex border-b overflow-x-auto"
          style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-6 py-4 text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer"
                style={{
                  borderBottomColor: active ? '#EC4899' : 'transparent',
                  color: active
                    ? '#EC4899'
                    : isDark
                    ? '#94A3B8'
                    : '#64748B',
                  background: active
                    ? isDark
                      ? 'rgba(236,72,153,0.08)'
                      : 'rgba(236,72,153,0.04)'
                    : 'transparent',
                }}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-pink-400' : 'opacity-60'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <form onSubmit={handleSave} className="p-6 space-y-6 text-xs">
          {activeTab === 'store' && (
            <div className="space-y-4 max-w-2xl">
              <h3 className="text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                Store Profile Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                    Store Name
                  </span>
                  <input
                    name="storeName"
                    value={form.storeName || ''}
                    onChange={handleChange}
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
                    Tagline
                  </span>
                  <input
                    name="storeTagline"
                    value={form.storeTagline || ''}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-xl border text-xs font-semibold focus:outline-none transition-all"
                    style={{
                      background: isDark ? '#181c33' : '#F8FAFC',
                      borderColor: isDark ? '#252A3A' : '#E2E8F0',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    }}
                  />
                </label>
              </div>
              <label className="block">
                <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  Description
                </span>
                <textarea
                  name="storeDescription"
                  value={form.storeDescription || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 rounded-xl border text-xs font-medium focus:outline-none resize-none transition-all"
                  style={{
                    background: isDark ? '#181c33' : '#F8FAFC',
                    borderColor: isDark ? '#252A3A' : '#E2E8F0',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                  }}
                />
              </label>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-4 max-w-2xl">
              <h3 className="text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                Contact & Support Channels
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                    General Inquiries Email
                  </span>
                  <input
                    name="storeEmail"
                    type="email"
                    value={form.storeEmail || ''}
                    onChange={handleChange}
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
                    Customer Support Email
                  </span>
                  <input
                    name="supportEmail"
                    type="email"
                    value={form.supportEmail || ''}
                    onChange={handleChange}
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
                    Store Phone
                  </span>
                  <input
                    name="storePhone"
                    value={form.storePhone || ''}
                    onChange={handleChange}
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
                    Support Phone
                  </span>
                  <input
                    name="supportPhone"
                    value={form.supportPhone || ''}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-xl border text-xs font-semibold focus:outline-none transition-all"
                    style={{
                      background: isDark ? '#181c33' : '#F8FAFC',
                      borderColor: isDark ? '#252A3A' : '#E2E8F0',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    }}
                  />
                </label>
              </div>
              <label className="block">
                <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  Physical Address / Headquarters
                </span>
                <input
                  name="storeAddress"
                  value={form.storeAddress || ''}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-xl border text-xs font-semibold focus:outline-none transition-all"
                  style={{
                    background: isDark ? '#181c33' : '#F8FAFC',
                    borderColor: isDark ? '#252A3A' : '#E2E8F0',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                  }}
                />
              </label>
            </div>
          )}

          {activeTab === 'policies' && (
            <div className="space-y-4 max-w-2xl">
              <h3 className="text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                Store Terms & Policies
              </h3>
              <label className="block">
                <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  Return & Refund Policy
                </span>
                <textarea
                  name="returnPolicy"
                  value={form.returnPolicy || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 rounded-xl border text-xs font-medium focus:outline-none resize-none transition-all"
                  style={{
                    background: isDark ? '#181c33' : '#F8FAFC',
                    borderColor: isDark ? '#252A3A' : '#E2E8F0',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                  }}
                />
              </label>
              <label className="block">
                <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  Privacy Policy Overview
                </span>
                <textarea
                  name="privacyPolicy"
                  value={form.privacyPolicy || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 rounded-xl border text-xs font-medium focus:outline-none resize-none transition-all"
                  style={{
                    background: isDark ? '#181c33' : '#F8FAFC',
                    borderColor: isDark ? '#252A3A' : '#E2E8F0',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                  }}
                />
              </label>
              <label className="block">
                <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  Terms of Service
                </span>
                <textarea
                  name="termsConditions"
                  value={form.termsConditions || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 rounded-xl border text-xs font-medium focus:outline-none resize-none transition-all"
                  style={{
                    background: isDark ? '#181c33' : '#F8FAFC',
                    borderColor: isDark ? '#252A3A' : '#E2E8F0',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                  }}
                />
              </label>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4 max-w-2xl">
              <h3 className="text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                Automated System Alerts
              </h3>
              <p className="text-xs" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                Configure which system events trigger notifications in the header and activity center.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { name: 'notifyNewOrders', label: 'New Customer Orders', desc: 'Alert when a customer completes checkout or places an order.' },
                  { name: 'notifyLowStock', label: 'Low & Out-of-Stock Warnings', desc: 'Alert when products hit depletion or low-stock thresholds.' },
                  { name: 'notifyFailedPayments', label: 'Failed Payment Transactions', desc: 'Alert immediately if Chapa or mobile money transactions fail.' },
                  { name: 'notifyNewUsers', label: 'New Customer Registrations', desc: 'Alert when a new shopper registers an account.' },
                ].map((item) => (
                  <label
                    key={item.name}
                    className="flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors"
                    style={{
                      background: isDark ? '#181c33' : '#F8FAFC',
                      borderColor: isDark ? '#252A3A' : '#E2E8F0',
                    }}
                  >
                    <input
                      type="checkbox"
                      name={item.name}
                      checked={!!form[item.name]}
                      onChange={handleChange}
                      className="mt-0.5 h-4 w-4 rounded text-pink-600 focus:ring-pink-500 border-slate-300"
                    />
                    <div>
                      <p className="text-xs font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{item.label}</p>
                      <p className="text-[11px] text-slate-400">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="pt-4 border-t flex items-center justify-end" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer transition-all"
              style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' }}
            >
              <Save className="h-4 w-4" /> <span>Save Settings</span>
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
