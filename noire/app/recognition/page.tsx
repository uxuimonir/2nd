import type { Metadata } from "next";
import { NoireBlocks, NoireCTA, NoireMarquee, NoirePageHero, NoireStackedWork } from "@/components/sections";
import { site } from "@/content/site";
import { recognition } from "@/content/studio";
import { getProjects } from "@/lib/cms";
import { hero, stackedProject } from "@/lib/view";

export const metadata: Metadata = {
  title: "Recognition",
  description: "Awards, exhibitions, talks, publications and milestones.",
  alternates: { canonical: "/recognition" },
};

export default function RecognitionPage() {
  return (
    <>
      <NoirePageHero label="Recognition" title="Awards, shows," accent="talks & print." lede={`${recognition.length} entries. All are fictional demo content — replace them with your own.`} meta="" {...hero("hero-recognition")} />
      <NoireMarquee items="Exhibitions, Awards, Talks, Publications, Milestones" speed={40} size={64} dark={false} italic />
      <NoireBlocks
        variant="rows"
        label="Index"
        heading=""
        accent=""
        text=""
        caption=""
        dark={false}
        items={recognition.map((r) => ({ a: `${r.year} · ${r.kind}`, b: r.title, c: `${r.body}. ${r.detail}`, link: r.project ? `/work/${r.project}` : "" }))}
      />
      <NoireStackedWork
        label="Recognised work"
        heading="The projects"
        headingItalic="behind the list."
        allLabel="All projects"
        allLink="/work"
        projects={getProjects()
          .filter((p) => recognition.some((r) => r.project === p.slug))
          .slice(0, 4)
          .map(stackedProject)}
      />
      <NoireCTA eyebrow={site.availability.label} line1="Want your project on" accent="this list?" email={site.email} buttonLabel="Start a project" buttonLink="/contact" />
    </>
  );
}
