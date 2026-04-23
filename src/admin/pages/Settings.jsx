import { useState } from 'react';
import {
  HiOutlineUser,
  HiOutlineShieldCheck,
  HiOutlineBell,
  HiOutlinePaintBrush,
} from 'react-icons/hi2';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-10">
      {/* Header Area */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-500 text-sm">Manage your store preferences and account security.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-48 space-y-1">
          <TabButton 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
            label="Store Profile" 
            icon={<HiOutlineUser className="w-4 h-4" />} 
          />
          <TabButton 
            active={activeTab === 'security'} 
            onClick={() => setActiveTab('security')} 
            label="Security" 
            icon={<HiOutlineShieldCheck className="w-4 h-4" />} 
          />
          <TabButton 
            active={activeTab === 'notifications'} 
            onClick={() => setActiveTab('notifications')} 
            label="Notifications" 
            icon={<HiOutlineBell className="w-4 h-4" />} 
          />
          <TabButton 
            active={activeTab === 'appearance'} 
            onClick={() => setActiveTab('appearance')} 
            label="Appearance" 
            icon={<HiOutlinePaintBrush className="w-4 h-4" />} 
          />
        </aside>

        {/* Content Area */}
        <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-8 space-y-10">
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <SectionHeader title="Store Information" subtitle="Update your public store details." />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Store Name" placeholder="EthioShop Main" />
                <InputField label="Contact Email" placeholder="hello@ethioshop.com" />
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Store Description</label>
                  <textarea className="w-full rounded-xl border-slate-100 bg-slate-50 p-4 text-sm focus:ring-primary focus:border-primary" rows="4"></textarea>
                </div>
              </div>
              <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors">
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <SectionHeader title="Security" subtitle="Manage your account password and authentication." />
              <div className="space-y-6">
                <InputField label="Current Password" type="password" />
                <InputField label="New Password" type="password" />
              </div>
              <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors">
                Update Password
              </button>
            </div>
          )}
          
          {(activeTab === 'notifications' || activeTab === 'appearance') && (
            <div className="text-center py-20 animate-in fade-in duration-500">
              <p className="text-slate-400 text-sm">Advanced configuration coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, label, icon, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
    >
      {icon}
      {label}
    </button>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500">{subtitle}</p>
      <div className="h-px bg-slate-50 w-full mt-4"></div>
    </div>
  );
}

function InputField({ label, placeholder, type = "text" }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</label>
      <input 
        type={type} 
        placeholder={placeholder} 
        className="w-full rounded-xl border-slate-100 bg-slate-50 px-4 py-2.5 text-sm focus:ring-primary focus:border-primary" 
      />
    </div>
  );
}
