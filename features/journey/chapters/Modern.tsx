"use client";
import { useRef } from "react";
import { Photo } from "@/components/media/Photo";
import { ChapterLabel } from "@/components/type/ChapterLabel";
import { TextReveal } from "@/components/type/TextReveal";
import { modernFacts } from "@/content/facts";
import { useExperience } from "@/features/experience/ExperienceProvider";
import { useGsap } from "@/hooks/useGsap";
import type { Destination } from "@/types/content";

const SPANS = 41; // 41 spans × 150 m = 6.15 km

/** 14 — MODERN BANGLADESH. Bridges, rails, cities — the delta connected. */
export function Modern({ destinations }: { destinations: Destination[] }) {
  const root = useRef<HTMLElement>(null);
  const { places, openPlace } = useExperience();
  useGsap(
    ({ gsap, reduced }) => {
      if (!root.current) return;
      const q = gsap.utils.selector(root.current);
      const deck = root.current.querySelector<SVGPathElement>("[data-m-deck]")!;
      const piers = q("[data-m-pier]");
      const counter = q("[data-m-km]")[0] as HTMLElement;
      if (reduced) {
        counter.textContent = "6.15";
        return;
      }
      const len = deck.getTotalLength();
      gsap.set(deck, { strokeDasharray: len, strokeDashoffset: len });
      const obj = { km: 0 };
      const tl = gsap.timeline({ scrollTrigger: { trigger: q("[data-m-bridge]")[0], start: "top 75%", end: "bottom 35%", scrub: 0.8 } });
      tl.to(deck, { strokeDashoffset: 0, ease: "none", duration: 1 }, 0)
        .fromTo(piers, { scaleY: 0 }, { scaleY: 1, transformOrigin: "bottom", stagger: 0.022, duration: 0.1, ease: "power2.out" }, 0)
        .to(obj, { km: 6.15, ease: "none", duration: 1, onUpdate: () => (counter.textContent = obj.km.toFixed(2)) }, 0);
      return () => tl.scrollTrigger?.kill();
    },
    root,
  );
  return (
    <section ref={root} id="chapter-modern" data-chapter="modern" aria-labelledby="modern-title" className="relative bg-ink pb-[var(--section-pad)] text-paper">
      <div className="gutter pt-[var(--section-pad)]">
        <ChapterLabel id="modern" />
        <TextReveal as="h2" id="modern-title" text="A delta connected" className="t-display mt-5" style={{ fontSize: "var(--step-5)" }} />
      </div>

      <div data-m-bridge className="gutter mt-16">
        <div className="flex items-end justify-between gap-6">
          <p className="t-kicker opacity-60">Padma Bridge · Mawa → Janjira</p>
          <p className="t-display tabular-nums leading-none" style={{ fontSize: "var(--step-5)" }}>
            <span data-m-km>0.00</span>
            <span className="text-[0.4em] opacity-60"> km</span>
          </p>
        </div>
        <svg viewBox="0 0 1640 160" className="mt-6 w-full" role="img" aria-label="Diagram of the Padma Bridge: 41 spans of 150 metres">
          <line x1={0} y1={150} x2={1640} y2={150} stroke="#3f8fa8" strokeOpacity={0.5} strokeWidth={1} />
          {Array.from({ length: SPANS + 1 }, (_, i) => (
            <rect key={i} data-m-pier x={i * 40 - 2} y={62} width={4} height={88} fill="#d9c7a3" fillOpacity={0.7} />
          ))}
          <path data-m-deck d="M0 60 L1640 60" stroke="#f3ede1" strokeWidth={6} />
          <path d="M0 74 L1640 74" stroke="#f3ede1" strokeOpacity={0.35} strokeWidth={2} strokeDasharray="10 8" />
        </svg>
        <p className="t-coord mt-3 opacity-50">Upper deck: four-lane road · lower deck: railway · 41 spans × 150 m · opened 25 June 2022</p>
      </div>

      <div className="gutter mt-20 grid grid-cols-12 gap-x-[var(--col-gap)] gap-y-10">
        <div className="relative col-span-12 aspect-[16/10] overflow-hidden lg:col-span-7">
          <Photo id="padma-bridge-night" className="absolute inset-0" sizes="(min-width:1024px) 58vw, 100vw" target={1280} />
        </div>
        <dl className="col-span-12 grid content-start gap-8 lg:col-span-5">
          {modernFacts.map((f) => (
            <div key={f.label} className="border-t border-white/15 pt-4">
              <dt className="t-kicker opacity-60">{f.label}</dt>
              <dd className="t-display mt-2 text-[clamp(1.8rem,3vw,2.8rem)] leading-tight">{f.value}</dd>
              {f.source && <dd className="t-coord mt-1 opacity-50">{f.source}</dd>}
            </div>
          ))}
        </dl>
      </div>

      <ul className="gutter mt-20 grid grid-cols-1 gap-[var(--col-gap)] sm:grid-cols-2 lg:grid-cols-4">
        {destinations.map((d) => {
          const place = places.find((p) => p.id === `destination:${d.slug}`);
          return (
            <li key={d.slug} id={d.slug}>
              <button type="button" onClick={(e) => place && openPlace(place, e.currentTarget)} className="group block w-full text-left" data-cursor="discover" data-cursor-label="Enter">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Photo id={d.media[0]} className="absolute inset-0 transition-transform duration-[1400ms] group-hover:scale-105" sizes="(min-width:1024px) 24vw, 50vw" target={960} />
                </div>
                <p className="t-kicker mt-4 opacity-60">{d.opened ? `Opened ${d.opened}` : d.category}</p>
                <p className="t-display mt-1 text-3xl">{d.name}</p>
                <p className="mt-2 text-sm opacity-75">{d.summary}</p>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
