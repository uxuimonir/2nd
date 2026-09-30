"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { BangladeshMap } from "@/components/map/BangladeshMap";
import { useMapCamera } from "@/components/map/useMapCamera";
import { Photo } from "@/components/media/Photo";
import { countryCamera, formatCoord, project } from "@/lib/geo";
import { ensureGsap, gsap, prefersReducedMotion } from "@/lib/motion";
import { hrefFor } from "@/lib/places";
import { cn } from "@/lib/utils";
import type { TimelineEvent } from "@/types/content";

const SPACING = 180; // px between events on the track

const TYPE_STYLE: Record<TimelineEvent["type"], { font: string; transform?: string; tracking?: string; weight?: number; italic?: boolean; filter: string }> = {
  ancient: { font: "var(--font-display)", italic: true, filter: "sepia(.45) contrast(1.05) saturate(.85)" },
  sultanate: { font: "var(--font-display)", filter: "sepia(.25) saturate(.9)" },
  mughal: { font: "var(--font-display)", transform: "uppercase", tracking: "0.04em", filter: "sepia(.18) saturate(1.05)" },
  colonial: { font: "var(--font-sans)", transform: "uppercase", tracking: "-0.03em", weight: 700, filter: "grayscale(.75) contrast(1.1)" },
  nation: { font: "var(--font-sans)", weight: 800, tracking: "-0.05em", filter: "grayscale(.35) contrast(1.05)" },
  contemporary: { font: "var(--font-mono)", weight: 500, tracking: "-0.06em", filter: "none" },
};

const hexToRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return `rgb(${Math.round(r1 + (r2 - r1) * t)}, ${Math.round(g1 + (g2 - g1) * t)}, ${Math.round(b1 + (b2 - b1) * t)})`;
};

/**
 * SIGNATURE 04 — HISTORY AS TIME TRAVEL.
 * Drag through time: colour, typeface, photograph, map and story shift together.
 * TIME · PLACE · STORY · IMAGE · MAP are one connected set of layers.
 */
