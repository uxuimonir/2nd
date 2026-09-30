"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { BangladeshMap } from "@/components/map/BangladeshMap";
import { useMapCamera } from "@/components/map/useMapCamera";
import { Photo } from "@/components/media/Photo";
import { useExperience } from "@/features/experience/ExperienceProvider";
import { countryCamera, fitCamera, formatCoord, project, riverGeo } from "@/lib/geo";
import { ensureGsap, gsap, prefersReducedMotion } from "@/lib/motion";
import { cn, pad2 } from "@/lib/utils";
import type { River } from "@/types/content";

const FOLLOW_W = 170;

/**
 * SIGNATURE 02 — FOLLOW THE RIVER.
 * Choosing a river dims the rest, the camera travels along its real course from stop to stop,
 * and each stop brings up its place, photograph and story.
 */
export function RiverJourney({ rivers, initial, compact = false }: { rivers: River[]; initial?: string | null; compact?: boolean }) {
  const camera = useMapCamera();
  const { places, openPlace } = useExperience();
  const [active, setActive] = useState<string | null>(null);
  const [stop, setStop] = useState(0);
  const [playing, setPlaying] = useState(false);
  const boat = useRef<SVGGElement>(null);
  const along = useRef({ i: 0 });
  const tween = useRef<gsap.core.Tween | null>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const river = rivers.find((r) => r.slug === active) ?? null;

  const pointAt = (pts: number[][], i: number) => {
    const a = Math.max(0, Math.min(pts.length - 1, Math.floor(i)));
    const b = Math.min(pts.length - 1, a + 1);
    const t = i - a;
    return [pts[a][0] + (pts[b][0] - pts[a][0]) * t, pts[a][1] + (pts[b][1] - pts[a][1]) * t];
  };

  const travel = useCallback(
    (r: River, stopIndex: number, fromStart = false) => {
      ensureGsap();
      const g = riverGeo(r.geoId);
      if (!g) return;
      const pts = g.points;
      const target = project(r.stops[stopIndex].coordinates);
      let idx = 0;
      let best = Infinity;
      pts.forEach(([x, y], i) => {
        const d = (x - target[0]) ** 2 + (y - target[1]) ** 2;
        if (d < best) {
          best = d;
          idx = i;
        }
      });
      tween.current?.kill();
      if (fromStart) along.current.i = 0;
      const reduced = prefersReducedMotion();
      const dist = Math.abs(idx - along.current.i);
      const place = () => {
        const [x, y] = pointAt(pts, along.current.i);
        camera.jumpTo({ cx: x, cy: y, w: FOLLOW_W });
        boat.current?.setAttribute("transform", `translate(${x} ${y})`);
      };
      if (reduced) {
        along.current.i = idx;
        place();
        return;
      }
      tween.current = gsap.to(along.current, { i: idx, duration: Math.min(4, 1.2 + dist * 0.035), ease: "sine.inOut", onUpdate: place });
    },
    [camera],
  );

  const select = useCallback(
    (slug: string | null) => {
      setPlaying(false);
      setActive(slug);
      setStop(0);
      tween.current?.kill();
      const r = rivers.find((x) => x.slug === slug);
      if (!r) {
        camera.setCamera(countryCamera(camera.aspect()), { duration: 1.4 });
        return;
      }
      const g = riverGeo(r.geoId)!;
      const xs = g.points.map((p) => p[0]);
      const ys = g.points.map((p) => p[1]);
      const bbox = [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)];
      // overview of the whole course, then drop to the water and follow it
      camera.setCamera(fitCamera(bbox, camera.aspect(), 1.35), {
        duration: 1.3,
        onComplete: () => {
          along.current.i = 0;
          const [x, y] = g.points[0];
          boat.current?.setAttribute("transform", `translate(${x} ${y})`);
          camera.setCamera({ cx: x, cy: y, w: FOLLOW_W }, { duration: 1.1, onComplete: () => travel(r, 0) });
        },
      });
    },
    [rivers, camera, travel],
  );

  useEffect(() => {
    if (initial && rivers.some((r) => r.slug === initial)) {
      const t = setTimeout(() => select(initial), 600);
      return () => clearTimeout(t);
    }
  }, [initial, rivers, select]);

  const go = useCallback(
    (i: number) => {
      if (!river) return;
      const n = (i + river.stops.length) % river.stops.length;
      setStop(n);
      travel(river, n, n === 0 && i >= river.stops.length);
    },
    [river, travel],
  );

  // photograph emerges at each stop
  useEffect(() => {
    if (!photoRef.current || prefersReducedMotion()) return;
    ensureGsap();
    gsap.fromTo(photoRef.current, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.2, ease: "power3.inOut", delay: 0.3 });
  }, [active, stop]);

  // autoplay: follow the whole river
  useEffect(() => {
    if (!playing || !river) return;
    const t = setTimeout(() => go(stop + 1), 6500);
    return () => clearTimeout(t);
  }, [playing, river, stop, go]);

  const s = river?.stops[stop];
  const refPlace = s?.ref ? places.find((p) => p.kind === s.ref!.kind && p.slug === s.ref!.slug && p.layer !== "history") : undefined;

  return (
    <div className={cn("relative grid grid-cols-12", compact ? "min-h-[100svh]" : "min-h-[100svh]")}>
      <div className="relative col-span-12 h-[58svh] lg:sticky lg:top-0 lg:col-span-7 lg:h-[100svh]">
        <BangladeshMap camera={camera} activeRiver={active} onRiverClick={(id) => select(rivers.find((r) => r.geoId === id)?.slug ?? null)} ariaLabel={river ? `Following the ${river.name}` : "Rivers of Bangladesh"} landFill="#10222b" outlineColor="#6d8f99">
          {river &&
            river.stops.map((st, i) => {
              const [x, y] = project(st.coordinates);
              return (
                <g key={st.label} style={{ transform: `translate(${x}px, ${y}px) scale(var(--mu, 1))` }}>
                  <circle r={i === stop ? 6 : 4} fill={i === stop ? "#f3ede1" : "#10222b"} stroke="#f3ede1" strokeWidth={1.5} style={{ transition: "r .4s" }} />
                  {i === stop && <circle r={6} fill="none" stroke="#f3ede1" className="pulse-ring" />}
                  <text x={10} y={4} fontSize={11} fill="#f3ede1" fillOpacity={i === stop ? 1 : 0.6} className="t-coord" paintOrder="stroke" stroke="#10222b" strokeWidth={3}>
                    {st.label}
                  </text>
                </g>
              );
            })}
          <g ref={boat} style={{ opacity: river ? 1 : 0, transition: "opacity .6s" }}>
            <g style={{ transform: "scale(var(--mu, 1))" }}>
              <circle r={9} fill="#8cc7da" opacity={0.25} />
              <circle r={3.5} fill="#fff" />
            </g>
          </g>
        </BangladeshMap>
        <p className="t-coord pointer-events-none absolute bottom-4 left-[var(--gutter)] opacity-60">
          {river ? `${river.name} · ${river.nameBn}` : "Select a river — or tap one on the map"}
        </p>
      </div>

      <div className="gutter relative col-span-12 flex flex-col justify-center py-12 lg:col-span-5 lg:min-h-[100svh]">
        {!river ? (
          <div>
            <p className="t-kicker mb-6 opacity-70">Follow the river</p>
            <ul className="border-t border-white/15" aria-label="Rivers">
              {rivers.map((r, i) => (
                <li key={r.slug} className="border-b border-white/15">
                  <button type="button" onClick={() => select(r.slug)} className="group flex w-full items-baseline gap-4 py-4 text-left" data-cursor="explore" data-cursor-label="Follow">
                    <span className="t-coord w-8 opacity-50">{pad2(i + 1)}</span>
                    <span className="t-display flex-1 text-[clamp(1.8rem,3vw,2.8rem)] leading-none transition-transform duration-500 group-hover:translate-x-2">{r.name}</span>
                    <span lang="bn" className="t-bn opacity-50">
                      {r.nameBn}
                    </span>
                    <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: r.color }} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div
            tabIndex={0}
            aria-label={`${river.name} journey, stop ${stop + 1} of ${river.stops.length}. Use left and right arrow keys to move along the river.`}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") go(stop + 1);
              if (e.key === "ArrowLeft") go(stop - 1);
              if (e.key === "Escape") select(null);
            }}
            className="outline-none"
          >
            <button type="button" onClick={() => select(null)} className="t-kicker mb-8 opacity-70 hover:opacity-100">
              ← All rivers
            </button>
            <p className="t-kicker opacity-70">
              {river.name} · stop {stop + 1} / {river.stops.length}
            </p>
            <h3 className="t-display mt-3" style={{ fontSize: "var(--step-4)" }}>
              {s!.label}
            </h3>
            <p className="t-coord mt-2 opacity-60">{formatCoord(s!.coordinates)}</p>
            <div ref={photoRef} className="relative mt-6 aspect-[4/3] w-full overflow-hidden" data-cursor={refPlace ? "view" : undefined}>
              <Photo key={s!.media ?? river.media[0]} id={s!.media ?? river.media[0]} className="absolute inset-0" sizes="(min-width:1024px) 40vw, 100vw" target={960} />
            </div>
            <p className="t-body mt-5 opacity-90" aria-live="polite">
              {s!.note}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => go(stop - 1)} className="btn-explore" aria-label="Previous stop">
                <span>←</span>
              </button>
              <button type="button" onClick={() => go(stop + 1)} className="btn-explore" data-cursor="explore" data-cursor-label="Downstream">
                <span>Downstream</span>
                <span aria-hidden>→</span>
              </button>
              {!prefersReducedMotionSafe() && (
                <button type="button" onClick={() => setPlaying((p) => !p)} aria-pressed={playing} className="btn-explore">
                  <span>{playing ? "Pause" : "Follow all"}</span>
                </button>
              )}
              {refPlace && (
                <button type="button" onClick={(e) => openPlace(refPlace, e.currentTarget)} className="t-kicker link-underline ml-1" data-cursor="discover">
                  Enter {refPlace.name} ↗
                </button>
              )}
            </div>
            <details className="mt-10 border-t border-white/15 pt-4">
              <summary className="t-kicker cursor-pointer opacity-70">About the {river.name}</summary>
              <div className="mt-4 space-y-4">
                {river.description.map((d, i) => (
                  <p key={i} className="t-body opacity-80">
                    {d}
                  </p>
                ))}
                <p className="t-coord opacity-60">{river.course}</p>
                <Link href={`/rivers?river=${river.slug}`} className="t-kicker link-underline">
                  Open river page →
                </Link>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

function prefersReducedMotionSafe() {
  return typeof window !== "undefined" && prefersReducedMotion();
}
