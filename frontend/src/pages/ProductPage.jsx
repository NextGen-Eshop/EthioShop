import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import SidebarFilters from "../components/SidebarFilters";
import Footer from "../components/Footer";
import { products } from "../data/products";

export default function ProductPage() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [maxPrice, setMaxPrice] = useState(2500);
  const [sortBy, setSortBy] = useState("default");

  const allCategories = [...new Set(products.map((p) => p.category))];

  const filtered = useMemo(() => {
    let result = products
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .filter((p) => (category ? p.category === category : true))
      .filter((p) => p.price <= maxPrice);

    switch (sortBy) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case "name":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return result;
  }, [search, category, maxPrice, sortBy]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />

      {/* ═══ PAGE HEADER ═══ */}
      <section className="pt-[120px] pb-10 bg-[var(--color-surface)] border-b border-[var(--color-border-light)]">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            {/* Title */}
            <div className="animate-fade-in-up">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)] mb-2 block">
                Collection
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-[var(--color-text)] mb-2">
                {category || "All Products"}
              </h1>
              <p className="text-[var(--color-text-secondary)] max-w-md">
                {category
                  ? `Explore our curated selection of ${category.toLowerCase()} pieces designed for modern living.`
                  : "Browse our complete collection of handpicked essentials for the contemporary home."}
              </p>
            </div>

            {/* Search Bar */}
            <div className="animate-fade-in-up stagger-2 relative w-full md:w-80">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-text-muted)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input pl-12 pr-4 py-3 rounded-xl bg-[var(--color-surface-alt)] border-[var(--color-border-light)] focus:bg-[var(--color-surface)]"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {(category || search || maxPrice < 2500) && (
            <div className="flex flex-wrap items-center gap-2 mt-6 animate-fade-in">
              <span className="text-xs text-[var(--color-text-muted)]">Active filters:</span>
              {category && (
                <button
                  onClick={() => setCategory("")}
                  className="badge badge-primary flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  {category}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="badge badge-primary flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  "{search}"
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
              {maxPrice < 2500 && (
                <button
                  onClick={() => setMaxPrice(2500)}
                  className="badge badge-primary flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  Under ${maxPrice}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ═══ MAIN CONTENT ═══ */}
      <section className="section-sm">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar */}
            <SidebarFilters
              categories={allCategories}
              selectedCategory={category}
              setCategory={setCategory}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              sortBy={sortBy}
              setSortBy={setSortBy}
              productCount={filtered.length}
            />

            {/* Products Grid */}
            <div className="flex-1">
              {filtered.length > 0 ? (
                <div className="product-grid">
                  {filtered.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                  <div className="w-20 h-20 rounded-2xl bg-[var(--color-surface-alt)] flex items-center justify-center mb-6">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
                    No products found
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] max-w-sm mb-6">
                    Try adjusting your filters or search terms to find what you're looking for.
                  </p>
                  <button
                    onClick={() => {
                      setCategory("");
                      setSearch("");
                      setMaxPrice(2500);
                      setSortBy("default");
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}