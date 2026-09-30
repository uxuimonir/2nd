"use client";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { cameraToViewBox, countryCamera, type Camera } from "@/lib/geo";
import { ensureGsap, gsap, prefersReducedMotion } from "@/lib/motion";

/**
 * Imperative camera for the SVG map. The camera is tweened outside React (no re-render per frame):
 * it writes the viewBox and a `--mu` CSS variable (map units per screen pixel) used to keep
 * markers and labels a constant on-screen size at any zoom.
 */
export function useMapCamera(initial?: Camera) {
  const svgEl = useRef<SVGSVGElement | null>(null);
  const cam = useRef<Camera | null>(initial ?? null);
  const tween = useRef<gsap.core.Tween | null>(null);
  const listeners = useRef(new Set<(c: Camera) => void>());
  const ro = useRef<ResizeObserver | null>(null);

  const aspect = useCallback(() => {
    const r = svgEl.current?.getBoundingClientRect();
    return r && r.height > 0 ? r.width / r.height : 0.72;
  }, []);

  const apply = useCallback(() => {
    const svg = svgEl.current;
    if (!svg) return;
    if (!cam.current) cam.current = countryCamera(aspect());
    const c = cam.current;
    svg.setAttribute("viewBox", cameraToViewBox(c, aspect()));
    const px = svg.getBoundingClientRect().width || 1;
    svg.style.setProperty("--mu", String(c.w / px));
    listeners.current.forEach((l) => l(c));
  }, [aspect]);

  /** Callback ref: works even when the map mounts after the hook (e.g. inside overlays). */
  const svgRef = useCallback(
    (el: SVGSVGElement | null) => {
      ro.current?.disconnect();
      svgEl.current = el;
      if (el) {
        ro.current = new ResizeObserver(() => apply());
        ro.current.observe(el);
        apply();
      }
    },
    [apply],
  );

  const setCamera = useCallback(
    (next: Camera, opts: { duration?: number; ease?: string; onComplete?: () => void } = {}) => {
      ensureGsap();
      tween.current?.kill();
      if (!cam.current) cam.current = { ...next };
      const duration = prefersReducedMotion() ? 0 : (opts.duration ?? 1.6);
      if (duration === 0) {
        cam.current = { ...next };
        apply();
        opts.onComplete?.();
        return;
      }
      tween.current = gsap.to(cam.current, {
        cx: next.cx,
        cy: next.cy,
        w: next.w,
        duration,
        ease: opts.ease ?? "power2.inOut",
        onUpdate: apply,
        onComplete: opts.onComplete,
      });
    },
    [apply],
  );

  /** Set the camera without animation (used for scroll-scrubbed motion). */
  const jumpTo = useCallback(
    (next: Camera) => {
      tween.current?.kill();
      cam.current = { ...next };
      apply();
    },
    [apply],
  );

  const getCamera = useCallback(() => cam.current ?? countryCamera(aspect()), [aspect]);

  const onCamera = useCallback((fn: (c: Camera) => void) => {
    listeners.current.add(fn);
    return () => {
      listeners.current.delete(fn);
    };
  }, []);

  useEffect(
    () => () => {
      ro.current?.disconnect();
      tween.current?.kill();
    },
    [],
  );

  return useMemo(
    () => ({ svgRef, svgEl, setCamera, jumpTo, getCamera, onCamera, aspect, apply, camRef: cam }),
    [svgRef, setCamera, jumpTo, getCamera, onCamera, aspect, apply],
  );
}

export type MapCamera = ReturnType<typeof useMapCamera>;
