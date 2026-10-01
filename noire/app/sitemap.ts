import type { MetadataRoute } from "next";
import { legalPages } from "@/content/studio";
import { getArticles, getProjects } from "@/lib/cms";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "",
    "/work",
    "/about",
    "/services",
    "/journal",
    "/studio",
    "/recognition",
    "/contact",
    "/colophon",
  ];
  return [
    ...pages.map((p) => ({
      url: `${base}${p}`,
      changeFrequency: "monthly" as const,
      priority: p === "" ? 1 : 0.7,
    })),
    ...getProjects().map((p) => ({ url: `${base}/work/${p.slug}`, priority: 0.8 })),
    ...getArticles().map((a) => ({
      url: `${base}/journal/${a.slug}`,
      lastModified: a.date,
      priority: 0.6,
    })),
    ...legalPages.map((l) => ({ url: `${base}/legal/${l.slug}`, priority: 0.2 })),
  ];
}
