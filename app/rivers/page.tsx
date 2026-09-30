import type { Metadata } from "next";
import { PageIntro } from "@/components/page/PageIntro";
import { RiverJourney } from "@/features/rivers/RiverJourney";
import { Delta } from "@/features/journey/chapters/Delta";
import { getRivers, getStories } from "@/services/content";

export const metadata: Metadata = {
  title: "The Rivers",
  description: "Follow the Padma, Jamuna, Meghna and the rivers of Bangladesh stop by stop — cities, landscapes and stories along their courses.",
  alternates: { canonical: "/rivers" },
};

export default async function RiversPage({ searchParams }: { searchParams: Promise<{ river?: string }> }) {
  const [{ river }, rivers, stories] = await Promise.all([searchParams, getRivers(), getStories()]);
  return (
    <main id="main" className="bg-river-deep text-paper">
      <PageIntro kicker="03 · The Rivers" title="Follow the river" bn="নদী" lede="Bangladesh is shaped by water. Choose a river and the map will travel along its course." className="!bg-river-deep" />
      <RiverJourney rivers={rivers} initial={typeof river === "string" ? river : null} />
      <div id="delta">
        <Delta story={stories.find((s) => s.chapter === "delta")} />
      </div>
    </main>
  );
}
