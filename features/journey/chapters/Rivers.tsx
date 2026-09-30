"use client";
import { ChapterLabel } from "@/components/type/ChapterLabel";
import { TextReveal } from "@/components/type/TextReveal";
import { RiverJourney } from "@/features/rivers/RiverJourney";
import type { River } from "@/types/content";

/** 03 — THE RIVERS. The river network becomes the navigation language of the journey. */
export function Rivers({ rivers }: { rivers: River[] }) {
  return (
    <section id="chapter-rivers" data-chapter="rivers" aria-labelledby="rivers-title" className="relative bg-river-deep text-paper">
      <div className="gutter pb-6 pt-[var(--section-pad)]">
        <ChapterLabel id="rivers" />
        <div className="mt-6 grid grid-cols-12 gap-x-[var(--col-gap)] gap-y-6">
          <TextReveal as="h2" id="rivers-title" text="Follow the river" className="t-display col-span-12 lg:col-span-8" style={{ fontSize: "var(--step-5)" }} />
          <p className="t-lede col-span-12 self-end opacity-85 lg:col-span-4">
            The Ganges becomes the Padma, the Brahmaputra becomes the Jamuna, and the Meghna gathers them both. Choose a river — the map will follow its course from stop to stop.
          </p>
        </div>
      </div>
      <RiverJourney rivers={rivers} />
    </section>
  );
}
