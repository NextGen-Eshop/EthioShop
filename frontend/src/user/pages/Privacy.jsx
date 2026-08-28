import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Server,
  UserCheck,
  Cookie,
  Mail,
  HelpCircle,
  CheckCircle2,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

const privacySections = [
  {
    id: 'collection',
    icon: <FileText className="h-5 w-5 text-purple-400" />,
    title: '1. Information We Collect',
    summary: 'The categories of personal, transaction, and device data required to fulfill your orders and protect your account.',
    content: [
      {
        heading: 'Account & Identification Data',
        body: 'When you create an account, we collect your full name, email address, phone number, and securely hashed authentication credentials. If you register using Google Authentication, we receive your verified email address, full name, and public profile identifier directly from Google with your consent.',
      },
      {
        heading: 'Shipping, Delivery & Location Data',
        body: 'To ensure accurate domestic logistics, we collect physical delivery destinations, sub-city designations, and landmark instructions. When you enable the live GPS location sensing during checkout, we use your device coordinates solely to route our couriers to your doorstep.',
      },
      {
        heading: 'Transaction & Transfer Records',
        body: 'For order verification, we process transaction identifiers, payment method choices (such as Telebirr, CBE Birr, Awash Bank, or BOA), and uploaded receipt slips. We do NOT store payment PINs or direct banking credentials on our servers; payments are processed through certified bank systems and Chapa.',
      },
      {
        heading: 'Technical & Device Telemetry',
        body: 'We collect standard device parameters, IP addresses, operating system specifications, and browser types to detect unauthorized account access, ensure session integrity, and maintain platform stability.',
      },
    ],
  },
  {
    id: 'usage',
    icon: <Eye className="h-5 w-5 text-pink-400" />,
    title: '2. How We Use Your Information',
    summary: 'Our operational principles: processing purchases, improving reliability, and maintaining security without selling your data.',
    content: [
      {
        heading: 'Order Fulfillment & Courier Dispatch',
        body: 'Your contact details and delivery instructions are shared with authorized EthioShop delivery couriers solely to coordinate parcel drop-off and provide real-time SMS delivery notifications.',
      },
      {
        heading: 'Personalization & Account Management',
        body: 'We use your account activity to maintain your shopping cart, synchronize saved wishlist items across your devices, and display locally relevant product pricing in Ethiopian Birr (ETB).',
      },
      {
        heading: 'Customer Support & Inquiries',
        body: 'When you contact our help desk, we review your order history and previous communication to resolve delivery inquiries, product questions, or refund requests effectively.',
      },
      {
        heading: 'Security, Verification & Fraud Prevention',
        body: 'We analyze transaction details to verify bank transfer references, prevent unauthorized account takeovers, and maintain escrow safeguards across our marketplace.',
      },
      {
        heading: 'Zero Data Selling Guarantee',
        body: 'EthioShop does not sell, rent, monetize, or lease your personal information to any third-party advertisers or data brokers under any circumstances.',
      },
    ],
  },
  {
    id: 'retention',
    icon: <Server className="h-5 w-5 text-emerald-400" />,
    title: '3. Data Retention & Security Standards',
    summary: 'How we safeguard stored records and our scheduled data lifecycle protocols.',
    content: [
      {
        heading: 'Encryption & Safeguards',
        body: 'All communications between your browser and EthioShop are encrypted using Transport Layer Security (TLS 1.3). Sensitive stored database records are protected with industry-standard AES-256 encryption.',
      },
      {
        heading: 'Retention Timeframes',
        body: 'We retain customer account records for as long as your account remains active. Transaction receipts and tax invoices are retained strictly for the duration mandated by Ethiopian commercial and taxation accounting laws.',
      },
      {
        heading: 'Disposal & Anonymization',
        body: 'When personal data is no longer necessary for operational fulfillment or legal compliance, it is permanently purged or irreversibly anonymized from our production storage systems.',
      },
    ],
  },
  {
    id: 'rights',
    icon: <UserCheck className="h-5 w-5 text-amber-400" />,
    title: '4. Your Privacy Rights & Controls',
    summary: 'Self-service controls and support channels for managing, exporting, or deleting your data.',
    content: [
      {
        heading: 'Profile Access & Data Updates',
        body: 'You may inspect and update your name, phone number, and default delivery addresses at any time directly through your Account Settings dashboard.',
      },
      {
        heading: 'Data Export Requests',
        body: 'You may request a machine-readable summary of your personal information and transaction logs by contacting our support team.',
      },
      {
        heading: 'Account Deletion & Erasure',
        body: 'You have the right to request the permanent deletion of your account and associated personal data, provided there are no active, unfulfilled orders or mandatory statutory accounting holds.',
      },
      {
        heading: 'Handling Timelines',
        body: 'We endeavor to acknowledge and fulfill formal data rights requests within standard operational timeframes, typically within thirty (30) business days.',
      },
    ],
  },
  {
    id: 'cookies',
    icon: <Cookie className="h-5 w-5 text-blue-400" />,
    title: '5. Cookies & Local Storage',
    summary: 'How local browser storage is used to keep you signed in and remember your preferences.',
    content: [
      {
        heading: 'Essential Session Storage',
        body: 'We utilize secure cookies and browser storage to maintain your authenticated login session, keep items in your shopping cart, and prevent cross-site request forgery.',
      },
      {
        heading: 'Preference Storage',
        body: 'We store your preferred interface theme (Dark Mode or Light Mode) and recent search queries locally in your browser to enhance responsiveness.',
      },
    ],
  },
  {
    id: 'contact',
    icon: <Mail className="h-5 w-5 text-purple-400" />,
    title: '6. Contact & Privacy Inquiries',
    summary: 'Direct communication channels for data protection and policy questions.',
    content: [
      {
        heading: 'Dedicated Support Desk',
        body: 'If you have questions regarding this Privacy Policy or wish to exercise your data rights, please contact us via email at privacy@ethioshop.et or open a ticket through our Support Center.',
      },
      {
        heading: 'Physical Headquarters',
        body: 'EthioShop E-Commerce Operations, Bole Sub-City, Addis Ababa, Ethiopia.',
      },
    ],
  },
];

