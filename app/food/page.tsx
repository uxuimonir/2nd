import type { Metadata } from "next";
import { Food } from "@/features/journey/chapters/Food";
import { getFood } from "@/services/content";

export const metadata: Metadata = {
  title: "The Food",
  description: "Hilsa, kacchi biryani, bhuna khichuri, fuchka, bhorta, pitha, chingri and the sweets of Bengal — a map you can taste.",
  alternates: { canonical: "/food" },
};

export default async function FoodPage() {
  const items = await getFood();
  return (
    <main id="main" className="bg-paper pt-10">
      <Food items={items} />
    </main>
  );
}
