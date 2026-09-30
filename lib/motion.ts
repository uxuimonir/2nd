"use client";
/**
 * Central animation system. Every motion in the site goes through these tokens and helpers
 * so the language stays consistent: slow, precise, editorial — and silent under reduced motion.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;
export function ensureGsap() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: EASE.out, duration: DUR.base });
    registered = true;
    if (process.env.NODE_ENV !== "production") (window as unknown as { __ST: typeof ScrollTrigger }).__ST = ScrollTrigger;
  }
  return { gsap, ScrollTrigger };
}

export const EASE = {
  out: "expo.out",
  inOut: "power3.inOut",
  river: "sine.inOut",
  camera: "power2.inOut",
} as const;

export const DUR = {
  quick: 0.24,
  base: 0.6,
  slow: 1.2,
  cinematic: 2.2,
} as const;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Draw an SVG path (stroke) from nothing to complete. */
export function drawPath(el: SVGPathElement | SVGPathElement[] | NodeListOf<SVGPathElement>, vars: gsap.TweenVars = {}) {
  const list = Array.from(el instanceof SVGPathElement ? [el] : el);
  list.forEach((p) => {
    const len = p.getTotalLength();
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
  });
  return gsap.to(list, { strokeDashoffset: 0, duration: DUR.cinematic, ease: EASE.inOut, ...vars });
}

/** Reveal an element through a moving clip-path mask — photography as a doorway. */
export function maskReveal(el: Element, from: "bottom" | "left" | "circle" = "bottom", vars: gsap.TweenVars = {}) {
  const start =
    from === "circle" ? "circle(0% at 50% 50%)" : from === "left" ? "inset(0% 100% 0% 0%)" : "inset(100% 0% 0% 0%)";
  const end = from === "circle" ? "circle(75% at 50% 50%)" : "inset(0% 0% 0% 0%)";
  return gsap.fromTo(el, { clipPath: start }, { clipPath: end, duration: DUR.slow, ease: EASE.inOut, ...vars });
}

export { gsap, ScrollTrigger };
