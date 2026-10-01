import { formatDate, getMedia, readingTime } from "@/lib/cms";
import type { Article, Project } from "@/lib/types";

/** Content → section props mappers (keeps pages declarative). */

export function img(id: string) {
  const m = getMedia(id);
  return { src: m.src, alt: m.alt };
}

const TONES = ["#2B2722", "#173A33", "#3A322A", "#15130F", "#3B2A20", "#2A2C2E", "#2F2A22", "#2E1E1B"];

export function stackedProject(p: Project, i: number) {
  return {
    title: p.title,
    client: p.client,
    discipline: p.discipline,
    year: String(p.year),
    thesis: p.thesis,
    link: `/work/${p.slug}`,
    image: img(p.heroImage),
    tone: TONES[i % TONES.length],
  };
}

export function indexRow(p: Project) {
  return { title: p.title, year: String(p.year), discipline: p.discipline, client: p.client, link: `/work/${p.slug}`, image: img(p.heroImage) };
}

export function archiveProject(p: Project) {
  return { title: p.title, client: p.client, discipline: p.discipline, category: p.category, year: String(p.year), link: `/work/${p.slug}`, image: img(p.heroImage) };
}

export function story(a: Article) {
  return {
    title: a.title,
    category: a.category,
    date: formatDate(a.date, "short"),
    read: `${readingTime(a)} min`,
    excerpt: a.excerpt,
    link: `/journal/${a.slug}`,
    image: img(a.coverImage),
  };
}

/** Article blocks → the light markup NoireArticle renders. */
export function articleBody(a: Article) {
  return a.body
    .map((b) => {
      if (b.type === "heading") return `## ${b.text}`;
      if (b.type === "quote") return `> ${b.text}`;
      if (b.type === "image") return `[img] ${getMedia(b.image).src} | ${b.caption}`;
      return b.text;
    })
    .join("\n\n");
}