export function TimeTravel({ events, initial }: { events: TimelineEvent[]; initial?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const pos = useRef(0);
  const snap = useRef<gsap.core.Tween | null>(null);
  const camera = useMapCamera();
  const [index, setIndex] = useState(0);
  const ev = events[index];
  const style = TYPE_STYLE[ev.type];

  const render = useCallback(() => {
    const p = pos.current;
    const a = Math.floor(p);
    const b = Math.min(events.length - 1, a + 1);
    const t = p - a;
    if (root.current) {
      root.current.style.backgroundColor = mix(events[a].palette.bg, events[b].palette.bg, t);
      root.current.style.color = mix(events[a].palette.ink, events[b].palette.ink, t);
      root.current.style.setProperty("--accent", t < 0.5 ? events[a].palette.accent : events[b].palette.accent);
    }
    if (track.current) track.current.style.transform = `translate3d(${-p * SPACING}px,0,0)`;
    const i = Math.round(p);
    setIndex((prev) => (prev === i ? prev : i));
  }, [events]);

  const goTo = useCallback(
    (i: number, duration = 1.1) => {
      ensureGsap();
      const target = Math.max(0, Math.min(events.length - 1, i));
      snap.current?.kill();
      if (prefersReducedMotion()) {
        pos.current = target;
        render();
        return;
      }
      snap.current = gsap.to(pos, { current: target, duration, ease: "power3.out", onUpdate: render });
    },
    [events.length, render],
  );

  useEffect(() => {
    const start = initial ? Math.max(0, events.findIndex((e) => e.slug === initial)) : 0;
    pos.current = start;
    render();
  }, [initial, events, render]);

  // the map follows the story to its place
  useEffect(() => {
    const [x, y] = project(ev.coordinates);
    const base = countryCamera(camera.aspect());
    camera.setCamera({ cx: base.cx + (x - base.cx) * 0.55, cy: base.cy + (y - base.cy) * 0.55, w: base.w * 0.62 }, { duration: 1.4 });
  }, [ev, camera]);

  // drag / swipe / horizontal wheel
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let startX = 0;
    let startPos = 0;
    let dragging = false;
    let lastX = 0;
    let lastT = 0;
    let vel = 0;
    const down = (e: PointerEvent) => {
      if ((e.target as Element).closest("a,button,[data-no-drag]")) return;
      dragging = true;
      startX = lastX = e.clientX;
      lastT = performance.now();
      startPos = pos.current;
      snap.current?.kill();
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      vel = (e.clientX - lastX) / Math.max(1, now - lastT);
      lastX = e.clientX;
      lastT = now;
      pos.current = Math.max(-0.3, Math.min(events.length - 0.7, startPos - (e.clientX - startX) / SPACING));
      render();
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      goTo(Math.round(pos.current - vel * 2.2), 0.9);
    };
    let wheelTimer: ReturnType<typeof setTimeout>;
    const wheel = (e: WheelEvent) => {
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (!dx) return;
      e.preventDefault();
      snap.current?.kill();
      pos.current = Math.max(0, Math.min(events.length - 1, pos.current + dx / SPACING));
      render();
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => goTo(Math.round(pos.current), 0.6), 140);
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
    };
  }, [events.length, render, goTo]);

  // headline roll on every change of era/event
  const yearRef = useRef<HTMLParagraphElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    ensureGsap();
    gsap.fromTo(yearRef.current, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: "expo.out" });
    gsap.fromTo(storyRef.current?.children ?? [], { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.06, ease: "expo.out" });
  }, [index]);

  return (
    <div
      ref={root}
      className="relative grid min-h-[100svh] touch-pan-y select-none grid-cols-12 overflow-hidden transition-[color] duration-500"
      style={{ backgroundColor: events[0].palette.bg, color: events[0].palette.ink }}
      data-cursor="drag"
    >
      {/* IMAGE */}
      <div className="absolute inset-0 md:left-auto md:w-[46%]" aria-hidden>
        {events.map((e, i) => (
          <div key={e.slug} className="absolute inset-0 transition-opacity duration-[1200ms]" style={{ opacity: i === index ? 1 : 0 }}>
            {Math.abs(i - index) <= 1 && <Photo id={e.media} className="absolute inset-0" sizes="46vw" target={960} imgClassName="transition-[filter] duration-1000" style={{ filter: TYPE_STYLE[e.type].filter }} decorative />}
          </div>
        ))}
        <div className="absolute inset-0 hidden md:block" style={{ background: "linear-gradient(90deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,.1) 40%, rgba(0,0,0,0) 100%)" }} />
        <div className="absolute inset-0 md:hidden" style={{ background: "rgba(0,0,0,.55)" }} />
      </div>

      {/* TIME + STORY */}
      <div className="gutter relative col-span-12 flex flex-col justify-between pb-44 pt-28 md:col-span-7">
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          {["Time", "Place", "Story", "Image", "Map"].map((l) => (
            <span key={l} className="t-kicker opacity-50">
              {l}
            </span>
          ))}
        </div>
        <div>
          <p className="t-kicker opacity-70" style={{ color: "var(--accent)" }}>
            {ev.era}
          </p>
          <div className="overflow-hidden">
            <p
              ref={yearRef}
              aria-hidden
              className="leading-[0.85]"
              style={{
                fontFamily: style.font,
                fontStyle: style.italic ? "italic" : "normal",
                textTransform: style.transform as React.CSSProperties["textTransform"],
                letterSpacing: style.tracking,
                fontWeight: style.weight ?? 400,
                fontSize: "clamp(3.8rem, 13vw, 12rem)",
              }}
            >
              {ev.yearLabel}
            </p>
          </div>
          <div ref={storyRef} aria-live="polite" className="max-w-2xl">
            <h3 className="t-display mt-4" style={{ fontSize: "var(--step-3)" }}>
              <span className="sr-only">{ev.yearLabel}: </span>
              {ev.title}
            </h3>
            <p className="t-coord mt-2 opacity-70">
              {ev.place} · {formatCoord(ev.coordinates)}
            </p>
            <p className="t-lede mt-4">{ev.event}</p>
            <p className="t-body mt-3 opacity-75">{ev.context}</p>
            {ev.ref && (
              <Link href={hrefFor(ev.ref.kind, ev.ref.slug)} className="t-kicker link-underline mt-5 inline-block" style={{ color: "var(--accent)" }} data-cursor="explore">
                Visit the place →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* MAP */}
      <div className="pointer-events-none absolute bottom-40 right-[var(--gutter)] hidden h-[34svh] w-[22svh] md:block" aria-hidden>
        <BangladeshMap
          camera={camera}
          flow={false}
          landFill="rgba(0,0,0,0.35)"
          places={events.slice(0, index + 1).map((e) => ({
            id: `t:${e.slug}`,
            kind: "heritage",
            slug: e.slug,
            name: e.title,
            nameBn: "",
            coordinates: e.coordinates,
            summary: e.event,
            href: "",
            layer: "history",
          }))}
          layers={{ base: true, rivers: true, history: true }}
          selectedPlaceId={`t:${ev.slug}`}
        />
      </div>

      {/* TRACK */}
      <div className="absolute inset-x-0 bottom-0 h-36 border-t border-current/20">
        <div className="absolute left-1/2 top-0 h-full w-px" style={{ background: "var(--accent)" }} aria-hidden />
        <div
          role="slider"
          tabIndex={0}
          aria-label="Timeline — drag or use arrow keys to travel through time"
          aria-valuemin={0}
          aria-valuemax={events.length - 1}
          aria-valuenow={index}
          aria-valuetext={`${ev.yearLabel}: ${ev.title}`}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowUp") goTo(index + 1);
            else if (e.key === "ArrowLeft" || e.key === "ArrowDown") goTo(index - 1);
            else if (e.key === "Home") goTo(0);
            else if (e.key === "End") goTo(events.length - 1);
            else return;
            e.preventDefault();
          }}
          className="absolute inset-0 outline-none focus-visible:bg-white/5"
        >
          <div ref={track} className="absolute left-1/2 top-0 h-full will-change-transform">
            {events.map((e, i) => (
              <button
                key={e.slug}
                type="button"
                tabIndex={-1}
                onClick={() => goTo(i)}
                className={cn("absolute top-0 flex h-full -translate-x-1/2 flex-col items-center pt-5 transition-opacity", i === index ? "opacity-100" : "opacity-45 hover:opacity-80")}
                style={{ left: i * SPACING, width: SPACING }}
                aria-label={`${e.yearLabel} — ${e.title}`}
              >
                <span className="h-5 w-px bg-current" />
                <span className="t-coord mt-3 whitespace-nowrap">{e.yearLabel}</span>
                <span className="mt-1 max-w-[150px] truncate text-xs opacity-70">{e.title}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-3 left-[var(--gutter)] right-[var(--gutter)] flex justify-between">
          <span className="t-kicker opacity-50">← Earlier</span>
          <span className="t-kicker opacity-50">Drag through time</span>
          <span className="t-kicker opacity-50">Later →</span>
        </div>
      </div>
    </div>
  );
}
