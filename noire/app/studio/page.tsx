import type { Metadata } from "next";
import { NoireArchive, NoireCTA, NoireMarquee, NoirePageHero } from "@/components/sections";
import { site } from "@/content/site";
import { archive } from "@/content/studio";
import { getProject } from "@/lib/cms";
import { hero, img } from "@/lib/view";

export const metadata: Metadata = {
  title: "Studio Archive",
  description: "Sketches, material studies, process fragments and behind-the-scenes notes from the studio.",
  alternates: { canonical: "/studio" },
};

export default function StudioPage() {
  return (
    <>
      <NoirePageHero label={`Studio archive — ${archive.length} fragments`} title="What happens" accent="before the work." lede="Sketches, glaze tests, misprints and notes from first meetings. Some became projects; most did not, and that is the point." meta="" {...hero("hero-studio")} />
      <NoireMarquee items="Sketches, Glaze tests, Misprints, Paper stocks, Notes, Fragments" speed={40} size={64} dark={false} italic />
      <NoireArchive
        items={archive.map((a) => {
          const p = a.project ? getProject(a.project) : undefined;
          return { title: a.title, kind: a.kind, year: String(a.year), note: a.note, link: p ? `/work/${p.slug}` : "", linkLabel: p?.title ?? "", image: img(a.image) };
        })}
      />
      <NoireCTA eyebrow={site.availability.label} line1="Want to see what happens" accent="next?" email={site.email} buttonLabel="Start a project" buttonLink="/contact" />
    </>
  );
}
