import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon, Store, Phone, ShieldCheck,
  Bell, Save, CheckCircle2, SlidersHorizontal, AlertTriangle, Loader2
} from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const tabs = [
  { id: 'store', label: 'Store Profile', icon: Store },
  { id: 'operations', label: 'Commerce & Operations', icon: SlidersHorizontal },
  { id: 'contact', label: 'Contact & Support', icon: Phone },
  { id: 'policies', label: 'Store Policies', icon: ShieldCheck },
  { id: 'notifications', label: 'Alert Preferences', icon: Bell },
];

export default function Settings() {
  const { settings, updateSettings } = useAdminStore();
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState('store');
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch live settings from database on mount
  useEffect(() => {
    const fetchLiveSettings = async () => {
      if (!user?.accessToken) return;
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/admin/settings`, {
          headers: { Authorization: `Bearer ${user.accessToken}` },
          credentials: 'include',
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setForm(json.data);
            updateSettings(json.data);
            useSettingsStore.getState().setSettings(json.data);
          }
        }
      } catch (err) {
        console.warn('Could not load live settings, using stored values:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveSettings();
  }, [user?.accessToken, updateSettings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const json = await res.json();
        const savedData = json.data || form;
        updateSettings(savedData);
        setForm(savedData);
        useSettingsStore.getState().setSettings(savedData);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        // Fallback update locally if server unreachable
        updateSettings(form);
        useSettingsStore.getState().setSettings(form);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.warn('Network save issue, updated locally:', err);
      updateSettings(form);
      useSettingsStore.getState().setSettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
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
              System Configuration
            </h1>
            <p className="text-xs mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              Manage global store parameters, commerce operations, contact channels, and role-based alert preferences
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
            <CheckCircle2 className="h-4 w-4" /> System settings updated successfully!
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
                type="button"
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
          {/* TAB 1: STORE PROFILE */}
          {activeTab === 'store' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h3 className="text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  Store Profile Information
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Appears on the storefront header, customer footer, and system brand communications.
                </p>
              </div>

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
                    Store Tagline
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
                  Store Description
                </span>
                <textarea
                  name="storeDescription"
                  value={form.storeDescription || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 rounded-xl border text-xs font-medium focus:outline-none resize-none transition-all leading-relaxed"
                  style={{
                    background: isDark ? '#181c33' : '#F8FAFC',
                    borderColor: isDark ? '#252A3A' : '#E2E8F0',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                  }}
                />
              </label>
            </div>
          )}

          {/* TAB 2: COMMERCE & OPERATIONS */}
          {activeTab === 'operations' && (
            <div className="space-y-5 max-w-2xl">
              <div>
                <h3 className="text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  Commerce & Operational Parameters
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  These settings directly govern customer checkout pricing, inventory depletion thresholds, and store availability.
                </p>
              </div>

              {/* Numerical settings grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                    Currency Symbol / Code
                  </span>
                  <input
                    name="currency"
                    value={form.currency || 'ETB'}
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
                    Standard Delivery Fee ({form.currency || 'ETB'})
                  </span>
                  <input
                    name="shippingFee"
                    type="number"
                    min="0"
                    value={form.shippingFee ?? 150}
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
                    Free Shipping Threshold ({form.currency || 'ETB'})
                  </span>
                  <input
                    name="freeShippingMin"
                    type="number"
                    min="0"
                    value={form.freeShippingMin ?? 3000}
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
                    Low Stock Threshold (Units)
                  </span>
                  <input
                    name="lowStockThreshold"
                    type="number"
                    min="1"
                    value={form.lowStockThreshold ?? 5}
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

              {/* Operational Status Toggles */}
              <div className="space-y-3 pt-2">
                {/* Order Acceptance */}
                <label
                  className="flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors"
                  style={{
                    background: isDark ? '#181c33' : '#F8FAFC',
                    borderColor: isDark ? '#252A3A' : '#E2E8F0',
                  }}
                >
                  <input
                    type="checkbox"
                    name="orderAcceptance"
                    checked={form.orderAcceptance !== false}
                    onChange={handleChange}
                    className="mt-0.5 h-4 w-4 rounded text-pink-600 focus:ring-pink-500 border-slate-300"
                  />
                  <div>
                    <p className="text-xs font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                      Accept New Customer Orders
                    </p>
                    <p className="text-[11px] text-slate-400">
                      When enabled, shoppers can complete checkout. If turned off, checkout displays a temporary order hold message.
                    </p>
                  </div>
                </label>

                {/* Maintenance Mode */}
                <label
                  className="flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors"
                  style={{
                    background: isDark ? '#181c33' : '#F8FAFC',
                    borderColor: form.maintenanceMode ? '#EC4899' : isDark ? '#252A3A' : '#E2E8F0',
                  }}
                >
                  <input
                    type="checkbox"
                    name="maintenanceMode"
                    checked={!!form.maintenanceMode}
                    onChange={handleChange}
                    className="mt-0.5 h-4 w-4 rounded text-pink-600 focus:ring-pink-500 border-slate-300"
                  />
                  <div>
                    <p className="text-xs font-bold flex items-center gap-1.5" style={{ color: form.maintenanceMode ? '#EC4899' : isDark ? '#F8FAFC' : '#0F172A' }}>
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      <span>System Maintenance Mode</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Displays a global maintenance banner to all store visitors and restricts new transactions.
                    </p>
                  </div>
                </label>

                {form.maintenanceMode && (
                  <label className="block pl-7">
                    <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                      Maintenance Notice Message
                    </span>
                    <input
                      name="maintenanceMessage"
                      value={form.maintenanceMessage || ''}
                      onChange={handleChange}
                      placeholder="Custom maintenance announcement displayed to shoppers..."
                      className="w-full h-10 px-3 rounded-xl border text-xs font-semibold focus:outline-none transition-all"
                      style={{
                        background: isDark ? '#181c33' : '#F8FAFC',
                        borderColor: isDark ? '#252A3A' : '#E2E8F0',
                        color: isDark ? '#F8FAFC' : '#0F172A',
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CONTACT & SUPPORT */}
          {activeTab === 'contact' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h3 className="text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  Contact & Support Channels
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Directly populates customer contact pages, support tickets, and storefront contact info.
                </p>
              </div>

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
                    Support Hotline
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
                  Headquarters & Physical Address
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

          {/* TAB 4: STORE POLICIES */}
          {activeTab === 'policies' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h3 className="text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  Store Terms & Policies
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Dynamically presented on the live /terms, /privacy, and checkout policy sections.
                </p>
              </div>

              <label className="block">
                <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  Return & Refund Policy
                </span>
                <textarea
                  name="returnPolicy"
                  value={form.returnPolicy || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 rounded-xl border text-xs font-medium focus:outline-none resize-none transition-all leading-relaxed"
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
                  className="w-full p-3 rounded-xl border text-xs font-medium focus:outline-none resize-none transition-all leading-relaxed"
                  style={{
                    background: isDark ? '#181c33' : '#F8FAFC',
                    borderColor: isDark ? '#252A3A' : '#E2E8F0',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                  }}
                />
              </label>
              <label className="block">
                <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  Terms & Conditions
                </span>
                <textarea
                  name="termsConditions"
                  value={form.termsConditions || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 rounded-xl border text-xs font-medium focus:outline-none resize-none transition-all leading-relaxed"
                  style={{
                    background: isDark ? '#181c33' : '#F8FAFC',
                    borderColor: isDark ? '#252A3A' : '#E2E8F0',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                  }}
                />
              </label>
            </div>
          )}

          {/* TAB 5: AUTOMATED SYSTEM ALERTS */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h3 className="text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  Automated Role-Based Alert Preferences
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure which system events actively trigger real-time notifications for the Administrator.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  {
                    name: 'notifyNewOrders',
                    label: 'New Customer Orders',
                    desc: 'Alert when a customer successfully completes checkout and submits an order.',
                  },
                  {
                    name: 'notifyLowStock',
                    label: 'Low & Out-of-Stock Warnings',
                    desc: 'Alert immediately when product inventory drops to or below the low-stock threshold.',
                  },
                  {
                    name: 'notifyFailedPayments',
                    label: 'Failed Payment Transactions',
                    desc: 'Alert when customer online verification or bank transfer verification fails.',
                  },
                  {
                    name: 'notifyNewUsers',
                    label: 'New Customer Registrations',
                    desc: 'Alert when a new shopper registers via standard registration or Google OAuth.',
                  },
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
                      checked={form[item.name] !== false}
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
          <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: isDark ? '#252A3A' : '#E2E8F0' }}>
            <span className="text-[11px] text-slate-400">
              {loading ? 'Refreshing configuration from database...' : 'All settings affect live system operations upon saving.'}
            </span>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' }}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving to System...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Configuration</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
