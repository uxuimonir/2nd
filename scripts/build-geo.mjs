/**
 * Geographic build pipeline for Digital Bangladesh.
 *
 * Sources (see data/geo/README.md):
 *  - Natural Earth 1:10m admin-0 outline + river centerlines (public domain)
 *  - geoBoundaries gbOpen BGD ADM1 divisions (CC BY 4.0)
 *  - AWS Terrain Tiles / Terrarium elevation (Mapzen, see attribution)
 *
 * Output:
 *  - content/geo/geo.generated.json  (projected SVG paths, river polylines)
 *  - public/geo/contours.json        (elevation contours, lazy-loaded)
 *  - public/geo/elevation.png        (heightmap aligned to the map viewBox)
 *
 * Run: npm run geo:build
 */
import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SRC = path.join(ROOT, "data/geo/sources");
const CACHE = path.join(ROOT, "data/geo/cache");

// ---------- projection (equirectangular, scaled by cos of mid-latitude) ----------
export const PROJ = { lonMin: 87.95, lonMax: 92.75, latMin: 20.55, latMax: 26.7, S: 200 };
const K = Math.cos(((PROJ.latMin + PROJ.latMax) / 2) * (Math.PI / 180));
const W = Math.round((PROJ.lonMax - PROJ.lonMin) * K * PROJ.S);
const H = Math.round((PROJ.latMax - PROJ.latMin) * PROJ.S);
const project = ([lon, lat]) => [(lon - PROJ.lonMin) * K * PROJ.S, (PROJ.latMax - lat) * PROJ.S];
const r1 = (n) => Math.round(n * 10) / 10;

// ---------- helpers ----------
function simplify(points, tol) {
  if (points.length < 3) return points;
  const sq = tol * tol;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let max = 0, idx = -1;
    const [ax, ay] = points[a], [bx, by] = points[b];
    const dx = bx - ax, dy = by - ay, len = dx * dx + dy * dy || 1e-9;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = points[i];
      let t = ((px - ax) * dx + (py - ay) * dy) / len;
      t = Math.max(0, Math.min(1, t));
      const ex = ax + t * dx - px, ey = ay + t * dy - py, d = ex * ex + ey * ey;
      if (d > max) { max = d; idx = i; }
    }
    if (max > sq && idx > 0) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
  }
  return points.filter((_, i) => keep[i]);
}
const ringPath = (ring) => "M" + ring.map(([x, y]) => `${r1(x)} ${r1(y)}`).join("L") + "Z";
function polygonsOf(geom) {
  return geom.type === "MultiPolygon" ? geom.coordinates : [geom.coordinates];
}
function area(ring) {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]);
  return Math.abs(a / 2);
}
function centroid(ring) {
  let x = 0, y = 0, a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const f = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
    x += (ring[j][0] + ring[i][0]) * f; y += (ring[j][1] + ring[i][1]) * f; a += f;
  }
  a *= 3;
  return [r1(x / a), r1(y / a)];
}
function bbox(rings) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const r of rings) for (const [x, y] of r) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return [r1(x0), r1(y0), r1(x1 - x0), r1(y1 - y0)];
}
/** Catmull-Rom → cubic Bézier path through points (smooth river courses). */
function smoothPath(pts) {
  if (pts.length < 3) return "M" + pts.map(([x, y]) => `${r1(x)} ${r1(y)}`).join("L");
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d;
}
function resample(pts, step) {
  const out = [pts[0]];
  let carry = 0;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
    const seg = Math.hypot(bx - ax, by - ay);
    let t = step - carry;
    while (t <= seg) { out.push([ax + ((bx - ax) * t) / seg, ay + ((by - ay) * t) / seg]); t += step; }
    carry = seg - (t - step);
  }
  out.push(pts[pts.length - 1]);
  return out.map(([x, y]) => [r1(x), r1(y)]);
}
const polyLen = (pts) => pts.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);

