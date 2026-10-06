import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, ArrowRight } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useSettingsStore } from '../../store/settingsStore';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.message.trim()) e.message = 'Message is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSent(true);
  };

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    setErrors(p => ({ ...p, [field]: '' }));
  };

  const { settings } = useSettingsStore();

  return (
    <div style={{ background: isDark ? '#080A12' : '#F8FAFC', minHeight: '100vh' }} className="transition-colors duration-300">
      <section className="container-shell max-w-[1200px] mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 items-start">
          {/* Info panel */}
          <div
            className="p-6 md:p-8 rounded-3xl shadow-xl"
            style={{
              background: isDark ? '#111522' : '#FFFFFF',
              border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
            }}
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-3"
              style={{
                background: 'rgba(139,92,246,0.12)',
                color: '#8B5CF6',
                border: '1px solid rgba(139,92,246,0.25)',
              }}
            >
              Contact {settings.storeName || 'EthioShop'}
            </div>
            <h1 className="text-3xl font-black tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              Talk to our <span className="text-gradient-brand">team.</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              For order issues, delivery inquiries, or product questions — send us a message and we will reply promptly.
            </p>

            <div className="mt-8 space-y-4">
              {[
                { icon: <Mail className="h-4.5 w-4.5 text-purple-400" />, label: 'Email', value: settings.supportEmail || settings.storeEmail || 'support@ethioshop.et' },
                { icon: <Phone className="h-4.5 w-4.5 text-pink-400" />, label: 'Phone', value: settings.supportPhone || settings.storePhone || '+251 11 234 5678' },
                { icon: <MapPin className="h-4.5 w-4.5 text-emerald-400" />, label: 'Headquarters', value: settings.storeAddress || 'Bole Atlas, Addis Ababa, Ethiopia' },
                { icon: <Clock className="h-4.5 w-4.5 text-amber-400" />, label: 'Support Hours', value: 'Mon–Sat: 8:00 AM – 8:00 PM EAT' },
              ].map(({ icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl"
                  style={{
                    background: isDark ? '#171B2B' : '#F8FAFC',
                    border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                  }}
                >
                  <div className="p-2 rounded-xl" style={{ background: isDark ? '#111522' : '#FFFFFF' }}>
                    {icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>{label}</p>
                    <p className="text-xs font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6" style={{ borderTop: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>
              <p className="text-xs font-medium mb-3" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Need immediate assistance?</p>
              <Link to="/support" className="btn-neon-secondary px-5 py-2.5 text-xs inline-flex items-center gap-2">
                <span>Browse Support FAQs</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Form panel */}
          {sent ? (
            <div
              className="p-8 md:p-12 rounded-3xl flex flex-col items-center justify-center text-center shadow-xl"
              style={{
                background: isDark ? '#111522' : '#FFFFFF',
                border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
              }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-emerald-500 mb-4"
                style={{ background: 'rgba(34,197,94,0.15)' }}
              >
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-black mb-2" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Message Sent!</h2>
              <p className="text-xs leading-relaxed max-w-xs mb-6" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                Thanks <strong>{form.name}</strong>! We have received your inquiry and will respond to <strong>{form.email}</strong> shortly.
              </p>
              <button
                onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                className="btn-neon-secondary px-6 py-2.5 text-xs font-bold cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="space-y-4 p-6 md:p-8 rounded-3xl shadow-xl"
              style={{
                background: isDark ? '#111522' : '#FFFFFF',
                border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
              }}
              noValidate
            >
              <h2 className="text-xl font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Send a Direct Message</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Full Name</label>
                  <input
                    value={form.name}
                    onChange={set('name')}
                    placeholder="Your Name"
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none transition-all"
                    style={{
                      background: isDark ? '#171B2B' : '#F1F5F9',
                      border: `1px solid ${errors.name ? '#F43F5E' : (isDark ? '#252A3A' : '#E2E8F0')}`,
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    }}
                  />
                  {errors.name && <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    placeholder="you@email.com"
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none transition-all"
                    style={{
                      background: isDark ? '#171B2B' : '#F1F5F9',
                      border: `1px solid ${errors.email ? '#F43F5E' : (isDark ? '#252A3A' : '#E2E8F0')}`,
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    }}
                  />
                  {errors.email && <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Subject / Topic</label>
                <select
                  value={form.subject}
                  onChange={set('subject')}
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none transition-all cursor-pointer"
                  style={{
                    background: isDark ? '#171B2B' : '#F1F5F9',
                    border: `1px solid ${errors.subject ? '#F43F5E' : (isDark ? '#252A3A' : '#E2E8F0')}`,
                    color: isDark ? '#F8FAFC' : '#0F172A',
                  }}
                >
                  <option value="">Select a topic...</option>
                  <option value="order">Order Tracking & Delivery</option>
                  <option value="return">Return / Exchange Request</option>
                  <option value="product">Product Information</option>
                  <option value="payment">Chapa & Payment Support</option>
                  <option value="partnership">Merchant Partnership</option>
                  <option value="other">Other Inquiry</option>
                </select>
                {errors.subject && <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.subject}</p>}
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Message</label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={set('message')}
                  placeholder="Describe how we can assist you..."
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none transition-all resize-none"
                  style={{
                    background: isDark ? '#171B2B' : '#F1F5F9',
                    border: `1px solid ${errors.message ? '#F43F5E' : (isDark ? '#252A3A' : '#E2E8F0')}`,
                    color: isDark ? '#F8FAFC' : '#0F172A',
                  }}
                />
                {errors.message && <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.message}</p>}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="btn-neon-primary w-full py-3.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Send className="h-4 w-4" />
                <span>Send Message</span>
              </motion.button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
