import "server-only";
import { cache } from "react";
import * as local from "@/content";
import { getPrisma } from "@/db/client";
import type {
  City,
  CultureItem,
  Destination,
  DivisionSlug,
  Fact,
  Food,
  HeritageSite,
  NatureSpot,
  PersonStory,
  Region,
  River,
  TimelineEvent,
  AmbientId,
  PlaceKind,
  Story,
} from "@/types/content";

/**
 * Content repository.
 * Reads from PostgreSQL (Prisma) when DATABASE_URL is configured and reachable,
 * otherwise serves the typed editorial content in /content. Callers never need to know which.
 */

type Source = "database" | "content";
let lastSource: Source = "content";
export const contentSource = () => lastSource;

async function fromDb<T>(query: (db: NonNullable<ReturnType<typeof getPrisma>>) => Promise<T>, fallback: () => T): Promise<T> {
  const db = getPrisma();
  if (!db) {
    lastSource = "content";
    return fallback();
  }
  try {
    const result = await query(db);
    lastSource = "database";
    return result;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.warn("[content] database unavailable, using /content:", (err as Error).message);
    lastSource = "content";
    return fallback();
  }
}

const ll = (r: { lon: number; lat: number }): [number, number] => [r.lon, r.lat];
const ref = (kind?: string | null, slug?: string | null) => (kind && slug ? { kind: kind as PlaceKind, slug } : undefined);

export const getRegions = cache(() =>
  fromDb<Region[]>(
    async (db) =>
      (await db.region.findMany({ orderBy: { name: "asc" } })).map((r) => ({
        slug: r.slug as DivisionSlug,
        name: r.name,
        nameBn: r.nameBn,
        capital: r.capitalSlug,
        summary: r.summary,
        description: r.description,
        character: r.character,
        established: r.established ?? undefined,
        media: r.mediaIds,
      })),
    () => local.regions,
  ),
);

export const getCities = cache(() =>
  fromDb<City[]>(
    async (db) =>
      (
        await db.city.findMany({
          include: { rivers: { select: { slug: true } }, heritage: { select: { slug: true } }, nature: { select: { slug: true } }, food: { select: { slug: true } } },
        })
      )
        .map((c) => ({
          slug: c.slug,
          name: c.name,
          nameBn: c.nameBn,
          region: c.regionSlug as DivisionSlug,
          coordinates: ll(c),
          tagline: c.tagline,
          summary: c.summary,
          description: c.description,
          rivers: c.rivers.map((r) => r.slug),
          landmarks: c.landmarks,
          facts: c.facts as unknown as Fact[],
          heritage: c.heritage.map((h) => h.slug),
          nature: c.nature.map((n) => n.slug),
          food: c.food.map((f) => f.slug),
          media: c.mediaIds,
          ambient: c.ambient as AmbientId,
        }))
        .sort((a, b) => local.cities.findIndex((c) => c.slug === a.slug) - local.cities.findIndex((c) => c.slug === b.slug)),
    () => local.cities,
  ),
);

export const getCity = cache(async (slug: string) => (await getCities()).find((c) => c.slug === slug));

export const getRivers = cache(() =>
  fromDb<River[]>(
    async (db) =>
      (await db.river.findMany({ include: { stops: { orderBy: { position: "asc" } }, cities: { select: { slug: true } } } }))
        .map((r) => ({
          slug: r.slug,
          geoId: r.geoId,
          name: r.name,
          nameBn: r.nameBn,
          color: r.color,
          course: r.course,
          summary: r.summary,
          description: r.description,
          media: r.mediaIds,
          cities: r.cities.map((c) => c.slug),
          stops: r.stops.map((s) => ({ label: s.label, note: s.note, coordinates: ll(s), media: s.mediaId ?? undefined, ref: ref(s.refKind, s.refSlug) })),
        }))
        .sort((a, b) => local.rivers.findIndex((r) => r.slug === a.slug) - local.rivers.findIndex((r) => r.slug === b.slug)),
    () => local.rivers,
  ),
);

export const getRiver = cache(async (slug: string) => (await getRivers()).find((r) => r.slug === slug));

export const getHeritage = cache(() =>
  fromDb<HeritageSite[]>(
    async (db) =>
      (await db.heritageSite.findMany({ include: { timeline: { select: { slug: true } }, cities: { select: { slug: true } } } }))
        .map((h) => ({
          slug: h.slug,
          name: h.name,
          nameBn: h.nameBn,
          region: h.regionSlug as DivisionSlug,
          coordinates: ll(h),
          period: h.period,
          architecture: h.architecture,
          recognition: h.recognition ?? undefined,
          summary: h.summary,
          description: h.description,
          media: h.mediaIds,
          timeline: h.timeline[0]?.slug,
          city: h.cities[0]?.slug,
        }))
        .sort((a, b) => local.heritage.findIndex((x) => x.slug === a.slug) - local.heritage.findIndex((x) => x.slug === b.slug)),
    () => local.heritage,
  ),
);

export const getHeritageSite = cache(async (slug: string) => (await getHeritage()).find((h) => h.slug === slug));

