import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/place/DetailPage";
import { food as local, regionName } from "@/content";
import { bestSrc, getMedia } from "@/lib/media";
import { relatedPlaces } from "@/server/related";
import { getFoodItem } from "@/services/content";

export function generateStaticParams() {
  return local.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const f = await getFoodItem(slug);
  if (!f) return { title: "Beyond the map" };
  const img = getMedia(f.media[0]);
  return {
    title: `${f.name} · ${f.nameBn}`,
    description: f.summary,
    alternates: { canonical: `/food/${f.slug}` },
    openGraph: { title: `${f.name} · ${f.nameBn}`, description: f.summary, images: img ? [{ url: bestSrc(img, 1280), alt: img.alt }] : undefined },
  };
}

export default async function FoodPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = await getFoodItem(slug);
  if (!f) notFound();
  const related = await relatedPlaces({ kind: "food", slug: f.slug, coordinates: f.coordinates });
  return (
    <DetailPage
      kind="food"
      slug={f.slug}
      name={f.name}
      nameBn={f.nameBn}
      kicker={`Food · ${f.category}`}
      regionName={regionName(f.region)}
      coordinates={f.coordinates}
      summary={f.summary}
      description={f.description}
      media={f.media}
      facts={[{ label: "Where it comes from", value: f.origin }, ...(f.season ? [{ label: "Season", value: f.season }] : [])]}
      related={related}
      layer="culture"
      path={`/food/${f.slug}`}
      back={{ href: "/food", label: "All food" }}
    />
  );
}
