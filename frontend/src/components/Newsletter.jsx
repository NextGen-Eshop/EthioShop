import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setEmail("");
      setSubmitted(false);
    }, 3000);
  };

  return (
    <section className="section relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-light)] to-[#a78bfa]" />
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                          radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 40%)`,
      }} />

      <div className="container relative z-10 text-center">
        <div className="max-w-xl mx-auto">
          <span className="inline-block text-white/70 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            Stay Connected
          </span>

          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
            Join the Collective
          </h2>

          <p className="text-white/70 text-base mb-8 leading-relaxed">
            Be the first to discover new collections, exclusive offers, and design inspiration delivered to your inbox.
          </p>

          {submitted ? (
            <div className="animate-scale-in flex items-center justify-center gap-3 bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="text-white font-medium">
                Welcome aboard! Check your inbox.
              </span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <div className="flex-1 relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all duration-300"
                  placeholder="Enter your email"
                />
              </div>
              <button
                type="submit"
                className="btn bg-white text-[var(--color-primary)] hover:bg-white/90 font-semibold px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                Subscribe
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </form>
          )}

          <p className="text-white/40 text-xs mt-5">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}