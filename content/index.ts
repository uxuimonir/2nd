import type { DivisionSlug, Place, PlaceKind } from "@/types/content";
import { buildPlaces } from "@/lib/places";
import { cities } from "./cities";
import { culture } from "./culture";
import { destinations } from "./destinations";
import { food } from "./food";
import { heritage } from "./heritage";
import { nature } from "./nature";
import { people } from "./people";
import { regions } from "./regions";
import { rivers } from "./rivers";
import { timeline } from "./timeline";

export { cities, culture, destinations, food, heritage, nature, people, regions, rivers, timeline };
export { media, mediaList } from "./media";
export { chapters } from "./chapters";
export { stories, galleries } from "./stories";
export * from "./facts";

export const regionName = (slug?: DivisionSlug) => regions.find((r) => r.slug === slug)?.name;
export { hrefFor } from "@/lib/places";
export type { PlaceKind };

/** Every entity with a location, flattened for the map, search and the final zoom-out. */
export function allPlaces(): Place[] {
  return buildPlaces({ cities, heritage, nature, culture, food, destinations, people, timeline });
}
