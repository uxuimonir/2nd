/**
 * Content model for Digital Bangladesh.
 * Every entity is addressable by slug, carries coordinates where it has a place on the map,
 * and references other entities by slug so the journey can connect MAP ↔ HISTORY ↔ PHOTOGRAPHY.
 */

/** [longitude, latitude] (WGS84) */
export type LngLat = [number, number];

export type DivisionSlug =
  | "dhaka"
  | "chattogram"
  | "khulna"
  | "rajshahi"
  | "rangpur"
  | "sylhet"
  | "barishal"
  | "mymensingh";

export type MapLayerId = "base" | "rivers" | "cities" | "heritage" | "nature" | "culture" | "history" | "future";

export type PlaceKind = "city" | "heritage" | "nature" | "destination" | "food" | "culture" | "story";

export interface Fact {
  label: string;
  value: string;
  /** Where the figure comes from. Figures without a source are marked editorial. */
  source?: string;
}

export interface MediaAsset {
  id: string;
  /** Exact Wikimedia Commons file name (without the "File:" prefix). */
  file: string;
  alt: string;
  caption?: string;
  kind: "photo" | "archival" | "satellite" | "document";
  /** CSS object-position focal point, e.g. "50% 40%". */
  focal?: string;
  /** Original width, when known; limits the largest requested thumbnail. */
  maxWidth?: number;
}

interface Base {
  slug: string;
  name: string;
  nameBn: string;
  summary: string;
  /** Long-form paragraphs. */
  description: string[];
  media: string[];
  /** Demo/editorial content that should be verified before publication. */
  editorial?: boolean;
}

export interface Region extends Base {
  slug: DivisionSlug;
  capital: string;
  character: string[];
  established?: string;
}

export interface City extends Base {
  region: DivisionSlug;
  coordinates: LngLat;
  tagline: string;
  rivers: string[];
  landmarks: string[];
  facts: Fact[];
  heritage: string[];
  nature: string[];
  food: string[];
  ambient: AmbientId;
}

export interface RiverStop {
  label: string;
  coordinates: LngLat;
  note: string;
  media?: string;
  /** optional link to another entity */
  ref?: { kind: PlaceKind; slug: string };
}

export interface River extends Base {
  /** id of the projected geometry in content/geo */
  geoId: string;
  color: string;
  course: string;
  stops: RiverStop[];
  cities: string[];
}

export interface HeritageSite extends Base {
  region: DivisionSlug;
  coordinates: LngLat;
  period: string;
  timeline?: string;
  architecture: string;
  recognition?: string;
  city?: string;
}

export interface NatureSpot extends Base {
  region: DivisionSlug;
  coordinates: LngLat;
  ecosystem: "mangrove" | "coast" | "island" | "swamp-forest" | "hills" | "tea" | "wetland" | "river";
  recognition?: string;
  ambient: AmbientId;
}

export interface Food extends Base {
  region: DivisionSlug;
  coordinates: LngLat;
  origin: string;
  season?: string;
  category: "fish" | "rice" | "street" | "sweet" | "everyday" | "festive";
}

export interface CultureItem extends Base {
  category: "language" | "music" | "craft" | "festival" | "literature" | "performance" | "art";
  coordinates?: LngLat;
  region?: DivisionSlug;
  recognition?: string;
}

export interface TimelineEvent {
  slug: string;
  year: number;
  yearLabel: string;
  era: string;
  title: string;
  place: string;
  coordinates: LngLat;
  event: string;
  context: string;
  media: string;
  ref?: { kind: PlaceKind; slug: string };
  /** atmosphere used by the time-travel timeline */
  palette: { bg: string; ink: string; accent: string };
  type: "ancient" | "sultanate" | "mughal" | "colonial" | "nation" | "contemporary";
}

export interface PersonStory {
  slug: string;
  role: string;
  roleBn: string;
  place: string;
  region: DivisionSlug;
  coordinates: LngLat;
  theme: "work" | "craft" | "community" | "ambition" | "learning";
  summary: string;
  story: string;
  media: string;
  /** People stories are editorial portraits of a way of life, not named individuals. */
  editorial: true;
}

export interface Destination extends Base {
  region: DivisionSlug;
  coordinates: LngLat;
  layer: MapLayerId;
  category: "infrastructure" | "memorial" | "landmark" | "urban";
  opened?: string;
}

export interface Story {
  slug: string;
  chapter: string;
  title: string;
  body: string[];
  media: string[];
  refs: { kind: PlaceKind; slug: string }[];
}

export interface Gallery {
  slug: string;
  title: string;
  media: string[];
}

export type AmbientId = "river" | "rain" | "forest" | "city" | "market" | "sea";

/** Flattened, map-ready representation of any entity with coordinates. */
export interface Place {
  id: string;
  kind: PlaceKind;
  slug: string;
  name: string;
  nameBn: string;
  coordinates: LngLat;
  region?: DivisionSlug;
  regionName?: string;
  summary: string;
  media?: string;
  href: string;
  layer: MapLayerId;
}

export interface SearchResult extends Place {
  score: number;
}
