import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { DetailPage } from "@/components/place/DetailPage";
import { nature as local, regionName } from "@/content";
import { bestSrc, getMedia } from "@/lib/media";
import { relatedPlaces } from "@/server/related";
import { getNatureSpot } from "@/services/content";

export function generateStaticParams() {
  return local.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const n = await getNatureSpot(slug);
  if (!n) return { title: "Beyond the map" };
  const img = getMedia(n.media[0]);
  return {
    title: n.name,
    description: n.summary,
    alternates: { canonical: n.slug === "sundarbans" ? "/sundarbans" : `/nature/${n.slug}` },
    openGraph: { title: `${n.name} · ${n.nameBn}`, description: n.summary, images: img ? [{ url: bestSrc(img, 1280), alt: img.alt }] : undefined },
  };
}

export default async function NaturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "sundarbans") redirect("/sundarbans");
  const n = await getNatureSpot(slug);
  if (!n) notFound();
  const related = await relatedPlaces({ kind: "nature", slug: n.slug, coordinates: n.coordinates });
  return (
    <DetailPage
      kind="nature"
      slug={n.slug}
      name={n.name}
      nameBn={n.nameBn}
      kicker={n.ecosystem.replace("-", " ")}
      regionName={regionName(n.region)}
      coordinates={n.coordinates}
      summary={n.summary}
      description={n.description}
      media={n.media}
      facts={n.recognition ? [{ label: "Recognition", value: n.recognition }] : []}
      related={related}
      layer="nature"
      path={`/nature/${n.slug}`}
      back={{ href: "/nature", label: "All nature" }}
    />
  );
}
