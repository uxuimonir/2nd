"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BangladeshMap } from "@/components/map/BangladeshMap";
import { useMapCamera } from "@/components/map/useMapCamera";
import { Photo } from "@/components/media/Photo";
import { ChapterLabel } from "@/components/type/ChapterLabel";
import { TextReveal } from "@/components/type/TextReveal";
import { regionName } from "@/content";
import { countryCamera, project } from "@/lib/geo";
import { ensureGsap, gsap, prefersReducedMotion } from "@/lib/motion";
import { cn, pad2 } from "@/lib/utils";
import type { Food as FoodT } from "@/types/content";

/** 11 — THE FOOD. A map you can taste: every dish lights up the place it comes from. */
export function Food({ items }: { items: FoodT[] }) {
  const camera = useMapCamera();
  const [active, setActive] = useState(0);
  const photo = useRef<HTMLDivElement>(null);
  const f = items[active];

  useEffect(() => {
    const [x, y] = project(f.coordinates);
    const base = countryCamera(camera.aspect());
    camera.setCamera({ cx: base.cx + (x - base.cx) * 0.4, cy: base.cy + (y - base.cy) * 0.4, w: base.w * 0.8 }, { duration: 1.2 });
    if (prefersReducedMotion() || !photo.current) return;
    ensureGsap();
    gsap.fromTo(photo.current, { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)", duration: 1.3, ease: "power3.inOut" });
  }, [f, camera]);

  return (
    <section id="chapter-food" data-chapter="food" aria-labelledby="food-title" className="relative bg-paper text-ink">
      <div className="gutter pt-[var(--section-pad)]">
        <ChapterLabel id="food" />
        <TextReveal as="h2" id="food-title" text="A map you can taste" className="t-display mt-5" style={{ fontSize: "var(--step-5)" }} />
      </div>
      <div className="gutter mt-12 grid grid-cols-12 gap-x-[var(--col-gap)] gap-y-10 pb-[var(--section-pad)]">
        <ol className="col-span-12 lg:col-span-5" aria-label="Dishes">
          {items.map((it, i) => (
            <li key={it.slug} className="border-t border-ink/15 last:border-b">
              <button
                type="button"
                aria-pressed={i === active}
                onClick={() => setActive(i)}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className={cn("flex w-full items-baseline gap-4 py-4 text-left transition-opacity", i === active ? "opacity-100" : "opacity-45 hover:opacity-80")}
                data-cursor="discover"
                data-cursor-label="Taste"
              >
                <span className="t-coord w-8">{pad2(i + 1)}</span>
                <span className="t-display flex-1 text-[clamp(1.6rem,2.8vw,2.6rem)] leading-none">{it.name}</span>
                <span lang="bn" className="t-bn text-sm">
                  {it.nameBn}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <div className="col-span-12 lg:sticky lg:top-20 lg:col-span-7 lg:h-[80svh]">
          <div className="grid h-full grid-cols-7 gap-[var(--col-gap)]">
            <div className="relative col-span-7 aspect-[4/3] overflow-hidden md:col-span-5 md:aspect-auto md:h-full">
              <div ref={photo} className="absolute inset-0">
                <Photo key={f.slug} id={f.media[0]} className="absolute inset-0" sizes="(min-width:1024px) 42vw, 100vw" target={1280} />
              </div>
            </div>
            <div className="col-span-7 flex flex-col justify-between md:col-span-2">
              <div className="h-48 bg-ink md:h-64">
                <BangladeshMap camera={camera} places={[{ id: `food:${f.slug}`, kind: "food", slug: f.slug, name: f.origin.split(",")[0], nameBn: "", coordinates: f.coordinates, summary: "", href: "", layer: "culture" }]} selectedPlaceId={`food:${f.slug}`} layers={{ base: true, rivers: true, culture: true }} divisions activeDivision={f.region} flow={false} ariaLabel={`Where ${f.name} comes from`} />
              </div>
              <div aria-live="polite" className="mt-4">
                <p className="t-kicker opacity-60">
                  {regionName(f.region)}
                  {f.season ? ` · ${f.season}` : ""}
                </p>
                <p className="mt-2 leading-snug">{f.summary}</p>
                <p className="t-coord mt-2 opacity-60">From: {f.origin}</p>
                <Link href={`/food/${f.slug}`} className="t-kicker link-underline mt-4 inline-block">
                  The story of {f.name} →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
