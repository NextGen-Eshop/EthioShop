import { useState } from "react";
import { Link } from "react-router-dom";

export default function ProductCard({ product, index = 0 }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getStockStatus = () => {
    if (product.stock === 0) return { label: "Out of Stock", class: "out-of-stock", badge: "badge-danger" };
    if (product.stock <= 3) return { label: `Only ${product.stock} left`, class: "low-stock", badge: "badge-warning" };
    return { label: "In Stock", class: "in-stock", badge: "badge-success" };
  };

  const stockInfo = getStockStatus();

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={i < fullStars ? "#fbbf24" : "none"}
          stroke={i < fullStars ? "#fbbf24" : "#d1d5db"}
          strokeWidth="2"
          className="inline-block"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    }
    return stars;
  };

  return (
    <div
      className={`card group animate-fade-in-up stagger-${Math.min(index % 6 + 1, 6)}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-[var(--color-surface-alt)] aspect-square">
        {/* Shimmer placeholder */}
        {!imgLoaded && (
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(90deg, #f3f4f8 25%, #eaecf2 50%, #f3f4f8 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
            }}
          />
        )}

        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
            isHovered ? "scale-110" : "scale-100"
          } ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImgLoaded(true)}
          loading="lazy"
        />

        {/* Overlay actions */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent flex items-end justify-between p-4 transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            className="btn btn-primary btn-sm"
            disabled={product.stock === 0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Added to cart:", product.name);
            }}
          >
            {product.stock === 0 ? "Sold Out" : "Add to Cart"}
          </button>

          <button
            className="w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all duration-300 hover:scale-110"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            aria-label="Wishlist"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1c2b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>
        </div>

        {/* Stock Badge */}
        {product.stock <= 3 && (
          <div className="absolute top-3 left-3">
            <span className={`badge ${stockInfo.badge}`}>
              <span className={`stock-dot ${stockInfo.class} mr-1.5`}></span>
              {stockInfo.label}
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            {product.category}
          </p>
          <div className="flex items-center gap-1">
            {renderStars(product.rating)}
            <span className="text-xs text-[var(--color-text-muted)] ml-1">
              {product.rating}
            </span>
          </div>
        </div>

        <h3 className="font-semibold text-[var(--color-text)] text-base mb-2 group-hover:text-[var(--color-primary)] transition-colors duration-300">
          {product.name}
        </h3>

        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed line-clamp-2 mb-3">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold gradient-text">
            ${product.price.toLocaleString()}
          </span>
          {product.stock > 3 && (
            <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
              <span className={`stock-dot ${stockInfo.class}`}></span>
              {stockInfo.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}