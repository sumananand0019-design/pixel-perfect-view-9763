import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, SearchX, Loader2 } from "lucide-react";

import { PokemonCard } from "@/components/PokemonCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  kalosListQuery,
  LEGENDARY_IDS,
  MYTHICAL_IDS,
  TYPES,
} from "@/lib/pokeapi";
import { usePersistentState, useFavorites } from "@/lib/preferences";

type SortKey = "number" | "name" | "height" | "weight" | "stats";
type Category = "all" | "legendary" | "mythical";

export function PokedexBrowser({
  favoritesOnly = false,
}: {
  favoritesOnly?: boolean;
}) {
  const { data, isLoading, isError, refetch } = useQuery(kalosListQuery);
  const { favorites, toggle } = useFavorites();

  const [search, setSearch] = usePersistentState("kalos-search", "");
  const [type, setType] = usePersistentState<string>("kalos-type", "all");
  const [category, setCategory] = usePersistentState<Category>(
    "kalos-category",
    "all",
  );
  const [sort, setSort] = usePersistentState<SortKey>("kalos-sort", "number");

  const visible = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    let list = data.filter((p) => {
      if (favoritesOnly && !favorites.includes(p.id)) return false;
      if (type !== "all" && !p.types.includes(type as never)) return false;
      if (category === "legendary" && !LEGENDARY_IDS.includes(p.id)) return false;
      if (category === "mythical" && !MYTHICAL_IDS.includes(p.id)) return false;
      if (!q) return true;
      return (
        p.name.includes(q) ||
        String(p.kalosNumber).padStart(3, "0").includes(q) ||
        String(p.kalosNumber) === q
      );
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name);
        case "height":
          return b.height - a.height;
        case "weight":
          return b.weight - a.weight;
        case "stats":
          return b.total - a.total;
        default:
          return a.kalosNumber - b.kalosNumber;
      }
    });
    return list;
  }, [data, search, type, category, sort, favorites, favoritesOnly]);

  return (
    <section id="pokedex" className="mx-auto max-w-7xl px-4 py-10">
      <div className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or Pokédex number…"
              className="h-12 w-full rounded-full border border-input bg-background pl-11 pr-4 text-sm outline-none transition-colors focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-12 rounded-full">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value="6" onValueChange={() => {}}>
              <SelectTrigger className="h-12 rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">Generation VI</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={category}
              onValueChange={(v) => setCategory(v as Category)}
            >
              <SelectTrigger className="h-12 rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pokémon</SelectItem>
                <SelectItem value="legendary">Legendary</SelectItem>
                <SelectItem value="mythical">Mythical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="h-12 rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="number">Pokédex number</SelectItem>
                <SelectItem value="name">Name (A–Z)</SelectItem>
                <SelectItem value="height">Height</SelectItem>
                <SelectItem value="weight">Weight</SelectItem>
                <SelectItem value="stats">Base stats</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center gap-3 py-24 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm">Loading the Kalos Pokédex…</p>
        </div>
      )}

      {isError && (
        <div className="py-24 text-center">
          <p className="text-sm text-muted-foreground">
            The Pokédex could not reach the data network.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
          >
            Try again
          </button>
        </div>
      )}

      {data && (
        <>
          <p className="mt-6 text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{visible.length}</span>{" "}
            Pokémon
          </p>

          {visible.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-24 text-center text-muted-foreground">
              <SearchX className="size-10" />
              <p className="font-display text-lg text-foreground">
                No Pokémon found
              </p>
              <p className="text-sm">
                {favoritesOnly
                  ? "Tap the heart on any Pokémon to add it here."
                  : "Try a different name, number, or filter."}
              </p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {visible.map((p) => (
                <PokemonCard
                  key={p.id}
                  pokemon={p}
                  favorite={favorites.includes(p.id)}
                  onToggleFavorite={toggle}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
