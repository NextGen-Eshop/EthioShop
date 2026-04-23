/**
 * Skeleton loader that matches the ProductCard dimensions.
 * Rendered in a grid while products are "loading".
 */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-square bg-gray-200" />

      {/* Content placeholder */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <div className="h-2.5 w-16 bg-gray-200 rounded-full" />
        {/* Title */}
        <div className="space-y-2">
          <div className="h-3.5 w-full bg-gray-200 rounded-full" />
          <div className="h-3.5 w-3/4 bg-gray-200 rounded-full" />
        </div>
        {/* Rating */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-gray-200 rounded-sm" />
          ))}
          <div className="h-2.5 w-8 bg-gray-200 rounded-full ml-1" />
        </div>
        {/* Price */}
        <div className="flex items-baseline gap-2 pt-1">
          <div className="h-5 w-24 bg-gray-200 rounded-full" />
          <div className="h-3 w-16 bg-gray-100 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * A grid of skeleton cards to show during loading.
 */
export default function ProductSkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
