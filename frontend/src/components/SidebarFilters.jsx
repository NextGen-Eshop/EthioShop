import { useState } from "react";

export default function SidebarFilters({
  categories,
  selectedCategory,
  setCategory,
  maxPrice,
  setMaxPrice,
  sortBy,
  setSortBy,
  productCount,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    { value: "default", label: "Featured" },
    { value: "price-asc", label: "Price: Low → High" },
    { value: "price-desc", label: "Price: High → Low" },
    { value: "rating", label: "Top Rated" },
    { value: "name", label: "Name: A → Z" },
  ];

  return (
    <>
      {/* Mobile Filter Toggle */}
      <button
        className="lg:hidden btn btn-secondary w-full mb-4 justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          Filters & Sort
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Sidebar Content */}
      <aside
        className={`lg:block transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[600px] opacity-100 mb-6" : "max-h-0 opacity-0 lg:max-h-none lg:opacity-100"
        }`}
      >
        <div className="w-full lg:w-64 space-y-8 lg:sticky lg:top-[96px]">
          {/* Product Count */}
          <div>
            <p className="text-sm text-[var(--color-text-muted)]">
              Showing{" "}
              <span className="font-semibold text-[var(--color-text)]">
                {productCount}
              </span>{" "}
              products
            </p>
          </div>

          {/* Category Filter */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-4">
              Category
            </h3>
            <div className="space-y-1.5">
              <button
                onClick={() => setCategory("")}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  selectedCategory === ""
                    ? "bg-[var(--color-primary-ghost)] text-[var(--color-primary)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)]"
                }`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    selectedCategory === cat
                      ? "bg-[var(--color-primary-ghost)] text-[var(--color-primary)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-4">
              Max Price
            </h3>
            <div className="px-1">
              <input
                type="range"
                min="50"
                max="2500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-[var(--color-border)] rounded-full appearance-none cursor-pointer accent-[var(--color-primary)]"
                style={{
                  background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${
                    ((maxPrice - 50) / 2450) * 100
                  }%, var(--color-border) ${
                    ((maxPrice - 50) / 2450) * 100
                  }%, var(--color-border) 100%)`,
                }}
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-[var(--color-text-muted)]">$50</span>
                <span className="text-sm font-semibold text-[var(--color-primary)]">
                  ${maxPrice.toLocaleString()}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">$2,500</span>
              </div>
            </div>
          </div>

          {/* Sort By */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-4">
              Sort By
            </h3>
            <div className="space-y-1.5">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    sortBy === option.value
                      ? "bg-[var(--color-primary-ghost)] text-[var(--color-primary)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              setCategory("");
              setMaxPrice(2500);
              setSortBy("default");
            }}
            className="btn btn-ghost w-full text-sm text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
            </svg>
            Reset Filters
          </button>
        </div>
      </aside>
    </>
  );
}