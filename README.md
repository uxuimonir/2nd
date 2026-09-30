# Digital Bangladesh

**A living journey through land, water, history & people.**

An immersive, full-stack web experience in which Bangladesh itself is the protagonist: the map
returns again and again, rivers become the navigation language, and every photograph, story and
date is tied to a place.

## The journey

Sixteen chapters on one continuous page (`/`), each also reachable on its own route:

| # | Chapter | Signature interaction |
|---|---|---|
| 01 | Enter Bangladesh | Darkness → a point of light → outline, rivers, cities, photography inside the silhouette |
| 02 | The Land | **Signature 01** — 2D map → rivers → elevation → WebGL terrain → settlement (real elevation data), SVG/CSS-3D fallback |
| 03 | The Rivers | **Signature 02** — *Follow the river*: the camera travels along the real course, stop by stop |
| 04 | The Delta | A river line drawn by the scroll collapses into the next map |
| 05 | The Regions | Eight divisions: hover to read, select to travel in |
| 06 | The Cities | Cities emerging from coordinates; horizontal travel (swipe on mobile) |
| 07 | The People | Stacked portraits of work and life |
| 08 | The History | **Signature 04** — drag through time; colour, typeface, photo, map and story change together |
| 09–12 | Heritage · Culture · Food · Nature | Cursor-following architecture index, playable ektara, a map you can taste, depth landscapes |
| 13 | The Sundarbans | WebGL water & mist, procedural mangroves, five-part reveal |
| 14–15 | Modern · Future | Padma Bridge drawn span by span; land-below-N-metres view from real elevation |
| 16 | Final Journey | **Signature 05** — everything becomes Bangladesh (visited places glow) |

**Signature 03** (map location → full-screen photography) is the global `PlaceReveal`
overlay, used from every map, list and search result.

Also: interactive map with 8 layers (`/map`), global search with visual previews (⌘K or `/`),
generative ambient sound (muted by default), contextual custom cursor (desktop only),
geographic loading sequence, 404/500 screens, share flow, lightbox galleries.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 · GSAP + ScrollTrigger ·
Lenis · Three.js / React Three Fiber · PostgreSQL · Prisma 7 · Zod

```
app/         routes, API routes, metadata (sitemap, robots, OG images)
components/  design system: map, media, type, chrome, cursor, place
features/    journey chapters, terrain, rivers, history, map explorer, sound, experience runtime
content/     typed editorial content + generated geography
services/    content repository (PostgreSQL via Prisma, falls back to /content)
server/      API helpers, relationship queries
db/          Prisma client
lib/         projection, media URLs, motion system, search
prisma/      schema, migrations, seed
scripts/     geographic build pipeline
```

## Getting started

```bash
npm install
npm run dev            # works without a database — content is served from /content
```

With PostgreSQL:

```bash
cp .env.example .env   # set DATABASE_URL
npm run db:migrate     # or: npx prisma migrate deploy
npm run db:seed
npm run dev
```

`npm run geo:build` regenerates the projected geography and heightmap (see `data/geo/README.md`).

## API

All endpoints are `GET`, validate their query with Zod and return
`{ data, meta: { count, source } }` or `{ error: { status, message, details? } }`.

`/api/regions` · `/api/cities?region=&slug=` · `/api/rivers?slug=` · `/api/destinations?category=` ·
`/api/heritage?region=&slug=` · `/api/nature?region=&ecosystem=` · `/api/culture?category=` ·
`/api/food?region=&category=` · `/api/timeline?from=&to=&type=` · `/api/search?q=&kind=&limit=` ·
`/api/stories?chapter=&type=`

## Content & sources

- Geography: Natural Earth (public domain), geoBoundaries (CC BY 4.0), AWS Terrain Tiles.
- Photography: ~90 real photographs from Wikimedia Commons, loaded from Commons' thumbnail CDN
  with a fallback chain; authors and licences are linked from `/about`.
- Facts carry source labels in `content/facts.ts`; figures marked *editorial* should be verified
  before publication. People chapters are editorial portraits, not named individuals.

## Accessibility & performance

Semantic landmarks, skip link, keyboard control for maps, timeline (slider), rivers and galleries,
focus management in dialogs, `prefers-reduced-motion` respected everywhere (no smooth scroll,
static final states, no autoplay). WebGL is lazy-loaded near the viewport, paused off-screen,
lighter on mobile, and disposed on unmount; 3D has a 2D fallback.
