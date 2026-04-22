import { useState } from 'react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    q: 'How do I track my order?',
    a: 'After placing an order, you\'ll receive a confirmation email with a tracking link. You can also check your order status in your account dashboard under "Orders".',
  },
  {
    q: 'Can I return an item?',
    a: 'Yes. Most items can be returned within 30 days of delivery when unused and in original packaging. Visit our returns page or contact us to initiate a return.',
  },
  {
    q: 'What payment methods are supported?',
    a: 'We support Chapa (Telebirr, CBE Birr), credit/debit cards (Visa, Mastercard), and Cash on Delivery for eligible areas.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Standard delivery within Addis Ababa takes 1–3 business days. Other regions may take 3–7 business days depending on location.',
  },
  {
    q: 'Is my payment information secure?',
    a: 'Yes. All payments are processed through secure, encrypted gateways. We never store your card details on our servers.',
  },
  {
    q: 'How do I cancel an order?',
    a: 'Orders can be cancelled within 1 hour of placement. After that, please contact our support team and we\'ll do our best to help.',
  },
];

export default function Support() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(null);

  const filtered = faqs.filter(
    f => !query || f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section className="container-shell py-12 md:py-16">
      <div className="grid gap-6 md:grid-cols-[1.1fr_1.4fr]">

        {/* Sidebar */}
        <aside className="panel p-6 h-fit">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3857d6]">Support Center</p>
          <h1 className="mt-3 text-3xl">How can we help?</h1>
          <p className="mt-3 text-sm leading-7 text-[#5b6475]">
            Search common answers below. Average response time: under 12 hours.
          </p>

          {/* Search */}
          <form onSubmit={(e) => e.preventDefault()} className="mt-5 flex gap-2">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="field flex-1"
              placeholder="Search support topics..."
            />
            <button type="submit" className="btn-primary px-4 py-2 text-sm shrink-0">
              Search
            </button>
          </form>

          <div className="mt-5 space-y-2">
            <p className="text-xs font-bold text-[#5b6475] uppercase tracking-widest">Quick Topics</p>
            {['Shipping', 'Returns', 'Payment', 'Account', 'Orders'].map(t => (
              <button
                key={t}
                onClick={() => setQuery(t)}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm text-[#5b6475] hover:bg-[#ecf1ff] hover:text-[#3857d6] transition-colors"
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-[#d8deed]">
            <p className="text-sm font-semibold text-[#111827] mb-1">Still need help?</p>
            <p className="text-xs text-[#5b6475] mb-3">Our team is ready to assist you directly.</p>
            <Link to="/contact" className="btn-primary px-4 py-2.5 text-sm inline-block w-full text-center">
              Contact Support
            </Link>
          </div>
        </aside>

        {/* FAQ accordion */}
        <div className="space-y-3">
          <p className="text-sm text-[#5b6475] mb-2">
            {query ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${query}"` : `${faqs.length} frequently asked questions`}
          </p>

          {filtered.length === 0 ? (
            <div className="panel p-8 text-center">
              <p className="text-3xl mb-3">🔍</p>
              <p className="text-sm font-semibold text-[#111827] mb-1">No results found</p>
              <p className="text-xs text-[#5b6475] mb-4">Try a different search term or contact us directly.</p>
              <Link to="/contact" className="btn-primary px-5 py-2.5 text-sm inline-block">Contact Support</Link>
            </div>
          ) : (
            filtered.map((item, i) => (
              <article key={item.q} className="panel overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-[#f4f6fb] transition-colors"
                >
                  <h2 className="text-sm font-semibold text-[#111827]">{item.q}</h2>
                  <span className={`shrink-0 w-6 h-6 rounded-full border border-[#d8deed] flex items-center justify-center text-[#5b6475] transition-transform ${open === i ? 'rotate-180' : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </span>
                </button>
                {open === i && (
                  <div className="px-5 pb-5">
                    <p className="text-sm leading-7 text-[#5b6475]">{item.a}</p>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
