import type { MetadataRoute } from "next";
import { cities, food, heritage, nature } from "@/content";
import { siteUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();
  const statics = ["", "/explore", "/map", "/land", "/rivers", "/cities", "/history", "/heritage", "/culture", "/food", "/nature", "/sundarbans", "/modern-bangladesh", "/future", "/search", "/about"];
  return [
    ...statics.map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.8 })),
    ...cities.map((c) => ({ url: `${base}/city/${c.slug}`, lastModified: now, priority: 0.7 })),
    ...heritage.map((h) => ({ url: `${base}/heritage/${h.slug}`, lastModified: now, priority: 0.7 })),
    ...nature.filter((n) => n.slug !== "sundarbans").map((n) => ({ url: `${base}/nature/${n.slug}`, lastModified: now, priority: 0.7 })),
    ...food.map((f) => ({ url: `${base}/food/${f.slug}`, lastModified: now, priority: 0.6 })),
  ];
}
