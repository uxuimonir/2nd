import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/place/DetailPage";
import { cities as localCities, regionName } from "@/content";
import { bestSrc, getMedia } from "@/lib/media";
import { relatedPlaces } from "@/server/related";
import { getCity, getRivers } from "@/services/content";

export function generateStaticParams() {
  return localCities.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCity(slug);
  if (!c) return { title: "Beyond the map" };
  const img = getMedia(c.media[0]);
  return {
    title: `${c.name} — ${c.tagline}`,
    description: c.summary,
    alternates: { canonical: `/city/${c.slug}` },
    openGraph: { title: `${c.name} · ${c.nameBn}`, description: c.summary, images: img ? [{ url: bestSrc(img, 1280), alt: img.alt }] : undefined },
  };
}

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getCity(slug);
  if (!c) notFound();
  const rivers = (await getRivers()).filter((r) => c.rivers.includes(r.slug));
  const related = await relatedPlaces({ kind: "city", slug: c.slug, coordinates: c.coordinates }, [
    ...c.heritage.map((s) => ({ kind: "heritage" as const, slug: s })),
    ...c.nature.map((s) => ({ kind: "nature" as const, slug: s })),
    ...c.food.map((s) => ({ kind: "food" as const, slug: s })),
  ]);
  const jsonLd = { "@context": "https://schema.org", "@type": "City", name: c.name, alternateName: c.nameBn, description: c.summary, geo: { "@type": "GeoCoordinates", latitude: c.coordinates[1], longitude: c.coordinates[0] }, containedInPlace: { "@type": "Country", name: "Bangladesh" } };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <DetailPage
        kind="city"
        slug={c.slug}
        name={c.name}
        nameBn={c.nameBn}
        kicker={c.tagline}
        regionName={regionName(c.region)}
        coordinates={c.coordinates}
        summary={c.summary}
        description={c.description}
        media={c.media}
        facts={c.facts}
        related={related}
        layer="cities"
        path={`/city/${c.slug}`}
        back={{ href: "/cities", label: "All cities" }}
        extra={
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            <div>
              <p className="t-kicker opacity-60">Landmarks</p>
              <ul className="mt-3 space-y-1">
                {c.landmarks.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>
            {rivers.length > 0 && (
              <div>
                <p className="t-kicker opacity-60">Rivers</p>
                <ul className="mt-3 space-y-1">
                  {rivers.map((r) => (
                    <li key={r.slug}>
                      <Link href={`/rivers?river=${r.slug}`} className="link-underline">
                        Follow the {r.name} →
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        }
      />
    </>
  );
}
