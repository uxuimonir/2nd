import type { Metadata } from "next";
import { Future } from "@/features/journey/chapters/Future";
import { getStories } from "@/services/content";

export const metadata: Metadata = {
  title: "The Future",
  description: "A delta that adapts — living with water through the Bangladesh Delta Plan 2100, cyclone preparedness and floating gardens.",
  alternates: { canonical: "/future" },
};

export default async function FuturePage() {
  const stories = await getStories();
  return (
    <main id="main" className="pt-10">
      <Future story={stories.find((s) => s.chapter === "future")} />
    </main>
  );
}
