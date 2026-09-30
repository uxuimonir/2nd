import type { Metadata } from "next";
import { Modern } from "@/features/journey/chapters/Modern";
import { getDestinations } from "@/services/content";

export const metadata: Metadata = {
  title: "Modern Bangladesh",
  description: "The Padma Bridge, Dhaka's metro, the Jamuna Bridge and the new public spaces of a connected delta.",
  alternates: { canonical: "/modern-bangladesh" },
};

export default async function ModernPage() {
  const d = await getDestinations();
  return (
    <main id="main" className="pt-10">
      <Modern destinations={d} />
    </main>
  );
}
