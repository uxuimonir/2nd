"use client";
import Link from "next/link";
import { useRef } from "react";
import { Photo } from "@/components/media/Photo";
import { ChapterLabel } from "@/components/type/ChapterLabel";
import { useExperience } from "@/features/experience/ExperienceProvider";
import { useGsap } from "@/hooks/useGsap";
import { useIsMobile } from "@/hooks/useMedia";
import { GEO, VB_H, VB_W, formatCoord, project } from "@/lib/geo";
import { pad2 } from "@/lib/utils";
import type { City } from "@/types/content";

/**
 * 06 — THE CITIES. Each city emerges from its coordinates: a point on the silhouette,
 * the numbers, then the photograph. Desktop travels sideways; mobile swipes.
 */
export function Cities({ cities }: { cities: City[] }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const mobile = useIsMobile();

  useGsap(
    ({ gsap, reduced }) => {
      if (mobile || reduced || !root.current || !track.current) return;
      const t = track.current;
      const tw = gsap.to(t, {
        x: () => -(t.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true },
      });
      // photographs drift inside their frames as they cross the screen
      gsap.utils.toArray<HTMLElement>(t.querySelectorAll("[data-c-photo]")).forEach((el) => {
        gsap.fromTo(el, { xPercent: -8 }, { xPercent: 8, ease: "none", scrollTrigger: { trigger: el.parentElement, containerAnimation: tw, start: "left right", end: "right left", scrub: true } });
      });
      return () => tw.scrollTrigger?.kill();
    },
    root,
    [mobile, cities.length],
  );

  return (
    <section
      ref={root}
      id="chapter-cities"
      data-chapter="cities"
      aria-labelledby="cities-title"
      className="relative bg-ink text-paper"
      style={{ height: mobile ? undefined : `${cities.length * 90 + 100}svh` }}
    >
      <div className={mobile ? "" : "sticky top-0 h-[100svh] overflow-hidden"}>
        <div
          ref={track}
          className={mobile ? "scrollbar-none flex snap-x snap-mandatory overflow-x-auto" : "flex h-full will-change-transform"}
          data-cursor={mobile ? undefined : "drag"}
        >
          <div className="gutter flex w-[100vw] shrink-0 snap-start flex-col justify-center py-24 md:w-[60vw]">
            <ChapterLabel id="cities" />
            <h2 id="cities-title" className="t-display mt-6" style={{ fontSize: "var(--step-5)" }}>
              Cities from coordinates
            </h2>
            <p className="t-lede mt-6 opacity-80">Eight divisional cities — each a point on the map, each a world of its own.</p>
            <p className="t-kicker mt-10 opacity-50">{mobile ? "Swipe →" : "Scroll to travel →"}</p>
          </div>
          {cities.map((c, i) => (
            <CityPanel key={c.slug} city={c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CityPanel({ city, index }: { city: City; index: number }) {
  const { openPlace, places } = useExperience();
  const [x, y] = project(city.coordinates);
  const place = places.find((p) => p.id === `city:${city.slug}`);
  return (
    <article aria-labelledby={`city-${city.slug}`} className="relative grid h-[100svh] w-[100vw] shrink-0 snap-start grid-cols-12 items-center gap-x-[var(--col-gap)] px-[var(--gutter)] md:w-[92vw]">
      <div className="relative z-10 col-span-12 self-end pb-10 md:col-span-5 md:self-center md:pb-0">
        <div className="flex items-center gap-4">
          <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="h-24 w-auto md:h-32" aria-hidden>
            <path d={GEO.outline} fill="#1e1d1b" stroke="#d9c7a3" strokeOpacity={0.5} strokeWidth={1} vectorEffect="non-scaling-stroke" />
            <circle cx={x} cy={y} r={26} fill="#b5532f" opacity={0.35} className="pulse-ring" />
            <circle cx={x} cy={y} r={16} fill="#f3ede1" />
          </svg>
          <div>
            <p className="t-coord opacity-60">{pad2(index + 1)} / 08</p>
            <p className="t-coord mt-1">{formatCoord(city.coordinates, 4)}</p>
          </div>
        </div>
        <h3 id={`city-${city.slug}`} className="t-display mt-6 leading-[0.85]" style={{ fontSize: "var(--step-6)" }}>
          {city.name}
        </h3>
        <p lang="bn" className="t-bn opacity-60" style={{ fontSize: "var(--step-2)" }}>
          {city.nameBn}
        </p>
        <p className="t-lede mt-5 opacity-90">{city.tagline}</p>
        <p className="t-body mt-3 hidden opacity-70 md:block">{city.summary}</p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          {place ? (
            <button type="button" className="btn-explore" onClick={(e) => openPlace(place, e.currentTarget)} data-cursor="explore" data-cursor-label="Enter">
              <span>Enter {city.name}</span>
              <span aria-hidden>→</span>
            </button>
          ) : null}
          <Link href={`/city/${city.slug}`} className="t-kicker link-underline">
            City page
          </Link>
        </div>
      </div>
      <div className="absolute inset-0 -z-0 md:relative md:col-span-7 md:h-[78svh]">
        <div className="absolute inset-0 overflow-hidden">
          <div data-c-photo className="absolute inset-y-0 -left-[10%] -right-[10%]">
            <Photo id={city.media[0]} className="h-full w-full" sizes="(min-width:768px) 60vw, 100vw" target={1280} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent md:hidden" />
        </div>
        <ul className="absolute bottom-4 right-4 hidden max-w-[60%] flex-wrap justify-end gap-1.5 md:flex">
          {city.landmarks.slice(0, 4).map((l) => (
            <li key={l} className="t-coord bg-ink/70 px-2 py-1 backdrop-blur">
              {l}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
