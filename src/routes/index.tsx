import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductInfo } from "@/components/ProductInfo";
import { StorySection } from "@/components/StorySection";
import { ReviewsSection } from "@/components/ReviewsSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Monolith Series 01 — The Collective" },
      {
        name: "description",
        content:
          "Hand-thrown sculptural stoneware from Gifu, Japan. The Monolith Series 01 — a singular study in volume and atmospheric presence.",
      },
      { property: "og:title", content: "Monolith Series 01 — The Collective" },
      {
        property: "og:description",
        content: "Curated sculptural objects for the modern sanctuary.",
      },
    ],
  }),
  component: ProductPage,
});

function Breadcrumbs() {
  return (
    <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-stone">
      <a href="#" className="transition-colors hover:text-ink">Catalog</a>
      <ChevronRight className="h-3 w-3" />
      <a href="#" className="transition-colors hover:text-ink">Objects</a>
      <ChevronRight className="h-3 w-3" />
      <span className="text-ink">Monolith Series 01</span>
    </nav>
  );
}

function ProductPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[1400px] px-6 pb-16 pt-10 lg:px-12">
        <Breadcrumbs />
        <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <ProductGallery />
          <ProductInfo />
        </div>
        <StorySection />
        <ReviewsSection />
      </main>
      <SiteFooter />
    </div>
  );
}
