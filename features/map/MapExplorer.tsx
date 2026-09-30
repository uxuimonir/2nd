"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { BangladeshMap, LAYER_COLOR, zoomMap } from "@/components/map/BangladeshMap";
import { useMapCamera } from "@/components/map/useMapCamera";
import { Photo } from "@/components/media/Photo";
import { useExperience } from "@/features/experience/ExperienceProvider";
import { useFinePointer } from "@/hooks/useMedia";
import { countryCamera, divisionGeo, fitCamera, formatCoord, project } from "@/lib/geo";
import { KIND_LABEL } from "@/lib/places";
import { cn } from "@/lib/utils";
import type { MapLayerId, Place } from "@/types/content";

const LAYERS: { id: MapLayerId; label: string; bn: string }[] = [
  { id: "base", label: "Base", bn: "ভূমি" },
  { id: "rivers", label: "Rivers", bn: "নদী" },
  { id: "cities", label: "Cities", bn: "নগর" },
  { id: "heritage", label: "Heritage", bn: "ঐতিহ্য" },
  { id: "nature", label: "Nature", bn: "প্রকৃতি" },
  { id: "culture", label: "Culture", bn: "সংস্কৃতি" },
  { id: "history", label: "History", bn: "ইতিহাস" },
  { id: "future", label: "Future", bn: "ভবিষ্যৎ" },
];

