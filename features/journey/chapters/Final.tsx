"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { BangladeshMap, LAYER_COLOR } from "@/components/map/BangladeshMap";
import { useMapCamera } from "@/components/map/useMapCamera";
import { ChapterLabel } from "@/components/type/ChapterLabel";
import { cities } from "@/content/cities";
import { useExperience } from "@/features/experience/ExperienceProvider";
import { GEO, countryCamera, project } from "@/lib/geo";
import { bestSrc, getMedia } from "@/lib/media";
import { clamp, lerp } from "@/lib/utils";
import { useScrollProgress } from "../useScrollProgress";

const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const FRAGMENTS = ["padma-boatman", "sixty-dome", "tea-srimangal", "kacchi", "jamdani-weaving", "coxs-bazar", "lalbagh-pari-bibi", "ratargul", "parliament", "sundarbans-tiger"];

/**
 * SIGNATURE 05 — THE FINAL ZOOM-OUT.
 * Every place you explored becomes a point; rivers connect them; cities, heritage and nature
 * appear; photograph fragments surface; the camera pulls back until everything is BANGLADESH.
 */
export function Final() {
  const root = useRef<HTMLElement>(null);
  const layer = useRef<SVGGElement>(null);
  const camera = useMapCamera();
  const { places, visited, scrollTo } = useExperience();
  const dhaka = project(cities[0].coordinates);

  const pts = useMemo(() => places.filter((p) => p.layer !== "history"), [places]);
  const explored = visited.size > 0 ? pts.filter((p) => visited.has(p.id)) : [];

  const onProgress = (p: number) => {
    const full = countryCamera(camera.aspect(), 1.12);
    const z = seg(p, 0.05, 0.86);
    const e = 1 - Math.pow(1 - z, 3);
    camera.jumpTo({ cx: lerp(dhaka[0], full.cx, e), cy: lerp(dhaka[1], full.cy, e), w: lerp(90, full.w, e) });
    const g = layer.current;
    if (!g) return;
    g.style.setProperty("--p-points", String(seg(p, 0.02, 0.14)));
    g.style.setProperty("--p-rivers", String(seg(p, 0.12, 0.4)));
    g.style.setProperty("--p-cities", String(seg(p, 0.3, 0.4)));
    g.style.setProperty("--p-heritage", String(seg(p, 0.38, 0.48)));
    g.style.setProperty("--p-nature", String(seg(p, 0.46, 0.56)));
    g.style.setProperty("--p-photos", String(seg(p, 0.5, 0.62) * (1 - seg(p, 0.76, 0.86))));
    g.style.setProperty("--p-fill", String(seg(p, 0.78, 0.93)));
    root.current?.style.setProperty("--p-title", String(seg(p, 0.88, 0.98)));
  };
  useScrollProgress(root, 1, onProgress);
  useEffect(() => onProgress(0), []); // eslint-disable-line react-hooks/exhaustive-deps

  const layerVar = (layer: string) => (layer === "cities" ? "--p-cities" : layer === "heritage" ? "--p-heritage" : layer === "nature" ? "--p-nature" : "--p-points");

  return (
    <section ref={root} id="chapter-final" data-chapter="final" aria-labelledby="final-title" className="relative h-[520svh] bg-[#07090a] text-paper">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          <BangladeshMap camera={camera} layers={{ base: false, rivers: false }} ariaLabel="All the places of the journey, becoming Bangladesh">
            <g ref={layer}>
              <path d={GEO.outline} fill="#d9c7a3" style={{ fillOpacity: "calc(var(--p-fill, 0) * 0.16)" }} stroke="#e9dcc0" strokeWidth={1.2} vectorEffect="non-scaling-stroke" strokeOpacity={0.9} />
              {GEO.rivers.map((r) => (
                <path
                  key={r.id}
                  d={r.path}
                  pathLength={1}
                  fill="none"
                  stroke="#8cc7da"
                  strokeLinecap="round"
                  style={{ strokeDasharray: 1, strokeDashoffset: "calc(1 - var(--p-rivers, 0))", strokeWidth: "calc(var(--mu, 1) * 1.6)" }}
                />
              ))}
              {pts.map((p) => {
                const [x, y] = project(p.coordinates);
                const mine = visited.has(p.id);
                return (
                  <g key={p.id} style={{ transform: `translate(${x}px, ${y}px) scale(var(--mu, 1))`, opacity: `var(${layerVar(p.layer)}, 0)` }}>
                    {mine && <circle r={9} fill={LAYER_COLOR[p.layer]} opacity={0.25} />}
                    <circle r={p.kind === "city" ? 4.5 : mine ? 3.6 : 2.4} fill={LAYER_COLOR[p.layer]} />
                    {p.kind === "city" && (
                      <text x={8} y={4} fontSize={11} fill="#f3ede1" className="t-coord" opacity={0.85}>
                        {p.name}
                      </text>
                    )}
                  </g>
                );
              })}
              {FRAGMENTS.map((id) => {
                const place = pts.find((p) => p.media === id);
                const m = getMedia(id);
                if (!place || !m) return null;
                const [x, y] = project(place.coordinates);
                return (
                  <g key={id} style={{ transform: `translate(${x}px, ${y}px) scale(var(--mu, 1))`, opacity: "var(--p-photos, 0)" }}>
                    <image href={bestSrc(m, 500)} x={12} y={-70} width={96} height={64} preserveAspectRatio="xMidYMid slice" />
                    <rect x={12} y={-70} width={96} height={64} fill="none" stroke="#f3ede1" strokeOpacity={0.5} strokeWidth={0.6} />
                  </g>
                );
              })}
            </g>
          </BangladeshMap>
        </div>

        <div className="gutter pointer-events-none absolute left-0 top-20">
          <ChapterLabel id="final" />
          <p className="t-coord mt-3 opacity-60">{explored.length > 0 ? `You explored ${explored.length} place${explored.length === 1 ? "" : "s"} — they glow on the map.` : "Every place on the journey, together."}</p>
        </div>

        <div className="gutter absolute inset-x-0 bottom-0 pb-[10svh]" style={{ opacity: "var(--p-title, 0)", transform: "translateY(calc((1 - var(--p-title, 0)) * 40px))" }}>
          <h2 id="final-title" className="t-display leading-[0.85]" style={{ fontSize: "var(--step-6)" }}>
            Digital
            <br />
            Bangladesh
          </h2>
          <p className="mt-6 max-w-[40ch] uppercase tracking-[0.12em]">A living journey through land, water, history &amp; people.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/map" className="btn-explore" data-cursor="map" data-cursor-label="Explore">
              <span>Explore again</span>
              <span aria-hidden>→</span>
            </Link>
            <button type="button" className="btn-explore" onClick={() => scrollTo(0)} data-cursor="explore" data-cursor-label="Start">
              <span>Start journey</span>
              <span aria-hidden>↑</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
