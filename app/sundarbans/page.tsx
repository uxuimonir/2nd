import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/place/DetailPage";
import { Sundarbans } from "@/features/journey/chapters/Sundarbans";
import { regionName } from "@/content";
import { relatedPlaces } from "@/server/related";
import { getNatureSpot } from "@/services/content";

export const metadata: Metadata = {
  title: "The Sundarbans",
  description: "The largest mangrove forest on earth — tides, breathing roots, the Royal Bengal tiger and the people of the forest's edge.",
  alternates: { canonical: "/sundarbans" },
};

export default async function SundarbansPage() {
  const n = await getNatureSpot("sundarbans");
  if (!n) notFound();
  const related = await relatedPlaces({ kind: "nature", slug: n.slug, coordinates: n.coordinates }, [{ kind: "city", slug: "khulna" }, { kind: "heritage", slug: "sixty-dome-mosque" }, { kind: "food", slug: "chingri" }]);
  return (
    <>
      <Sundarbans />
      <DetailPage
        kind="nature"
        slug={n.slug}
        name={n.name}
        nameBn={n.nameBn}
        kicker="Mangrove · tidal forest"
        regionName={regionName(n.region)}
        coordinates={n.coordinates}
        summary={n.summary}
        description={n.description}
        media={n.media}
        facts={[{ label: "Recognition", value: n.recognition ?? "" }, { label: "Area (Bangladesh + India)", value: "≈ 10,000 km²", source: "UNESCO World Heritage Centre" }]}
        related={related}
        layer="nature"
        path="/sundarbans"
        back={{ href: "/nature", label: "All nature" }}
      />
    </>
  );
}
