import { regions } from "@/content/regions";
import type {
  City,
  CultureItem,
  Destination,
  DivisionSlug,
  Food,
  HeritageSite,
  MapLayerId,
  NatureSpot,
  PersonStory,
  Place,
  PlaceKind,
  River,
  SearchResult,
  TimelineEvent,
} from "@/types/content";

export const hrefFor = (kind: PlaceKind, slug: string): string => {
  switch (kind) {
    case "city":
      return `/city/${slug}`;
    case "heritage":
      return `/heritage/${slug}`;
    case "nature":
      return slug === "sundarbans" ? "/sundarbans" : `/nature/${slug}`;
    case "food":
      return `/food/${slug}`;
    case "culture":
      return `/culture#${slug}`;
    case "destination":
      return `/modern-bangladesh#${slug}`;
    case "story":
      return `/explore#${slug}`;
  }
};

export const KIND_LABEL: Record<PlaceKind, string> = {
  city: "City",
  heritage: "Heritage",
  nature: "Nature",
  destination: "Landmark",
  food: "Food",
  culture: "Culture",
  story: "People",
};

const regionName = (slug?: DivisionSlug) => regions.find((r) => r.slug === slug)?.name;

export interface PlaceSources {
  cities: City[];
  heritage: HeritageSite[];
  nature: NatureSpot[];
  culture: CultureItem[];
  food: Food[];
  destinations: Destination[];
  people: PersonStory[];
  timeline: TimelineEvent[];
}

export function buildPlaces(src: PlaceSources): Place[] {
  const out: Place[] = [];
  const push = (
    kind: PlaceKind,
    layer: MapLayerId,
    e: { slug: string; name: string; nameBn: string; summary: string; media: string[] | string; region?: DivisionSlug; coordinates?: [number, number] },
  ) => {
    if (!e.coordinates) return;
    out.push({
      id: `${kind}:${e.slug}`,
      kind,
      slug: e.slug,
      name: e.name,
      nameBn: e.nameBn,
      coordinates: e.coordinates,
      region: e.region,
      regionName: regionName(e.region),
      summary: e.summary,
      media: Array.isArray(e.media) ? e.media[0] : e.media,
      href: hrefFor(kind, e.slug),
      layer,
    });
  };
  src.cities.forEach((c) => push("city", "cities", c));
  src.heritage.forEach((h) => push("heritage", "heritage", h));
  src.nature.forEach((n) => push("nature", "nature", n));
  src.culture.forEach((c) => push("culture", "culture", c));
  src.food.forEach((f) => push("food", "culture", f));
  src.destinations.forEach((d) => push("destination", d.layer, d));
  src.people.forEach((p) =>
    push("story", "culture", { slug: p.slug, name: p.role, nameBn: p.roleBn, summary: p.summary, media: p.media, region: p.region, coordinates: p.coordinates }),
  );
  src.timeline.forEach((t) =>
    out.push({
      id: `history:${t.slug}`,
      kind: t.ref?.kind ?? "heritage",
      slug: t.ref?.slug ?? t.slug,
      name: `${t.yearLabel} — ${t.title}`,
      nameBn: "",
      coordinates: t.coordinates,
      summary: t.event,
      media: t.media,
      href: t.ref ? hrefFor(t.ref.kind, t.ref.slug) : `/history#${t.slug}`,
      layer: "history",
    }),
  );
  return out;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’'`]/g, "")
    .trim();

/**
 * Lightweight relevance search over places (and rivers, as places on the map).
 * Scores exact/prefix name matches above summary matches; supports Bangla names.
 */
export function searchPlaces(places: Place[], rivers: River[], query: string, opts: { kinds?: PlaceKind[]; limit?: number } = {}): SearchResult[] {
  const q = norm(query);
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  const riverPlaces: Place[] = rivers.map((r) => ({
    id: `river:${r.slug}`,
    kind: "nature",
    slug: r.slug,
    name: `${r.name} River`,
    nameBn: r.nameBn,
    coordinates: r.stops[Math.floor(r.stops.length / 2)]?.coordinates ?? [90.4, 23.8],
    summary: r.summary,
    media: r.media[0],
    href: `/rivers?river=${r.slug}`,
    layer: "rivers",
  }));
  const seen = new Set<string>();
  const results: SearchResult[] = [];
  for (const p of [...places.filter((p) => p.layer !== "history"), ...riverPlaces, ...places.filter((p) => p.layer === "history")]) {
    if (opts.kinds && !opts.kinds.includes(p.kind)) continue;
    const name = norm(p.name);
    const hay = `${name} ${p.nameBn} ${norm(p.summary)} ${norm(p.regionName ?? "")} ${p.layer} ${p.kind}`;
    let score = 0;
    for (const t of terms) {
      if (name === t) score += 12;
      else if (name.startsWith(t)) score += 8;
      else if (name.split(/[\s—-]+/).some((w) => w.startsWith(t))) score += 6;
      else if (p.nameBn && p.nameBn.includes(query.trim())) score += 8;
      else if (hay.includes(t)) score += 2;
      else {
        score = 0;
        break;
      }
    }
    if (p.layer === "history") score -= 1;
    if (score > 0 && !seen.has(p.href + p.name)) {
      seen.add(p.href + p.name);
      results.push({ ...p, score });
    }
  }
  return results.sort((a, b) => b.score - a.score).slice(0, opts.limit ?? 24);
}