// ---------- outline ----------
const outlineFC = JSON.parse(fs.readFileSync(path.join(SRC, "bangladesh-outline.ne10m.geojson"), "utf8"));
const outlineRings = polygonsOf(outlineFC.features[0].geometry)
  .map((poly) => simplify(poly[0].map(project), 0.35))
  .filter((r) => r.length > 3 && area(r) > 1.5)
  .sort((a, b) => area(b) - area(a));
const outline = outlineRings.map(ringPath).join("");
const outlineMain = ringPath(outlineRings[0]);

// ---------- divisions ----------
const DIVISION_FIX = { Rajshani: "Rajshahi", Barisal: "Barishal", Chittagong: "Chattogram" };
const divFC = JSON.parse(fs.readFileSync(path.join(SRC, "divisions.geoboundaries-adm1.geojson"), "utf8"));
const divisions = divFC.features.map((f) => {
  const name = DIVISION_FIX[f.properties.shapeName] || f.properties.shapeName;
  const rings = polygonsOf(f.geometry).map((p) => simplify(p[0].map(project), 0.5)).filter((r) => r.length > 3);
  const main = [...rings].sort((a, b) => area(b) - area(a))[0];
  return { id: name.toLowerCase(), name, path: rings.map(ringPath).join(""), centroid: centroid(main), bbox: bbox(rings) };
});

// ---------- rivers ----------
const riverFC = JSON.parse(fs.readFileSync(path.join(SRC, "rivers.ne10m.geojson"), "utf8"));
const ne = (name, idx) => {
  const f = riverFC.features.filter((x) => x.properties.name === name);
  const lines = f.flatMap((x) => (x.geometry.type === "MultiLineString" ? x.geometry.coordinates : [x.geometry.coordinates]));
  return lines[idx];
};
const between = (line, test) => line.filter(test);
const idxNear = (line, [lon, lat]) => {
  let best = 0, bd = Infinity;
  line.forEach(([x, y], i) => { const d = (x - lon) ** 2 + (y - lat) ** 2; if (d < bd) { bd = d; best = i; } });
  return best;
};
const slice = (line, from, to) => line.slice(idxNear(line, from), idxNear(line, to) + 1);

const brahma = ne("Brahmaputra", 0);
const balak = ne("Balak", 1);
const balakLower = ne("Balak", 2);
const ganges = ne("Ganges", 0);
const gangesLink = ne("Ganges", 4);
const tista = ne("Tista", 0);
const karna = riverFC.features.find((f) => f.properties.name === "unnamed").geometry;
const karnaLine = karna.type === "MultiLineString" ? karna.coordinates[0] : karna.coordinates;

/**
 * Each river: named, with "source" noting which parts are Natural Earth geometry
 * and which are schematic waypoints between well-known river towns.
 */
