"use client";
import { useEffect, useRef, useState } from "react";
import { GEO, VB_H, VB_W } from "@/lib/geo";
import { ensureGsap, gsap } from "@/lib/motion";

const KEY = "db:loaded";

/**
 * Geographic loading sequence (no spinner): the outline of Bangladesh draws itself, rivers follow,
 * and the percentage tracks real readiness (fonts + first imagery), then the veil lifts.
 * Shown once per browser session; an inline script in <head> skips it for returning visits.
 */
export function LoadingScreen() {
  const root = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains("db-loaded")) {
      setDone(true);
      window.dispatchEvent(new Event("db:loaded"));
      return;
    }
    ensureGsap();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = root.current!;
    const outline = el.querySelector<SVGPathElement>("[data-outline]")!;
    const rivers = el.querySelectorAll<SVGPathElement>("[data-river]");
    const prog = { v: 0 };
    const tl = gsap.timeline({ paused: true });
    [outline, ...rivers].forEach((p) => {
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    });
    tl.to(outline, { strokeDashoffset: 0, duration: reduced ? 0 : 2.2, ease: "power2.inOut" });
    tl.to(rivers, { strokeDashoffset: 0, duration: reduced ? 0 : 1.4, ease: "power2.out", stagger: 0.12 }, reduced ? 0 : 1.2);
    tl.to(prog, { v: 100, duration: tl.duration(), ease: "none", onUpdate: () => setPct(Math.round(prog.v)) }, 0);

    const ready = Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise((r) => setTimeout(r, reduced ? 0 : 400)),
    ]);
    tl.play();
    let cancelled = false;
    Promise.all([ready, new Promise((r) => tl.eventCallback("onComplete", r))]).then(() => {
      if (cancelled) return;
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {}
      gsap.to(el, {
        opacity: 0,
        duration: reduced ? 0 : 1,
        ease: "power2.inOut",
        onStart: () => window.dispatchEvent(new Event("db:loaded")),
        onComplete: () => setDone(true),
      });
    });
    return () => {
      cancelled = true;
      tl.kill();
    };
  }, []);

  if (done) return null;
  return (
    <div
      ref={root}
      className="db-loader fixed inset-0 grid place-items-center bg-[#07090a] text-paper"
      style={{ zIndex: "var(--z-loader)" }}
      role="progressbar"
      aria-label="Loading the journey"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      <svg viewBox={`-40 -40 ${VB_W + 80} ${VB_H + 80}`} className="h-[62vh] w-auto" aria-hidden>
        <path data-outline d={GEO.outlineMain} fill="none" stroke="#d9c7a3" strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
        {GEO.rivers.slice(0, 5).map((r) => (
          <path key={r.id} data-river d={r.path} fill="none" stroke="#8cc7da" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="gutter absolute inset-x-0 bottom-8 flex items-end justify-between">
        <p className="t-kicker opacity-60">Entering the delta</p>
        <p className="t-display text-5xl tabular-nums">{String(pct).padStart(3, "0")}</p>
      </div>
    </div>
  );
}

/** Inline script: mark returning sessions before paint so the loader never flashes. */
export const LOADER_SCRIPT = `try{if(sessionStorage.getItem("${KEY}"))document.documentElement.classList.add("db-loaded")}catch(e){}`;
