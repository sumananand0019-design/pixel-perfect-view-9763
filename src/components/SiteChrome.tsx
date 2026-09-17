import { Link } from "@tanstack/react-router";
import { Moon, Sun, Heart } from "lucide-react";

import { useTheme } from "@/lib/preferences";

export function SiteHeader() {
  const { dark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <span className="relative flex size-8 items-center justify-center rounded-full bg-primary ring-4 ring-primary/20">
            <span className="size-3 rounded-full bg-background" />
          </span>
          <span className="font-display text-base tracking-widest text-foreground">
            KALOS POKÉDEX
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            to="/favorites"
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "text-primary" }}
          >
            <Heart className="size-4" />
            <span className="hidden sm:inline">Favorites</span>
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border py-8 text-center text-sm text-muted-foreground">
      <p className="font-display tracking-widest">
        Kalos Pokédex • Generation VI
      </p>
      <p className="mt-2 text-xs">
        Data from PokéAPI. Pokémon © Nintendo / Game Freak / The Pokémon Company.
      </p>
    </footer>
  );
}
