"use client";
import { useEffect, useRef, useState } from "react";
import { cities } from "@/content/cities";
import { useExperience } from "@/features/experience/ExperienceProvider";
import { useGsap } from "@/hooks/useGsap";
import { GEO, VB_H, VB_W, project } from "@/lib/geo";
import { bestSrc, getMedia } from "@/lib/media";
import { ScrollTrigger } from "@/lib/motion";

const FRAGMENTS = ["padma-boatman", "tea-srimangal", "sundarbans-largest"];

/**
 * 01 — ENTER BANGLADESH.
 * Darkness → a point of light → the outline forms → rivers, coastline, cities → photography inside
 * the silhouette → DIGITAL BANGLADESH. Scrolling then carries the camera down into the land.
 */
export function Opening() {
  const root = useRef<HTMLElement>(null);
  const { scrollTo } = useExperience();
  const [ready, setReady] = useState(false);
  const dhaka = project(cities[0].coordinates);

  useEffect(() => {
    const go = () => setReady(true);
    if (document.documentElement.classList.contains("db-loaded")) {
      const t = setTimeout(go, 150);
      return () => clearTimeout(t);
    }
    window.addEventListener("db:loaded", go, { once: true });
    const fallback = setTimeout(go, 6000);
    return () => {
      window.removeEventListener("db:loaded", go);
      clearTimeout(fallback);
    };
  }, []);

  // before the intro: letters wait below their baseline
  useGsap(
    ({ gsap, reduced }) => {
      if (reduced || ready || !root.current) return;
      gsap.set(root.current.querySelectorAll("[data-o-letter]"), { yPercent: 110 });
    },
    root,
    [],
  );

  // intro sequence
  useGsap(
    ({ gsap, reduced }) => {
      if (!ready || !root.current) return;
      const q = gsap.utils.selector(root.current);
      const outline = root.current.querySelector<SVGPathElement>("[data-o-outline]")!;
      const rivers = Array.from(root.current.querySelectorAll<SVGPathElement>("[data-o-river]"));
      [outline, ...rivers].forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });
      const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });
      if (reduced) {
        tl.progress(1);
        gsap.set([outline, ...rivers], { strokeDashoffset: 0 });
        gsap.set(q("[data-o-fade], [data-o-city], [data-o-letter]"), { opacity: 1, yPercent: 0 });
        gsap.set(q("[data-o-photo]"), { opacity: 0.42 });
        gsap.set(q("[data-o-light]"), { opacity: 0 });
        return;
      }
      tl.fromTo(q("[data-o-light]"), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: "expo.out" }, 0)
        .to(q("[data-o-light]"), { scale: 80, opacity: 0, duration: 1.5, ease: "power2.in" }, 0.6)
        .to(outline, { strokeDashoffset: 0, duration: 2.0 }, 0.9)
        .to(rivers, { strokeDashoffset: 0, duration: 1.4, stagger: 0.08, ease: "power2.out" }, 1.8)
        .fromTo(q("[data-o-coast]"), { opacity: 0 }, { opacity: 1, duration: 1.2 }, 2.3)
        .fromTo(q("[data-o-city]"), { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.7, stagger: 0.06, ease: "back.out(2)", transformOrigin: "center" }, 2.7)
        .fromTo(q("[data-o-letter]"), { yPercent: 110 }, { yPercent: 0, duration: 1.4, stagger: 0.03, ease: "expo.out" }, 2.5)
        .fromTo(q("[data-o-fade]"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.1, ease: "expo.out" }, 3.3)
        .fromTo(q("[data-o-photo]"), { opacity: 0 }, { opacity: 0.42, duration: 2.4, ease: "power1.inOut" }, 3.2);
      // photography fragments slowly cross-fade inside the silhouette
      const photos = q("[data-o-photo] image");
      gsap.set(photos, { opacity: 0 });
      gsap.set(photos[0], { opacity: 1 });
      const cycle = gsap.timeline({ repeat: -1, delay: tl.duration() });
      photos.forEach((p, i) => {
        const next = photos[(i + 1) % photos.length];
        cycle.to(p, { opacity: 0, duration: 2.5, ease: "sine.inOut" }, i * 6 + 5).to(next, { opacity: 1, duration: 2.5, ease: "sine.inOut" }, i * 6 + 5);
      });
    },
    root,
    [ready],
  );

  // scroll handoff: the camera falls into the land
  useGsap(
    ({ gsap, reduced }) => {
      if (reduced || !root.current) return;
      const q = gsap.utils.selector(root.current);
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.6 },
      });
      tl.to(q("[data-o-map]"), { scale: 5.2, ease: "power2.in" }, 0)
        .to(q("[data-o-type]"), { yPercent: -30, opacity: 0, ease: "power1.in" }, 0)
        .to(q("[data-o-veil]"), { opacity: 1, ease: "power2.in" }, 0.35);
      return () => tl.scrollTrigger?.kill();
    },
    root,
  );

  useEffect(() => () => ScrollTrigger.refresh(), []);

  const title1 = "Digital";
  const title2 = "Bangladesh";
  return (
    <section ref={root} id="chapter-enter" data-chapter="enter" aria-labelledby="enter-title" className="relative h-[190svh] bg-[#07090a]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* the silhouette */}
        <div data-o-map className="absolute inset-0 flex items-center justify-center md:justify-end md:pr-[6vw]" style={{ transformOrigin: `${(dhaka[0] / VB_W) * 100}% ${(dhaka[1] / VB_H) * 100}%` }}>
          <svg viewBox={`-30 -30 ${VB_W + 60} ${VB_H + 60}`} className="h-[88svh] w-auto max-w-[96vw] opacity-60 md:opacity-100" aria-hidden>
            <defs>
              <clipPath id="o-clip">
                <path d={GEO.outline} />
              </clipPath>
              <filter id="o-glow" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>
            <g data-o-photo clipPath="url(#o-clip)" style={{ opacity: 0 }}>
              {FRAGMENTS.map((id) => {
                const m = getMedia(id);
                return m ? <image key={id} href={bestSrc(m, 960)} x={0} y={0} width={VB_W} height={VB_H} preserveAspectRatio="xMidYMid slice" style={{ filter: "grayscale(0.35) contrast(1.05)" }} /> : null;
              })}
              <rect width={VB_W} height={VB_H} fill="#07090a" opacity={0.25} />
            </g>
            <path data-o-coast d={GEO.outline} fill="none" stroke="#d9c7a3" strokeWidth={6} opacity={0} filter="url(#o-glow)" vectorEffect="non-scaling-stroke" />
            <path data-o-outline d={GEO.outline} fill="none" stroke="#e9dcc0" strokeWidth={1.3} vectorEffect="non-scaling-stroke" />
            {GEO.rivers.map((r) => (
              <path key={r.id} data-o-river d={r.path} fill="none" stroke="#8cc7da" strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
            ))}
            {cities.map((c) => {
              const [x, y] = project(c.coordinates);
              return (
                <g key={c.slug} data-o-city style={{ opacity: 0 }}>
                  <circle cx={x} cy={y} r={5} fill="#f3ede1" />
                  <text x={x + 10} y={y + 4} fontSize={13} fill="#f3ede1" fillOpacity={0.7} className="t-coord">
                    {c.name}
                  </text>
                </g>
              );
            })}
          </svg>
          <div
            data-o-light
            aria-hidden
            className="pointer-events-none absolute h-3 w-3 rounded-full"
            style={{
              left: "50%",
              top: "50%",
              opacity: 0,
              background: "radial-gradient(circle, #fff7e6 0%, rgba(255,230,190,.6) 35%, rgba(255,200,140,0) 70%)",
              boxShadow: "0 0 30px 10px rgba(255,220,170,.35)",
            }}
          />
        </div>

        {/* typography */}
        <div data-o-type className="gutter relative flex h-full flex-col justify-end pb-[12svh] md:justify-center md:pb-0">
          <h1 id="enter-title" className="t-display relative" aria-label="Digital Bangladesh">
            {[title1, title2].map((word, wi) => (
              <span key={word} aria-hidden className="block overflow-hidden leading-[0.86]" style={{ fontSize: wi === 0 ? "var(--step-5)" : "clamp(3rem, 0.8rem + 13vw, 17rem)" }}>
                {word.split("").map((ch, i) => (
                  <span key={i} data-o-letter className="inline-block will-change-transform">
                    {ch}
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <p data-o-fade className="t-lede mt-6 max-w-[34ch] uppercase tracking-[0.12em] opacity-0" style={{ fontSize: "var(--step-0)" }}>
            A living journey through land, water, history &amp; people.
          </p>
          <p data-o-fade lang="bn" className="t-bn mt-2 opacity-0" style={{ fontSize: "var(--step-1)" }}>
            মাটি, জল, ইতিহাস ও মানুষের ভেতর দিয়ে এক জীবন্ত যাত্রা
          </p>
          <div data-o-fade className="mt-10 flex flex-wrap items-center gap-6 opacity-0">
            <button type="button" className="btn-explore" onClick={() => scrollTo("#chapter-land")} data-cursor="explore" data-cursor-label="Begin">
              <span>Begin journey</span>
              <span aria-hidden>↓</span>
            </button>
            <span className="t-coord opacity-60">20°34′–26°38′ N · 88°01′–92°41′ E</span>
          </div>
        </div>
        <div data-o-veil aria-hidden className="pointer-events-none absolute inset-0 bg-[#1a130d] opacity-0" />
      </div>
    </section>
  );
}
