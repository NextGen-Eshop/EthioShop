import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function Settings() {
  const { user, updateProfile } = useAuthStore();
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: '+251 91 122 3344'
  });
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-12 py-12 md:py-20">
      <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Account Settings</h1>
        <p className="text-gray-500 mb-10">Manage your profile information and account security.</p>
        
        <div className="grid md:grid-cols-3 gap-12">
          {/* Sidebar */}
          <div className="space-y-1">
            <button className="w-full text-left px-4 py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl transition-all">Profile Information</button>
            <button className="w-full text-left px-4 py-3 text-gray-500 hover:bg-gray-50 font-medium rounded-xl transition-all">My Addresses</button>
            <button className="w-full text-left px-4 py-3 text-gray-500 hover:bg-gray-50 font-medium rounded-xl transition-all">Orders & Returns</button>
            <button className="w-full text-left px-4 py-3 text-gray-500 hover:bg-gray-50 font-medium rounded-xl transition-all">Security</button>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                    isSaved ? 'bg-green-500 text-white' : 'bg-indigo-600 hover:bg-white hover:text-indigo-600 border-2 border-transparent hover:border-indigo-100 text-white shadow-indigo-100'
                  }`}
                >
                  {isSaved ? (
                     <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      Changes Saved
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
