import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductSection from "../components/ProductSection";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import { categories } from "../data/products";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative h-screen min-h-[600px] max-h-[900px] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/hero-banner.png"
            alt="Modern living essentials"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="container relative z-10">
          <div className="max-w-2xl">
            <span className="animate-fade-in-up inline-block text-white/60 text-xs font-semibold uppercase tracking-[0.25em] mb-6">
              New Collection 2026
            </span>

            <h1 className="animate-fade-in-up stagger-1 font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6">
              Modern Living{" "}
              <span className="italic font-normal text-white/80">Essentials</span>
            </h1>

            <p className="animate-fade-in-up stagger-2 text-lg text-white/60 leading-relaxed mb-10 max-w-lg">
              Discover curated pieces that blend timeless craftsmanship with
              contemporary design. Elevate every corner of your space.
            </p>

            <div className="animate-fade-in-up stagger-3 flex flex-wrap gap-4">
              <Link to="/products" className="btn btn-primary btn-lg">
                Explore Collection
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <Link to="/products?category=Furniture" className="btn btn-lg bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 hover:border-white/40">
                Shop Furniture
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in stagger-5">
          <div className="flex flex-col items-center gap-2 text-white/40">
            <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
            <div className="w-[1px] h-8 bg-gradient-to-b from-white/40 to-transparent" />
          </div>
        </div>
      </section>

      {/* ═══ TRUST BAR ═══ */}
      <section className="bg-[var(--color-surface)] border-b border-[var(--color-border-light)]">
        <div className="container py-6">
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 text-center">
            {[
              { icon: "truck", label: "Free Shipping", sub: "On orders over $200" },
              { icon: "shield", label: "Secure Payments", sub: "256-bit encryption" },
              { icon: "refresh", label: "Easy Returns", sub: "30-day return policy" },
              { icon: "headphones", label: "24/7 Support", sub: "Always here to help" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-ghost)] flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {item.icon === "truck" && (
                      <>
                        <rect x="1" y="3" width="15" height="13" />
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                        <circle cx="5.5" cy="18.5" r="2.5" />
                        <circle cx="18.5" cy="18.5" r="2.5" />
                      </>
                    )}
                    {item.icon === "shield" && (
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    )}
                    {item.icon === "refresh" && (
                      <>
                        <polyline points="23 4 23 10 17 10" />
                        <polyline points="1 20 1 14 7 14" />
                        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                      </>
                    )}
                    {item.icon === "headphones" && (
                      <>
                        <path d="M3 18v-6a9 9 0 0118 0v6" />
                        <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
                      </>
                    )}
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-[var(--color-text)]">{item.label}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CATEGORIES ═══ */}
      <section className="section bg-[var(--color-bg)]">
        <div className="container">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)] mb-2 block">
              Browse
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[var(--color-text)]">
              Shop by Category
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <Link
                key={cat.name}
                to={`/products?category=${cat.name}`}
                className={`group relative overflow-hidden rounded-2xl h-72 md:h-80 animate-fade-in-up stagger-${i + 1}`}
              >
                {/* Image */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-500" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-start justify-end p-8">
                  <span className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">
                    {cat.count} Products
                  </span>
                  <h3 className="text-white text-2xl font-bold mb-1 group-hover:translate-x-1 transition-transform duration-300">
                    {cat.name}
                  </h3>
                  <p className="text-white/60 text-sm mb-4">
                    {cat.description}
                  </p>
                  <span className="flex items-center gap-2 text-white/80 text-sm font-medium group-hover:gap-3 transition-all duration-300">
                    Explore
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURED PRODUCTS ═══ */}
      <ProductSection />

      {/* ═══ BANNER / CTA ═══ */}
      <section className="section-sm">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-text)] to-[#2d2f45] p-10 sm:p-16">
            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-[var(--color-primary)]/10 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[var(--color-primary-light)]/10 blur-3xl" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left">
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
                  The Art of Living Well
                </h2>
                <p className="text-white/50 max-w-md">
                  Explore our complete collection of handpicked essentials designed for the modern home.
                </p>
              </div>
              <Link
                to="/products"
                className="btn btn-lg bg-white text-[var(--color-text)] hover:bg-white/90 font-semibold shadow-xl hover:-translate-y-1 transition-all duration-300 flex-shrink-0"
              >
                Shop Now
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ NEWSLETTER ═══ */}
      <Newsletter />

      {/* ═══ FOOTER ═══ */}
      <Footer />
    </div>
  );
}