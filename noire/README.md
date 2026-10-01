# NOIRÉ 2 — Creative Portfolio System

An editorial, motion-led portfolio template for designers, artists, studios, photographers and
cultural practices. Built from the *NOIRÉ 2 Research-Based Master Build Prompt*: expressive at the
surface, disciplined underneath — a small token system, a finite set of layout primitives,
reusable components, CMS-first content and documented responsive overrides.

The demo brand (**Noiré**, a fictional studio in Lisbon) and every person, client, project, award
and figure in it are fictional. All imagery is original, procedurally rendered artwork made for this
template (see [Imagery](#imagery)), so it can be redistributed with the template.

## Run it

```bash
cd noire
npm install
npm run dev          # http://localhost:3000
```

Production:

```bash
npm run build && npm start
```

Optional environment (`.env.example`):

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata, sitemap and OG images |
| `CONTACT_WEBHOOK_URL` | Where contact enquiries are POSTed (form service, Zapier, CRM…). Unset → validated and logged on the server |

## Pages (12 + 404)

| # | Route | Structure |
|---|---|---|
| 01 | `/` | Micro header → hero statement → hero transition → featured work → work index → manifesto → capabilities → process → clients & recognition → journal → contact statement → footer |
| 02 | `/work` | Grid / Index views, category + year filters, state in the URL (`?view=index&category=Identity&year=2025`) |
| 03 | `/work/[slug]` | Title/meta → hero (morphs from the card) → statement → visual sequence → details → outcome → related → previous / all work → next-project card |
| 04 | `/about` | Statement + portrait/material image → principles → experience timeline → selected clients → personal notes → CTA |
| 05 | `/services` | Service index → detailed modules → engagement model → process → deliverables → FAQ → enquiry CTA |
| 06 | `/journal` | Featured story → category chips → editorial cards → compact index |
| 07 | `/journal/[slug]` | Header with date/category/reading time → long-form body with pull quotes and image breaks → related → newer/older |
| 08 | `/studio` | Archive of sketches, material studies, process fragments, visual notes |
| 09 | `/recognition` | Year-grouped index of awards, exhibitions, talks, publications, milestones |
| 10 | `/contact` | Intro → enquiry form (all states) → availability, local time, email, socials |
| 11 | `/colophon` | Typefaces, colour, imagery, motion, build notes |
| 12 | `/legal/[slug]` | Privacy, Terms — one quiet shared layout |
| — | any unknown URL | Art-directed 404 with Back home / View work |

## Structure

```
app/                 routes, metadata, sitemap, robots, OG image, contact API
components/
  chrome/            Header (Nav / Desktop), MobileMenu (Nav / Mobile), Footer, LocalTime
  media/             Media — the single image primitive (ratio, focal point, caption, reveal)
  motion/            RevealObserver, ScrollScale, PageTransition
  ui/                ButtonLink, SectionHead, PageIntro
  work/              ProjectCard (Grid), WorkIndex (List), WorkArchive (filters/views)
  journal/           JournalCard
  home/              Capabilities, ProcessScroll
  forms/             ContactForm
content/             CMS collections + site settings (typed, editable)
lib/                 types, cms read layer + integrity checks, shared form validation
styles/              tokens.css → base.css → components.css → sections.css → motion.css
scripts/             media generator, CMS check, link/a11y crawler
public/media/        generated demo imagery (.webp)
```

## Design system

All values live in `styles/tokens.css` — nothing page-specific overrides them.

**Colour** — `Background/Primary #F5F2EC`, `Background/Inverse #11110F`, `Surface #EAE6DE`,
`Text/Primary #11110F`, `Text/Inverse #F7F5F0`, `Text/Muted #6D6A64`, `Line/Subtle #D3CFC6`,
`Accent/Primary #D9573F` (5–10% of surface, large or graphic use), `Accent/Soft #F0C8BF`,
`Focus #11110F`. Any section can switch to the dark pairing with `.theme-inverse`.

**Type** — Instrument Serif (display) + Inter Tight (utility). Fluid scale, min @ 375px → max @ 1440px:

| Style | Size | Use |
|---|---|---|
| Display XL | 48 → 148 | Hero / brand moments |
| Display L | 40 → 104 | Section statements, page titles |
| H1 | 34 → 72 | Large headings |
| H2 | 26 → 48 | Section headings |
| H3 | 20 → 26 | Card titles |
| Body L | 16 → 22 | Lead copy |
| Body | 15 → 18 | General |
| Meta | 11 → 13 | Labels, years, categories |

**Space** — 4px base; rhythm 8/12/16/24/32/48/64/80/96/128/160/192; fluid section padding 80 → 192.

**Grid** — Mobile 0–767px: 4 columns, 16px gutter · Tablet 768–1199px: 8 columns, 20px ·
Desktop 1200px+: 12 columns, 24px · max content width 1440px · outer padding `clamp(16px, 4vw, 64px)`.

**Radius** — 0 / 4 / 10 / 18 / pill. **Image ratios** — 3:2, 4:5, 3:4, 1:1, 16:9, 21:9.

**Motion** — "quietly cinematic":

| Interaction | Duration | Easing |
|---|---|---|
| Micro hover | 220ms | ease-out |
| Image / card reveal | 480ms | cubic-bezier(.22,.61,.36,1) |
| Text appear (12–24px rise) | 700ms | cubic-bezier(.16,1,.3,1) |
| Section reveal | 900ms | cubic-bezier(.16,1,.3,1) |
| Page transition | 560ms | cubic-bezier(.16,1,.3,1) / (.76,0,.24,1) |

Recipes: hero text reveal + image mask reveal + scroll-linked scale 1.00 → 0.96; work cards shift
crop 3% with stable metadata; manifesto grouped line reveal; capabilities line + thumbnail on hover,
tap-to-expand everywhere; process highlights the current step from scroll progress; one page
transition family (fade + 16px rise) site-wide; project image morphs from card to case-study hero
(View Transitions). **Reduced motion** removes all movement, shortens transitions and never hides
content; without JavaScript nothing is hidden at all.

## CMS collections (`content/`)

**Projects** — `title, slug, client, year, category, discipline, location, thesis,
shortDescription, longDescription[], heroImage, heroFocal, gallery[{image, caption, layout}], role,
team[], deliverables[], credits[{role, name}], outcome?, externalUrl?, featured, sortOrder,
related[]`. Gallery layouts: `full · wide · inset · pair · portrait` (5–12 items recommended).
Previous/next are derived from `sortOrder`; related projects that don't resolve are dropped; the
external-link button only renders when `externalUrl` is a real `https://` URL.

**Journal** — `title, slug, category, date, author, excerpt, coverImage, featured, body[], related[]`.
Body blocks: `paragraph · heading · quote{text, cite?} · image{image, caption, wide?}`. Reading time
is computed.

**Also:** `services`, `processSteps`, `engagementModels`, `faqs`, `principles`, `timeline`,
`clients`, `personalNotes`, `archive`, `recognition`, `legalPages` (`content/studio.ts`) and the
media library (`content/media.ts`: `src, width, height, alt, focal`).

`npm run cms:check` validates every collection: unique slugs, resolving references, existing media,
no image reused across unrelated records. Pages read only through `lib/cms.ts`, so swapping in a
headless CMS touches one file.

## Buyer customisation points

| What | Where |
|---|---|
| Brand name, wordmark, descriptor, founder, location, time zone, availability | `content/site.ts` |
| Contact email, social links, navigation labels | `content/site.ts` |
| SEO title/description, OG image | `content/site.ts`, `app/opengraph-image.tsx` |
| Display & utility font | `app/layout.tsx` (two `next/font` calls) |
| Accent colour, light/dark pairing, every token | `styles/tokens.css` |
| Projects / Journal / everything else | `content/*.ts` |
| Form destination | `CONTACT_WEBHOOK_URL` |
| Imagery | replace files in `public/media` and keep `width/height` accurate in `content/media.ts` |

No personal email, analytics, calendar or account is hard-coded; the demo email uses the reserved
`.example` domain and social links point to platform home pages.

## Framer conversion

Everything maps one-to-one to native Framer features — no custom code components are required.

| This build | Framer |
|---|---|
| `styles/tokens.css` colour tokens | Color Styles (same names, e.g. `Color/Accent/Primary`) |
| `.t-*` type classes + fluid sizes | Text Styles with Desktop / Tablet / Phone sizes from the table above |
| Breakpoints 1200 / 768 / 0 | Desktop / Tablet / Phone breakpoints |
| `.container`, `.grid`, sections | Stacks + Grid with the column counts above |
| `Header` / `MobileMenu` | `Nav / Desktop`, `Nav / Mobile` (variants: closed, open) |
| `ButtonLink` | `Button / Primary`, `Button / Secondary`, `Button / Text` (variants: default, hover, disabled) |
| `ProjectCard`, `WorkIndex` row | `Project Card / Grid`, `Project Card / List` (CMS-bound) |
| `JournalCard` | `Journal Card / Feature`, `Journal Card / Default` |
| `SectionHead`, `PageIntro`, `Media` | `Section / Header`, `Page / Intro`, `Media / Figure` |
| `Capabilities`, `ProcessScroll` | Variants with tap/hover interactions; scroll section with sticky + scroll transform |
| Reveal / mask reveal / scroll scale | Appear effects + Scroll Transforms using the motion table |
| `PageTransition` | One Page Effect for all routes |
| `content/projects.ts`, `content/journal.ts` | CMS Collections + CMS detail pages (`/work/:slug`, `/journal/:slug`) |
| Work filters | CMS collection list filters (category, year) |
| `ContactForm` | Framer Form with the same fields, required flags and success/error states |
| Metadata per page | Page SEO fields |

Test component typography at every breakpoint — Framer does not propagate page-level text-style
breakpoints into components automatically.

## Imagery

`npm run media:generate` renders every entry in `content/media.ts` with headless Chromium using the
ten recipes in `scripts/media/recipes.js` (stone, water, paper, light, clay, concrete, linen, riso,
studio, sketch) and one shared grade (soft contrast, controlled highlights, 2–4% grain). Output is
deterministic per seed. Use `-- --force` to re-render everything or pass ids to render a few.
Replace with licensed photography for a real site.

## QA

```bash
npm run typecheck
npm run cms:check
npm run build && npm start &
npm run qa:links -- http://localhost:3000
```

`qa:links` crawls every reachable page and fails on empty/`#`/`javascript:` hrefs, broken internal
links or anchors, external links without `target`/`rel`, images without `alt`, unnamed buttons and
pages without exactly one `<h1>`, and checks that unknown URLs return 404.

### Build report (passes 01–12)

| Pass | Status |
|---|---|
| 01 Foundation | Tokens, type, grid, spacing, radius, motion, primitives — `styles/`, `components/ui`, `components/media` |
| 02 CMS | Projects (8), Journal (6), Services, Archive, Recognition, Legal + integrity checks |
| 03 Core pages | Home, Work, Project Detail, About, Services, Contact |
| 04 Editorial | Journal, Journal Detail, Studio Archive, Recognition, Colophon |
| 05 Utility | Legal (Privacy, Terms), custom 404 |
| 06 Responsive | Checked at 390, 820, 1440 and in between; no horizontal overflow on any route |
| 07 Motion | Only the recipes above; reduced-motion fallback verified |
| 08 Interaction QA | Every route, card, related/next link, filters + Back, mobile menu, form validation/loading/success/error, 404 links — scripted with Playwright |
| 09 Accessibility | Landmarks, one h1 per page, skip link, visible focus, focus-trapped menu, labelled form fields with error summary, alt text, 40–48px touch targets |
| 10 Performance | Static prerendering, responsive `next/image` (WebP), lazy below the fold, reserved dimensions (CLS 0), transform/opacity animation only, no third-party scripts |
| 11 Marketplace polish | Framer-aligned component names, single source of truth for styles and content |
| 12 Final review | Against the "Do not ship until" checklist in the brief |

Known limits: the demo form logs enquiries unless `CONTACT_WEBHOOK_URL` is set; the page
transition and image morph use the View Transitions API and degrade to instant navigation in
browsers without it.
