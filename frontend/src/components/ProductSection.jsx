import { useState } from "react";
import ProductCard from "./ProductCard";
import { products } from "../data/products";

export default function ProductSection() {
  const categories = ["All", ...new Set(products.map((p) => p.category))];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProducts =
    selectedCategory === "All"
      ? products.slice(0, 6)
      : products.filter((p) => p.category === selectedCategory).slice(0, 6);

  return (
    <section className="section bg-[var(--color-bg)]">
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)] mb-2 block">
              Curated Selection
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[var(--color-text)]">
              Editorial Picks
            </h2>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === cat
                    ? "bg-[var(--color-primary)] text-white shadow-md"
                    : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="product-grid">
          {filteredProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-14">
          <a
            href="/products"
            className="btn btn-secondary btn-lg group"
          >
            View All Products
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}