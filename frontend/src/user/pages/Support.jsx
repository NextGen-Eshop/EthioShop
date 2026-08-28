import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ChevronDown, HelpCircle, Mail, MessageSquare, Headphones, ArrowRight } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

const faqs = [
  {
    q: 'How do I track my order?',
    a: 'After placing an order, you will receive real-time SMS updates and an email notification with a tracking reference. You can also check your order status in your Account dashboard under "My Orders".',
  },
  {
    q: 'Can I return an item?',
    a: 'Yes. Most items can be returned within 30 days of delivery when unused and in original packaging. Contact our 24/7 support team to initiate a return or exchange.',
  },
  {
    q: 'What payment methods are supported in Ethiopia?',
    a: 'We support Chapa (Telebirr, CBE Birr, Awash Bank, Bank of Abyssinia), international Visa/Mastercard credit cards, and direct bank transfers.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Standard delivery within Addis Ababa takes 1–2 business days. Regional deliveries across Ethiopia take 3–5 business days.',
  },
  {
    q: 'Is my payment information secure?',
    a: 'Yes. All payments are encrypted and processed through certified bank gateways and Chapa. We never store your payment credentials or PINs on our servers.',
  },
  {
    q: 'How do I cancel or modify an order?',
    a: 'Orders can be cancelled or delivery addresses updated within 2 hours of placement directly from your Account page or by messaging our support line.',
  },
];

export default function Support() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(null);
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const filtered = faqs.filter(
    f => !query || f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ background: isDark ? '#080A12' : '#F8FAFC', minHeight: '100vh' }} className="transition-colors duration-300">
      {/* Header Banner */}
      <div
        className="relative overflow-hidden py-12 md:py-16"
        style={{
          background: isDark ? 'linear-gradient(135deg, #111522 0%, #171B2B 100%)' : 'linear-gradient(135deg, #F1F5F9 0%, #FFFFFF 100%)',
          borderBottom: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
        }}
      >
        <div className="container-shell max-w-[1200px] mx-auto px-4 text-center">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
            style={{
              background: 'rgba(139,92,246,0.12)',
              color: '#8B5CF6',
              border: '1px solid rgba(139,92,246,0.3)',
            }}
          >
            <Headphones className="h-3.5 w-3.5" />
            24/7 Dedicated Support
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
            How can we <span className="text-gradient-brand">help you?</span>
          </h1>
          <p className="mt-3 text-sm max-w-md mx-auto" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
            Search common questions or browse our quick help guides below.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto mt-6">
            <div
              className="flex items-center rounded-2xl p-1.5 transition-all shadow-lg"
              style={{
                background: isDark ? '#111522' : '#FFFFFF',
                border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
              }}
            >
              <Search className="h-5 w-5 ml-3" style={{ color: '#8B5CF6' }} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search topics: delivery, payment, Chapa, returns..."
                className="w-full h-11 px-3 bg-transparent text-sm font-medium focus:outline-none"
                style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="px-3 text-xs font-bold cursor-pointer"
                  style={{ color: isDark ? '#94A3B8' : '#64748B' }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="container-shell max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-[1fr_1.6fr] items-start">

          {/* Quick Contact & Categories */}
          <aside className="space-y-6">
            {/* Quick topics */}
            <div
              className="p-6 rounded-3xl"
              style={{
                background: isDark ? '#111522' : '#FFFFFF',
                border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
              }}
            >
              <h2 className="text-xs font-black tracking-widest uppercase mb-3" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                Popular Topics
              </h2>
              <div className="flex flex-wrap gap-2">
                {['Delivery', 'Chapa Payment', 'Returns', 'Account Security', 'Order Status'].map(t => (
                  <button
                    key={t}
                    onClick={() => setQuery(t)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    style={{
                      background: isDark ? '#171B2B' : '#F1F5F9',
                      color: isDark ? '#94A3B8' : '#64748B',
                      border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Contact Card */}
            <div
              className="p-6 rounded-3xl"
              style={{
                background: isDark ? '#111522' : '#FFFFFF',
                border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)' }}
                >
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>Still have questions?</h3>
                  <p className="text-xs" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Average response in under 1 hour</p>
                </div>
              </div>
              <Link
                to="/contact"
                className="btn-neon-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>Contact Support</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </aside>

          {/* FAQ Accordion */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
              {query ? `${filtered.length} result(s) found for "${query}"` : `${faqs.length} Frequently Asked Questions`}
            </p>

            {filtered.length === 0 ? (
              <div
                className="p-10 text-center rounded-3xl"
                style={{
                  background: isDark ? '#111522' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                }}
              >
                <HelpCircle className="h-10 w-10 mx-auto mb-3 text-purple-400" />
                <h3 className="text-base font-bold mb-1" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>No matching answers found</h3>
                <p className="text-xs mb-4" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>Please contact our customer support team directly.</p>
                <Link to="/contact" className="btn-neon-primary px-6 py-2.5 text-xs inline-block">
                  Contact Support
                </Link>
              </div>
            ) : (
              filtered.map((item, i) => (
                <div
                  key={item.q}
                  className="rounded-2xl overflow-hidden transition-all"
                  style={{
                    background: isDark ? '#111522' : '#FFFFFF',
                    border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                  }}
                >
                  <button
                    onClick={() => setOpen(open === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left transition-colors cursor-pointer"
                    style={{ background: open === i ? (isDark ? '#171B2B' : '#F8FAFC') : 'transparent' }}
                  >
                    <span className="text-sm font-bold" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                      {item.q}
                    </span>
                    <motion.span
                      animate={{ rotate: open === i ? 180 : 0 }}
                      className="shrink-0 w-7 h-7 rounded-xl flex items-center justify-center"
                      style={{
                        background: isDark ? '#111522' : '#FFFFFF',
                        border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                        color: isDark ? '#94A3B8' : '#64748B',
                      }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.span>
                  </button>
                  {open === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="px-5 pb-5 pt-1"
                    >
                      <p className="text-xs leading-relaxed" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