const RIVER_DEFS = [
  {
    id: "padma",
    coords: [
      ...between(ganges, ([x]) => x >= 88.05),
      ...gangesLink.slice(1),
      ...slice(brahma, [89.79, 23.8], [90.21, 23.5]).slice(1),
      [90.4, 23.33], [90.56, 23.25], [90.64, 23.23],
    ],
    source: "Natural Earth centerline (Ganges/Padma) + schematic reach Mawa–Chandpur",
  },
  {
    id: "jamuna",
    coords: slice(brahma, [89.87, 25.93], [89.79, 23.8]),
    source: "Natural Earth centerline (Brahmaputra/Jamuna)",
  },
  {
    id: "meghna",
    coords: [
      ...slice(balak, [91.27, 24.59], [91.17, 24.36]),
      ...ne("Balak", 0),
      ...balakLower.slice(1),
      [90.63, 23.42], [90.64, 23.23], [90.7, 22.98], [90.78, 22.72], [90.86, 22.45], [91.0, 22.2],
    ],
    source: "Natural Earth centerline (upper Meghna) + schematic lower Meghna to the estuary",
  },
  {
    id: "surma",
    coords: slice(balak, [92.48, 24.93], [91.27, 24.59]),
    source: "Natural Earth centerline (Barak/Surma)",
  },
  {
    id: "teesta",
    coords: between(tista, ([, y]) => y <= 26.3),
    source: "Natural Earth centerline (Tista)",
  },
  {
    id: "old-brahmaputra",
    coords: [[89.71, 25.2], [89.86, 25.02], [89.95, 24.93], [90.18, 24.85], [90.4, 24.76], [90.55, 24.6], [90.72, 24.38], [90.86, 24.18], [90.98, 24.02]],
    source: "Schematic course via Jamalpur and Mymensingh to Bhairab",
  },
  {
    id: "karnaphuli",
    coords: [[92.18, 22.62], ...karnaLine.filter(([x]) => x <= 92.2), [91.86, 22.35], [91.82, 22.28], [91.8, 22.22]],
    source: "Natural Earth centerline + schematic reach through Chattogram",
  },
  {
    id: "pasur",
    coords: [[89.55, 22.9], [89.57, 22.8], [89.59, 22.63], [89.6, 22.48], [89.62, 22.3], [89.6, 22.1], [89.58, 21.85]],
    source: "Schematic course: Rupsha at Khulna → Pasur via Mongla to the Bay",
  },
  {
    id: "buriganga",
    coords: [[90.33, 23.8], [90.35, 23.72], [90.4, 23.7], [90.44, 23.66], [90.48, 23.6]],
    source: "Schematic course along old Dhaka",
  },
];
const rivers = RIVER_DEFS.map((r) => {
  const projected = r.coords.map(project);
  const s = simplify(projected, 0.6);
  const points = resample(s, 6);
  return { id: r.id, path: smoothPath(s), points, length: Math.round(polyLen(points)), source: r.source };
});

