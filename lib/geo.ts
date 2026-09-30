import geo from "@/content/geo/geo.generated.json";
import type { LngLat } from "@/types/content";

export type GeoData = typeof geo;
export const GEO = geo;
export const [VB_X, VB_Y, VB_W, VB_H] = geo.viewBox as [number, number, number, number];

/** Project [lon, lat] to map viewBox coordinates (same projection as scripts/build-geo.mjs). */
export function project([lon, lat]: LngLat): [number, number] {
  const p = geo.projection;
  return [(lon - p.lonMin) * p.k * p.S, (p.latMax - lat) * p.S];
}

export function unproject([x, y]: [number, number]): LngLat {
  const p = geo.projection;
  return [x / (p.k * p.S) + p.lonMin, p.latMax - y / p.S];
}

export const riverGeo = (id: string) => geo.rivers.find((r) => r.id === id);
export const divisionGeo = (id: string) => geo.divisions.find((d) => d.id === id);

/** Format coordinates editorially: 23.8103° N, 90.4125° E */
export function formatCoord([lon, lat]: LngLat, digits = 2): string {
  return `${Math.abs(lat).toFixed(digits)}° ${lat >= 0 ? "N" : "S"}  ${Math.abs(lon).toFixed(digits)}° ${lon >= 0 ? "E" : "W"}`;
}

/** A camera = centre + width (in viewBox units). Height follows the viewport aspect. */
export interface Camera {
  cx: number;
  cy: number;
  w: number;
}

export const FULL_CAMERA: Camera = { cx: VB_W / 2, cy: VB_H / 2, w: VB_W * 1.02 };

export function cameraToViewBox(cam: Camera, aspect: number): string {
  const h = cam.w / aspect;
  return `${cam.cx - cam.w / 2} ${cam.cy - h / 2} ${cam.w} ${h}`;
}

/** Camera that fits a bounding box [x, y, w, h] inside a viewport of the given aspect. */
export function fitCamera([x, y, w, h]: number[], aspect: number, pad = 1.2): Camera {
  const cw = Math.max(w, h * aspect) * pad;
  return { cx: x + w / 2, cy: y + h / 2, w: cw };
}

/** Camera that fits the whole country for a viewport aspect. */
export function countryCamera(aspect: number, pad = 1.08): Camera {
  return fitCamera([0, 0, VB_W, VB_H], aspect, pad);
}