export const getNature = cache(() =>
  fromDb<NatureSpot[]>(
    async (db) =>
      (await db.natureSpot.findMany())
        .map((n) => ({
          slug: n.slug,
          name: n.name,
          nameBn: n.nameBn,
          region: n.regionSlug as DivisionSlug,
          coordinates: ll(n),
          ecosystem: n.ecosystem as NatureSpot["ecosystem"],
          recognition: n.recognition ?? undefined,
          summary: n.summary,
          description: n.description,
          media: n.mediaIds,
          ambient: n.ambient as AmbientId,
        }))
        .sort((a, b) => local.nature.findIndex((x) => x.slug === a.slug) - local.nature.findIndex((x) => x.slug === b.slug)),
    () => local.nature,
  ),
);

export const getNatureSpot = cache(async (slug: string) => (await getNature()).find((n) => n.slug === slug));

export const getFood = cache(() =>
  fromDb<Food[]>(
    async (db) =>
      (await db.food.findMany())
        .map((f) => ({
          slug: f.slug,
          name: f.name,
          nameBn: f.nameBn,
          region: f.regionSlug as DivisionSlug,
          coordinates: ll(f),
          origin: f.origin,
          season: f.season ?? undefined,
          category: f.category as Food["category"],
          summary: f.summary,
          description: f.description,
          media: f.mediaIds,
        }))
        .sort((a, b) => local.food.findIndex((x) => x.slug === a.slug) - local.food.findIndex((x) => x.slug === b.slug)),
    () => local.food,
  ),
);

export const getFoodItem = cache(async (slug: string) => (await getFood()).find((f) => f.slug === slug));

export const getCulture = cache(() =>
  fromDb<CultureItem[]>(
    async (db) =>
      (await db.cultureItem.findMany())
        .map((c) => ({
          slug: c.slug,
          name: c.name,
          nameBn: c.nameBn,
          category: c.category as CultureItem["category"],
          summary: c.summary,
          description: c.description,
          recognition: c.recognition ?? undefined,
          coordinates: c.lon != null && c.lat != null ? ([c.lon, c.lat] as [number, number]) : undefined,
          region: (c.regionSlug ?? undefined) as DivisionSlug | undefined,
          media: c.mediaIds,
        }))
        .sort((a, b) => local.culture.findIndex((x) => x.slug === a.slug) - local.culture.findIndex((x) => x.slug === b.slug)),
    () => local.culture,
  ),
);

export const getTimeline = cache(() =>
  fromDb<TimelineEvent[]>(
    async (db) =>
      (await db.timelineEvent.findMany({ orderBy: { year: "asc" } })).map((t) => ({
        slug: t.slug,
        year: t.year,
        yearLabel: t.yearLabel,
        era: t.era,
        title: t.title,
        place: t.place,
        coordinates: ll(t),
        event: t.event,
        context: t.context,
        media: t.mediaId,
        ref: ref(t.refKind, t.refSlug),
        palette: t.palette as TimelineEvent["palette"],
        type: t.type as TimelineEvent["type"],
      })),
    () => [...local.timeline].sort((a, b) => a.year - b.year),
  ),
);

export const getPeople = cache(() =>
  fromDb<PersonStory[]>(
    async (db) =>
      (await db.personStory.findMany())
        .map((p) => ({
          slug: p.slug,
          role: p.role,
          roleBn: p.roleBn,
          place: p.place,
          region: p.regionSlug as DivisionSlug,
          coordinates: ll(p),
          theme: p.theme as PersonStory["theme"],
          summary: p.summary,
          story: p.story,
          media: p.mediaId,
          editorial: true as const,
        }))
        .sort((a, b) => local.people.findIndex((x) => x.slug === a.slug) - local.people.findIndex((x) => x.slug === b.slug)),
    () => local.people,
  ),
);

export const getDestinations = cache(() =>
  fromDb<Destination[]>(
    async (db) =>
      (await db.destination.findMany())
        .map((d) => ({
          slug: d.slug,
          name: d.name,
          nameBn: d.nameBn,
          region: d.regionSlug as DivisionSlug,
          coordinates: ll(d),
          layer: d.layer as Destination["layer"],
          category: d.category as Destination["category"],
          opened: d.opened ?? undefined,
          summary: d.summary,
          description: d.description,
          media: d.mediaIds,
        }))
        .sort((a, b) => local.destinations.findIndex((x) => x.slug === a.slug) - local.destinations.findIndex((x) => x.slug === b.slug)),
    () => local.destinations,
  ),
);

export const getStories = cache(() =>
  fromDb<Story[]>(
    async (db) =>
      (await db.story.findMany()).map((s) => ({
        slug: s.slug,
        chapter: s.chapter,
        title: s.title,
        body: s.body,
        media: s.mediaIds,
        refs: s.refs as Story["refs"],
      })),
    () => local.stories,
  ),
);

/** Everything the journey needs, fetched in parallel. */
export const getJourney = cache(async () => {
  const [regions, cities, rivers, heritage, nature, food, culture, timeline, people, destinations, stories] = await Promise.all([
    getRegions(),
    getCities(),
    getRivers(),
    getHeritage(),
    getNature(),
    getFood(),
    getCulture(),
    getTimeline(),
    getPeople(),
    getDestinations(),
    getStories(),
  ]);
  return { regions, cities, rivers, heritage, nature, food, culture, timeline, people, destinations, stories };
});

export type Journey = Awaited<ReturnType<typeof getJourney>>;
