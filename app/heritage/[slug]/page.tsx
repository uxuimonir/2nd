import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/place/DetailPage";
import { heritage as local, regionName } from "@/content";
import { bestSrc, getMedia } from "@/lib/media";
import { relatedPlaces } from "@/server/related";
import { getHeritageSite, getTimeline } from "@/services/content";

export function generateStaticParams() {
  return local.map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const h = await getHeritageSite(slug);
  if (!h) return { title: "Beyond the map" };
  const img = getMedia(h.media[0]);
  return {
    title: h.name,
    description: h.summary,
    alternates: { canonical: `/heritage/${h.slug}` },
    openGraph: { title: `${h.name} · ${h.nameBn}`, description: h.summary, images: img ? [{ url: bestSrc(img, 1280), alt: img.alt }] : undefined },
  };
}

export default async function HeritagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const h = await getHeritageSite(slug);
  if (!h) notFound();
  const events = (await getTimeline()).filter((t) => t.ref?.kind === "heritage" && t.ref.slug === h.slug);
  const related = await relatedPlaces({ kind: "heritage", slug: h.slug, coordinates: h.coordinates }, h.city ? [{ kind: "city", slug: h.city }] : []);
  const jsonLd = { "@context": "https://schema.org", "@type": "LandmarksOrHistoricalBuildings", name: h.name, alternateName: h.nameBn, description: h.summary, geo: { "@type": "GeoCoordinates", latitude: h.coordinates[1], longitude: h.coordinates[0] } };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <DetailPage
        kind="heritage"
        slug={h.slug}
        name={h.name}
        nameBn={h.nameBn}
        kicker={h.period}
        regionName={regionName(h.region)}
        coordinates={h.coordinates}
        summary={h.summary}
        description={h.description}
        media={h.media}
        facts={[{ label: "Period", value: h.period }, { label: "Architecture", value: h.architecture }, ...(h.recognition ? [{ label: "Recognition", value: h.recognition }] : [])]}
        related={related}
        layer="heritage"
        path={`/heritage/${h.slug}`}
        back={{ href: "/heritage", label: "All heritage" }}
        extra={
          events.length > 0 ? (
            <div className="mt-12 border-t border-ink/20 pt-6">
              <p className="t-kicker opacity-60">On the timeline</p>
              {events.map((e) => (
                <Link key={e.slug} href={`/history?at=${e.slug}`} className="t-display mt-2 block text-3xl link-underline">
                  {e.yearLabel} — {e.title} →
                </Link>
              ))}
            </div>
          ) : null
        }
      />
    </>
  );
}
