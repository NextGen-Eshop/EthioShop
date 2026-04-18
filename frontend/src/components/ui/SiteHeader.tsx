import { Link } from "@tanstack/react-router";
import { Search, Heart, ShoppingBag } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 lg:px-12">
        <Link to="/" className="font-display text-xl tracking-tight text-ink">
          The Collective
        </Link>
        <nav className="hidden items-center gap-10 text-sm text-stone md:flex">
          <a href="#" className="transition-colors hover:text-ink">Catalog</a>
          <a href="#" className="transition-colors hover:text-ink">Objects</a>
          <a href="#" className="transition-colors hover:text-ink">Editorial</a>
          <a href="#" className="transition-colors hover:text-ink">Atelier</a>
        </nav>
        <div className="flex items-center gap-5 text-stone">
          <button aria-label="Search" className="transition-colors hover:text-ink">
            <Search className="h-4 w-4" />
          </button>
          <button aria-label="Saved" className="transition-colors hover:text-ink">
            <Heart className="h-4 w-4" />
          </button>
          <button aria-label="Cart" className="relative transition-colors hover:text-ink">
            <ShoppingBag className="h-4 w-4" />
            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              2
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
