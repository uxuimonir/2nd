import type { Metadata } from "next";
import { Culture } from "@/features/journey/chapters/Culture";
import { StoryBlock } from "@/components/type/StoryBlock";
import { Photo } from "@/components/media/Photo";
import { getCulture } from "@/services/content";

export const metadata: Metadata = {
  title: "The Culture",
  description: "Bangla, Baul songs, Jamdani, Nakshi Kantha, pottery, Pohela Boishakh, rickshaw painting and literature.",
  alternates: { canonical: "/culture" },
};

export default async function CulturePage() {
  const items = await getCulture();
  return (
    <main id="main" className="bg-ink pt-10 text-paper">
      <Culture items={items} />
      <div className="gutter space-y-[var(--section-pad)] pb-[var(--section-pad)]">
        {items.map((c, i) => (
          <article key={c.slug} id={c.slug} className="grid grid-cols-12 items-center gap-x-[var(--col-gap)] gap-y-8 scroll-mt-24">
            <div className={`relative col-span-12 aspect-[4/3] md:col-span-6 ${i % 2 ? "md:order-2" : ""}`}>
              <Photo id={c.media[0]} className="absolute inset-0" sizes="(min-width:768px) 50vw, 100vw" target={1280} />
            </div>
            <div className="col-span-12 md:col-span-5 md:col-start-auto">
              <StoryBlock kicker={`${c.category}${c.recognition ? " · " + c.recognition : ""}`} title={c.name} body={c.description} />
              <p lang="bn" className="t-bn mt-4 text-2xl opacity-60">
                {c.nameBn}
              </p>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
