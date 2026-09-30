"use client";
import { useRef } from "react";
import { Photo } from "@/components/media/Photo";
import { ChapterLabel } from "@/components/type/ChapterLabel";
import { deltaFacts } from "@/content/facts";
import { useGsap } from "@/hooks/useGsap";
import type { Story } from "@/types/content";

const LINE = "M-100 180 C 220 60, 420 360, 700 260 S 1100 40, 1300 300 S 1500 640, 1120 700 S 560 560, 420 820 S 700 1140, 980 1080";

/**
 * 04 — THE DELTA. A single river line fills the viewport and is drawn by the scroll;
 * along it, the facts of a land made by water. The line finally narrows into a point
 * — the map of the regions that follows.
 */
export function Delta({ story }: { story?: Story }) {
  const root = useRef<HTMLElement>(null);
  useGsap(
    ({ gsap, reduced }) => {
      if (!root.current) return;
      const q = gsap.utils.selector(root.current);
      const path = root.current.querySelector<SVGPathElement>("[data-d-line]")!;
      const len = path.getTotalLength();
      if (reduced) return;
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.8 } });
      tl.to(path, { strokeDashoffset: 0, ease: "none", duration: 1 }, 0)
        .fromTo(q("[data-d-block]"), { opacity: 0, y: 60 }, { opacity: 1, y: 0, stagger: 0.18, duration: 0.14, ease: "power2.out" }, 0.05)
        .fromTo(q("[data-d-photo]"), { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(70% at 50% 50%)", duration: 0.3, ease: "power2.inOut" }, 0.45)
        .to(q("[data-d-stage]"), { scale: 0.08, opacity: 0, duration: 0.18, ease: "power3.in" }, 0.84);
      return () => tl.scrollTrigger?.kill();
    },
    root,
  );
  return (
    <section ref={root} id="chapter-delta" data-chapter="delta" aria-labelledby="delta-title" className="relative h-[380svh] bg-[#0b1d25] text-paper">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div data-d-stage className="absolute inset-0 origin-center">
          <svg viewBox="0 0 1200 1000" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
            <path d={LINE} fill="none" stroke="#8cc7da" strokeOpacity={0.12} strokeWidth={90} strokeLinecap="round" />
            <path data-d-line d={LINE} fill="none" stroke="#8cc7da" strokeWidth={3} strokeLinecap="round" />
          </svg>
          <div data-d-photo className="absolute right-[6vw] top-[14svh] aspect-square w-[min(44vw,52svh)] overflow-hidden rounded-full" style={{ clipPath: "circle(0% at 50% 50%)" }}>
            <Photo id="sundarbans-satellite" className="absolute inset-0" sizes="44vw" target={960} />
            <p className="t-coord absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/50 px-2 py-1">The delta mouth from orbit</p>
          </div>
          <div className="gutter relative flex h-full flex-col justify-center gap-10 py-24">
            <div data-d-block className="max-w-2xl">
              <ChapterLabel id="delta" />
              <h2 id="delta-title" className="t-display mt-4" style={{ fontSize: "var(--step-5)" }}>
                Shaped by water
              </h2>
              <p lang="bn" className="t-bn opacity-60" style={{ fontSize: "var(--step-2)" }}>
                জলে গড়া দেশ
              </p>
            </div>
            <p data-d-block className="t-lede max-w-[46ch] opacity-90">
              {story?.body[0] ?? "Three of Asia's great rivers meet in Bangladesh and carry the Himalayas' silt to the sea. Over thousands of years that silt built the land itself."}
            </p>
            <dl className="grid max-w-3xl grid-cols-1 gap-8 sm:grid-cols-3">
              {deltaFacts.map((f) => (
                <div data-d-block key={f.label} className="border-t border-white/20 pt-4">
                  <dt className="t-kicker opacity-60">{f.label}</dt>
                  <dd className="t-display mt-2 text-[clamp(2.4rem,4.5vw,4rem)] leading-none">{f.value}</dd>
                  {f.source && <dd className="t-coord mt-2 opacity-50">{f.source}</dd>}
                </div>
              ))}
            </dl>
            <p data-d-block className="t-body max-w-[52ch] opacity-75">
              {story?.body[1]}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
