import { useState } from 'react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Store Profile', icon: 'storefront' },
    { id: 'security', label: 'Security', icon: 'shield' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'appearance', label: 'Appearance', icon: 'palette' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your store preferences and account security.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-48 space-y-1">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 space-y-8">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <SectionHeader title="Store Information" subtitle="Update your public store details." />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField label="Store Name" placeholder="EthioShop Main" />
                <InputField label="Contact Email" placeholder="hello@ethioshop.com" />
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Store Description</label>
                  <textarea className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder-gray-400" rows="4" placeholder="Describe your store..." />
                </div>
              </div>
              <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200">Save Changes</button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <SectionHeader title="Security" subtitle="Manage your account password and authentication." />
              <div className="space-y-5">
                <InputField label="Current Password" type="password" />
                <InputField label="New Password" type="password" />
                <InputField label="Confirm Password" type="password" />
              </div>
              <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200">Update Password</button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <SectionHeader title="Notifications" subtitle="Control how you receive updates and alerts." />
              <div className="space-y-4">
                <ToggleRow label="Email Notifications" desc="Get notified about new orders and updates" defaultOn />
                <ToggleRow label="Push Notifications" desc="Receive alerts on your browser" defaultOn={false} />
                <ToggleRow label="Weekly Digest" desc="Summary of your store performance" defaultOn />
                <ToggleRow label="Marketing Updates" desc="Product tips and feature announcements" defaultOn={false} />
              </div>
              <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200">Save Preferences</button>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <SectionHeader title="Appearance" subtitle="Customize the look and feel of your admin panel." />
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Theme</label>
                  <div className="flex gap-3">
                    {['Light', 'Dark', 'System'].map((t, i) => (
                      <button key={t} className={`flex-1 py-3 text-sm font-semibold rounded-xl border-2 transition-all ${i === 0 ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Accent Color</label>
                  <div className="flex gap-3">
                    {[{ color: 'bg-indigo-600', name: 'Indigo' }, { color: 'bg-emerald-600', name: 'Emerald' }, { color: 'bg-violet-600', name: 'Violet' }, { color: 'bg-rose-600', name: 'Rose' }].map((c, i) => (
                      <button key={c.name} className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-xs font-semibold transition-all ${i === 0 ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                        <span className={`w-4 h-4 rounded-full ${c.color}`} />{c.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="pb-4 border-b border-gray-100">
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
    </div>
  );
}

function InputField({ label, placeholder, type = 'text' }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
      <input type={type} placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder-gray-400" />
    </div>
  );
}

function ToggleRow({ label, desc, defaultOn }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
      <div>
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <button onClick={() => setOn(!on)} className={`relative w-11 h-6 rounded-full transition-colors ${on ? 'bg-indigo-600' : 'bg-gray-300'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${on ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}
