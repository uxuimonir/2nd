import type { Metadata } from "next";
import { PageIntro } from "@/components/page/PageIntro";
import { mediaList } from "@/content/media";
import { GEO } from "@/lib/geo";
import { commonsPage } from "@/lib/media";

export const metadata: Metadata = {
  title: "About & credits",
  description: "How Digital Bangladesh was made: sources for geography, elevation and photography, and notes on content accuracy.",
  alternates: { canonical: "/about" },
};

const API = ["regions", "cities", "rivers", "destinations", "heritage", "nature", "culture", "food", "timeline", "search?q=padma", "stories"];

export default function AboutPage() {
  return (
    <main id="main" className="bg-paper text-ink">
      <PageIntro tone="paper" kicker="About" title="How this journey was made" lede="Digital Bangladesh is an interactive presentation of the country — its land, water, history and people — in which Bangladesh itself is the protagonist: the map returns again and again, and every photograph, story and date is tied to a place." />
      <div className="gutter grid grid-cols-12 gap-x-[var(--col-gap)] gap-y-16 pb-[var(--section-pad)]">
        <section className="col-span-12 lg:col-span-6" aria-labelledby="geo">
          <h2 id="geo" className="t-kicker opacity-60">Geography</h2>
          <ul className="mt-4 space-y-3">
            {GEO.attribution.map((a) => (
              <li key={a}>{a}</li>
            ))}
            <li>River courses combine Natural Earth centerlines with schematic reaches between well-known river towns; they are simplified for an editorial map, not for navigation.</li>
            <li>The terrain view uses real elevation sampled at roughly 1 km and vertically exaggerated so that a nearly level country can be read.</li>
          </ul>
        </section>
        <section className="col-span-12 lg:col-span-6" aria-labelledby="accuracy">
          <h2 id="accuracy" className="t-kicker opacity-60">Content accuracy</h2>
          <ul className="mt-4 space-y-3">
            <li>Dates, figures and places are drawn from widely documented sources; each figure in the journey carries its source label, and figures marked “editorial” are summaries to be verified before publication.</li>
            <li>People chapters are editorial portraits of ways of life, not named individuals.</li>
            <li>All content lives in typed files (<code>/content</code>) and in PostgreSQL via Prisma, so it can be corrected in one place.</li>
          </ul>
        </section>
        <section className="col-span-12" aria-labelledby="api">
          <h2 id="api" className="t-kicker opacity-60">Open data API</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {API.map((a) => (
              <li key={a}>
                <a href={`/api/${a}`} className="t-coord border border-ink/25 px-2 py-1 hover:bg-ink hover:text-paper">
                  GET /api/{a}
                </a>
              </li>
            ))}
          </ul>
        </section>
        <section className="col-span-12" aria-labelledby="credits">
          <h2 id="credits" className="t-kicker opacity-60">Photography · {mediaList.length} photographs from Wikimedia Commons</h2>
          <p className="mt-3 max-w-3xl opacity-75">Every photograph is used under the licence stated on its Commons file page, where the author is credited. Follow each link for authorship and licence details.</p>
          <ul className="mt-6 grid grid-cols-1 gap-x-8 gap-y-2 text-sm md:grid-cols-2 lg:grid-cols-3">
            {mediaList.map((m) => (
              <li key={m.id}>
                <a href={commonsPage(m.file)} target="_blank" rel="noreferrer" className="link-underline">
                  {m.alt}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
