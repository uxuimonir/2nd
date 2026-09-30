import type { Metadata } from "next";
import { Heritage } from "@/features/journey/chapters/Heritage";
import { getHeritage } from "@/services/content";

export const metadata: Metadata = {
  title: "The Heritage",
  description: "Somapura Mahavihara, the Sixty Dome Mosque, Lalbagh Fort, Ahsan Manzil, Panam City and more — brick, stone and terracotta across Bangladesh.",
  alternates: { canonical: "/heritage" },
};

export default async function HeritagePage() {
  const sites = await getHeritage();
  return (
    <main id="main" className="pt-10">
      <Heritage sites={sites} />
    </main>
  );
}