export default function Privacy() {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('collection');

  const filteredSections = privacySections.filter((section) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesTitle = section.title.toLowerCase().includes(q);
    const matchesSummary = section.summary.toLowerCase().includes(q);
    const matchesContent = section.content.some(
      (c) => c.heading.toLowerCase().includes(q) || c.body.toLowerCase().includes(q)
    );
    return matchesTitle || matchesSummary || matchesContent;
  });

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      style={{ background: isDark ? '#080A12' : '#F8FAFC', minHeight: '100vh' }}
      className="transition-colors duration-300 py-12 md:py-16"
    >
      <div className="container-shell max-w-[1200px] mx-auto px-4">
        
        {/* Header Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-8 md:p-12 rounded-3xl mb-10 relative overflow-hidden shadow-2xl"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #111522 0%, #171B2B 100%)'
              : 'linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 100%)',
            border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
          }}
        >
          {/* Subtle Ambient Light */}
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }}
          />

          <div className="max-w-3xl relative z-10">
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{
                  background: 'rgba(139,92,246,0.12)',
                  color: '#8B5CF6',
                  border: '1px solid rgba(139,92,246,0.3)',
                }}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Trust & Transparency
              </span>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{
                  background: isDark ? '#171B2B' : '#E2E8F0',
                  color: isDark ? '#94A3B8' : '#64748B',
                }}
              >
                Updated: August 2026
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
              Privacy Policy & <span className="text-gradient-brand">Data Protection</span>
            </h1>

            <p className="mt-4 text-sm sm:text-base leading-relaxed" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
              We believe in complete transparency. This policy outlines how EthioShop Atelier collects, safeguards, and utilizes your personal information when using our e-commerce platform and services.
            </p>

            {/* In-page search bar */}
            <div className="mt-8 max-w-lg">
              <div
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-sm transition-all"
                style={{
                  background: isDark ? '#171B2B' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#252A3A' : '#CBD5E1'}`,
                }}
              >
                <Search className="h-4 w-4 shrink-0" style={{ color: '#8B5CF6' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search topics (e.g. cookies, Telebirr, deletion, encryption)..."
                  className="w-full text-xs sm:text-sm font-medium bg-transparent focus:outline-none"
                  style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-bold px-2 py-0.5 rounded cursor-pointer"
                    style={{ color: isDark ? '#94A3B8' : '#64748B' }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Grid: Table of Contents + Policy Content */}
        <div className="grid lg:grid-cols-[300px_1fr] gap-8 items-start">
          
          {/* Sticky Navigation Sidebar (Desktop) */}
          <aside className="hidden lg:block sticky top-24 space-y-4">
            <div
              className="p-5 rounded-3xl shadow-lg"
              style={{
                background: isDark ? '#111522' : '#FFFFFF',
                border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
              }}
            >
              <h3 className="text-xs font-black uppercase tracking-wider mb-4 px-2" style={{ color: isDark ? '#64748B' : '#94A3B8' }}>
                Table of Contents
              </h3>
              <nav className="space-y-1">
                {privacySections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollToSection(s.id)}
                    className="w-full flex items-center justify-between text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    style={{
                      background: activeSection === s.id ? (isDark ? '#171B2B' : '#F1F5F9') : 'transparent',
                      color: activeSection === s.id ? '#8B5CF6' : (isDark ? '#94A3B8' : '#64748B'),
                      borderLeft: activeSection === s.id ? '3px solid #8B5CF6' : '3px solid transparent',
                    }}
                  >
                    <span className="line-clamp-1">{s.title}</span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Contact Box */}
            <div
              className="p-5 rounded-3xl"
              style={{
                background: isDark ? '#111522' : '#FFFFFF',
                border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
              }}
            >
              <h4 className="text-xs font-bold mb-1" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                Need Privacy Assistance?
              </h4>
              <p className="text-[11px] leading-relaxed mb-3" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                Our compliance team is ready to help with data export or erasure requests.
              </p>
              <Link
                to="/contact"
                className="btn-neon-secondary w-full py-2 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <span>Contact Desk</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </aside>

          {/* Policy Content Sections */}
          <div className="space-y-8">
            {filteredSections.length === 0 ? (
              <div
                className="p-12 text-center rounded-3xl"
                style={{
                  background: isDark ? '#111522' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                }}
              >
                <HelpCircle className="h-10 w-10 mx-auto mb-3 text-purple-400" />
                <h3 className="text-base font-bold mb-1" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  No matching policy sections found
                </h3>
                <p className="text-xs max-w-xs mx-auto mb-4" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                  Try a different search keyword or clear your filter to browse all terms.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="btn-neon-primary px-6 py-2 text-xs font-bold"
                >
                  View All Sections
                </button>
              </div>
            ) : (
              filteredSections.map((section, idx) => (
                <motion.article
                  key={section.id}
                  id={section.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: idx * 0.05 }}
                  className="p-6 sm:p-8 rounded-3xl shadow-xl transition-all scroll-mt-28"
                  style={{
                    background: isDark ? '#111522' : '#FFFFFF',
                    border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                  }}
                >
                  {/* Section Title Header */}
                  <div className="flex items-center gap-3.5 pb-4 mb-6" style={{ borderBottom: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}` }}>
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                      style={{
                        background: isDark ? '#171B2B' : '#F1F5F9',
                        border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                      }}
                    >
                      {section.icon}
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                        {section.title}
                      </h2>
                      <p className="text-xs mt-0.5" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                        {section.summary}
                      </p>
                    </div>
                  </div>

                  {/* Section Sub-items */}
                  <div className="space-y-6">
                    {section.content.map((item, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-4 sm:p-5 rounded-2xl"
                        style={{
                          background: isDark ? '#171B2B' : '#F8FAFC',
                          border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
                        }}
                      >
                        <h3 className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />
                          {item.heading}
                        </h3>
                        <p className="text-xs sm:text-sm leading-relaxed" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                          {item.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.article>
              ))
            )}

            {/* Final Trust & Support Card */}
            <div
              className="p-8 rounded-3xl text-center space-y-4"
              style={{
                background: isDark ? 'linear-gradient(135deg, #111522 0%, #171B2B 100%)' : '#FFFFFF',
                border: `1px solid ${isDark ? '#252A3A' : '#E2E8F0'}`,
              }}
            >
              <ShieldCheck className="h-10 w-10 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-black" style={{ color: isDark ? '#F8FAFC' : '#0F172A' }}>
                Your Privacy is Our Standard
              </h3>
              <p className="text-xs sm:text-sm max-w-md mx-auto leading-relaxed" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>
                If you have questions about how your transaction or account data is processed, our dedicated support team is available 24/7.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Link to="/contact" className="btn-neon-primary px-6 py-2.5 text-xs font-bold">
                  Contact Support Team
                </Link>
                <Link to="/terms" className="btn-neon-secondary px-6 py-2.5 text-xs font-bold">
                  View Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
