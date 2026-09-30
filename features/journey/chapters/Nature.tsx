"use client";
import { useRef } from "react";
import { Photo } from "@/components/media/Photo";
import { ChapterLabel } from "@/components/type/ChapterLabel";
import { TextReveal } from "@/components/type/TextReveal";
import { useExperience } from "@/features/experience/ExperienceProvider";
import { useGsap } from "@/hooks/useGsap";
import { GEO, VB_H, VB_W, formatCoord, project } from "@/lib/geo";
import type { NatureSpot } from "@/types/content";

/**
 * 12 — THE NATURE. Full-screen landscapes stacked in depth. Each frame is entered through
 * a widening window; the image breathes with the pointer for a subtle sense of depth.
 */
export function Nature({ spots }: { spots: NatureSpot[] }) {
  const root = useRef<HTMLElement>(null);
  const { places, openPlace } = useExperience();
  useGsap(
    ({ gsap, reduced }) => {
      if (!root.current || reduced) return;
      const frames = gsap.utils.toArray<HTMLElement>(root.current.querySelectorAll("[data-n-frame]"));
      frames.forEach((f) => {
        const win = f.querySelector("[data-n-window]");
        const img = f.querySelector("[data-n-img]");
        gsap.fromTo(win, { clipPath: "inset(22% 18% 22% 18%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: f, start: "top bottom", end: "top top", scrub: true } });
        gsap.fromTo(img, { scale: 1.25 }, { scale: 1.02, ease: "none", scrollTrigger: { trigger: f, start: "top bottom", end: "bottom top", scrub: true } });
      });
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        const dx = e.clientX / window.innerWidth - 0.5;
        const dy = e.clientY / window.innerHeight - 0.5;
        gsap.to(root.current!.querySelectorAll("[data-n-depth]"), { x: dx * -18, y: dy * -12, rotateY: dx * 2, rotateX: dy * -2, duration: 1.2, ease: "power3.out" });
      };
      window.addEventListener("pointermove", onMove);
      return () => window.removeEventListener("pointermove", onMove);
    },
    root,
    [spots.length],
  );
  return (
    <section ref={root} id="chapter-nature" data-chapter="nature" aria-labelledby="nature-title" className="relative bg-green-deep text-paper">
      <div className="gutter py-[var(--section-pad)]">
        <ChapterLabel id="nature" />
        <div className="mt-6 grid grid-cols-12 gap-x-[var(--col-gap)] gap-y-6">
          <TextReveal as="h2" id="nature-title" text="Hills, haors, coast" className="t-display col-span-12 lg:col-span-8" style={{ fontSize: "var(--step-5)" }} />
          <p className="t-lede col-span-12 self-end opacity-85 lg:col-span-4">From the country's highest hills to its only coral island — landscapes that change with every monsoon.</p>
        </div>
      </div>
      {spots.map((s) => {
        const [x, y] = project(s.coordinates);
        const place = places.find((p) => p.id === `nature:${s.slug}`);
        return (
          <article key={s.slug} data-n-frame className="relative h-[100svh] [perspective:1200px]" aria-labelledby={`n-${s.slug}`}>
            <div className="sticky top-0 h-[100svh] overflow-hidden">
              <div data-n-window className="absolute inset-0 overflow-hidden">
                <div data-n-depth className="absolute -inset-6">
                  <div data-n-img className="absolute inset-0">
                    <Photo id={s.media[0]} className="absolute inset-0" sizes="100vw" target={1920} />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/30" />
              </div>
              <div className="gutter relative flex h-full flex-col justify-end pb-14">
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <div>
                    <p className="t-kicker opacity-80">
                      {s.ecosystem.replace("-", " ")} · {formatCoord(s.coordinates)}
                    </p>
                    <h3 id={`n-${s.slug}`} className="t-display mt-3" style={{ fontSize: "var(--step-5)" }}>
                      {s.name}
                    </h3>
                    <p lang="bn" className="t-bn opacity-70" style={{ fontSize: "var(--step-1)" }}>
                      {s.nameBn}
                    </p>
                    <p className="t-lede mt-4 opacity-90">{s.summary}</p>
                    {place && (
                      <button type="button" onClick={(e) => openPlace(place, e.currentTarget)} className="btn-explore mt-6" data-cursor="explore" data-cursor-label="Enter">
                        <span>Enter</span>
                        <span aria-hidden>→</span>
                      </button>
                    )}
                  </div>
                  <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="h-28 w-auto opacity-90 md:h-40" aria-hidden>
                    <path d={GEO.outline} fill="rgba(0,0,0,.35)" stroke="#f3ede1" strokeOpacity={0.6} strokeWidth={1} vectorEffect="non-scaling-stroke" />
                    <circle cx={x} cy={y} r={22} fill="#8fb573" className="pulse-ring" />
                    <circle cx={x} cy={y} r={14} fill="#f3ede1" />
                  </svg>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
