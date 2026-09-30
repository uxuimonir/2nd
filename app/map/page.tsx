import type { Metadata } from "next";
import { MapExplorer } from "@/features/map/MapExplorer";

export const metadata: Metadata = {
  title: "The Map",
  description: "An editorial, interactive map of Bangladesh — rivers, divisions, cities, heritage, nature, culture, history and the future, layer by layer.",
  alternates: { canonical: "/map" },
};

export default async function MapPage({ searchParams }: { searchParams: Promise<{ region?: string; focus?: string }> }) {
  const { region, focus } = await searchParams;
  return (
    <main id="main">
      <MapExplorer region={typeof region === "string" ? region : undefined} focus={typeof focus === "string" ? focus : undefined} />
    </main>
  );
}