// ---------- elevation (Terrarium tiles) ----------
const Z = 8;
const lon2tile = (lon) => ((lon + 180) / 360) * 2 ** Z;
const lat2tile = (lat) => ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * 2 ** Z;
async function tile(x, y) {
  fs.mkdirSync(CACHE, { recursive: true });
  const f = path.join(CACHE, `terrarium-${Z}-${x}-${y}.png`);
  if (!fs.existsSync(f)) {
    const url = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${Z}/${x}/${y}.png`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`tile ${url}: ${res.status}`);
    fs.writeFileSync(f, Buffer.from(await res.arrayBuffer()));
  }
  return PNG.sync.read(fs.readFileSync(f));
}
const GW = 440, GH = Math.round((GW * H) / W);
const tiles = new Map();
async function elevAt(lon, lat) {
  const tx = lon2tile(lon), ty = lat2tile(lat);
  const x = Math.floor(tx), y = Math.floor(ty);
  const key = `${x}/${y}`;
  if (!tiles.has(key)) tiles.set(key, await tile(x, y));
  const png = tiles.get(key);
  const px = Math.min(255, Math.floor((tx - x) * 256)), py = Math.min(255, Math.floor((ty - y) * 256));
  const i = (py * 256 + px) * 4;
  return png.data[i] * 256 + png.data[i + 1] + png.data[i + 2] / 256 - 32768;
}
const grid = new Float32Array(GW * GH);
let maxE = 0;
for (let j = 0; j < GH; j++) {
  for (let i = 0; i < GW; i++) {
    const lon = PROJ.lonMin + ((i + 0.5) / GW) * (PROJ.lonMax - PROJ.lonMin);
    const lat = PROJ.latMax - ((j + 0.5) / GH) * (PROJ.latMax - PROJ.latMin);
    const e = Math.max(0, await elevAt(lon, lat));
    grid[j * GW + i] = e;
    maxE = Math.max(maxE, e);
  }
}
// Bangladesh land mask on the same grid (even-odd point-in-polygon over the projected outline)
function inside(x, y) {
  let c = false;
  for (const ring of outlineRings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
  }
  return c;
}
const mask = new Uint8Array(GW * GH);
let maxBD = 0;
for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
  const k = j * GW + i;
  mask[k] = inside(((i + 0.5) / GW) * W, ((j + 0.5) / GH) * H) ? 1 : 0;
  if (mask[k]) maxBD = Math.max(maxBD, grid[k]);
}
// heightmap: sqrt scaling so the 5–50 m floodplain still reads next to 1000 m hills
const png = new PNG({ width: GW, height: GH });
const CAP = 1100;
for (let k = 0; k < grid.length; k++) {
  const v = Math.round(Math.sqrt(Math.min(grid[k], CAP) / CAP) * 255);
  // R = height, G = Bangladesh mask, B = height (so the PNG still previews as greyscale-ish)
  png.data[k * 4] = v;
  png.data[k * 4 + 1] = mask[k] ? 255 : 0;
  png.data[k * 4 + 2] = v;
  png.data[k * 4 + 3] = 255;
}
fs.writeFileSync(path.join(ROOT, "public/geo/elevation.png"), PNG.sync.write(png));

// contours via marching squares (segments; good enough for an editorial layer)
function contour(level) {
  const segs = [];
  const sx = W / GW, sy = H / GH;
  const v = (i, j) => (mask[j * GW + i] ? grid[j * GW + i] : 0);
  const lerp = (a, b) => (level - a) / (b - a);
  for (let j = 0; j < GH - 1; j += 1) for (let i = 0; i < GW - 1; i += 1) {
    const a = v(i, j), b = v(i + 1, j), c = v(i + 1, j + 1), d = v(i, j + 1);
    const idx = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
    if (idx === 0 || idx === 15) continue;
    const top = [(i + lerp(a, b)) * sx, j * sy], right = [(i + 1) * sx, (j + lerp(b, c)) * sy];
    const bottom = [(i + lerp(d, c)) * sx, (j + 1) * sy], left = [i * sx, (j + lerp(a, d)) * sy];
    const table = { 1: [[left, bottom]], 2: [[bottom, right]], 3: [[left, right]], 4: [[top, right]], 5: [[left, top], [bottom, right]], 6: [[top, bottom]], 7: [[left, top]], 8: [[left, top]], 9: [[top, bottom]], 10: [[left, bottom], [top, right]], 11: [[top, right]], 12: [[left, right]], 13: [[bottom, right]], 14: [[left, bottom]] };
    for (const s of table[idx]) segs.push(s);
  }
  return segs.map(([p, q]) => `M${r1(p[0])} ${r1(p[1])}L${r1(q[0])} ${r1(q[1])}`).join("");
}
const contours = [20, 100, 300, 600].map((level) => ({ level, path: contour(level) }));

const out = {
  attribution: [
    "Outline & river centerlines: Natural Earth (public domain)",
    "Divisions: geoBoundaries gbOpen BGD ADM1 (CC BY 4.0)",
    "Elevation: AWS Terrain Tiles (Terrarium) — SRTM & other sources via Mapzen",
  ],
  projection: { ...PROJ, k: K },
  viewBox: [0, 0, W, H],
  outline,
  outlineMain,
  divisions,
  rivers,
  contoursSrc: "/geo/contours.json",
  elevation: { src: "/geo/elevation.png", width: GW, height: GH, maxMeters: Math.round(maxE), maxMetersBangladesh: Math.round(maxBD), capMeters: CAP, scaling: "sqrt" },
};
fs.writeFileSync(path.join(ROOT, "content/geo/geo.generated.json"), JSON.stringify(out));
fs.writeFileSync(path.join(ROOT, "public/geo/contours.json"), JSON.stringify(contours));
console.log(`viewBox ${W}x${H}, ${outlineRings.length} rings, ${divisions.length} divisions, ${rivers.length} rivers, max elevation ${Math.round(maxE)} m (in Bangladesh ${Math.round(maxBD)} m)`);
console.log(`outline ${outline.length}B, contours ${contours.map((c) => c.path.length).join("/")}B`);
