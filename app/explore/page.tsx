import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page/PageIntro";
import { Photo } from "@/components/media/Photo";
import { chapters } from "@/content/chapters";
import { People } from "@/features/journey/chapters/People";
import { buildPlaces, KIND_LABEL } from "@/lib/places";
import { pad2 } from "@/lib/utils";
import { getJourney } from "@/services/content";
import type { PlaceKind } from "@/types/content";

export const metadata: Metadata = {
  title: "Explore",
  description: "Every chapter, place and story of Digital Bangladesh in one index.",
  alternates: { canonical: "/explore" },
};

const GROUPS: PlaceKind[] = ["city", "heritage", "nature", "food", "culture", "destination"];

export default async function ExplorePage() {
  const j = await getJourney();
  const places = buildPlaces(j).filter((p) => p.layer !== "history" && p.kind !== "story");
  return (
    <main id="main" className="bg-ink text-paper">
      <PageIntro kicker="Explore" title="The whole journey" bn="সম্পূর্ণ যাত্রা" lede="Sixteen chapters, every place on the map, and the people behind them." />
      <ol className="gutter grid grid-cols-1 gap-x-10 sm:grid-cols-2 lg:grid-cols-4">
        {chapters.map((c, i) => (
          <li key={c.id} className="border-t border-white/15">
            <Link href={c.id === "enter" ? "/" : `/#chapter-${c.id}`} className="group flex items-baseline gap-3 py-4">
              <span className="t-coord opacity-50">{pad2(i + 1)}</span>
              <span className="t-display text-2xl transition-transform duration-500 group-hover:translate-x-1">{c.title}</span>
              <span lang="bn" className="t-bn ml-auto text-sm opacity-50">
                {c.titleBn}
              </span>
            </Link>
          </li>
        ))}
      </ol>
      {GROUPS.map((g) => {
        const items = places.filter((p) => p.kind === g);
        return (
          <section key={g} aria-labelledby={`g-${g}`} className="gutter mt-[var(--section-pad)]">
            <h2 id={`g-${g}`} className="t-kicker border-b border-white/15 pb-3 opacity-70">
              {KIND_LABEL[g]} · {items.length}
            </h2>
            <ul className="mt-6 grid grid-cols-2 gap-[var(--col-gap)] md:grid-cols-4 lg:grid-cols-6">
              {items.map((p) => (
                <li key={p.id}>
                  <Link href={p.href} className="group block" data-cursor="explore">
                    <div className="relative aspect-square overflow-hidden">
                      <Photo id={p.media} className="absolute inset-0 transition-transform duration-[1400ms] group-hover:scale-105" sizes="(min-width:1024px) 16vw, 45vw" target={500} />
                    </div>
                    <p className="mt-2 leading-tight">{p.name}</p>
                    <p className="t-coord opacity-50">{p.regionName}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      <div className="mt-[var(--section-pad)]">
        <People people={j.people} />
      </div>
    </main>
  );
}
