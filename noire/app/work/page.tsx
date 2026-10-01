import type { Metadata } from "next";
import { NoireCTA, NoireMarquee, NoirePageHero, NoireWorkArchive } from "@/components/sections";
import { site } from "@/content/site";
import { clients } from "@/content/studio";
import { getProjects } from "@/lib/cms";
import { archiveProject, hero } from "@/lib/view";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected identities, exhibitions, books, spaces and digital archives, 2022 — 2026.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  const projects = getProjects();
  return (
    <>
      <NoirePageHero
        label={`Work — ${projects.length} projects`}
        title="Selected work,"
        accent="2022 — 2026"
        lede="Identities, exhibitions, books, spaces and archives. Switch to the index for a faster, text-only view."
        meta=""
        {...hero("hero-work")}
      />
      <NoireMarquee items={clients.join(", ")} speed={40} size={64} dark={false} italic />
      <NoireWorkArchive projects={projects.map(archiveProject)} />
      <NoireCTA eyebrow={site.availability.label} line1="Have something that should" accent="last?" email={site.email} buttonLabel="Start a project" buttonLink="/contact" />
    </>
  );
}
