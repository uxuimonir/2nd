"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BangladeshMap } from "@/components/map/BangladeshMap";
import { useMapCamera } from "@/components/map/useMapCamera";
import { Photo } from "@/components/media/Photo";
import { ChapterLabel } from "@/components/type/ChapterLabel";
import { TextReveal } from "@/components/type/TextReveal";
import { useExperience } from "@/features/experience/ExperienceProvider";
import { countryCamera, divisionGeo, fitCamera } from "@/lib/geo";
import { cn } from "@/lib/utils";
import type { Region } from "@/types/content";

/** 05 — THE REGIONS. Eight divisions — hover to read, select to travel into one. */
export function Regions({ regions }: { regions: Region[] }) {
  const camera = useMapCamera();
  const { places, openPlace, visited } = useExperience();
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const focus = selected ?? hover;
  const region = regions.find((r) => r.slug === focus) ?? null;

  const regionPlaces = useMemo(() => (selected ? places.filter((p) => p.region === selected && p.layer !== "history" && p.kind !== "story") : []), [places, selected]);

  const choose = (slug: string | null) => {
    setSelected(slug);
    const g = slug ? divisionGeo(slug) : null;
    camera.setCamera(g ? fitCamera(g.bbox, camera.aspect(), 1.25) : countryCamera(camera.aspect()), { duration: 1.6 });
  };

  return (
    <section id="chapter-regions" data-chapter="regions" aria-labelledby="regions-title" className="relative bg-paper text-ink">
      <div className="grid min-h-[100svh] grid-cols-12">
        <div className="gutter col-span-12 flex flex-col justify-between py-[var(--section-pad)] lg:col-span-5">
          <div>
            <ChapterLabel id="regions" />
            <TextReveal as="h2" id="regions-title" text="Eight divisions, one delta" className="t-display mt-5" style={{ fontSize: "var(--step-4)" }} />
            <p className="t-body mt-6 opacity-80">Each division has its own landscape and rhythm. Hover to read the land; select one to travel into it and see its places.</p>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-x-6 border-t border-ink/15" aria-label="Divisions">
            {regions.map((r) => (
              <li key={r.slug} className="border-b border-ink/15">
                <button
                  type="button"
                  aria-pressed={selected === r.slug}
                  onPointerEnter={() => setHover(r.slug)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(r.slug)}
                  onBlur={() => setHover(null)}
                  onClick={() => choose(selected === r.slug ? null : r.slug)}
                  className={cn("flex w-full items-baseline justify-between py-3 text-left transition-opacity", focus && focus !== r.slug ? "opacity-45" : "opacity-100")}
                  data-cursor="explore"
                >
                  <span className="t-display text-[clamp(1.4rem,2.2vw,2rem)] leading-none">{r.name}</span>
                  <span lang="bn" className="t-bn text-sm opacity-60">
                    {r.nameBn}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-10 min-h-[15rem]" aria-live="polite">
            {region ? (
              <div className="grid grid-cols-5 gap-5">
                <Photo id={region.media[0]} className="col-span-2 aspect-[3/4]" sizes="20vw" target={500} />
                <div className="col-span-3">
                  <p className="t-kicker opacity-60">{region.name} Division</p>
                  <p className="mt-2 leading-snug">{region.summary}</p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {region.character.map((c) => (
                      <li key={c} className="t-coord border border-ink/25 px-2 py-1">
                        {c}
                      </li>
                    ))}
                  </ul>
                  {selected && (
                    <Link href={`/map?region=${region.slug}`} className="t-kicker link-underline mt-4 inline-block">
                      Open on the full map →
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <p className="t-kicker opacity-50">Select a division</p>
            )}
          </div>
        </div>
        <div className="relative col-span-12 h-[80svh] bg-ink lg:sticky lg:top-0 lg:col-span-7 lg:h-[100svh]">
          <BangladeshMap
            camera={camera}
            divisions
            divisionLabels
            activeDivision={focus}
            onDivisionHover={setHover}
            onDivisionClick={(id) => choose(selected === id ? null : id)}
            layers={{ base: true, rivers: true, cities: true, heritage: !!selected, nature: !!selected, culture: !!selected, future: !!selected }}
            places={selected ? regionPlaces : places.filter((p) => p.kind === "city")}
            visitedIds={visited}
            onPlaceClick={(p, el) => openPlace(p, el)}
            relief={0.35}
            ariaLabel="Divisions of Bangladesh"
          />
          {selected && (
            <button type="button" onClick={() => choose(null)} className="t-kicker absolute right-4 top-20 border border-paper/40 bg-ink/60 px-3 py-2 text-paper">
              ← Whole country
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
