import Link from "next/link";
import { ViewTransition } from "react";
import { Media } from "@/components/media/Media";
import type { Project } from "@/lib/types";

type Ratio = "landscape" | "portrait" | "tall" | "square" | "wide";

/**
 * Project Card / Grid. The whole card is one link to the CMS detail page.
 * `morph` names the image so it morphs into the project hero on navigation —
 * enable it for at most one card per project on a page.
 */
export function ProjectCard({
  project,
  ratio = "landscape",
  sizes,
  lead,
  morph,
  priority,
  headingLevel = 3,
}: {
  project: Project;
  ratio?: Ratio;
  sizes: string;
  lead?: boolean;
  morph?: boolean;
  priority?: boolean;
  headingLevel?: 2 | 3;
}) {
  const H = headingLevel === 2 ? "h2" : "h3";
  const media = (
    <Media
      id={project.heroImage}
      ratio={ratio}
      sizes={sizes}
      focal={project.heroFocal}
      className="project-card__media"
      priority={priority}
      decorative
    />
  );
  return (
    <Link
      href={`/work/${project.slug}`}
      className={`project-card${lead ? " project-card--lead" : ""}`}
    >
      {morph ? (
        <ViewTransition name={`project-${project.slug}`} share="morph" default="none">
          {media}
        </ViewTransition>
      ) : (
        media
      )}
      <div className="project-card__meta">
        <H className="project-card__title">{project.title}</H>
        <span className="project-card__year">{project.year}</span>
        <p className="project-card__info">
          {project.client} — {project.discipline}
        </p>
      </div>
    </Link>
  );
}
