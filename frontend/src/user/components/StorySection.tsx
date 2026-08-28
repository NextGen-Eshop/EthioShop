import detailImg from "@/assets/monolith-detail-1.jpg";
import { ArrowUpRight } from "lucide-react";

export function StorySection() {
  return (
    <section className="mt-32 grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-24">
      <div>
        <h2 className="font-display text-4xl leading-tight text-ink lg:text-5xl">
          The Art of Reduction
        </h2>
        <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-foreground/80">
          <p>
            Designed by the Collective in collaboration with Master Hiroshi Ando,
            this piece explores the intersection of brutalist architecture and
            organic pottery traditions. The finish is achieved through a 48-hour
            pit-firing process that gives every object its unique tonal signature.
          </p>
          <p>
            Ideal as a standalone statement or part of a clustered gallery
            arrangement, the Monolith Series transforms with the path of the sun
            through your space.
          </p>
        </div>
        <a
          href="#"
          className="mt-10 inline-flex items-center gap-2 border-b-2 border-primary pb-1 text-xs font-medium uppercase tracking-[0.18em] text-primary transition-all hover:gap-3"
        >
          Read the Story <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
      <div className="overflow-hidden rounded-md">
        <img
          src={detailImg}
          alt="Atmospheric pottery in lamplight"
          width={1000}
          height={750}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover"
        />
      </div>
    </section>
  );
}
