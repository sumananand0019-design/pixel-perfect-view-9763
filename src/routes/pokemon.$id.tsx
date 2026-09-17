import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2,
  Sparkles,
} from "lucide-react";

import { TypeBadge } from "@/components/TypeBadge";
import { cn } from "@/lib/utils";
import {
  KALOS_END,
  KALOS_START,
  STAT_LABELS,
  evolutionQuery,
  genderText,
  matchupQuery,
  pokemonQuery,
} from "@/lib/pokeapi";
import { useFavorites } from "@/lib/preferences";

export const Route = createFileRoute("/pokemon/$id")({
  head: ({ params }) => {
    const n = Number(params.id) - KALOS_START + 1;
    return {
      meta: [
        { title: `Kalos Pokédex #${String(n).padStart(3, "0")} — Pokémon Details` },
        {
          name: "description",
          content:
            "Full Pokédex entry: stats, abilities, evolution chain, egg groups, moves and type matchups.",
        },
        { property: "og:title", content: "Kalos Pokédex entry" },
        {
          property: "og:description",
          content:
            "Stats, abilities, evolutions and type matchups for this Kalos Pokémon.",
        },
      ],
    };
  },
  component: PokemonDetailPage,
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-2 last:border-0">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="text-right text-sm font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}

function PokemonDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const numericId = Number(id);
  const { favorites, toggle } = useFavorites();

  const { data: p, isLoading, isError } = useQuery(pokemonQuery(numericId));
  const { data: evolution } = useQuery(evolutionQuery(p?.evolutionChainUrl ?? null));
  const { data: matchups } = useQuery(matchupQuery(p?.types ?? []));

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm">Loading Pokédex entry…</p>
      </div>
    );
  }

  if (isError || !p) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <p className="font-display text-xl text-foreground">Entry unavailable</p>
        <Link
          to="/"
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
        >
          Back to Pokédex
        </Link>
      </div>
    );
  }

  const prevId = numericId > KALOS_START ? numericId - 1 : KALOS_END;
  const nextId = numericId < KALOS_END ? numericId + 1 : KALOS_START;
  const isFavorite = favorites.includes(p.id);
  const special = p.isLegendary || p.isMythical;

  return (
    <div className="pb-8">
      <section
        className="relative"
        style={{
          background: `linear-gradient(140deg, color-mix(in oklab, var(--type-${p.types[0]}) 70%, black), color-mix(in oklab, var(--type-${p.types[p.types.length - 1]}) 45%, black))`,
        }}
      >
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-center justify-between gap-3 text-primary-foreground">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-background/15 px-4 py-2 text-sm font-medium backdrop-blur transition-colors hover:bg-background/25"
            >
              <ArrowLeft className="size-4" /> Back to Pokédex
            </Link>
            <div className="flex items-center gap-2">
              <Link
                to="/pokemon/$id"
                params={{ id: String(prevId) }}
                className="inline-flex items-center gap-1 rounded-full bg-background/15 px-3 py-2 text-sm backdrop-blur transition-colors hover:bg-background/25"
              >
                <ChevronLeft className="size-4" /> Prev
              </Link>
              <Link
                to="/pokemon/$id"
                params={{ id: String(nextId) }}
                className="inline-flex items-center gap-1 rounded-full bg-background/15 px-3 py-2 text-sm backdrop-blur transition-colors hover:bg-background/25"
              >
                Next <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>

          <div className="mt-6 grid items-center gap-6 md:grid-cols-2">
            <div className="flex justify-center">
              <img
                src={p.sprite}
                alt={p.displayName}
                className="size-64 object-contain drop-shadow-2xl sm:size-72"
              />
            </div>
            <div className="text-primary-foreground">
              <p className="font-display text-sm tracking-[0.3em] opacity-80">
                #{String(p.kalosNumber).padStart(3, "0")}
              </p>
              <h1 className="mt-1 flex flex-wrap items-center gap-3 font-display text-4xl sm:text-5xl">
                {p.displayName}
                {special && <Sparkles className="size-6" />}
              </h1>
              {p.japaneseName && (
                <p className="mt-1 text-sm opacity-80">{p.japaneseName}</p>
              )}
              {p.genus && <p className="text-sm opacity-80">{p.genus}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                {p.types.map((t) => (
                  <TypeBadge key={t} type={t} />
                ))}
              </div>
              {p.flavorText && (
                <p className="mt-4 max-w-md text-sm leading-relaxed opacity-90">
                  {p.flavorText}
                </p>
              )}
              <button
                type="button"
                onClick={() => toggle(p.id)}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-background/15 px-4 py-2 text-sm font-medium backdrop-blur transition-colors hover:bg-background/25"
              >
                <Heart className={cn("size-4", isFavorite && "fill-current")} />
                {isFavorite ? "In favorites" : "Add to favorites"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-xl text-foreground">Base Stats</h2>
          <div className="mt-4 space-y-3">
            {p.stats.map((s) => (
              <div key={s.name}>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {STAT_LABELS[s.name] ?? s.name}
                  </span>
                  <span className="font-semibold text-foreground">{s.value}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${Math.min(100, (s.value / 180) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="flex justify-between border-t border-border pt-3 text-sm">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-display text-lg text-primary">{p.total}</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-xl text-foreground">Pokédex Data</h2>
          <div className="mt-2">
            <Row label="Height" value={`${p.height.toFixed(1)} m`} />
            <Row label="Weight" value={`${p.weight.toFixed(1)} kg`} />
            <Row
              label="Abilities"
              value={p.abilities
                .filter((a) => !a.hidden)
                .map((a) => a.name)
                .join(", ")}
            />
            <Row
              label="Hidden ability"
              value={
                p.abilities.find((a) => a.hidden)?.name ?? "None"
              }
            />
            <Row label="Gender ratio" value={genderText(p.genderRate)} />
            <Row label="Egg groups" value={p.eggGroups.join(", ")} />
            <Row label="Catch rate" value={String(p.captureRate)} />
            <Row
              label="Base experience"
              value={p.baseExperience ? String(p.baseExperience) : "—"}
            />
            <Row label="Growth rate" value={p.growthRate} />
            <Row
              label="Category"
              value={
                p.isMythical ? "Mythical" : p.isLegendary ? "Legendary" : "Standard"
              }
            />
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 lg:col-span-2">
          <h2 className="font-display text-xl text-foreground">Evolution Chain</h2>
          {!evolution ? (
            <p className="mt-4 text-sm text-muted-foreground">Loading evolutions…</p>
          ) : evolution.length === 1 && (evolution[0]?.length ?? 0) === 1 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              {p.displayName} does not evolve.
            </p>
          ) : (
            <div className="mt-5 flex flex-wrap items-center gap-4">
              {evolution.map((stage, i) => (
                <div key={i} className="flex flex-wrap items-center gap-4">
                  {i > 0 && (
                    <ChevronRight className="size-6 shrink-0 text-muted-foreground" />
                  )}
                  <div className="flex flex-wrap gap-3">
                    {stage.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() =>
                          navigate({
                            to: "/pokemon/$id",
                            params: { id: String(s.id) },
                          })
                        }
                        className={cn(
                          "flex w-28 flex-col items-center rounded-2xl border border-border p-3 transition-all hover:-translate-y-1 hover:border-primary/60",
                          s.id === p.id && "border-primary bg-secondary",
                        )}
                      >
                        <img
                          src={s.sprite}
                          alt={s.displayName}
                          className="size-20 object-contain"
                        />
                        <span className="mt-1 text-sm font-semibold text-foreground">
                          {s.displayName}
                        </span>
                        {s.condition && (
                          <span className="text-[11px] text-muted-foreground">
                            {s.condition}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-xl text-foreground">Type Matchups</h2>
          {!matchups ? (
            <p className="mt-4 text-sm text-muted-foreground">Calculating…</p>
          ) : (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Weaknesses
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {matchups.weaknesses.length ? (
                    matchups.weaknesses.map((w) => (
                      <span key={w.type} className="flex items-center gap-1">
                        <TypeBadge type={w.type} size="sm" />
                        <span className="text-xs text-muted-foreground">
                          ×{w.x}
                        </span>
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">None</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Resistances
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {matchups.resistances.length ? (
                    matchups.resistances.map((w) => (
                      <span key={w.type} className="flex items-center gap-1">
                        <TypeBadge type={w.type} size="sm" />
                        <span className="text-xs text-muted-foreground">
                          ×{w.x}
                        </span>
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">None</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Immunities
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {matchups.immunities.length ? (
                    matchups.immunities.map((t) => (
                      <TypeBadge key={t} type={t} size="sm" />
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">None</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-xl text-foreground">Moves</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {p.moves.map((m) => (
              <span
                key={m}
                className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
