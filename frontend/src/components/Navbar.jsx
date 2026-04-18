import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/" || location.pathname === "/home";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Products" },
    { to: "/cart", label: "Cart" },
  ];

  const navBg = scrolled || !isHome
    ? "bg-white/80 backdrop-blur-xl border-b border-[var(--color-border-light)] shadow-sm"
    : "bg-transparent";

  const textColor = scrolled || !isHome ? "text-[var(--color-text)]" : "text-white";
  const logoColor = scrolled || !isHome ? "text-[var(--color-text)]" : "text-white";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg}`}
    >
      <div className="container flex items-center justify-between h-[72px]">
        {/* Logo */}
        <Link
          to="/"
          className={`flex items-center gap-2 ${logoColor} transition-colors duration-300`}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <span className="text-lg font-bold tracking-tight">EthioShop</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-[var(--color-primary-ghost)] text-[var(--color-primary)]"
                    : `${textColor} hover:bg-white/10 hover:text-[var(--color-primary)]`
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <button
            className={`btn-icon hidden sm:flex items-center justify-center rounded-xl border border-transparent hover:border-[var(--color-border)] hover:bg-white/80 transition-all duration-300 ${textColor}`}
            aria-label="Search"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          {/* Cart */}
          <Link
            to="/cart"
            className={`btn-icon flex items-center justify-center rounded-xl border border-transparent hover:border-[var(--color-border)] hover:bg-white/80 transition-all duration-300 relative ${textColor}`}
            aria-label="Cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-bold flex items-center justify-center">
              0
            </span>
          </Link>

          {/* User */}
          <Link
            to="/login"
            className={`btn-icon hidden sm:flex items-center justify-center rounded-xl border border-transparent hover:border-[var(--color-border)] hover:bg-white/80 transition-all duration-300 ${textColor}`}
            aria-label="Account"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className={`md:hidden btn-icon flex items-center justify-center rounded-xl ${textColor}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="15" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="glass px-6 py-4 mx-4 mb-4 rounded-2xl space-y-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[var(--color-primary-ghost)] text-[var(--color-primary)]"
                    : "text-[var(--color-text)] hover:bg-[var(--color-surface-alt)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-[var(--color-border-light)]">
            <Link
              to="/login"
              className="block px-4 py-3 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}