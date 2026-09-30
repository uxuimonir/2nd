import type { Metadata } from "next";
import { SearchPanel } from "@/components/chrome/SearchOverlay";

export const metadata: Metadata = {
  title: "Search",
  description: "Search places, cities, rivers, heritage, food, culture, history and nature across Bangladesh.",
  alternates: { canonical: "/search" },
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return (
    <main id="main" className="gutter min-h-[100svh] bg-ink pb-16 pt-32 text-paper">
      <h1 className="sr-only">Search Digital Bangladesh</h1>
      <div className="h-[calc(100svh-12rem)] min-h-[32rem]">
        <SearchPanel initialQuery={typeof q === "string" ? q : ""} />
      </div>
    </main>
  );
}
