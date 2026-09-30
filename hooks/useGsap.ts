"use client";
import { useLayoutEffect, useEffect, type DependencyList, type RefObject } from "react";
import { ensureGsap, gsap } from "@/lib/motion";

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Scoped GSAP context: animations and ScrollTriggers created inside `fn`
 * are reverted automatically on unmount (resource cleanup).
 */
export function useGsap(fn: (ctx: { gsap: typeof gsap; reduced: boolean }) => void | (() => void), scope: RefObject<Element | null>, deps: DependencyList = []) {
  useIso(() => {
    ensureGsap();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cleanup: void | (() => void);
    const ctx = gsap.context(() => {
      cleanup = fn({ gsap, reduced });
    }, scope.current ?? undefined);
    return () => {
      if (typeof cleanup === "function") cleanup();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
