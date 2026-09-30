"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BangladeshMap } from "@/components/map/BangladeshMap";
import { useMapCamera } from "@/components/map/useMapCamera";
import { Photo } from "@/components/media/Photo";
import { ShareButton } from "@/components/chrome/ShareButton";
import { useExperience } from "@/features/experience/ExperienceProvider";
import { countryCamera, formatCoord, project } from "@/lib/geo";
import { ensureGsap, gsap, prefersReducedMotion } from "@/lib/motion";
import { KIND_LABEL } from "@/lib/places";

/**
 * SIGNATURE 03 — map location → full-screen photography.
 * Map zooms → texture turns to relief → marker expands → photograph emerges → story appears.
 */
export function PlaceReveal() {
  const { reveal: place, closePlace, places } = useExperience();
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lastFocus = useRef<Element | null>(null);
  const camera = useMapCamera();
  const [relief, setRelief] = useState(0);
  const [phase, setPhase] = useState<"map" | "photo">("map");

  // close when navigating away (e.g. after "Enter")
  const openedAt = useRef(pathname);
  useEffect(() => {
    if (place && pathname !== openedAt.current) closePlace();
    openedAt.current = pathname;
  }, [pathname, place, closePlace]);

  useEffect(() => {
    if (!place) return;
    ensureGsap();
    lastFocus.current = document.activeElement;
    const reduced = prefersReducedMotion();
    const [x, y] = project(place.coordinates);
    const aspect = window.innerWidth / window.innerHeight;
    setPhase("map");
    setRelief(0);
    camera.setCamera(countryCamera(aspect), { duration: 0 });

    const tl = gsap.timeline();
    tl.fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: reduced ? 0 : 0.5, ease: "power2.out" });
    tl.add(() => camera.setCamera({ cx: x, cy: y, w: 95 }, { duration: reduced ? 0 : 1.7, ease: "power3.inOut" }), reduced ? 0 : 0.2);
    tl.add(() => setRelief(0.85), reduced ? 0 : 0.9);
    tl.add(() => setPhase("photo"), reduced ? 0 : 1.9);
    tl.fromTo(
      photoRef.current,
      { clipPath: "circle(0% at 50% 50%)" },
      { clipPath: "circle(150% at 50% 50%)", duration: reduced ? 0 : 1.4, ease: "power3.inOut" },
      reduced ? 0 : 1.9,
    );
    tl.fromTo(photoRef.current?.querySelector("img") ?? {}, { scale: 1.25 }, { scale: 1, duration: reduced ? 0 : 2.4, ease: "expo.out" }, reduced ? 0 : 1.9);
    tl.fromTo(
      storyRef.current?.querySelectorAll("[data-rise]") ?? [],
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: reduced ? 0 : 1.1, ease: "expo.out", stagger: 0.08 },
      reduced ? 0 : 2.6,
    );
    tl.add(() => headingRef.current?.focus({ preventScroll: true }), reduced ? 0 : 2.7);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePlace();
      if (e.key === "Tab" && root.current) {
        const f = root.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      tl.kill();
      window.removeEventListener("keydown", onKey);
      (lastFocus.current as HTMLElement | null)?.focus?.({ preventScroll: true });
    };
  }, [place, camera, closePlace]);

  if (!place) return null;
  const nearby = places
    .filter((p) => p.id !== place.id && p.layer !== "history")
    .map((p) => ({ p, d: Math.hypot(p.coordinates[0] - place.coordinates[0], p.coordinates[1] - place.coordinates[1]) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3)
    .map((x) => x.p);

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reveal-title"
      className="fixed inset-0 bg-[#07090a] text-paper"
      style={{ zIndex: "var(--z-reveal)" }}
    >
      <div className="absolute inset-0" aria-hidden={phase === "photo"}>
        <BangladeshMap camera={camera} places={[place]} selectedPlaceId={place.id} layers={{ base: true, rivers: true, [place.layer]: true }} relief={relief} contours flow ariaLabel={`Map zooming to ${place.name}`} />
      </div>

      <div ref={photoRef} className="absolute inset-0" style={{ clipPath: "circle(0% at 50% 50%)" }}>
        <Photo id={place.media} className="absolute inset-0" priority target={1920} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />
      </div>

      <div ref={storyRef} className="gutter absolute inset-x-0 bottom-0 pb-[max(2rem,env(safe-area-inset-bottom))] pt-24">
        <div className="editorial-grid items-end gap-y-8">
          <div className="col-span-12 lg:col-span-8">
            <p data-rise className="t-kicker mb-4 flex flex-wrap gap-x-4 opacity-80">
              <span>{KIND_LABEL[place.kind]}</span>
              {place.regionName && <span>{place.regionName} Division</span>}
              <span className="t-coord">{formatCoord(place.coordinates)}</span>
            </p>
            <h2 id="reveal-title" ref={headingRef} tabIndex={-1} data-rise className="t-display outline-none" style={{ fontSize: "var(--step-5)" }}>
              {place.name}
            </h2>
            {place.nameBn && (
              <p data-rise lang="bn" className="t-bn mt-2 opacity-70" style={{ fontSize: "var(--step-2)" }}>
                {place.nameBn}
              </p>
            )}
            <p data-rise className="t-lede mt-6 opacity-90">
              {place.summary}
            </p>
            <div data-rise className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={place.href} className="btn-explore text-paper" data-cursor="explore" data-cursor-label="Enter">
                <span>Enter {place.name.length > 22 ? "this place" : place.name}</span>
                <span aria-hidden>→</span>
              </Link>
              <button type="button" onClick={closePlace} className="btn-explore text-paper" data-cursor="map">
                <span>Back to the map</span>
              </button>
              <ShareButton title={place.name} path={place.href} />
            </div>
          </div>
          {nearby.length > 0 && (
            <nav data-rise aria-label="Nearby" className="col-span-12 lg:col-span-4">
              <p className="t-kicker mb-3 opacity-60">Nearby</p>
              <ul className="divide-y divide-white/15 border-y border-white/15">
                {nearby.map((n) => (
                  <li key={n.id}>
                    <NearbyLink place={n} />
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={closePlace}
        aria-label="Close"
        className="t-kicker absolute right-[var(--gutter)] top-5 border border-white/40 px-3 py-2 hover:bg-white hover:text-ink"
      >
        Close ✕
      </button>
    </div>
  );
}

function NearbyLink({ place }: { place: import("@/types/content").Place }) {
  const { openPlace } = useExperience();
  return (
    <button type="button" onClick={(e) => openPlace(place, e.currentTarget)} className="flex w-full items-baseline justify-between gap-4 py-3 text-left hover:opacity-100 opacity-80" data-cursor="discover">
      <span>{place.name}</span>
      <span className="t-coord opacity-60">{KIND_LABEL[place.kind]}</span>
    </button>
  );
}
