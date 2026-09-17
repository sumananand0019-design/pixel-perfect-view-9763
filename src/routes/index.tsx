import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";

import { PokedexBrowser } from "@/components/PokedexBrowser";
import { TypeBadge } from "@/components/TypeBadge";
import {
  KALOS_COUNT,
  LEGENDARY_IDS,
  MYTHICAL_IDS,
  kalosListQuery,
  type Pokemon,
} from "@/lib/pokeapi";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kalos Pokédex — All 72 Generation VI Pokémon" },
      {
        name: "description",
        content:
          "Browse, search, filter and compare all 72 Pokémon introduced in the Kalos region, with stats, evolutions, types and weaknesses.",
      },
      { property: "og:title", content: "Kalos Pokédex — Generation VI" },
      {
        property: "og:description",
        content:
          "Explore the Pokémon of the Kalos Region: stats, evolutions, abilities and type matchups.",
      },
    ],
  }),
  component: Index,
});

const STARTER_LINES = [
  { label: "Grass Line", ids: [650, 651, 652] },
  { label: "Fire Line", ids: [653, 654, 655] },
  { label: "Water Line", ids: [656, 657, 658] },
];

function MiniCard({ pokemon }: { pokemon: Pokemon }) {
  return (
    <Link
      to="/pokemon/$id"
      params={{ id: String(pokemon.id) }}
      className="group flex flex-col items-center rounded-2xl border border-border bg-card p-3 transition-all hover:-translate-y-1 hover:border-primary/60 hover:shadow-[var(--shadow-card)]"
    >
      <img
        src={pokemon.sprite}
        alt={pokemon.displayName}
        loading="lazy"
        className="size-24 object-contain transition-transform group-hover:scale-110"
      />
      <span className="mt-1 text-sm font-semibold text-foreground">
        {pokemon.displayName}
      </span>
      <div className="mt-1 flex gap-1">
        {pokemon.types.map((t) => (
          <TypeBadge key={t} type={t} size="sm" />
        ))}
      </div>
    </Link>
  );
}

function Index() {
  const { data } = useQuery(kalosListQuery);
  const byId = (id: number) => data?.find((p) => p.id === id);

  return (
    <div>
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="mx-auto max-w-7xl px-4 py-20 text-center text-primary-foreground sm:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] opacity-80">
            Generation VI
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight sm:text-6xl">
            KALOS POKÉDEX
          </h1>
          <p className="mt-4 text-base opacity-90 sm:text-lg">
            Explore the Pokémon of the Kalos Region
          </p>
          <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-background/15 px-6 py-3 backdrop-blur">
            <span className="font-display text-3xl">{KALOS_COUNT}</span>
            <span className="text-left text-xs uppercase tracking-widest opacity-80">
              Pokémon
              <br />
              registered
            </span>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-xs opacity-75">
            This Pokédex covers the 72 species newly introduced in Kalos
            (Chespin #001 – Volcanion #072). The in-game Central, Coastal and
            Mountain Pokédexes also list Pokémon from earlier generations.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-14">
        <h2 className="font-display text-2xl text-foreground">Kalos Starters</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose your first partner and follow its full evolution line.
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {STARTER_LINES.map((line) => (
            <div
              key={line.label}
              className="rounded-3xl border border-border bg-card p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {line.label}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {line.ids.map((id) => {
                  const p = byId(id);
                  return p ? (
                    <MiniCard key={id} pokemon={p} />
                  ) : (
                    <div
                      key={id}
                      className="h-40 animate-pulse rounded-2xl bg-muted"
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-14">
        <h2 className="flex items-center gap-2 font-display text-2xl text-foreground">
          <Sparkles className="size-5 text-accent" />
          Legendary &amp; Mythical
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The rarest forces of the Kalos region.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[...LEGENDARY_IDS, ...MYTHICAL_IDS].map((id) => {
            const p = byId(id);
            return p ? (
              <div
                key={id}
                className="rounded-2xl p-[1px]"
                style={{ background: "var(--gradient-hero)" }}
              >
                <MiniCard pokemon={p} />
              </div>
            ) : (
              <div key={id} className="h-40 animate-pulse rounded-2xl bg-muted" />
            );
          })}
        </div>
      </section>

      <PokedexBrowser />
    </div>
  );
}
