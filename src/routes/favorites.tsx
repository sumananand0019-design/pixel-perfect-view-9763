import { createFileRoute } from "@tanstack/react-router";

import { PokedexBrowser } from "@/components/PokedexBrowser";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "My Favorite Kalos Pokémon — Kalos Pokédex" },
      {
        name: "description",
        content:
          "Your saved Kalos Pokémon, kept on this device and ready to compare.",
      },
      { property: "og:title", content: "My Favorite Kalos Pokémon" },
      {
        property: "og:description",
        content: "Your personal shortlist of Generation VI Pokémon.",
      },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  return (
    <div>
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <h1 className="font-display text-3xl text-foreground">FAVORITES</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pokémon you marked with a heart, saved on this device.
          </p>
        </div>
      </section>
      <PokedexBrowser favoritesOnly />
    </div>
  );
}
