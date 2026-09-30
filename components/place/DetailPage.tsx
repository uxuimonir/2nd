"use client";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { BangladeshMap } from "@/components/map/BangladeshMap";
import { useMapCamera } from "@/components/map/useMapCamera";
import { Gallery } from "@/components/media/Gallery";
import { Photo } from "@/components/media/Photo";
import { ShareButton } from "@/components/chrome/ShareButton";
import { TextReveal } from "@/components/type/TextReveal";
import { useExperience } from "@/features/experience/ExperienceProvider";
import { useGsap } from "@/hooks/useGsap";
import { formatCoord, project } from "@/lib/geo";
import { KIND_LABEL } from "@/lib/places";
import type { Fact, LngLat, MapLayerId, Place, PlaceKind } from "@/types/content";

export interface DetailProps {
  kind: PlaceKind;
  slug: string;
  name: string;
  nameBn: string;
  kicker?: string;
  regionName?: string;
  coordinates: LngLat;
  summary: string;
  description: string[];
  media: string[];
  facts?: Fact[];
  related?: Place[];
  layer: MapLayerId;
  path: string;
  back: { href: string; label: string };
  extra?: ReactNode;
}

/**
 * Destination page: arriving in a place. Full-screen photograph (the doorway), then the place
 * on the map, its story, facts, photographs and connections to other places.
 */
export function DetailPage(p: DetailProps) {
  const root = useRef<HTMLDivElement>(null);
  const camera = useMapCamera();
  const { markVisited, openPlace } = useExperience();
  const id = `${p.kind}:${p.slug}`;

  useEffect(() => markVisited(id), [id, markVisited]);
  useEffect(() => {
    const [x, y] = project(p.coordinates);
    camera.setCamera({ cx: x, cy: y, w: 520 }, { duration: 0 });
    const t = setTimeout(() => camera.setCamera({ cx: x, cy: y, w: 150 }, { duration: 2.4 }), 600);
    return () => clearTimeout(t);
  }, [p.coordinates, camera]);

  useGsap(
    ({ gsap, reduced }) => {
      if (reduced || !root.current) return;
      const hero = root.current.querySelector("[data-hero]");
      const img = hero?.querySelector("img")?.parentElement;
      gsap.fromTo(hero, { clipPath: "circle(8% at 50% 60%)" }, { clipPath: "circle(100% at 50% 50%)", duration: 1.8, ease: "power3.inOut", delay: 0.4 });
      if (img) gsap.fromTo(img, { scale: 1.2 }, { scale: 1, duration: 2.6, ease: "expo.out", delay: 0.4 });
      if (img) gsap.to(img, { yPercent: 12, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    },
    root,
    [p.slug],
  );

  const place: Place = { id, kind: p.kind, slug: p.slug, name: p.name, nameBn: p.nameBn, coordinates: p.coordinates, summary: p.summary, href: p.path, layer: p.layer };

  return (
    <main id="main" ref={root}>
      <header className="relative h-[100svh] overflow-hidden bg-ink text-paper">
        <div data-hero className="absolute inset-0">
          <Photo id={p.media[0]} className="absolute inset-0" priority sizes="100vw" target={1920} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />
        </div>
        <div className="gutter absolute inset-x-0 bottom-0 pb-[12svh]">
          <p className="t-kicker flex flex-wrap gap-x-4 opacity-85">
            <span>{p.kicker ?? KIND_LABEL[p.kind]}</span>
            {p.regionName && <span>{p.regionName} Division</span>}
            <span className="t-coord">{formatCoord(p.coordinates)}</span>
          </p>
          <TextReveal as="h1" text={p.name} immediate delay={0.9} className="t-display mt-4" style={{ fontSize: "var(--step-6)" }} />
          <p lang="bn" className="t-bn opacity-75" style={{ fontSize: "var(--step-2)" }}>
            {p.nameBn}
          </p>
          <p className="t-lede mt-6 opacity-90">{p.summary}</p>
        </div>
      </header>

      <section className="bg-paper text-ink" aria-label="Story">
        <div className="gutter grid grid-cols-12 gap-x-[var(--col-gap)] gap-y-12 py-[var(--section-pad)]">
          <div className="col-span-12 lg:col-span-7">
            <Link href={p.back.href} className="t-kicker link-underline opacity-70">
              ← {p.back.label}
            </Link>
            <div className="mt-10 space-y-6">
              {p.description.map((d, i) => (
                <p key={i} className={i === 0 ? "t-lede" : "t-body opacity-85"}>
                  {d}
                </p>
              ))}
            </div>
            {p.facts && p.facts.length > 0 && (
              <dl className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {p.facts.map((f) => (
                  <div key={f.label} className="border-t border-ink/20 pt-3">
                    <dt className="t-coord opacity-60">{f.label}</dt>
                    <dd className="t-display mt-1 text-2xl">{f.value}</dd>
                    {f.source && <dd className="t-coord mt-1 opacity-50">{f.source}</dd>}
                  </div>
                ))}
              </dl>
            )}
            {p.extra}
            <div className="mt-12 flex flex-wrap items-center gap-3 [--btn-contrast:var(--color-paper)]">
              <ShareButton title={p.name} path={p.path} />
              <Link href={`/map?focus=${encodeURIComponent(id)}`} className="btn-explore" data-cursor="map">
                <span>See on the map</span>
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
          <aside className="col-span-12 lg:col-span-4 lg:col-start-9" aria-label="Location">
            <div className="sticky top-24">
              <div className="aspect-[3/4] bg-ink">
                <BangladeshMap camera={camera} places={[place, ...(p.related ?? [])]} selectedPlaceId={id} layers={{ base: true, rivers: true, [p.layer]: true, cities: true, heritage: true, nature: true, culture: true, future: true }} onPlaceClick={(pl, el) => pl.id !== id && openPlace(pl, el)} relief={0.5} ariaLabel={`${p.name} on the map of Bangladesh`} />
              </div>
              <p className="t-coord mt-3 opacity-60">{formatCoord(p.coordinates, 4)}</p>
            </div>
          </aside>
        </div>
      </section>

      {p.media.length > 1 && (
        <section className="gutter bg-ink py-[var(--section-pad)] text-paper" aria-label="Photographs">
          <p className="t-kicker mb-8 opacity-60">Photographs</p>
          <Gallery ids={p.media} title={`Photographs of ${p.name}`} />
        </section>
      )}

      {p.related && p.related.length > 0 && (
        <section className="gutter bg-ink pb-[var(--section-pad)] text-paper" aria-label="Connected places">
          <p className="t-kicker mb-6 border-t border-white/15 pt-8 opacity-60">Connected places</p>
          <ul className="grid grid-cols-1 gap-[var(--col-gap)] sm:grid-cols-2 lg:grid-cols-4">
            {p.related.slice(0, 8).map((r) => (
              <li key={r.id}>
                <button type="button" onClick={(e) => openPlace(r, e.currentTarget)} className="group block w-full text-left" data-cursor="discover" data-cursor-label="Enter">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Photo id={r.media} className="absolute inset-0 transition-transform duration-[1400ms] group-hover:scale-105" sizes="25vw" target={500} />
                  </div>
                  <p className="t-coord mt-3 opacity-60">{KIND_LABEL[r.kind]}</p>
                  <p className="t-display text-2xl">{r.name}</p>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
