import type { Metadata } from "next";
import { NoireCTA, NoireJournalGrid, NoireMarquee, NoirePageHero } from "@/components/sections";
import { site } from "@/content/site";
import { getArticles, getFeaturedArticle } from "@/lib/cms";
import { hero, story } from "@/lib/view";

export const metadata: Metadata = {
  title: "Journal",
  description: "Essays, process notes and studio news on making things slowly.",
  alternates: { canonical: "/journal" },
};

export default function JournalPage() {
  const featured = getFeaturedArticle();
  const all = [featured, ...getArticles().filter((a) => a.slug !== featured.slug)];
  return (
    <>
      <NoirePageHero label={`Journal — ${all.length} entries`} title="Notes on making" accent="things slowly." lede="Essays, process diaries and the occasional studio update. Written by the people who did the work." meta="" {...hero("hero-journal")} />
      <NoireMarquee items="Essays, Process notes, Studio diaries, Captions, Archives, Slow work" speed={40} size={64} dark={false} italic />
      <NoireJournalGrid stories={all.map(story)} />
      <NoireCTA eyebrow={site.availability.label} line1="Have a story worth" accent="making?" email={site.email} buttonLabel="Start a project" buttonLink="/contact" />
    </>
  );
}
