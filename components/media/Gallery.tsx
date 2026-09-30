"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { getMedia, commonsPage } from "@/lib/media";
import { cn } from "@/lib/utils";
import { Photo } from "./Photo";

/** Photograph grid that opens into a full-screen lightbox (keyboard + swipe). */
export function Gallery({ ids, title = "Gallery", className }: { ids: string[]; title?: string; className?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const items = ids.filter((id) => getMedia(id));
  if (!items.length) return null;
  return (
    <section aria-label={title} className={className}>
      <ul className="grid grid-cols-2 gap-[var(--col-gap)] md:grid-cols-3">
        {items.map((id, i) => (
          <li key={id} className={cn(i === 0 && items.length > 2 && "col-span-2 row-span-2")}>
            <button type="button" onClick={() => setOpen(i)} className="group relative block aspect-[4/3] h-full w-full overflow-hidden" aria-label={`Open photograph: ${getMedia(id)!.alt}`} data-cursor="view">
              <Photo id={id} className="absolute inset-0 transition-transform duration-[1400ms] group-hover:scale-105" sizes="(min-width:768px) 33vw, 50vw" target={i === 0 ? 1280 : 960} />
            </button>
          </li>
        ))}
      </ul>
      {open !== null && <Lightbox ids={items} index={open} onChange={setOpen} onClose={() => setOpen(null)} />}
    </section>
  );
}

function Lightbox({ ids, index, onChange, onClose }: { ids: string[]; index: number; onChange: (i: number) => void; onClose: () => void }) {
  const m = getMedia(ids[index])!;
  const closeRef = useRef<HTMLButtonElement>(null);
  const touch = useRef(0);
  const go = useCallback((d: number) => onChange((index + d + ids.length) % ids.length), [index, ids.length, onChange]);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={m.alt}
      className="fixed inset-0 flex flex-col bg-black/95 text-paper"
      style={{ zIndex: "var(--z-overlay)" }}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
      data-lenis-prevent
    >
      <div className="gutter flex items-center justify-between py-4">
        <p className="t-coord opacity-70">
          {index + 1} / {ids.length}
        </p>
        <button ref={closeRef} type="button" onClick={onClose} className="t-kicker border border-current px-3 py-2">
          Close ✕
        </button>
      </div>
      <div className="relative min-h-0 flex-1">
        <Photo key={m.id} id={m.id} className="absolute inset-0 !bg-transparent" imgClassName="!object-contain" sizes="100vw" target={1920} priority />
        <button type="button" onClick={() => go(-1)} aria-label="Previous photograph" className="absolute left-2 top-1/2 -translate-y-1/2 p-4 text-3xl">
          ←
        </button>
        <button type="button" onClick={() => go(1)} aria-label="Next photograph" className="absolute right-2 top-1/2 -translate-y-1/2 p-4 text-3xl">
          →
        </button>
      </div>
      <div className="gutter flex flex-wrap items-baseline justify-between gap-4 py-4">
        <p className="max-w-3xl text-sm opacity-85">{m.alt}</p>
        <a href={commonsPage(m.file)} target="_blank" rel="noreferrer" className="t-coord link-underline opacity-70">
          Photo: Wikimedia Commons — author &amp; licence ↗
        </a>
      </div>
    </div>
  );
}
