# NOIRÉ 2 — Framer sections

Self-contained Framer code components that make up the modern NOIRÉ 2 site.
Each file is one section with property controls, so a buyer edits copy,
images, links and lists from Framer's properties panel. Every section sizes
itself from its own width (ResizeObserver), so it is responsive inside Framer
breakpoints without extra layers.

| Page | Sections (top → bottom) |
|---|---|
| Home `/` | NoireNav (fixed) · NoireHero · NoireMarquee · NoireStackedWork · NoireIndex · NoireManifesto · NoireServices · NoireProcessSection · NoireClients · NoireJournalPreview · NoireCTA · NoireFooter |
| Work `/work` | NoireNav (Over dark off) · NoirePageHero · NoireWorkArchive · NoireCTA · NoireFooter |
| Project `/work/<slug>` | NoireNav · NoireProjectDetail · NoireFooter |
| About `/about` | NoireNav · NoirePageHero · NoireBlocks (split) · NoireBlocks (cards, dark) · NoireBlocks (rows) · NoireCTA · NoireFooter |
| Services `/services` | NoireNav · NoirePageHero · NoireServices (light) · NoireBlocks (cards) · NoireProcessSection · NoireBlocks (faq) · NoireCTA · NoireFooter |
| Journal `/journal` | NoireNav · NoirePageHero · NoireJournalGrid · NoireFooter |
| Article `/journal/<slug>` | NoireNav · NoireArticle · NoireFooter |
| Contact `/contact` | NoireNav · NoirePageHero · NoireContact · NoireFooter |
| Studio `/studio` | NoireNav · NoirePageHero · NoireArchive · NoireFooter |
| Recognition `/recognition` | NoireNav · NoirePageHero · NoireBlocks (rows) · NoireFooter |
| Colophon, Privacy, Terms | NoireNav · NoireArticle · NoireFooter |
| 404 | NoireNav · Noire404 |

Set the NoireNav instance to **Position: Fixed, top 0, width 100%** on every page.
Images default to the demo library on GitHub; replace them via each component's
image controls (Framer uploads them). Contact: set *Form endpoint* to a form
service URL; without one the form opens the visitor's mail app prefilled.

## Page components (`framer/pages`)

Inner pages with lots of content (About, Services, Journal, Contact, Studio,
Recognition, Colophon, Privacy/Terms, every project and every article) are also
available as one component per page, generated from the Next.js pages so both
builds show exactly the same content:

```bash
npm run framer:pages   # writes framer/pages/*.tsx
```

Each file imports the section code files by their Framer module URL, listed in
`framer/modules.json` (copy a URL with *Copy Import* in Framer if you recreate a
section). Multi-page files (`NoireProjectPage`, `NoireArticlePage`,
`NoireLegalPage`) have a **Page** property: one instance per Framer page, e.g.
`/work/tidewater` → Page `tidewater`. Content can be edited in the generated
props or, to keep both builds in sync, in `content/*.ts` and regenerated.
