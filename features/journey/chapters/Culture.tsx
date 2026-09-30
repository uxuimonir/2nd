"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { Photo } from "@/components/media/Photo";
import { ChapterLabel } from "@/components/type/ChapterLabel";
import { useExperience } from "@/features/experience/ExperienceProvider";
import { useGsap } from "@/hooks/useGsap";
import { cn } from "@/lib/utils";
import type { CultureItem } from "@/types/content";

const VOWELS = ["অ", "আ", "ই", "ঈ", "উ", "ঊ", "ঋ", "এ", "ঐ", "ও", "ঔ"];
const EKTARA_NOTES = [146.8, 164.8, 196, 220, 246.9, 293.7];

/** 10 — THE CULTURE. Language first — then song, craft and festival. */
export function Culture({ items }: { items: CultureItem[] }) {
  const root = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const { pluck } = useExperience();
  const [plucked, setPlucked] = useState<number | null>(null);

  useGsap(
    ({ gsap, reduced }) => {
      if (reduced || !root.current) return;
      gsap.fromTo(
        root.current.querySelector("[data-cu-word]"),
        { letterSpacing: "0.4em", opacity: 0.2 },
        { letterSpacing: "-0.02em", opacity: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top 80%", end: "top 10%", scrub: true } },
      );
    },
    root,
  );

  // drag-to-scroll gallery (touch scrolls natively)
  const drag = useRef({ down: false, x: 0, left: 0 });

  return (
    <section ref={root} id="chapter-culture" data-chapter="culture" aria-labelledby="culture-title" className="relative overflow-hidden bg-ink pb-[var(--section-pad)] text-paper">
      <div className="gutter pt-[var(--section-pad)]">
        <ChapterLabel id="culture" />
        <h2 id="culture-title" className="sr-only">
          The Culture — language, song, craft
        </h2>
        <p data-cu-word lang="bn" aria-hidden className="t-bn mt-6 whitespace-nowrap leading-none" style={{ fontSize: "clamp(6rem, 28vw, 26rem)" }}>
          বাংলা
        </p>
        <div className="mt-6 grid grid-cols-12 gap-x-[var(--col-gap)] gap-y-8">
          <p className="t-lede col-span-12 opacity-90 lg:col-span-5">
            A language defended with lives in 1952 and celebrated by the world every 21 February. Its script is the first thing to learn — and the first thing to love.
          </p>
          <ul className="col-span-12 flex flex-wrap gap-1 lg:col-span-6 lg:col-start-7" aria-label="Bangla vowels">
            {VOWELS.map((v) => (
              <li key={v} lang="bn" className="t-bn grid h-14 w-14 place-items-center border border-white/15 text-2xl transition-colors duration-300 hover:bg-paper hover:text-ink">
                {v}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Baul — the ektara plays */}
      <div className="gutter mt-20 grid grid-cols-12 items-center gap-x-[var(--col-gap)] gap-y-8 border-y border-white/10 py-12">
        <div className="col-span-12 md:col-span-5">
          <p className="t-kicker opacity-60">Baul · UNESCO intangible heritage</p>
          <p className="t-display mt-3" style={{ fontSize: "var(--step-3)" }}>
            One string, the whole heart.
          </p>
          <p className="t-body mt-3 opacity-75">The ektara accompanies the songs of the Bauls. Pluck it.</p>
        </div>
        <div className="col-span-12 flex items-end gap-2 md:col-span-6 md:col-start-7" role="group" aria-label="Play the ektara">
          {EKTARA_NOTES.map((f, i) => (
            <button
              key={f}
              type="button"
              aria-label={`Pluck note ${i + 1}`}
              onClick={() => {
                pluck(f);
                setPlucked(i);
                setTimeout(() => setPlucked((p) => (p === i ? null : p)), 700);
              }}
              className="group relative flex h-40 flex-1 justify-center"
              data-cursor="explore"
              data-cursor-label="Pluck"
            >
              <span
                className={cn("block h-full w-px bg-sand transition-transform", plucked === i && "animate-[string_.7s_ease-out]")}
                style={{ transformOrigin: "center" }}
              />
              <span className="t-coord absolute -bottom-6 opacity-50">{i + 1}</span>
            </button>
          ))}
          <style>{`@keyframes string{0%{transform:scaleX(6)}20%{transform:scaleX(1) translateX(3px)}40%{transform:translateX(-2px)}60%{transform:translateX(1px)}100%{transform:none}}`}</style>
        </div>
      </div>

      <div
        ref={rail}
        className="scrollbar-none mt-16 flex snap-x gap-[var(--col-gap)] overflow-x-auto px-[var(--gutter)]"
        data-cursor="drag"
        data-lenis-prevent-wheel
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || !rail.current) return;
          drag.current = { down: true, x: e.clientX, left: rail.current.scrollLeft };
        }}
        onPointerMove={(e) => {
          if (!drag.current.down || !rail.current) return;
          rail.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
        }}
        onPointerUp={() => (drag.current.down = false)}
        onPointerLeave={() => (drag.current.down = false)}
        aria-label="Culture gallery"
        role="region"
        tabIndex={0}
      >
        {items.map((c) => (
          <article key={c.slug} id={c.slug} className="w-[82vw] shrink-0 snap-start sm:w-[46vw] lg:w-[30vw]">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Photo id={c.media[0]} className="absolute inset-0 transition-transform duration-[1400ms] hover:scale-105" sizes="(min-width:1024px) 30vw, 80vw" target={960} />
            </div>
            <p className="t-kicker mt-4 opacity-60">{c.category}</p>
            <h3 className="t-display mt-2 text-4xl">{c.name}</h3>
            <p lang="bn" className="t-bn opacity-60">
              {c.nameBn}
            </p>
            <p className="mt-3 opacity-80">{c.summary}</p>
            {c.recognition && <p className="t-coord mt-3 opacity-50">{c.recognition}</p>}
          </article>
        ))}
      </div>
      <div className="gutter mt-10">
        <Link href="/culture" className="btn-explore">
          <span>All of the culture</span>
          <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
