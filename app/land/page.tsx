import type { Metadata } from "next";
import { Delta } from "@/features/journey/chapters/Delta";
import { Land } from "@/features/journey/chapters/Land";
import { getStories } from "@/services/content";

export const metadata: Metadata = {
  title: "The Land",
  description: "From a flat map to real terrain: Bangladesh's rivers, elevation, hills and settlements, built from open elevation data.",
  alternates: { canonical: "/land" },
};

export default async function LandPage() {
  const stories = await getStories();
  return (
    <main id="main">
      <Land />
      <Delta story={stories.find((s) => s.chapter === "delta")} />
    </main>
  );
}
