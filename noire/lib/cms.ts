import { articles } from "@/content/journal";
import { media } from "@/content/media";
import { projects } from "@/content/projects";
import { archive, recognition } from "@/content/studio";
import type { Article, MediaAsset, Project } from "@/lib/types";

/**
 * Read layer over the content collections. Pages only talk to this module,
 * so swapping the static content for a headless CMS touches one file.
 */

export function getMedia(id: string): MediaAsset {
  const asset = media[id];
  if (!asset) throw new Error(`Unknown media id "${id}"`);
  return asset;
}

const bySort = (a: Project, b: Project) => a.sortOrder - b.sortOrder;

export function getProjects(): Project[] {
  return [...projects].sort(bySort);
}

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return getProjects().filter((p) => p.featured);
}

/** Related projects that resolve to real records (never dead links). */
export function getRelatedProjects(project: Project): Project[] {
  return project.related.map(getProject).filter((p): p is Project => Boolean(p));
}

/** Previous/next derived from the same sorted collection, wrapping around. */
export function getAdjacentProjects(slug: string) {
  const list = getProjects();
  const i = list.findIndex((p) => p.slug === slug);
  return {
    previous: list[(i - 1 + list.length) % list.length],
    next: list[(i + 1) % list.length],
  };
}

export function getProjectCategories() {
  return [...new Set(getProjects().map((p) => p.category))];
}

export function getProjectYears() {
  return [...new Set(getProjects().map((p) => p.year))].sort((a, b) => b - a);
}

const byDate = (a: Article, b: Article) => b.date.localeCompare(a.date);

export function getArticles(): Article[] {
  return [...articles].sort(byDate);
}

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getFeaturedArticle(): Article {
  return getArticles().find((a) => a.featured) ?? getArticles()[0];
}

export function getRelatedArticles(article: Article): Article[] {
  return article.related.map(getArticle).filter((a): a is Article => Boolean(a));
}

/** Newer / older neighbours in date order. No wrap-around for a journal. */
export function getAdjacentArticles(slug: string) {
  const list = getArticles();
  const i = list.findIndex((a) => a.slug === slug);
  return { newer: list[i - 1], older: list[i + 1] };
}

export function getArticleCategories() {
  return [...new Set(getArticles().map((a) => a.category))];
}

export function readingTime(article: Article): number {
  const words = article.body
    .map((b) => ("text" in b ? b.text : b.caption))
    .join(" ")
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

export function formatDate(iso: string, style: "long" | "short" = "long") {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

/**
 * Integrity check for every collection: slugs unique, references resolve,
 * every media id exists. Run with `npm run cms:check` and at build time.
 */
export function validateContent(): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  const checkMedia = (id: string, where: string) => {
    if (!media[id]) errors.push(`${where}: missing media "${id}"`);
  };
  for (const p of projects) {
    if (seen.has(p.slug)) errors.push(`Duplicate project slug "${p.slug}"`);
    seen.add(p.slug);
    if (!/^[a-z0-9-]+$/.test(p.slug)) errors.push(`Invalid slug "${p.slug}"`);
    checkMedia(p.heroImage, `project ${p.slug} hero`);
    p.gallery.forEach((g) => checkMedia(g.image, `project ${p.slug} gallery`));
    p.related.forEach((r) => {
      if (!getProject(r)) errors.push(`project ${p.slug}: related "${r}" does not exist`);
      if (r === p.slug) errors.push(`project ${p.slug}: relates to itself`);
    });
    if (p.externalUrl && !/^https:\/\//.test(p.externalUrl))
      errors.push(`project ${p.slug}: externalUrl must be https`);
  }
  const seenA = new Set<string>();
  for (const a of articles) {
    if (seenA.has(a.slug)) errors.push(`Duplicate article slug "${a.slug}"`);
    seenA.add(a.slug);
    checkMedia(a.coverImage, `article ${a.slug} cover`);
    a.body.forEach((b) => b.type === "image" && checkMedia(b.image, `article ${a.slug} body`));
    a.related.forEach(
      (r) => !getArticle(r) && errors.push(`article ${a.slug}: related "${r}" does not exist`),
    );
  }
  archive.forEach((item) => {
    checkMedia(item.image, `archive ${item.id}`);
    if (item.project && !getProject(item.project))
      errors.push(`archive ${item.id}: project "${item.project}" does not exist`);
  });
  recognition.forEach((r) => {
    if (r.project && !getProject(r.project))
      errors.push(`recognition ${r.title}: project "${r.project}" does not exist`);
  });
  // The same image should not appear in unrelated places.
  const usage = new Map<string, string[]>();
  const use = (id: string, where: string) => usage.set(id, [...(usage.get(id) ?? []), where]);
  projects.forEach((p) => p.gallery.forEach((g) => use(g.image, p.slug)));
  articles.forEach((a) => use(a.coverImage, a.slug));
  archive.forEach((i) => use(i.image, i.id));
  usage.forEach(
    (where, id) => where.length > 1 && errors.push(`media "${id}" reused in ${where.join(", ")}`),
  );
  return errors;
}
