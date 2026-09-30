"use client";
import { useRef } from "react";
import { Photo } from "@/components/media/Photo";
import { ChapterLabel } from "@/components/type/ChapterLabel";
import { TextReveal } from "@/components/type/TextReveal";
import { useGsap } from "@/hooks/useGsap";
import { formatCoord } from "@/lib/geo";
import type { PersonStory } from "@/types/content";

/**
 * 07 — THE PEOPLE. Stacked portraits of work and life: each card settles, the next slides over it.
 * Editorial portraits of ways of life — not named individuals.
 */
export function People({ people }: { people: PersonStory[] }) {
  const root = useRef<HTMLElement>(null);
  useGsap(
    ({ gsap, reduced }) => {
      if (reduced || !root.current) return;
      const cards = gsap.utils.toArray<HTMLElement>(root.current.querySelectorAll("[data-p-card]"));
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        gsap.to(card.firstElementChild, {
          scale: 0.92,
          opacity: 0.35,
          ease: "none",
          scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 12%", scrub: true },
        });
      });
    },
    root,
    [people.length],
  );
  return (
    <section ref={root} id="chapter-people" data-chapter="people" aria-labelledby="people-title" className="relative bg-[#2a1812] pb-[var(--section-pad)] text-paper">
      <div className="gutter pt-[var(--section-pad)]">
        <ChapterLabel id="people" />
        <div className="mt-6 grid grid-cols-12 gap-x-[var(--col-gap)] gap-y-6">
          <TextReveal as="h2" id="people-title" text="Life, work, ambition" className="t-display col-span-12 lg:col-span-8" style={{ fontSize: "var(--step-5)" }} />
          <p className="t-lede col-span-12 self-end opacity-80 lg:col-span-4">From the paddy to the metro — the hands and ideas that keep the delta moving.</p>
        </div>
      </div>
      <ol className="gutter mt-16">
        {people.map((p, i) => (
          <li key={p.slug} id={p.slug} data-p-card className="sticky mb-[8svh]" style={{ top: `calc(9svh + ${i * 10}px)` }}>
            <article className="grid h-[82svh] grid-cols-12 overflow-hidden bg-[#1c110d] will-change-transform" aria-labelledby={`p-${p.slug}`}>
              <div className="relative col-span-12 h-[45%] md:col-span-7 md:h-full">
                <Photo id={p.media} className="absolute inset-0" sizes="(min-width:768px) 58vw, 100vw" target={1280} />
              </div>
              <div className="col-span-12 flex flex-col justify-between p-6 md:col-span-5 md:p-10">
                <div>
                  <p className="t-coord opacity-60">
                    {String(i + 1).padStart(2, "0")} · {p.place}
                  </p>
                  <h3 id={`p-${p.slug}`} className="t-display mt-4" style={{ fontSize: "var(--step-4)" }}>
                    {p.role}
                  </h3>
                  <p lang="bn" className="t-bn opacity-60" style={{ fontSize: "var(--step-2)" }}>
                    {p.roleBn}
                  </p>
                </div>
                <div>
                  <p className="t-lede opacity-90">{p.summary}</p>
                  <p className="t-body mt-4 hidden opacity-70 sm:block">{p.story}</p>
                  <p className="t-coord mt-6 opacity-40">{formatCoord(p.coordinates)} · editorial portrait</p>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
