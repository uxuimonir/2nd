import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page/PageIntro";
import { Photo } from "@/components/media/Photo";
import { Cities } from "@/features/journey/chapters/Cities";
import { formatCoord } from "@/lib/geo";
import { getCities } from "@/services/content";

export const metadata: Metadata = {
  title: "The Cities",
  description: "Dhaka, Chattogram, Sylhet, Rajshahi, Khulna, Barishal, Rangpur and Mymensingh — eight cities, each a world of its own.",
  alternates: { canonical: "/cities" },
};

export default async function CitiesPage() {
  const cities = await getCities();
  return (
    <main id="main">
      <Cities cities={cities} />
      <section aria-labelledby="all-cities" className="bg-ink text-paper">
        <PageIntro kicker="Index" title="All eight cities" />
        <ul className="gutter grid grid-cols-1 gap-[var(--col-gap)] pb-[var(--section-pad)] sm:grid-cols-2 lg:grid-cols-4" id="all-cities">
          {cities.map((c) => (
            <li key={c.slug}>
              <Link href={`/city/${c.slug}`} className="group block" data-cursor="explore">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Photo id={c.media[0]} className="absolute inset-0 transition-transform duration-[1400ms] group-hover:scale-105" sizes="(min-width:1024px) 25vw, 50vw" target={960} />
                </div>
                <p className="t-coord mt-3 opacity-60">{formatCoord(c.coordinates)}</p>
                <p className="t-display text-3xl">{c.name}</p>
                <p className="text-sm opacity-70">{c.tagline}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
