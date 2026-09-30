import "server-only";
import { buildPlaces } from "@/lib/places";
import { getJourney } from "@/services/content";
import type { LngLat, Place, PlaceKind } from "@/types/content";

/** Places connected to an entity: explicit relationships first, then geographic neighbours. */
export async function relatedPlaces(self: { kind: PlaceKind; slug: string; coordinates: LngLat }, explicit: { kind: PlaceKind; slug: string }[] = [], limit = 8): Promise<Place[]> {
  const j = await getJourney();
  const places = buildPlaces(j).filter((p) => p.layer !== "history" && p.kind !== "story" && !(p.kind === self.kind && p.slug === self.slug));
  const out: Place[] = [];
  for (const e of explicit) {
    const p = places.find((x) => x.kind === e.kind && x.slug === e.slug);
    if (p && !out.includes(p)) out.push(p);
  }
  const near = places
    .filter((p) => !out.includes(p))
    .map((p) => ({ p, d: Math.hypot(p.coordinates[0] - self.coordinates[0], p.coordinates[1] - self.coordinates[1]) }))
    .sort((a, b) => a.d - b.d)
    .map((x) => x.p);
  return [...out, ...near].slice(0, limit);
}
