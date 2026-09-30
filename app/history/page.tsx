import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page/PageIntro";
import { TimeTravel } from "@/features/history/TimeTravel";
import { hrefFor } from "@/lib/places";
import { getTimeline } from "@/services/content";

export const metadata: Metadata = {
  title: "The History",
  description: "Drag through time — from Pundranagara to the Padma Bridge. Every era connects to a place on the map.",
  alternates: { canonical: "/history" },
};

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ at?: string }> }) {
  const [{ at }, events] = await Promise.all([searchParams, getTimeline()]);
  return (
    <main id="main">
      <h1 className="sr-only">The History of Bangladesh — a timeline</h1>
      <TimeTravel events={events} initial={typeof at === "string" ? at : undefined} />
      <section aria-labelledby="chronology" className="bg-ink text-paper">
        <PageIntro kicker="Chronology" title="Every moment, every place" />
        <ol id="chronology" className="gutter pb-[var(--section-pad)]">
          {events.map((e) => (
            <li key={e.slug} id={e.slug} className="grid grid-cols-12 gap-x-[var(--col-gap)] border-t border-white/15 py-5">
              <span className="t-display col-span-12 text-3xl sm:col-span-3">{e.yearLabel}</span>
              <div className="col-span-12 sm:col-span-6">
                <p className="text-lg">{e.title}</p>
                <p className="opacity-75">{e.event}</p>
              </div>
              <span className="t-coord col-span-12 opacity-60 sm:col-span-3 sm:text-right">
                {e.ref ? (
                  <Link href={hrefFor(e.ref.kind, e.ref.slug)} className="link-underline">
                    {e.place} →
                  </Link>
                ) : (
                  e.place
                )}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
