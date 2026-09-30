"use client";
import Lenis from "lenis";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AmbientEngine } from "@/features/sound/engine";
import { ensureGsap, gsap, ScrollTrigger } from "@/lib/motion";
import type { AmbientId, Place } from "@/types/content";

interface Experience {
  places: Place[];
  // chapter
  activeChapter: string;
  setActiveChapter: (id: string) => void;
  // sound
  soundOn: boolean;
  toggleSound: () => void;
  setAmbient: (id: AmbientId) => void;
  pluck: (freq?: number) => void;
  // visited places (persisted per browser)
  visited: Set<string>;
  markVisited: (id: string) => void;
  // location reveal
  reveal: Place | null;
  revealOrigin: DOMRect | null;
  openPlace: (p: Place, origin?: Element | null) => void;
  closePlace: () => void;
  // smooth scroll
  scrollTo: (target: string | number | HTMLElement, opts?: { immediate?: boolean; offset?: number }) => void;
  lenis: Lenis | null;
}

const Ctx = createContext<Experience | null>(null);

export function useExperience() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useExperience must be used inside <ExperienceProvider>");
  return v;
}

const VISITED_KEY = "db:visited:v1";

export function ExperienceProvider({ places, children }: { places: Place[]; children: ReactNode }) {
  const [activeChapter, setActiveChapter] = useState("enter");
  const [soundOn, setSoundOn] = useState(false);
  const [visited, setVisited] = useState<Set<string>>(() => new Set());
  const [reveal, setReveal] = useState<Place | null>(null);
  const [revealOrigin, setRevealOrigin] = useState<DOMRect | null>(null);
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const engine = useRef<AmbientEngine | null>(null);
  const ambient = useRef<AmbientId>("river");

  // ——— smooth scroll (Lenis + GSAP ScrollTrigger in one ticker) ———
  useEffect(() => {
    ensureGsap();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const l = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), touchMultiplier: 1.4 });
    l.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => l.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(l);
    return () => {
      gsap.ticker.remove(tick);
      l.destroy();
      setLenis(null);
    };
  }, []);

  // ——— keep every ScrollTrigger measured against the real layout ———
  useEffect(() => {
    ensureGsap();
    let t: ReturnType<typeof setTimeout>;
    let lastH = 0;
    const refresh = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const h = document.documentElement.scrollHeight;
        if (Math.abs(h - lastH) > 2) {
          lastH = h;
          ScrollTrigger.refresh();
        }
      }, 180);
    };
    const ro = new ResizeObserver(refresh);
    ro.observe(document.body);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener("db:loaded", refresh);
    return () => {
      clearTimeout(t);
      ro.disconnect();
      window.removeEventListener("db:loaded", refresh);
    };
  }, []);

  // ——— visited places ———
  useEffect(() => {
    try {
      const raw = localStorage.getItem(VISITED_KEY);
      if (raw) setVisited(new Set(JSON.parse(raw)));
    } catch {}
  }, []);
  const markVisited = useCallback((id: string) => {
    setVisited((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev).add(id);
      try {
        localStorage.setItem(VISITED_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }, []);

  // ——— sound ———
  const toggleSound = useCallback(() => {
    engine.current ??= new AmbientEngine();
    setSoundOn((on) => {
      if (on) engine.current!.mute();
      else {
        void engine.current!.start().then(() => engine.current!.setScene(ambient.current));
      }
      return !on;
    });
  }, []);
  const setAmbient = useCallback(
    (id: AmbientId) => {
      ambient.current = id;
      if (soundOn) engine.current?.setScene(id);
    },
    [soundOn],
  );
  const pluck = useCallback((freq?: number) => {
    engine.current ??= new AmbientEngine();
    engine.current.pluck(freq);
  }, []);
  useEffect(() => () => engine.current?.dispose(), []);

  // ——— reveal ———
  const openPlace = useCallback(
    (p: Place, origin?: Element | null) => {
      setRevealOrigin(origin ? origin.getBoundingClientRect() : null);
      setReveal(p);
      markVisited(p.id);
    },
    [markVisited],
  );
  const closePlace = useCallback(() => setReveal(null), []);
  useEffect(() => {
    if (reveal) lenis?.stop();
    else lenis?.start();
  }, [reveal, lenis]);

  const scrollTo = useCallback<Experience["scrollTo"]>(
    (target, opts = {}) => {
      if (lenis) lenis.scrollTo(target, { immediate: opts.immediate, offset: opts.offset ?? 0, duration: 1.8 });
      else {
        const el = typeof target === "string" ? document.querySelector(target) : target;
        if (typeof el === "number") window.scrollTo({ top: el, behavior: opts.immediate ? "auto" : "smooth" });
        else (el as HTMLElement | null)?.scrollIntoView({ behavior: opts.immediate ? "auto" : "smooth" });
      }
    },
    [lenis],
  );

  const value = useMemo<Experience>(
    () => ({
      places,
      activeChapter,
      setActiveChapter,
      soundOn,
      toggleSound,
      setAmbient,
      pluck,
      visited,
      markVisited,
      reveal,
      revealOrigin,
      openPlace,
      closePlace,
      scrollTo,
      lenis,
    }),
    [places, activeChapter, soundOn, toggleSound, setAmbient, pluck, visited, markVisited, reveal, revealOrigin, openPlace, closePlace, scrollTo, lenis],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
