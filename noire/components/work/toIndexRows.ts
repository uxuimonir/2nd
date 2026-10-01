import { getMedia } from "@/lib/cms";
import type { Project } from "@/lib/types";
import type { IndexRow } from "./WorkIndex";

/** Serialisable rows for the client-side index (no functions, small payload). */
export function toIndexRows(projects: Project[]): IndexRow[] {
  return projects.map((p) => {
    const m = getMedia(p.heroImage);
    return {
      slug: p.slug,
      title: p.title,
      year: p.year,
      discipline: p.discipline,
      client: p.client,
      thumb: { src: m.src, alt: m.alt, focal: p.heroFocal ?? m.focal },
    };
  });
}
