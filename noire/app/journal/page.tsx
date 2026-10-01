import type { Metadata } from "next";
import { NoireJournalGrid, NoirePageHero } from "@/components/sections";
import { getArticles, getFeaturedArticle } from "@/lib/cms";
import { story } from "@/lib/view";

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
      <NoirePageHero label={`Journal — ${all.length} entries`} title="Notes on making" accent="things slowly." lede="Essays, process diaries and the occasional studio update. Written by the people who did the work." meta="" imageRatio={1.78} dark={false} />
      <NoireJournalGrid stories={all.map(story)} />
    </>
  );
}
