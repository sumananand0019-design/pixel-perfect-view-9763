import { Link } from "@tanstack/react-router";
import { Heart, Sparkles } from "lucide-react";

import { TypeBadge } from "@/components/TypeBadge";
import { cn } from "@/lib/utils";
import { LEGENDARY_IDS, MYTHICAL_IDS, type Pokemon } from "@/lib/pokeapi";

export function PokemonCard({
  pokemon,
  favorite,
  onToggleFavorite,
}: {
  pokemon: Pokemon;
  favorite: boolean;
  onToggleFavorite: (id: number) => void;
}) {
  const special =
    LEGENDARY_IDS.includes(pokemon.id) || MYTHICAL_IDS.includes(pokemon.id);

  return (
    <div className="group relative">
      <Link
        to="/pokemon/$id"
        params={{ id: String(pokemon.id) }}
        className={cn(
          "block overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-300",
          "hover:-translate-y-1.5 hover:border-primary/60 hover:shadow-[var(--shadow-card)]",
          special && "border-accent/50 bg-[var(--gradient-special)]",
        )}
      >
        <div className="flex items-center justify-between text-xs font-semibold tracking-widest text-muted-foreground">
          <span>#{String(pokemon.kalosNumber).padStart(3, "0")}</span>
          {special && <Sparkles className="size-4 text-accent" />}
        </div>

        <div
          className="mt-2 flex aspect-square items-center justify-center rounded-xl"
          style={{
            background: `radial-gradient(circle at 50% 60%, color-mix(in oklab, var(--type-${pokemon.types[0]}) 30%, transparent), transparent 70%)`,
          }}
        >
          <img
            src={pokemon.sprite}
            alt={pokemon.displayName}
            loading="lazy"
            className="size-32 object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        <h3 className="mt-3 font-display text-lg tracking-wide text-foreground">
          {pokemon.displayName}
        </h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {pokemon.types.map((t) => (
            <TypeBadge key={t} type={t} size="sm" />
          ))}
        </div>
      </Link>

      <button
        type="button"
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        onClick={() => onToggleFavorite(pokemon.id)}
        className="absolute right-3 top-3 rounded-full bg-background/70 p-1.5 text-muted-foreground backdrop-blur transition-colors hover:text-primary"
      >
        <Heart className={cn("size-4", favorite && "fill-primary text-primary")} />
      </button>
    </div>
  );
}
