"use client";
import { useEffect, useRef } from "react";
import { chapters } from "@/content/chapters";
import { useExperience } from "@/features/experience/ExperienceProvider";
import { ensureGsap, ScrollTrigger } from "@/lib/motion";
import { cn, pad2 } from "@/lib/utils";

/**
 * Always answers: where am I, what am I seeing, how far have I travelled.
 * Desktop: a vertical rail of chapters with an animated indicator. Mobile: a slim bottom bar.
 */
export function ChapterNavigation() {
  const { activeChapter, setActiveChapter, scrollTo, setAmbient } = useExperience();
  const bar = useRef<HTMLDivElement>(null);
  const barM = useRef<HTMLDivElement>(null);
  const i = Math.max(0, chapters.findIndex((c) => c.id === activeChapter));
  const c = chapters[i];

  // active chapter from the section crossing the middle of the viewport
  useEffect(() => {
    const els = chapters.map((ch) => document.getElementById(`chapter-${ch.id}`)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveChapter(e.target.getAttribute("data-chapter") || "enter");
        });
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [setActiveChapter]);

  useEffect(() => {
    setAmbient(c.ambient);
  }, [c, setAmbient]);

  // overall progress: how far have I travelled
  useEffect(() => {
    ensureGsap();
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (s) => {
        if (bar.current) bar.current.style.transform = `scaleY(${s.progress})`;
        if (barM.current) barM.current.style.transform = `scaleX(${s.progress})`;
      },
    });
    return () => st.kill();
  }, []);

  return (
    <>
      <nav aria-label="Journey chapters" className={cn("pointer-events-none fixed bottom-6 left-3 hidden mix-blend-difference text-paper transition-opacity duration-700 lg:block", activeChapter === "enter" && "opacity-0")} style={{ zIndex: "var(--z-chrome)" }}>
        <div className="flex items-end gap-2">
          <div className="relative h-[36vh] w-px bg-paper/25">
            <div ref={bar} className="absolute inset-0 origin-top bg-paper" style={{ transform: "scaleY(0)" }} />
          </div>
          <ol className="pointer-events-auto flex h-[36vh] flex-col justify-between">
            {chapters.map((ch, k) => (
              <li key={ch.id}>
                <button
                  type="button"
                  onClick={() => scrollTo(`#chapter-${ch.id}`)}
                  aria-current={k === i ? "step" : undefined}
                  aria-label={`${pad2(k + 1)} ${ch.title}`}
                  className="group flex items-center gap-2"
                  data-cursor="explore"
                  data-cursor-label={ch.title}
                >
                  <span className={cn("block h-px bg-paper transition-all duration-500", k === i ? "w-5" : "w-2 opacity-40 group-hover:w-4 group-hover:opacity-100")} />
                  <span className="t-coord whitespace-nowrap bg-ink/80 px-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">{ch.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <p className="t-kicker mt-4 pl-[calc(var(--gutter)-0.75rem)]" aria-live="polite">
          <span className="tabular-nums">
            {pad2(i + 1)} / {pad2(chapters.length)}
          </span>{" "}
          · {c.kicker}
        </p>
      </nav>

      <div className="fixed inset-x-0 bottom-0 flex items-center justify-between gap-4 bg-gradient-to-t from-black/70 to-transparent px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-6 text-paper lg:hidden" style={{ zIndex: "var(--z-chrome)" }}>
        <p className="t-kicker">
          <span className="tabular-nums opacity-70">
            {pad2(i + 1)}/{pad2(chapters.length)}
          </span>{" "}
          {c.title}
        </p>
        <div className="h-px flex-1 bg-white/25">
          <div ref={barM} className="h-px origin-left bg-paper" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </>
  );
}
