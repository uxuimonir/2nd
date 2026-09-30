import { media } from "@/content/media";
import type { MediaAsset } from "@/types/content";
import { md5 } from "./md5";

/** Wikimedia's standard thumbnail steps; requesting these keeps us on warm CDN caches. */
export const THUMB_STEPS = [500, 960, 1280, 1920] as const;

const COMMONS = "https://upload.wikimedia.org/wikipedia/commons";

export function getMedia(id?: string): MediaAsset | undefined {
  return id ? media[id] : undefined;
}

const normalise = (file: string) => file.replace(/ /g, "_");

/** Direct thumbnail URL on upload.wikimedia.org for a given width. */
export function commonsThumb(file: string, width: number): string {
  const name = normalise(file);
  const hash = md5(name);
  const enc = encodeURIComponent(name);
  // Wikimedia serves PNG thumbs for SVGs; for bitmaps the thumb keeps the original extension.
  return `${COMMONS}/thumb/${hash[0]}/${hash.slice(0, 2)}/${enc}/${width}px-${enc}`;
}

/** Redirecting fallback that tolerates widths larger than the original. */
export function commonsFilePath(file: string, width: number): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(normalise(file))}?width=${width}`;
}

export function commonsPage(file: string): string {
  return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(normalise(file))}`;
}

export function srcSet(asset: MediaAsset): string {
  return THUMB_STEPS.filter((w) => !asset.maxWidth || w <= asset.maxWidth)
    .map((w) => `${commonsThumb(asset.file, w)} ${w}w`)
    .join(", ");
}

export function bestSrc(asset: MediaAsset, target = 1280): string {
  const steps = THUMB_STEPS.filter((w) => !asset.maxWidth || w <= asset.maxWidth);
  const w = steps.find((s) => s >= target) ?? steps[steps.length - 1];
  return commonsThumb(asset.file, w);
}
