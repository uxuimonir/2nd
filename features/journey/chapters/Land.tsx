"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { BangladeshMap } from "@/components/map/BangladeshMap";
import { useMapCamera } from "@/components/map/useMapCamera";
import { ChapterLabel } from "@/components/type/ChapterLabel";
import { TextReveal } from "@/components/type/TextReveal";
import { useInView, useIsMobile, useNearViewport, useReducedMotion, useWebGL } from "@/hooks/useMedia";
import { cn } from "@/lib/utils";
import { STAGES } from "@/features/terrain/TerrainScene";
import { useScrollProgress } from "../useScrollProgress";

const TerrainScene = dynamic(() => import("@/features/terrain/TerrainScene"), { ssr: false });

const STEPS = [
  { k: "Map", t: "A country drawn in one line", d: "147,570 square kilometres between the Himalayan foothills and the Bay of Bengal, bordered by India and Myanmar." },
  { k: "Rivers", t: "Veined with water", d: "The Padma, Jamuna and Meghna cross the country and meet before the sea. Hundreds of rivers and channels branch between them." },
  { k: "Elevation", t: "Almost level", d: "Most of the country is low floodplain, only a few metres above the sea. The older Barind and Madhupur tracts rise gently above it." },
  { k: "Terrain", t: "Hills at the edges", d: "Relief gathers in the east: the Sylhet hills and the Chittagong Hill Tracts, where the highest peaks stand near the Myanmar border." },
  { k: "Settlement", t: "A land lived in", d: "On this plain, cities grew beside rivers — from Rangpur in the north to Chattogram on the coast." },
];

/**
 * 02 — THE LAND. Signature 01: 2D map → geographic layers → elevation → terrain.
 * WebGL heightfield from real elevation data, with an SVG/CSS-3D fallback.
 */
export function Land() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const webgl = useWebGL();
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const near = useNearViewport(root, "800px");
  const visible = useInView(root, "200px");
  const { progress, step } = useScrollProgress(root, STEPS.length);
  const use3D = webgl === true && !reduced;

  return (
    <section ref={root} id="chapter-land" data-chapter="land" aria-labelledby="land-title" className="relative h-[520svh] bg-[#1a130d] text-paper">
      <div ref={stage} className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          {use3D ? near && <TerrainScene progress={progress} active={visible} mobile={mobile} /> : <FlatLand progress={progress} step={step} />}
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(26,19,13,.85)_100%)]" />

        <div className="gutter pointer-events-none relative flex h-full flex-col justify-between py-24">
          <div className="max-w-xl">
            <ChapterLabel id="land" />
            <TextReveal as="h2" id="land-title" text="The Land" className="t-display mt-4" style={{ fontSize: "var(--step-5)" }} />
            <p lang="bn" className="t-bn opacity-60" style={{ fontSize: "var(--step-2)" }}>
              ভূমি
            </p>
          </div>

          <div className="grid grid-cols-12 items-end gap-x-[var(--col-gap)]">
            <ol className="col-span-12 mb-6 flex gap-1 md:col-span-5 md:mb-0 md:flex-col md:gap-2" aria-label="Layers">
              {STEPS.map((s, i) => (
                <li key={s.k} className={cn("t-kicker flex items-center gap-3 transition-opacity duration-700", i === step ? "opacity-100" : "opacity-35")}>
                  <span className={cn("h-px bg-current transition-all duration-700", i === step ? "w-10" : "w-4")} />
                  <span className={cn(i !== step && "hidden md:inline")}>
                    {String(i + 1).padStart(2, "0")} {s.k}
                  </span>
                </li>
              ))}
            </ol>
            <div className="col-span-12 md:col-span-5 md:col-start-8" aria-live="polite">
              <p className="t-display" style={{ fontSize: "var(--step-3)" }}>
                {STEPS[step].t}
              </p>
              <p className="t-body mt-3 opacity-80">{STEPS[step].d}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** 2D fallback: the same five layers in SVG, with a CSS perspective tilt for the terrain stage. */
function FlatLand({ progress, step }: { progress: React.MutableRefObject<number>; step: number }) {
  const camera = useMapCamera();
  const tilt = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      setP((prev) => (Math.abs(prev - progress.current) > 0.004 ? progress.current : prev));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [progress]);
  const s = STAGES(p);
  return (
    <div className="absolute inset-0 grid place-items-center [perspective:1400px]">
      <div
        ref={tilt}
        className="h-[92%] w-full"
        style={{ transform: `rotateX(${s.tilt * 48}deg) scale(${1 + s.tilt * 0.15})`, transformOrigin: "50% 70%", transition: "transform .2s linear" }}
      >
        <BangladeshMap camera={camera} layers={{ base: true, rivers: s.rivers > 0.5 }} relief={s.elev * 0.95} contours={step >= 2} flow={false} divisions={step === 0} ariaLabel="Bangladesh — land, rivers and relief" />
      </div>
    </div>
  );
}
