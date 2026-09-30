"use client";
import { useRef, useState } from "react";
import { Photo } from "@/components/media/Photo";
import { ChapterLabel } from "@/components/type/ChapterLabel";
import { TextReveal } from "@/components/type/TextReveal";
import { useExperience } from "@/features/experience/ExperienceProvider";
import { useGsap } from "@/hooks/useGsap";
import { useFinePointer } from "@/hooks/useMedia";
import { regionName } from "@/content";
import { pad2 } from "@/lib/utils";
import type { HeritageSite } from "@/types/content";

/**
 * 09 — THE HERITAGE. An architectural index: brick, stone and terracotta across 2,300 years.
 * The hovered row's photograph follows the cursor; selecting opens the place.
 */
export function Heritage({ sites }: { sites: HeritageSite[] }) {
  const root = useRef<HTMLElement>(null);
  const follower = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const { places, openPlace } = useExperience();
  const [hover, setHover] = useState<string | null>(null);

  useGsap(
    ({ gsap, reduced }) => {
      if (!root.current) return;
      const hero = root.current.querySelector("[data-h-hero]");
      if (!reduced && hero) {
        gsap.fromTo(hero, { clipPath: "inset(18% 22% 18% 22%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: hero, start: "top 85%", end: "top 10%", scrub: true } });
      }
      if (!fine || !follower.current) return;
      const xTo = gsap.quickTo(follower.current, "x", { duration: 0.6, ease: "power3" });
      const yTo = gsap.quickTo(follower.current, "y", { duration: 0.6, ease: "power3" });
      const move = (e: PointerEvent) => {
        xTo(e.clientX);
        yTo(e.clientY);
      };
      window.addEventListener("pointermove", move);
      return () => window.removeEventListener("pointermove", move);
    },
    root,
    [fine],
  );

  const hovered = sites.find((s) => s.slug === hover);
  return (
    <section ref={root} id="chapter-heritage" data-chapter="heritage" aria-labelledby="heritage-title" className="relative bg-[#2a1812] text-paper">
      <div className="gutter pt-[var(--section-pad)]">
        <ChapterLabel id="heritage" />
        <TextReveal as="h2" id="heritage-title" text="Brick, stone, terracotta" className="t-display mt-6" style={{ fontSize: "var(--step-5)" }} />
      </div>
      <div data-h-hero className="relative mx-[var(--gutter)] mt-12 h-[80svh] overflow-hidden">
        <Photo id="paharpur-aerial" className="absolute inset-0" sizes="100vw" target={1920} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="t-kicker opacity-80">Paharpur, Naogaon · late 8th century</p>
            <p className="t-display mt-2" style={{ fontSize: "var(--step-3)" }}>
              Somapura Mahavihara
            </p>
          </div>
          <p className="t-coord opacity-70">UNESCO World Heritage Site</p>
        </div>
      </div>

      <ol className="gutter mt-20 pb-[var(--section-pad)]" onPointerLeave={() => setHover(null)}>
        {sites.map((s, i) => {
          const place = places.find((p) => p.id === `heritage:${s.slug}`);
          return (
            <li key={s.slug} className="border-t border-white/15 last:border-b">
              <button
                type="button"
                onPointerEnter={() => setHover(s.slug)}
                onFocus={() => setHover(s.slug)}
                onClick={(e) => place && openPlace(place, e.currentTarget)}
                className="group grid w-full grid-cols-12 items-baseline gap-x-[var(--col-gap)] py-5 text-left"
                data-cursor="discover"
                data-cursor-label="Enter"
              >
                <span className="t-coord col-span-1 opacity-50">{pad2(i + 1)}</span>
                <span className="col-span-11 md:col-span-6">
                  <span className="t-display block text-[clamp(1.8rem,3.6vw,3.4rem)] leading-none transition-transform duration-700 group-hover:translate-x-3">{s.name}</span>
                  <span lang="bn" className="t-bn text-sm opacity-50">
                    {s.nameBn}
                  </span>
                </span>
                <span className="t-coord col-span-6 col-start-2 mt-2 opacity-70 md:col-span-3 md:col-start-auto md:mt-0">{s.period}</span>
                <span className="t-coord col-span-5 mt-2 text-right opacity-50 md:col-span-2 md:mt-0">{regionName(s.region)}</span>
              </button>
              {!fine && (
                <div className="mb-5 aspect-[16/9] w-full">
                  <Photo id={s.media[0]} className="h-full w-full" sizes="100vw" target={960} />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {fine && (
        <div ref={follower} aria-hidden className="pointer-events-none fixed left-0 top-0 z-20" style={{ transform: "translate(-200px,-200px)" }}>
          <div className="-translate-x-1/2 -translate-y-1/2 transition-[opacity,transform] duration-500" style={{ opacity: hovered ? 1 : 0, transform: `translate(-50%,-50%) scale(${hovered ? 1 : 0.85})` }}>
            {sites.map((s) => (
              <div key={s.slug} className="absolute left-0 top-0 h-[34vh] w-[26vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden transition-opacity duration-500" style={{ opacity: hover === s.slug ? 1 : 0 }}>
                <Photo id={s.media[0]} className="h-full w-full" sizes="26vh" target={500} decorative />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
