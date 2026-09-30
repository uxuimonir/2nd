"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Photo } from "@/components/media/Photo";
import { formatCoord } from "@/lib/geo";
import { KIND_LABEL } from "@/lib/places";
import { cn } from "@/lib/utils";
import type { PlaceKind, SearchResult } from "@/types/content";

const FILTERS: { id: PlaceKind | "all"; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "city", label: "Cities" },
  { id: "heritage", label: "Heritage" },
  { id: "nature", label: "Nature & rivers" },
  { id: "food", label: "Food" },
  { id: "culture", label: "Culture" },
  { id: "destination", label: "Landmarks" },
];

const SUGGESTIONS = ["Sundarbans", "Padma", "Dhaka", "Paharpur", "Hilsa", "Jamdani", "Tea", "1971"];

/** Global search with visual destination previews. Used as an overlay (⌘K) and as the /search page. */
export function SearchPanel({ initialQuery = "", autoFocus = true, onNavigate }: { initialQuery?: string; autoFocus?: boolean; onNavigate?: () => void }) {
  const [q, setQ] = useState(initialQuery);
  const [kind, setKind] = useState<PlaceKind | "all">("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [active, setActive] = useState(0);
  const router = useRouter();
  const listId = useId();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) input.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const query = q.trim();
    if (!query) {
      setResults([]);
      setState("idle");
      return;
    }
    const ctrl = new AbortController();
    setState("loading");
    const t = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: query, limit: "20" });
        if (kind !== "all") params.set("kind", kind === "nature" ? "nature" : kind);
        const res = await fetch(`/api/search?${params}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as { data: SearchResult[] };
        setResults(json.data);
        setActive(0);
        setState("done");
      } catch (e) {
        if ((e as Error).name !== "AbortError") setState("error");
      }
    }, 160);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, kind]);

  const current = results[active];

  function go(r: SearchResult) {
    onNavigate?.();
    router.push(r.href);
  }

  return (
    <div className="grid h-full grid-cols-12 gap-x-[var(--col-gap)]">
      <div className="col-span-12 flex min-h-0 flex-col lg:col-span-7">
        <label htmlFor="search-input" className="t-kicker opacity-60">
          Search places, rivers, heritage, food, culture, history
        </label>
        <input
          id="search-input"
          ref={input}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(results.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(0, a - 1));
            } else if (e.key === "Enter" && current) {
              e.preventDefault();
              go(current);
            }
          }}
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls={listId}
          aria-activedescendant={current ? `${listId}-${active}` : undefined}
          autoComplete="off"
          placeholder="Where to?"
          className="t-display mt-3 w-full border-b border-white/25 bg-transparent pb-3 focus-visible:outline-none text-[clamp(2.2rem,6vw,4.8rem)] leading-none outline-none placeholder:text-white/25 focus:border-sand"
        />
        <div role="group" aria-label="Filter" className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={kind === f.id}
              onClick={() => setKind(f.id)}
              className={cn("t-coord border px-3 py-1.5 uppercase", kind === f.id ? "border-sand bg-sand text-ink" : "border-white/25 hover:border-white/60")}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1" data-lenis-prevent>
          {state === "idle" && (
            <div>
              <p className="t-kicker mb-3 opacity-50">Try</p>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => setQ(s)} className="t-display text-2xl opacity-70 link-underline hover:opacity-100">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {state === "error" && <p role="alert">Search is unavailable right now. Please try again.</p>}
          {state === "done" && results.length === 0 && <p className="opacity-70">Nothing on the map matches “{q}”. Try a city, river or dish.</p>}
          <ul id={listId} role="listbox" aria-label="Results" className="divide-y divide-white/10">
            {results.map((r, i) => (
              <li key={r.id} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                <Link
                  href={r.href}
                  onClick={() => onNavigate?.()}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className={cn("flex items-center gap-4 py-3 transition-colors", i === active ? "text-paper" : "text-paper/65")}
                  data-cursor="discover"
                  data-cursor-label="Go"
                >
                  <Photo id={r.media} className="h-14 w-14 shrink-0 lg:hidden" sizes="56px" target={500} decorative />
                  <span className="flex-1">
                    <span className="block text-lg leading-tight">{r.name}</span>
                    <span className="t-coord opacity-60">
                      {KIND_LABEL[r.kind]}
                      {r.regionName ? ` · ${r.regionName}` : ""}
                    </span>
                  </span>
                  <span aria-hidden className={cn("transition-transform", i === active && "translate-x-1")}>
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p aria-live="polite" className="sr-only">
            {state === "done" ? `${results.length} results` : ""}
          </p>
        </div>
      </div>

      {/* visual preview of the destination */}
      <aside aria-hidden className="relative col-span-5 hidden overflow-hidden lg:block">
        {current ? (
          <div key={current.id} className="absolute inset-0 animate-[fade_.6s_ease]">
            <Photo id={current.media} className="absolute inset-0" sizes="40vw" target={960} decorative />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <p className="t-coord opacity-70">{formatCoord(current.coordinates)}</p>
              <p className="t-display mt-2 text-4xl">{current.name}</p>
              {current.nameBn && (
                <p lang="bn" className="t-bn opacity-70">
                  {current.nameBn}
                </p>
              )}
              <p className="mt-3 max-w-[40ch] text-sm opacity-85">{current.summary}</p>
            </div>
            <style>{`@keyframes fade{from{opacity:0;transform:scale(1.03)}to{opacity:1;transform:none}}`}</style>
          </div>
        ) : (
          <div className="absolute inset-0 grid place-items-center border border-white/10">
            <p className="t-kicker opacity-40">Preview</p>
          </div>
        )}
      </aside>
    </div>
  );
}

export function SearchOverlay({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div role="dialog" aria-modal="true" aria-label="Search" className="fixed inset-0 bg-ink/97 text-paper backdrop-blur" style={{ zIndex: "var(--z-overlay)" }}>
      <div className="gutter flex h-full flex-col pb-6 pt-4">
        <div className="mb-8 flex justify-end">
          <button type="button" onClick={onClose} className="t-kicker border border-current px-3 py-2">
            Close ✕
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <SearchPanel onNavigate={onClose} />
        </div>
      </div>
    </div>
  );
}
