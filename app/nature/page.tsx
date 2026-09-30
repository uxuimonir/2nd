import type { Metadata } from "next";
import { Nature } from "@/features/journey/chapters/Nature";
import { getNature } from "@/services/content";

export const metadata: Metadata = {
  title: "The Nature",
  description: "Cox's Bazar, Saint Martin's Island, Ratargul, Sajek, Bandarban, the tea gardens of Srimangal, Tanguar Haor and Jaflong.",
  alternates: { canonical: "/nature" },
};

export default async function NaturePage() {
  const spots = await getNature();
  return (
    <main id="main" className="pt-10">
      <Nature spots={spots.filter((s) => s.slug !== "sundarbans")} />
    </main>
  );
}
