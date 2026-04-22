import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

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
    // TODO: POST /api/contact
    setSent(true);
  };

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    setErrors(p => ({ ...p, [field]: '' }));
  };

  return (
    <section className="container-shell py-12 md:py-16">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Info panel */}
        <div className="panel p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#00a98f]">Contact Us</p>
          <h1 className="mt-3 text-3xl">Talk to our team.</h1>
          <p className="mt-3 text-sm leading-7 text-[#5b6475]">
            For order issues, partnership inquiries, or product questions — send us a message and we'll reply within 12 hours.
          </p>

          <div className="mt-6 space-y-4">
            {[
              { icon: '📧', label: 'Email', value: 'support@ethioshop.example' },
              { icon: '📞', label: 'Phone', value: '+251 900 000 000' },
              { icon: '📍', label: 'Location', value: 'Addis Ababa, Ethiopia' },
              { icon: '🕐', label: 'Hours', value: 'Mon–Sat, 8am–6pm EAT' },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{icon}</span>
                <div>
                  <p className="text-xs font-bold text-[#5b6475] uppercase tracking-widest">{label}</p>
                  <p className="text-sm text-[#111827] font-medium">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-[#d8deed]">
            <p className="text-xs text-[#5b6475] mb-3">Need quick answers?</p>
            <Link to="/support" className="btn-secondary px-4 py-2 text-sm inline-block">
              Visit Support Center →
            </Link>
          </div>
        </div>

        {/* Form panel */}
        {sent ? (
          <div className="panel p-6 md:p-8 flex flex-col items-center justify-center text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-[#111827] mb-2">Message Sent!</h2>
            <p className="text-sm text-[#5b6475] mb-6 max-w-xs">
              Thanks, <strong>{form.name}</strong>! We've received your message and will reply to <strong>{form.email}</strong> within 12 hours.
            </p>
            <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }} className="btn-secondary px-5 py-2.5 text-sm">
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="panel space-y-4 p-6 md:p-8" noValidate>
            <h2 className="text-xl font-bold text-[#111827]">Send a Message</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6475]">Full Name</label>
                <input value={form.name} onChange={set('name')} className={`field ${errors.name ? 'field-error' : ''}`} placeholder="Your name" />
                {errors.name && <p className="text-xs text-[#c7414b] mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6475]">Email</label>
                <input type="email" value={form.email} onChange={set('email')} className={`field ${errors.email ? 'field-error' : ''}`} placeholder="you@email.com" />
                {errors.email && <p className="text-xs text-[#c7414b] mt-1">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6475]">Subject</label>
              <select value={form.subject} onChange={set('subject')} className={`field ${errors.subject ? 'field-error' : ''}`}>
                <option value="">Select a topic...</option>
                <option value="order">Order Issue</option>
                <option value="return">Return / Refund</option>
                <option value="product">Product Question</option>
                <option value="payment">Payment Problem</option>
                <option value="partnership">Partnership</option>
                <option value="other">Other</option>
              </select>
              {errors.subject && <p className="text-xs text-[#c7414b] mt-1">{errors.subject}</p>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-[#5b6475]">Message</label>
              <textarea
                rows={5}
                value={form.message}
                onChange={set('message')}
                className={`field resize-none ${errors.message ? 'field-error' : ''}`}
                placeholder="Describe your issue or question in detail..."
              />
              {errors.message && <p className="text-xs text-[#c7414b] mt-1">{errors.message}</p>}
            </div>

            <button type="submit" className="btn-primary w-full px-5 py-3 text-sm">
              Send Message
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
