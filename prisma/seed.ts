/**
 * Seeds PostgreSQL from the typed editorial content in /content.
 * Idempotent: every record is upserted by slug. Run with `npm run db:seed`.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { cities } from "../content/cities";
import { culture } from "../content/culture";
import { destinations } from "../content/destinations";
import { food } from "../content/food";
import { heritage } from "../content/heritage";
import { mediaList } from "../content/media";
import { nature } from "../content/nature";
import { people } from "../content/people";
import { regions } from "../content/regions";
import { rivers } from "../content/rivers";
import { galleries, stories } from "../content/stories";
import { timeline } from "../content/timeline";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

async function main() {
  for (const m of mediaList) {
    const data = { file: m.file, alt: m.alt, caption: m.caption ?? null, kind: m.kind, focal: m.focal ?? null, maxWidth: m.maxWidth ?? null };
    await prisma.media.upsert({ where: { id: m.id }, create: { id: m.id, ...data }, update: data });
  }

  for (const r of regions) {
    const data = { name: r.name, nameBn: r.nameBn, summary: r.summary, description: r.description, character: r.character, established: r.established ?? null, mediaIds: r.media, capitalSlug: r.capital };
    await prisma.region.upsert({ where: { slug: r.slug }, create: { slug: r.slug, ...data }, update: data });
  }

  for (const r of rivers) {
    const data = { geoId: r.geoId, name: r.name, nameBn: r.nameBn, color: r.color, course: r.course, summary: r.summary, description: r.description, mediaIds: r.media };
    await prisma.river.upsert({ where: { slug: r.slug }, create: { slug: r.slug, ...data }, update: data });
    await prisma.riverStop.deleteMany({ where: { riverSlug: r.slug } });
    await prisma.riverStop.createMany({
      data: r.stops.map((s, position) => ({
        riverSlug: r.slug, position, label: s.label, note: s.note, lon: s.coordinates[0], lat: s.coordinates[1],
        mediaId: s.media ?? null, refKind: s.ref?.kind ?? null, refSlug: s.ref?.slug ?? null,
      })),
    });
  }

  for (const h of heritage) {
    const data = { name: h.name, nameBn: h.nameBn, summary: h.summary, description: h.description, period: h.period, architecture: h.architecture, recognition: h.recognition ?? null, lon: h.coordinates[0], lat: h.coordinates[1], mediaIds: h.media, regionSlug: h.region };
    await prisma.heritageSite.upsert({ where: { slug: h.slug }, create: { slug: h.slug, ...data }, update: data });
  }
  for (const n of nature) {
    const data = { name: n.name, nameBn: n.nameBn, summary: n.summary, description: n.description, ecosystem: n.ecosystem, recognition: n.recognition ?? null, ambient: n.ambient, lon: n.coordinates[0], lat: n.coordinates[1], mediaIds: n.media, regionSlug: n.region };
    await prisma.natureSpot.upsert({ where: { slug: n.slug }, create: { slug: n.slug, ...data }, update: data });
  }
  for (const f of food) {
    const data = { name: f.name, nameBn: f.nameBn, summary: f.summary, description: f.description, origin: f.origin, season: f.season ?? null, category: f.category, lon: f.coordinates[0], lat: f.coordinates[1], mediaIds: f.media, regionSlug: f.region };
    await prisma.food.upsert({ where: { slug: f.slug }, create: { slug: f.slug, ...data }, update: data });
  }

  for (const c of cities) {
    const links = {
      rivers: { set: c.rivers.map((slug) => ({ slug })) },
      heritage: { set: c.heritage.map((slug) => ({ slug })) },
      nature: { set: c.nature.map((slug) => ({ slug })) },
      food: { set: c.food.map((slug) => ({ slug })) },
    };
    const data = { name: c.name, nameBn: c.nameBn, tagline: c.tagline, summary: c.summary, description: c.description, landmarks: c.landmarks, facts: c.facts as object[], lon: c.coordinates[0], lat: c.coordinates[1], ambient: c.ambient, mediaIds: c.media, regionSlug: c.region };
    await prisma.city.upsert({
      where: { slug: c.slug },
      create: { slug: c.slug, ...data, rivers: { connect: c.rivers.map((slug) => ({ slug })) }, heritage: { connect: c.heritage.map((slug) => ({ slug })) }, nature: { connect: c.nature.map((slug) => ({ slug })) }, food: { connect: c.food.map((slug) => ({ slug })) } },
      update: { ...data, ...links },
    });
  }

  for (const c of culture) {
    const data = { name: c.name, nameBn: c.nameBn, category: c.category, summary: c.summary, description: c.description, recognition: c.recognition ?? null, lon: c.coordinates?.[0] ?? null, lat: c.coordinates?.[1] ?? null, mediaIds: c.media, regionSlug: c.region ?? null };
    await prisma.cultureItem.upsert({ where: { slug: c.slug }, create: { slug: c.slug, ...data }, update: data });
  }
  for (const t of timeline) {
    const data = {
      year: t.year, yearLabel: t.yearLabel, era: t.era, title: t.title, place: t.place, event: t.event, context: t.context,
      lon: t.coordinates[0], lat: t.coordinates[1], mediaId: t.media, type: t.type, palette: t.palette,
      refKind: t.ref?.kind ?? null, refSlug: t.ref?.slug ?? null, heritageSlug: t.ref?.kind === "heritage" ? t.ref.slug : null,
    };
    await prisma.timelineEvent.upsert({ where: { slug: t.slug }, create: { slug: t.slug, ...data }, update: data });
  }
  for (const p of people) {
    const data = { role: p.role, roleBn: p.roleBn, place: p.place, theme: p.theme, summary: p.summary, story: p.story, lon: p.coordinates[0], lat: p.coordinates[1], mediaId: p.media, editorial: true, regionSlug: p.region };
    await prisma.personStory.upsert({ where: { slug: p.slug }, create: { slug: p.slug, ...data }, update: data });
  }
  for (const d of destinations) {
    const data = { name: d.name, nameBn: d.nameBn, summary: d.summary, description: d.description, layer: d.layer, category: d.category, opened: d.opened ?? null, lon: d.coordinates[0], lat: d.coordinates[1], mediaIds: d.media, regionSlug: d.region };
    await prisma.destination.upsert({ where: { slug: d.slug }, create: { slug: d.slug, ...data }, update: data });
  }
  for (const s of stories) {
    const data = { chapter: s.chapter, title: s.title, body: s.body, mediaIds: s.media, refs: s.refs };
    await prisma.story.upsert({ where: { slug: s.slug }, create: { slug: s.slug, ...data }, update: data });
  }
  for (const g of galleries) {
    const data = { title: g.title, mediaIds: g.media };
    await prisma.gallery.upsert({ where: { slug: g.slug }, create: { slug: g.slug, ...data }, update: data });
  }

  const counts = await Promise.all([prisma.city.count(), prisma.river.count(), prisma.heritageSite.count(), prisma.timelineEvent.count(), prisma.media.count()]);
  console.log(`Seeded: ${counts[0]} cities, ${counts[1]} rivers, ${counts[2]} heritage sites, ${counts[3]} timeline events, ${counts[4]} media.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
