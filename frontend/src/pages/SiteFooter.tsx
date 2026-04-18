import { Globe, Share2 } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border bg-canvas">
      <div className="mx-auto max-w-[1400px] px-6 py-20 lg:px-12">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="md:col-span-1">
            <h3 className="font-display text-2xl text-ink">The Collective</h3>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-stone">
              Curating the world's most intentional objects for the modern sanctuary.
            </p>
          </div>
          <div>
            <p className="eyebrow mb-5">Discover</p>
            <ul className="space-y-3 text-sm text-foreground">
              <li><a href="#" className="transition-colors hover:text-primary">Sustainability</a></li>
              <li><a href="#" className="transition-colors hover:text-primary">Contact</a></li>
              <li><a href="#" className="transition-colors hover:text-primary">Journal</a></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-5">Legal</p>
            <ul className="space-y-3 text-sm text-foreground">
              <li><a href="#" className="transition-colors hover:text-primary">Privacy</a></li>
              <li><a href="#" className="transition-colors hover:text-primary">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 flex items-center justify-between border-t border-border pt-8 text-xs text-stone">
          <p>© 2024 The Seamless Collective. Editorial Authority.</p>
          <div className="flex items-center gap-4">
            <button aria-label="Region"><Globe className="h-4 w-4" /></button>
            <button aria-label="Share"><Share2 className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    </footer>
  );
}
