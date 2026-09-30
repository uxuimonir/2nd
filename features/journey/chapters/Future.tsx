"use client";
import { useId, useMemo, useState } from "react";
import { BangladeshMap } from "@/components/map/BangladeshMap";
import { useMapCamera } from "@/components/map/useMapCamera";
import { ChapterLabel } from "@/components/type/ChapterLabel";
import { TextReveal } from "@/components/type/TextReveal";
import { futureFacts } from "@/content/facts";
import { useExperience } from "@/features/experience/ExperienceProvider";
import { GEO, VB_H, VB_W } from "@/lib/geo";
import type { Story } from "@/types/content";

/**
 * 15 — THE FUTURE. A delta that adapts.
 * The slider highlights land below a chosen height using the real elevation model — a way to feel
 * how close to the water much of the country lives. (Elevation-only view; not a flood forecast.)
 */
export function Future({ story }: { story?: Story }) {
  const camera = useMapCamera();
  const { places, openPlace } = useExperience();
  const [meters, setMeters] = useState(5);
  const uid = useId().replace(/:/g, "");
  const cap = GEO.elevation.capMeters;
  // sqrt-scaled heightmap: value = sqrt(m / cap)
  const table = useMemo(() => {
    const n = 256;
    const cut = Math.sqrt(meters / cap);
    return Array.from({ length: n }, (_, i) => (i / (n - 1) <= cut ? 1 : 0)).join(" ");
  }, [meters, cap]);

  return (
    <section id="chapter-future" data-chapter="future" aria-labelledby="future-title" className="relative bg-river-deep text-paper">
      <div className="grid min-h-[100svh] grid-cols-12">
        <div className="gutter col-span-12 flex flex-col justify-center py-[var(--section-pad)] lg:col-span-5">
          <ChapterLabel id="future" />
          <TextReveal as="h2" id="future-title" text="A delta that adapts" className="t-display mt-5" style={{ fontSize: "var(--step-4)" }} />
          {story?.body.map((b, i) => (
            <p key={i} className="t-body mt-5 opacity-85">
              {b}
            </p>
          ))}
          <div className="mt-10 border-t border-white/15 pt-6">
            <label htmlFor="water-level" className="t-kicker flex items-baseline justify-between opacity-80">
              <span>Land below</span>
              <span className="t-display text-4xl tabular-nums normal-case tracking-normal">{meters} m</span>
            </label>
            <input
              id="water-level"
              type="range"
              min={1}
              max={20}
              step={1}
              value={meters}
              onChange={(e) => setMeters(Number(e.target.value))}
              className="mt-4 w-full accent-[#8cc7da]"
              aria-describedby="water-note"
            />
            <p id="water-note" className="t-coord mt-3 opacity-55">
              Elevation-only view from open terrain data (≈ 1 km grid). Illustrative — not a flood forecast.
            </p>
          </div>
          <dl className="mt-10 grid gap-6 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {futureFacts.map((f) => (
              <div key={f.label} className="border-t border-white/15 pt-3">
                <dt className="t-coord opacity-60">{f.label}</dt>
                <dd className="mt-1 text-lg leading-tight">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative col-span-12 h-[85svh] lg:sticky lg:top-0 lg:col-span-7 lg:h-[100svh]">
          <BangladeshMap
            camera={camera}
            landFill="#1b2a24"
            outlineColor="#8cc7da"
            places={places.filter((p) => p.layer === "future")}
            layers={{ base: true, rivers: true, future: true }}
            onPlaceClick={(p, el) => openPlace(p, el)}
            ariaLabel={`Map highlighting land below ${meters} metres elevation`}
          >
            <defs>
              <clipPath id={`fclip-${uid}`}>
                <path d={GEO.outline} />
              </clipPath>
              <filter id={`low-${uid}`} colorInterpolationFilters="sRGB">
                <feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.78  0 0 0 0 0.86  1 0 0 0 0" />
                <feComponentTransfer>
                  <feFuncA type="discrete" tableValues={table} />
                </feComponentTransfer>
              </filter>
            </defs>
            <image href={GEO.elevation.src} x={0} y={0} width={VB_W} height={VB_H} preserveAspectRatio="none" clipPath={`url(#fclip-${uid})`} filter={`url(#low-${uid})`} opacity={0.75} />
          </BangladeshMap>
        </div>
      </div>
    </section>
  );
}
