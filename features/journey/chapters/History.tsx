"use client";
import { ChapterLabel } from "@/components/type/ChapterLabel";
import { TimeTravel } from "@/features/history/TimeTravel";
import type { TimelineEvent } from "@/types/content";

/** 08 — THE HISTORY. */
export function History({ events }: { events: TimelineEvent[] }) {
  return (
    <section id="chapter-history" data-chapter="history" aria-labelledby="history-title" className="relative">
      <h2 id="history-title" className="sr-only">
        The History — drag through time
      </h2>
      <div className="gutter pointer-events-none absolute left-0 top-20 z-10">
        <ChapterLabel id="history" />
      </div>
      <TimeTravel events={events} />
    </section>
  );
}
