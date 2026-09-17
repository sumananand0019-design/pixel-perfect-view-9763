import { queryOptions } from "@tanstack/react-query";

export const KALOS_START = 650; // Chespin
export const KALOS_END = 721; // Volcanion
export const KALOS_COUNT = KALOS_END - KALOS_START + 1; // 72

export const LEGENDARY_IDS = [716, 717, 718]; // Xerneas, Yveltal, Zygarde
export const MYTHICAL_IDS = [719, 720, 721]; // Diancie, Hoopa, Volcanion
export const STARTER_IDS = [650, 653, 656];

export const TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

export type PokemonType = (typeof TYPES)[number];

const API = "https://pokeapi.co/api/v2";

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return (await res.json()) as T;
}

export type Pokemon = {
  id: number;
  kalosNumber: number;
  name: string;
  displayName: string;
  types: PokemonType[];
  height: number; // metres
  weight: number; // kg
  baseExperience: number | null;
  sprite: string;
  abilities: { name: string; hidden: boolean }[];
  stats: { name: string; value: number }[];
  total: number;
  moves: string[];
};

export type PokemonDetail = Pokemon & {
  japaneseName: string | null;
  genus: string | null;
  flavorText: string | null;
  genderRate: number;
  eggGroups: string[];
  captureRate: number;
  growthRate: string;
  isLegendary: boolean;
  isMythical: boolean;
  evolutionChainUrl: string | null;
};

export function titleCase(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapPokemon(raw: any): Pokemon {
  const stats = raw.stats.map((s: any) => ({
    name: s.stat.name as string,
    value: s.base_stat as number,
  }));
  return {
    id: raw.id,
    kalosNumber: raw.id - KALOS_START + 1,
    name: raw.name,
    displayName: titleCase(raw.name),
    types: raw.types.map((t: any) => t.type.name as PokemonType),
    height: raw.height / 10,
    weight: raw.weight / 10,
    baseExperience: raw.base_experience ?? null,
    sprite:
      raw.sprites?.other?.["official-artwork"]?.front_default ??
      raw.sprites?.front_default ??
      "",
    abilities: raw.abilities.map((a: any) => ({
      name: titleCase(a.ability.name),
      hidden: a.is_hidden as boolean,
    })),
    stats,
    total: stats.reduce((sum: number, s: any) => sum + s.value, 0),
    moves: raw.moves.slice(0, 40).map((m: any) => titleCase(m.move.name)),
  };
}

export const kalosListQuery = queryOptions({
  queryKey: ["kalos-list"],
  staleTime: Infinity,
  queryFn: async () => {
    const ids = Array.from({ length: KALOS_COUNT }, (_, i) => KALOS_START + i);
    const results = await Promise.all(
      ids.map((id) => getJson<any>(`${API}/pokemon/${id}`).then(mapPokemon)),
    );
    return results;
  },
});

export function pokemonQuery(id: number) {
  return queryOptions({
    queryKey: ["pokemon", id],
    staleTime: Infinity,
    queryFn: async (): Promise<PokemonDetail> => {
      const [raw, species] = await Promise.all([
        getJson<any>(`${API}/pokemon/${id}`),
        getJson<any>(`${API}/pokemon-species/${id}`),
      ]);
      const base = mapPokemon(raw);
      const flavor = species.flavor_text_entries.find(
        (f: any) => f.language.name === "en",
      );
      const genus = species.genera.find((g: any) => g.language.name === "en");
      const jp = species.names.find((n: any) => n.language.name === "ja-Hrkt");
      return {
        ...base,
        japaneseName: jp?.name ?? null,
        genus: genus?.genus ?? null,
        flavorText: flavor ? flavor.flavor_text.replace(/\s+/g, " ") : null,
        genderRate: species.gender_rate,
        eggGroups: species.egg_groups.map((e: any) => titleCase(e.name)),
        captureRate: species.capture_rate,
        growthRate: titleCase(species.growth_rate.name),
        isLegendary: species.is_legendary,
        isMythical: species.is_mythical,
        evolutionChainUrl: species.evolution_chain?.url ?? null,
      };
    },
  });
}

export type EvolutionStage = {
  id: number;
  name: string;
  displayName: string;
  sprite: string;
  condition: string | null;
};

function evoCondition(details: any[]): string | null {
  if (!details?.length) return null;
  const d = details[0];
  if (d.min_level) return `Level ${d.min_level}`;
  if (d.item?.name) return `Use ${titleCase(d.item.name)}`;
  if (d.held_item?.name) return `Hold ${titleCase(d.held_item.name)}`;
  if (d.min_happiness) return "High friendship";
  if (d.min_affection) return "High affection";
  if (d.trigger?.name === "trade") return "Trade";
  return titleCase(d.trigger?.name ?? "special");
}

export function evolutionQuery(url: string | null) {
  return queryOptions({
    queryKey: ["evolution", url],
    enabled: Boolean(url),
    staleTime: Infinity,
    queryFn: async (): Promise<EvolutionStage[][]> => {
      const data = await getJson<any>(url!);
      const levels: EvolutionStage[][] = [];
      let current: any[] = [data.chain];
      while (current.length) {
        const stage = await Promise.all(
          current.map(async (node: any) => {
            const speciesId = Number(
              node.species.url.split("/").filter(Boolean).pop(),
            );
            const poke = await getJson<any>(`${API}/pokemon/${speciesId}`);
            return {
              id: speciesId,
              name: node.species.name,
              displayName: titleCase(node.species.name),
              sprite:
                poke.sprites?.other?.["official-artwork"]?.front_default ??
                poke.sprites?.front_default ??
                "",
              condition: evoCondition(node.evolution_details),
            };
          }),
        );
        levels.push(stage);
        current = current.flatMap((node: any) => node.evolves_to);
      }
      return levels;
    },
  });
}

export function matchupQuery(types: PokemonType[]) {
  return queryOptions({
    queryKey: ["matchups", types.join("-")],
    enabled: types.length > 0,
    staleTime: Infinity,
    queryFn: async () => {
      const multipliers: Record<string, number> = {};
      for (const t of TYPES) multipliers[t] = 1;
      for (const type of types) {
        const data = await getJson<any>(`${API}/type/${type}`);
        const r = data.damage_relations;
        for (const x of r.double_damage_from)
          multipliers[x.name] = (multipliers[x.name] ?? 1) * 2;
        for (const x of r.half_damage_from)
          multipliers[x.name] = (multipliers[x.name] ?? 1) * 0.5;
        for (const x of r.no_damage_from) multipliers[x.name] = 0;
      }
      const weaknesses: { type: string; x: number }[] = [];
      const resistances: { type: string; x: number }[] = [];
      const immunities: string[] = [];
      for (const t of TYPES) {
        const m = multipliers[t] ?? 1;
        if (m === 0) immunities.push(t);
        else if (m > 1) weaknesses.push({ type: t, x: m });
        else if (m < 1) resistances.push({ type: t, x: m });
      }
      return { weaknesses, resistances, immunities };
    },
  });
}

export const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Attack",
  "special-defense": "Sp. Defense",
  speed: "Speed",
};

export function genderText(rate: number) {
  if (rate === -1) return "Genderless";
  const female = (rate / 8) * 100;
  return `${(100 - female).toFixed(1)}% male / ${female.toFixed(1)}% female`;
}
