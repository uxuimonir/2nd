import type { Metadata } from "next";
import { Suspense } from "react";
import { PageTransition } from "@/components/motion/PageTransition";
import { PageIntro } from "@/components/ui/PageIntro";
import { ProjectCard } from "@/components/work/ProjectCard";
import { WorkArchive } from "@/components/work/WorkArchive";
import { toIndexRows } from "@/components/work/toIndexRows";
import { getProjectCategories, getProjectYears, getProjects } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected identities, exhibitions, books, spaces and digital archives, 2022 — 2026.",
  alternates: { canonical: "/work" },
};

const RATIOS = ["landscape", "portrait", "square", "landscape"] as const;

export default function WorkPage() {
  const projects = getProjects();
  const categories = getProjectCategories();
  const years = getProjectYears();
  const cards = projects.map((p, i) => (
    <ProjectCard
      key={p.slug}
      project={p}
      ratio={RATIOS[i % RATIOS.length]}
      morph
      headingLevel={2}
      priority={i < 2}
      sizes="(min-width: 1200px) 50vw, (min-width: 768px) 50vw, 100vw"
    />
  ));

  return (
    <PageTransition>
      <PageIntro
        label={`Work — ${projects.length} projects`}
        title={
          <>
            Selected work, <em>2022 — 2026</em>
          </>
        }
        lede="Identities, exhibitions, books, spaces and archives. Switch to the index for a faster, text-only view."
      />
      <section className="container section section--flush-top" aria-label="Projects">
        {/* The static fallback is the full grid; the client archive takes over with URL filters. */}
        <Suspense
          fallback={
            <ul role="list" className="work-grid">
              {cards.map((card, i) => (
                <li key={projects[i].slug}>{card}</li>
              ))}
            </ul>
          }
        >
          <WorkArchive
            items={projects.map((p) => ({ slug: p.slug, category: p.category, year: p.year }))}
            rows={toIndexRows(projects)}
            categories={categories}
            years={years}
            cards={cards}
          />
        </Suspense>
      </section>
    </PageTransition>
  );
}
