"use client";
import { memo, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { GEO, VB_H, VB_W, project } from "@/lib/geo";
import { cn, clamp } from "@/lib/utils";
import type { MapLayerId, Place } from "@/types/content";
import type { MapCamera } from "./useMapCamera";

export const LAYER_COLOR: Record<MapLayerId, string> = {
  base: "#d9c7a3",
  rivers: "#8cc7da",
  cities: "#f3ede1",
  heritage: "#d0643a",
  nature: "#8fb573",
  culture: "#e2b35f",
  history: "#c0392b",
  future: "#5fb3c9",
};

const RIVER_COLOR: Record<string, string> = {
  padma: "#6fb7cf",
  jamuna: "#9fd3e6",
  meghna: "#4b93bd",
  surma: "#8fa6d6",
  teesta: "#7cc1b4",
  "old-brahmaputra": "#7fa7c9",
  karnaphuli: "#5aa0c8",
  pasur: "#3f86ad",
  buriganga: "#d08a5a",
};

const DHAKA_BOX = { lon: [90.25, 90.55], lat: [23.6, 23.95] };
const isMinor = (p: Place) =>
  p.kind !== "city" &&
  p.coordinates[0] > DHAKA_BOX.lon[0] &&
  p.coordinates[0] < DHAKA_BOX.lon[1] &&
  p.coordinates[1] > DHAKA_BOX.lat[0] &&
  p.coordinates[1] < DHAKA_BOX.lat[1];

export interface BangladeshMapProps {
  camera: MapCamera;
  layers?: Partial<Record<MapLayerId, boolean>>;
  places?: Place[];
  activeRiver?: string | null;
  dimOtherRivers?: boolean;
  onRiverClick?: (id: string) => void;
  divisions?: boolean;
  divisionLabels?: boolean;
  activeDivision?: string | null;
  onDivisionHover?: (id: string | null) => void;
  onDivisionClick?: (id: string) => void;
  contours?: boolean;
  relief?: number;
  selectedPlaceId?: string | null;
  visitedIds?: Set<string>;
  onPlaceClick?: (p: Place, el: Element) => void;
  onPlaceHover?: (p: Place | null, el?: Element) => void;
  flow?: boolean;
  interactive?: boolean;
  outlineDraw?: boolean;
  className?: string;
  children?: ReactNode;
  ariaLabel?: string;
  landFill?: string;
  outlineColor?: string;
}

/**
 * The editorial map of Bangladesh.
 * Real geography (Natural Earth, geoBoundaries, Terrarium elevation) in a custom projection;
 * the camera is driven imperatively through useMapCamera so cinematic moves stay smooth.
 */
export const BangladeshMap = memo(function BangladeshMap({
  camera,
  layers = { base: true, rivers: true },
  places = [],
  activeRiver,
  dimOtherRivers = true,
  onRiverClick,
  divisions = false,
  divisionLabels = false,
  activeDivision,
  onDivisionHover,
  onDivisionClick,
  contours = false,
  relief = 0,
  selectedPlaceId,
  visitedIds,
  onPlaceClick,
  onPlaceHover,
  flow = true,
  interactive = false,
  className,
  children,
  ariaLabel = "Map of Bangladesh",
  landFill = "#1a1d19",
  outlineColor = "#d9c7a3",
}: BangladeshMapProps) {
  const uid = useId().replace(/:/g, "");
  const [contourPaths, setContourPaths] = useState<{ level: number; path: string }[] | null>(null);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (!contours || contourPaths) return;
    let alive = true;
    fetch(GEO.contoursSrc)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && d && setContourPaths(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [contours, contourPaths]);

  useEffect(() => camera.onCamera((c) => setZoomed(c.w < 420)), [camera]);

  useInteractive(camera, interactive);

  const visiblePlaces = useMemo(() => places.filter((p) => layers[p.layer]), [places, layers]);

  return (
    <svg
      ref={camera.svgRef}
      role="img"
      aria-label={ariaLabel}
      className={cn("block h-full w-full select-none", zoomed && "is-zoomed", interactive && "touch-none", className)}
      preserveAspectRatio="xMidYMid meet"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      data-cursor={interactive ? "map" : undefined}
    >
      <defs>
        <clipPath id={`bd-${uid}`}>
          <path d={GEO.outline} />
        </clipPath>
        <filter id={`relief-${uid}`} colorInterpolationFilters="sRGB">
          {/* R channel = sqrt-scaled height → warm hypsometric tint */}
          <feColorMatrix type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 1 0" />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.10 0.26 0.55 0.78 0.93" />
            <feFuncG type="table" tableValues="0.12 0.27 0.45 0.62 0.86" />
            <feFuncB type="table" tableValues="0.10 0.18 0.28 0.42 0.74" />
          </feComponentTransfer>
        </filter>
        <radialGradient id={`glow-${uid}`}>
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <style>{`
        .m-marker { transition: opacity .6s var(--ease-out-expo); }
        svg:not(.is-zoomed) .m-marker.minor { opacity: 0; pointer-events: none; }
        .m-marker:focus-visible .m-dot { stroke: #fff; stroke-width: 2; }
        .m-marker .m-label { opacity: 0; transition: opacity .4s; }
        .m-marker:hover .m-label, .m-marker:focus-visible .m-label, .m-marker.is-selected .m-label, .m-marker.always .m-label { opacity: 1; }
        .m-div { transition: fill .5s var(--ease-out-expo), stroke-opacity .5s; }
      `}</style>

      {layers.base !== false && (
        <g>
          <path d={GEO.outline} fill={landFill} />
          {relief > 0 && (
            <image
              href={GEO.elevation.src}
              x={0}
              y={0}
              width={VB_W}
              height={VB_H}
              preserveAspectRatio="none"
              clipPath={`url(#bd-${uid})`}
              filter={`url(#relief-${uid})`}
              opacity={relief}
              style={{ transition: "opacity 1s" }}
            />
          )}
          {contours && contourPaths && (
            <g clipPath={`url(#bd-${uid})`} fill="none">
              {contourPaths.map((c, i) => (
                <path key={c.level} d={c.path} stroke={i === 0 ? "#6b4a2f" : "#b5532f"} strokeOpacity={0.35 + i * 0.12} strokeWidth={0.8} vectorEffect="non-scaling-stroke" />
              ))}
            </g>
          )}
          {divisions &&
            GEO.divisions.map((d) => (
              <path
                key={d.id}
                d={d.path}
                className="m-div"
                fill={activeDivision === d.id ? "rgba(217,199,163,0.16)" : "rgba(0,0,0,0)"}
                stroke="#d9c7a3"
                strokeOpacity={activeDivision === d.id ? 0.9 : 0.28}
                strokeWidth={activeDivision === d.id ? 1.4 : 0.7}
                vectorEffect="non-scaling-stroke"
                onPointerEnter={onDivisionHover ? () => onDivisionHover(d.id) : undefined}
                onPointerLeave={onDivisionHover ? () => onDivisionHover(null) : undefined}
                onClick={onDivisionClick ? () => onDivisionClick(d.id) : undefined}
                style={{ cursor: onDivisionClick ? "pointer" : undefined }}
                data-cursor={onDivisionClick ? "explore" : undefined}
                data-cursor-label={onDivisionClick ? d.name : undefined}
              />
            ))}
          <path d={GEO.outline} fill="none" stroke={outlineColor} strokeWidth={1.1} strokeOpacity={0.9} vectorEffect="non-scaling-stroke" data-outline />
          {divisionLabels &&
            GEO.divisions.map((d) => (
              <text
                key={d.id}
                style={{ transform: `translate(${d.centroid[0]}px, ${d.centroid[1]}px) scale(var(--mu, 1))` }}
                textAnchor="middle"
                className="t-kicker"
                fontSize={10}
                fill="#f3ede1"
                fillOpacity={activeDivision === d.id ? 1 : 0.55}
                pointerEvents="none"
              >
                {d.name}
              </text>
            ))}
        </g>
      )}

      {layers.rivers !== false && (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {GEO.rivers.map((r) => {
            const active = activeRiver === r.id;
            const dim = dimOtherRivers && activeRiver && !active;
            const color = RIVER_COLOR[r.id] ?? "#8cc7da";
            return (
              <g key={r.id} data-river={r.id} opacity={dim ? 0.22 : 1} style={{ transition: "opacity .8s" }}>
                <path d={r.path} stroke={color} strokeOpacity={0.35} strokeWidth={active ? 6 : 3.2} vectorEffect="non-scaling-stroke" />
                <path
                  d={r.path}
                  stroke={active ? "#ffffff" : color}
                  strokeWidth={active ? 2.2 : 1.4}
                  vectorEffect="non-scaling-stroke"
                  className={flow ? (active ? "river-flow" : "river-flow-slow") : undefined}
                />
                {onRiverClick && (
                  <path
                    d={r.path}
                    stroke="transparent"
                    strokeWidth={16}
                    vectorEffect="non-scaling-stroke"
                    style={{ cursor: "pointer" }}
                    onClick={() => onRiverClick(r.id)}
                    data-cursor="explore"
                    data-cursor-label="Follow"
                  />
                )}
              </g>
            );
          })}
        </g>
      )}

      {children}

      <g>
        {visiblePlaces.map((p) => {
          const [x, y] = project(p.coordinates);
          const selected = selectedPlaceId === p.id;
          const visited = visitedIds?.has(p.id);
          const color = LAYER_COLOR[p.layer];
          const r = p.kind === "city" ? 4.2 : 3.2;
          return (
            <g
              key={p.id}
              role={onPlaceClick ? "button" : undefined}
              tabIndex={onPlaceClick ? 0 : undefined}
              aria-label={onPlaceClick ? `${p.name}${p.regionName ? `, ${p.regionName}` : ""} — ${p.summary}` : undefined}
              className={cn("m-marker", isMinor(p) && "minor", selected && "is-selected", p.kind === "city" && "always")}
              style={{ transform: `translate(${x}px, ${y}px) scale(var(--mu, 1))`, cursor: onPlaceClick ? "pointer" : undefined }}
              data-cursor={onPlaceClick ? "discover" : undefined}
              data-cursor-label={onPlaceClick ? p.name : undefined}
              onPointerEnter={onPlaceHover ? (e) => onPlaceHover(p, e.currentTarget) : undefined}
              onPointerLeave={onPlaceHover ? () => onPlaceHover(null) : undefined}
              onFocus={onPlaceHover ? (e) => onPlaceHover(p, e.currentTarget) : undefined}
              onBlur={onPlaceHover ? () => onPlaceHover(null) : undefined}
              onClick={onPlaceClick ? (e) => onPlaceClick(p, e.currentTarget) : undefined}
              onKeyDown={
                onPlaceClick
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onPlaceClick(p, e.currentTarget);
                      }
                    }
                  : undefined
              }
            >
              <circle r={14} fill="transparent" />
              {(selected || p.kind === "city") && <circle r={r} fill="none" stroke={color} strokeWidth={1} className="pulse-ring" />}
              <circle className="m-dot" r={selected ? r + 2 : r} fill={p.layer === "history" ? "none" : color} stroke={p.layer === "history" ? color : visited ? "#fff" : "#121110"} strokeWidth={p.layer === "history" ? 1.6 : 1} />
              <text className="m-label t-coord" x={9} y={3.5} fontSize={11} fill="#f3ede1" paintOrder="stroke" stroke="#121110" strokeWidth={3} strokeOpacity={0.7}>
                {p.name}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
});

/** Drag, wheel, pinch and keyboard navigation for the interactive map. */
function useInteractive(camera: MapCamera, enabled: boolean) {
  const state = useRef({ pointers: new Map<number, { x: number; y: number }>(), pinch: 0, moved: 0 });
  useEffect(() => {
    const svg = camera.svgEl.current;
    if (!svg || !enabled) return;
    const MIN_W = 50;
    const MAX_W = VB_W * 1.8;
    const toMap = (clientX: number, clientY: number) => {
      const r = svg.getBoundingClientRect();
      const c = camera.getCamera();
      const h = c.w / (r.width / r.height);
      return { x: c.cx - c.w / 2 + ((clientX - r.left) / r.width) * c.w, y: c.cy - h / 2 + ((clientY - r.top) / r.height) * h };
    };
    const zoomAt = (factor: number, clientX?: number, clientY?: number, animate = false) => {
      const c = camera.getCamera();
      const w = clamp(c.w * factor, MIN_W, MAX_W);
      const r = svg.getBoundingClientRect();
      const px = clientX ?? r.left + r.width / 2;
      const py = clientY ?? r.top + r.height / 2;
      const p = toMap(px, py);
      const k = w / c.w;
      const next = { cx: p.x + (c.cx - p.x) * k, cy: p.y + (c.cy - p.y) * k, w };
      camera.setCamera(next, { duration: animate ? 0.6 : 0.25, ease: "power2.out" });
    };
    const pan = (dxPx: number, dyPx: number) => {
      const c = camera.getCamera();
      const r = svg.getBoundingClientRect();
      const u = c.w / r.width;
      const next = { cx: clamp(c.cx - dxPx * u, -100, VB_W + 100), cy: clamp(c.cy - dyPx * u, -100, VB_H + 100), w: c.w };
      camera.camRef.current = next;
      camera.apply();
    };
    const onDown = (e: PointerEvent) => {
      state.current.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      state.current.moved = 0;
      if (state.current.pointers.size === 2) {
        const [a, b] = [...state.current.pointers.values()];
        state.current.pinch = Math.hypot(a.x - b.x, a.y - b.y);
      }
    };
    const onMove = (e: PointerEvent) => {
      const prev = state.current.pointers.get(e.pointerId);
      if (!prev) return;
      const pts = state.current.pointers;
      if (pts.size === 2) {
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const [a, b] = [...pts.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (state.current.pinch > 0) {
          const c = camera.getCamera();
          const w = clamp(c.w * (state.current.pinch / d), MIN_W, MAX_W);
          camera.camRef.current = { ...c, w };
          camera.apply();
        }
        state.current.pinch = d;
        return;
      }
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      state.current.moved += Math.abs(dx) + Math.abs(dy);
      // capture only once it is clearly a drag, so taps still reach markers
      if (state.current.moved > 4 && !svg.hasPointerCapture(e.pointerId)) svg.setPointerCapture(e.pointerId);
      if (state.current.moved <= 4) return;
      pan(dx, dy);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    };
    const onUp = (e: PointerEvent) => {
      state.current.pointers.delete(e.pointerId);
      if (state.current.pointers.size < 2) state.current.pinch = 0;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomAt(Math.exp(e.deltaY * 0.0015), e.clientX, e.clientY);
    };
    const onDbl = (e: MouseEvent) => zoomAt(0.5, e.clientX, e.clientY, true);
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as Element).closest("[role=button]")) return;
      const step = 60;
      if (e.key === "ArrowLeft") pan(step, 0);
      else if (e.key === "ArrowRight") pan(-step, 0);
      else if (e.key === "ArrowUp") pan(0, step);
      else if (e.key === "ArrowDown") pan(0, -step);
      else if (e.key === "+" || e.key === "=") zoomAt(0.7, undefined, undefined, true);
      else if (e.key === "-" || e.key === "_") zoomAt(1.4, undefined, undefined, true);
      else return;
      e.preventDefault();
    };
    svg.setAttribute("tabindex", "0");
    svg.addEventListener("pointerdown", onDown);
    svg.addEventListener("pointermove", onMove);
    svg.addEventListener("pointerup", onUp);
    svg.addEventListener("pointercancel", onUp);
    svg.addEventListener("wheel", onWheel, { passive: false });
    svg.addEventListener("dblclick", onDbl);
    svg.addEventListener("keydown", onKey);
    (svg as unknown as { __zoomAt: typeof zoomAt }).__zoomAt = zoomAt;
    return () => {
      svg.removeEventListener("pointerdown", onDown);
      svg.removeEventListener("pointermove", onMove);
      svg.removeEventListener("pointerup", onUp);
      svg.removeEventListener("pointercancel", onUp);
      svg.removeEventListener("wheel", onWheel);
      svg.removeEventListener("dblclick", onDbl);
      svg.removeEventListener("keydown", onKey);
    };
  }, [camera, enabled]);
}

/** Zoom helper for external buttons (+ / −). */
export function zoomMap(camera: MapCamera, factor: number) {
  const svg = camera.svgEl.current as unknown as { __zoomAt?: (f: number, x?: number, y?: number, a?: boolean) => void } | null;
  svg?.__zoomAt?.(factor, undefined, undefined, true);
}
