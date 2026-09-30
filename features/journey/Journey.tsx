"use client";
import { useEffect } from "react";
import { useExperience } from "@/features/experience/ExperienceProvider";
import type { Journey as JourneyData } from "@/services/content";
import { ChapterNavigation } from "./ChapterNavigation";
import { Cities } from "./chapters/Cities";
import { Culture } from "./chapters/Culture";
import { Delta } from "./chapters/Delta";
import { Final } from "./chapters/Final";
import { Food } from "./chapters/Food";
import { Future } from "./chapters/Future";
import { Heritage } from "./chapters/Heritage";
import { History } from "./chapters/History";
import { Land } from "./chapters/Land";
import { Modern } from "./chapters/Modern";
import { Nature } from "./chapters/Nature";
import { Opening } from "./chapters/Opening";
import { People } from "./chapters/People";
import { Regions } from "./chapters/Regions";
import { Rivers } from "./chapters/Rivers";
import { Sundarbans } from "./chapters/Sundarbans";

/**
 * The continuous journey. Rhythm is deliberate:
 * MAP → PHOTO → RIVER → TYPOGRAPHY → 3D TERRAIN → TIMELINE → CITY → HUMAN STORY → NATURE → DATA → FUTURE.
 */
export function Journey({ data }: { data: JourneyData }) {
  const { scrollTo } = useExperience();
  // honour deep links such as /#chapter-history
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#chapter-")) {
      const t = setTimeout(() => scrollTo(hash, { immediate: true }), 300);
      return () => clearTimeout(t);
    }
  }, [scrollTo]);

  return (
    <main id="main">
      <Opening />
      <Land />
      <Rivers rivers={data.rivers} />
      <Delta story={data.stories.find((s) => s.chapter === "delta")} />
      <Regions regions={data.regions} />
      <Cities cities={data.cities} />
      <People people={data.people} />
      <History events={data.timeline} />
      <Heritage sites={data.heritage} />
      <Culture items={data.culture} />
      <Food items={data.food} />
      <Nature spots={data.nature.filter((n) => n.slug !== "sundarbans")} />
      <Sundarbans />
      <Modern destinations={data.destinations} />
      <Future story={data.stories.find((s) => s.chapter === "future")} />
      <Final />
      <ChapterNavigation />
    </main>
  );
}
