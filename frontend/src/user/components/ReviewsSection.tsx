import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const reviews = [
  {
    initials: "EM",
    name: "Elena Moretti",
    role: "Verified Collector",
    when: "2 weeks ago",
    color: "bg-[oklch(0.92_0.04_275)] text-primary",
    quote:
      "The way this piece catches the light in the afternoon is transformative. It's more than a vase, it's a structural anchor for my study.",
  },
  {
    initials: "JW",
    name: "Julian Weaver",
    role: "Verified Collector",
    when: "1 month ago",
    color: "bg-[oklch(0.88_0.06_275)] text-primary",
    quote:
      "Exceptional craftsmanship. The matte finish feels like velvet. Shipping was handled with extreme care and white-glove delivery.",
  },
  {
    initials: "SA",
    name: "Sarah Al-Fayed",
    role: "Verified Collector",
    when: "2 months ago",
    color: "bg-[oklch(0.88_0.07_45)] text-[oklch(0.45_0.18_45)]",
    quote:
      "Slightly larger in person than I expected, which was a pleasant surprise. The weight of the sandstone is significant and premium.",
  },
];

export function ReviewsSection() {
  return (
    <section className="mt-32">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className="font-display text-4xl leading-tight text-ink lg:text-5xl">
            Acquired Reflections
          </h2>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <div className="flex text-primary">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <span className="text-stone">4.9 Based on 42 reviews</span>
          </div>
        </div>
        <Button variant="outline" className="rounded-md">
          Write a Review
        </Button>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {reviews.map((r) => (
          <article
            key={r.name}
            className="flex flex-col rounded-md border border-border bg-card p-7 shadow-soft"
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-md text-xs font-semibold ${r.color}`}
              >
                {r.initials}
              </div>
              <span className="text-xs text-stone">{r.when}</span>
            </div>
            <p className="mt-6 flex-1 text-[15px] italic leading-relaxed text-foreground/85">
              "{r.quote}"
            </p>
            <div className="mt-6 border-t border-border pt-4">
              <p className="text-sm font-medium text-ink">{r.name}</p>
              <p className="text-xs text-stone">{r.role}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
