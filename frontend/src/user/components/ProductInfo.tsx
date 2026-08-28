import { useState } from "react";
import { Heart, ShoppingCart, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

const specs = [
  { label: "Dimensions", value: '12.5" x 8.0" x 8.0"' },
  { label: "Material", value: "Glazed Sandstone" },
  { label: "Origin", value: "Gifu, Japan" },
  { label: "Finish", value: "Satin Matte White" },
];

export function ProductInfo() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="lg:sticky lg:top-28 lg:self-start">
      <div className="flex items-start justify-between gap-4">
        <h1 className="font-display text-4xl leading-tight text-ink lg:text-5xl">
          Monolith Series 01
        </h1>
        <button
          onClick={() => setSaved((s) => !s)}
          aria-label="Save"
          className="mt-2 transition-colors"
        >
          <Heart
            className={`h-6 w-6 transition-all ${
              saved ? "fill-primary text-primary" : "text-primary"
            }`}
          />
        </button>
      </div>

      <div className="mt-4 flex items-baseline gap-3">
        <span className="font-display text-2xl text-primary">$1,240.00</span>
        <span className="text-xs text-stone">Duty &amp; Taxes Included</span>
      </div>

      <p className="mt-6 max-w-md text-[15px] leading-relaxed text-foreground/80">
        The Monolith Series 01 represents the pinnacle of reductive design.
        Hand-thrown in the northern reaches of Japan, each piece is a singular
        study in volume and atmospheric presence.
      </p>

      <div className="mt-8 space-y-3">
        <Button size="lg" className="h-14 w-full rounded-md text-base font-medium shadow-soft">
          <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
        </Button>
        <div className="rounded-md border border-border bg-canvas p-1.5">
          <p className="px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-stone">
            Merchant Controls
          </p>
          <Button variant="outline" className="h-11 w-full bg-card text-sm font-medium">
            <Pencil className="mr-2 h-4 w-4" /> Edit Product Detail
          </Button>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-border pt-8">
        {specs.map((s, i) => (
          <div key={s.label} className={i % 2 === 0 ? "border-r border-border pr-4" : ""}>
            <p className="eyebrow">{s.label}</p>
            <p className="mt-1.5 text-[15px] font-medium text-ink">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
