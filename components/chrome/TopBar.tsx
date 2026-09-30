"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { chapters } from "@/content/chapters";
import { useExperience } from "@/features/experience/ExperienceProvider";
import { cn, pad2 } from "@/lib/utils";
import { SearchOverlay } from "./SearchOverlay";

/** Minimal chrome: wordmark, map, search, sound and the chapter index. Navigation lives in the journey itself. */
export function TopBar() {
  const { soundOn, toggleSound } = useExperience();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenu(false);
    setSearch(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest?.("input, textarea, [contenteditable]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setSearch(true);
      }
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="gutter pointer-events-none fixed inset-x-0 top-0 flex items-start justify-between pt-4 mix-blend-difference text-paper" style={{ zIndex: "var(--z-chrome)" }}>
        <Link href="/" className="pointer-events-auto group flex items-baseline gap-3" aria-label="Digital Bangladesh — home" data-cursor="explore" data-cursor-label="Home">
          <span className="t-display text-[1.35rem] leading-none tracking-tight">Digital Bangladesh</span>
          <span lang="bn" className="t-bn hidden text-sm opacity-70 sm:inline">
            ডিজিটাল বাংলাদেশ
          </span>
        </Link>
        <nav aria-label="Utilities" className="pointer-events-auto flex items-center gap-1 sm:gap-2">
          <Link href="/map" className={cn("t-kicker hidden px-3 py-2 sm:inline-block link-underline", pathname === "/map" && "underline")} data-cursor="map">
            Map
          </Link>
          <button type="button" onClick={() => setSearch(true)} className="t-kicker px-3 py-2" aria-label="Search (Ctrl K)" data-cursor="discover" data-cursor-label="Search">
            Search
          </button>
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? "Mute ambient sound" : "Play ambient sound"}
            className="t-kicker flex items-center gap-2 px-3 py-2"
            data-cursor="explore"
            data-cursor-label={soundOn ? "Mute" : "Sound"}
          >
            <SoundBars on={soundOn} />
            <span className="hidden sm:inline">{soundOn ? "Sound on" : "Sound off"}</span>
          </button>
          <button
            type="button"
            onClick={() => setMenu(true)}
            aria-expanded={menu}
            aria-controls="chapter-index"
            className="t-kicker border border-current px-3 py-2"
            data-cursor="explore"
            data-cursor-label="Chapters"
          >
            Chapters
          </button>
        </nav>
      </header>
      {menu && <ChapterIndex onClose={() => setMenu(false)} />}
      {search && <SearchOverlay onClose={() => setSearch(false)} />}
    </>
  );
}

function SoundBars({ on }: { on: boolean }) {
  return (
    <span aria-hidden className="flex h-3 items-end gap-[2px]">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-[2px] bg-current"
          style={{
            height: on ? undefined : 3,
            animation: on ? `sound-bar 1.${i + 1}s ease-in-out ${i * 0.12}s infinite alternate` : undefined,
          }}
        />
      ))}
      <style>{`@keyframes sound-bar{from{height:3px}to{height:12px}}`}</style>
    </span>
  );
}

function ChapterIndex({ onClose }: { onClose: () => void }) {
  const { activeChapter, scrollTo } = useExperience();
  const pathname = usePathname();
  const onHome = pathname === "/";
  useEffect(() => {
    const first = document.querySelector<HTMLElement>("#chapter-index a, #chapter-index button");
    first?.focus();
  }, []);
  return (
    <div id="chapter-index" role="dialog" aria-modal="true" aria-label="Chapters" className="fixed inset-0 overflow-y-auto bg-ink text-paper" style={{ zIndex: "var(--z-overlay)" }} data-lenis-prevent>
      <div className="gutter flex items-center justify-between pt-4">
        <p className="t-kicker opacity-60">The journey · {chapters.length} chapters</p>
        <button type="button" onClick={onClose} className="t-kicker border border-current px-3 py-2">
          Close ✕
        </button>
      </div>
      <ol className="gutter mt-10 grid grid-cols-1 gap-x-10 pb-16 md:grid-cols-2">
        {chapters.map((c, i) => {
          const active = onHome && c.id === activeChapter;
          const content = (
            <>
              <span className="t-coord w-10 opacity-50">{pad2(i + 1)}</span>
              <span className="t-display flex-1 text-[clamp(1.6rem,3.2vw,2.8rem)] leading-none transition-transform duration-500 group-hover:translate-x-2">{c.title}</span>
              <span lang="bn" className="t-bn hidden opacity-50 sm:inline">
                {c.titleBn}
              </span>
            </>
          );
          const cls = cn("group flex w-full items-baseline gap-4 border-b border-white/10 py-4 text-left", active && "text-sand");
          return (
            <li key={c.id}>
              {onHome ? (
                <button
                  type="button"
                  className={cls}
                  aria-current={active ? "step" : undefined}
                  onClick={() => {
                    onClose();
                    requestAnimationFrame(() => scrollTo(`#chapter-${c.id}`));
                  }}
                >
                  {content}
                </button>
              ) : (
                <Link href={c.id === "enter" ? "/" : `/#chapter-${c.id}`} className={cls}>
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      <nav aria-label="More" className="gutter flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 py-8">
        {[
          ["/map", "Interactive map"],
          ["/explore", "Explore index"],
          ["/history", "Timeline"],
          ["/search", "Search"],
          ["/about", "About & credits"],
        ].map(([href, label]) => (
          <Link key={href} href={href} className="t-kicker link-underline">
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