/** The full editorial map: zoom, pan, drag, hover, select, explore. */
export function MapExplorer({ region, focus }: { region?: string; focus?: string }) {
  const camera = useMapCamera();
  const { places, openPlace, visited } = useExperience();
  const fine = useFinePointer();
  const wrap = useRef<HTMLDivElement>(null);
  const [layers, setLayers] = useState<Record<MapLayerId, boolean>>({ base: true, rivers: true, cities: true, heritage: true, nature: true, culture: false, history: false, future: false });
  const [relief, setRelief] = useState(true);
  const [divisions, setDivisions] = useState(true);
  const [hover, setHover] = useState<{ p: Place; x: number; y: number } | null>(null);
  const [sheet, setSheet] = useState<Place | null>(null);
  const [panel, setPanel] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const g = region ? divisionGeo(region) : null;
      const f = focus ? places.find((p) => p.id === focus) : null;
      if (f) {
        const [x, y] = project(f.coordinates);
        camera.setCamera({ cx: x, cy: y, w: 200 }, { duration: 1.8 });
        setLayers((l) => ({ ...l, [f.layer]: true }));
      } else if (g) camera.setCamera(fitCamera(g.bbox, camera.aspect(), 1.3), { duration: 1.8 });
      else camera.setCamera(countryCamera(camera.aspect()), { duration: 0 });
    }, 200);
    return () => clearTimeout(t);
  }, [region, focus, places, camera]);

  const counts = useMemo(() => {
    const c: Partial<Record<MapLayerId, number>> = {};
    places.forEach((p) => (c[p.layer] = (c[p.layer] ?? 0) + 1));
    return c;
  }, [places]);

  const onHover = (p: Place | null, el?: Element) => {
    if (!fine || !p || !el || !wrap.current) return setHover(null);
    const r = el.getBoundingClientRect();
    const w = wrap.current.getBoundingClientRect();
    setHover({ p, x: r.left + r.width / 2 - w.left, y: r.top - w.top });
  };

  return (
    <div ref={wrap} className="relative h-[100svh] overflow-hidden bg-[#0b0d0e] text-paper">
      <BangladeshMap
        camera={camera}
        interactive
        layers={layers}
        places={places}
        divisions={divisions}
        divisionLabels={divisions}
        relief={relief ? 0.7 : 0}
        contours={relief}
        visitedIds={visited}
        onPlaceHover={onHover}
        onPlaceClick={(p, el) => (fine ? openPlace(p, el) : setSheet(p))}
        ariaLabel="Interactive map of Bangladesh. Drag to pan, scroll or use plus and minus to zoom, Tab to move between places."
      />

      {/* hover card: location · region · image · short story */}
      {hover && (
        <div className="pointer-events-none absolute z-10 w-72 -translate-x-1/2 -translate-y-full pb-4" style={{ left: hover.x, top: hover.y }} role="tooltip">
          <div className="overflow-hidden bg-ink/95 shadow-2xl ring-1 ring-white/10">
            <Photo id={hover.p.media} className="aspect-[16/9]" sizes="288px" target={500} decorative />
            <div className="p-4">
              <p className="t-coord opacity-60">
                {KIND_LABEL[hover.p.kind]}
                {hover.p.regionName ? ` · ${hover.p.regionName}` : ""}
              </p>
              <p className="t-display mt-1 text-2xl leading-tight">{hover.p.name}</p>
              <p className="mt-2 line-clamp-3 text-sm opacity-80">{hover.p.summary}</p>
            </div>
          </div>
        </div>
      )}

      {/* controls */}
      <div className="gutter pointer-events-none absolute inset-x-0 top-20 flex items-start justify-between gap-4">
        <div className="pointer-events-auto">
          <h1 className="t-display text-[clamp(2rem,4vw,3.4rem)] leading-none">The map</h1>
          <p lang="bn" className="t-bn opacity-60">
            মানচিত্র
          </p>
          <button type="button" className="t-kicker mt-4 border border-white/30 bg-ink/60 px-3 py-2 md:hidden" aria-expanded={panel} aria-controls="map-layers" onClick={() => setPanel((v) => !v)}>
            Layers
          </button>
          <fieldset id="map-layers" className={cn("mt-4 bg-ink/70 p-4 backdrop-blur md:block", panel ? "block" : "hidden")}>
            <legend className="t-kicker mb-2 opacity-60">Layers</legend>
            <ul className="space-y-1.5">
              {LAYERS.map((l) => (
                <li key={l.id}>
                  <label className="flex cursor-pointer items-center gap-3">
                    <input type="checkbox" checked={layers[l.id]} onChange={() => setLayers((s) => ({ ...s, [l.id]: !s[l.id] }))} className="h-4 w-4 accent-[#d9c7a3]" />
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: LAYER_COLOR[l.id] }} aria-hidden />
                    <span className="t-kicker">{l.label}</span>
                    <span lang="bn" className="t-bn text-xs opacity-50">
                      {l.bn}
                    </span>
                    {counts[l.id] ? <span className="t-coord ml-auto opacity-40">{counts[l.id]}</span> : null}
                  </label>
                </li>
              ))}
              <li className="border-t border-white/10 pt-2">
                <label className="flex cursor-pointer items-center gap-3">
                  <input type="checkbox" checked={relief} onChange={() => setRelief((v) => !v)} className="h-4 w-4 accent-[#d9c7a3]" />
                  <span className="t-kicker">Relief &amp; contours</span>
                </label>
              </li>
              <li>
                <label className="flex cursor-pointer items-center gap-3">
                  <input type="checkbox" checked={divisions} onChange={() => setDivisions((v) => !v)} className="h-4 w-4 accent-[#d9c7a3]" />
                  <span className="t-kicker">Divisions</span>
                </label>
              </li>
            </ul>
          </fieldset>
        </div>
        <div className="pointer-events-auto flex flex-col gap-1" role="group" aria-label="Zoom">
          <button type="button" onClick={() => zoomMap(camera, 0.6)} className="grid h-11 w-11 place-items-center border border-white/30 bg-ink/70 text-xl" aria-label="Zoom in">
            +
          </button>
          <button type="button" onClick={() => zoomMap(camera, 1.6)} className="grid h-11 w-11 place-items-center border border-white/30 bg-ink/70 text-xl" aria-label="Zoom out">
            −
          </button>
          <button type="button" onClick={() => camera.setCamera(countryCamera(camera.aspect()), { duration: 1.2 })} className="t-coord grid h-11 w-11 place-items-center border border-white/30 bg-ink/70" aria-label="Show the whole country">
            ⤢
          </button>
        </div>
      </div>

      <p className="t-coord pointer-events-none absolute bottom-4 right-[var(--gutter)] hidden opacity-50 md:block">Drag · scroll to zoom · double-click · arrow keys</p>

      {/* mobile bottom sheet (no hover dependency) */}
      {sheet && (
        <div role="dialog" aria-label={sheet.name} className="absolute inset-x-0 bottom-0 z-20 bg-ink/97 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl">
          <div className="flex gap-4 p-4">
            <Photo id={sheet.media} className="h-24 w-24 shrink-0" sizes="96px" target={500} decorative />
            <div className="min-w-0 flex-1">
              <p className="t-coord opacity-60">
                {KIND_LABEL[sheet.kind]} · {formatCoord(sheet.coordinates)}
              </p>
              <p className="t-display text-2xl leading-tight">{sheet.name}</p>
              <p className="mt-1 line-clamp-2 text-sm opacity-80">{sheet.summary}</p>
            </div>
          </div>
          <div className="flex gap-2 px-4">
            <button type="button" className="btn-explore flex-1 justify-center" onClick={() => { const p = sheet; setSheet(null); openPlace(p); }}>
              <span>Enter</span>
            </button>
            <button type="button" className="btn-explore" onClick={() => setSheet(null)}>
              <span>Close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
