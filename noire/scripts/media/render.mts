/**
 * Renders the demo media library (content/media.ts) to public/media/*.webp
 * using headless Chromium and the procedural recipes in recipes.js.
 *
 *   npm run media:generate            # render missing files
 *   npm run media:generate -- --force # re-render everything
 *   npm run media:generate -- p-tidewater-hero a-03   # specific ids
 */
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { media } from "../../content/media";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const out = path.join(root, "public/media");
mkdirSync(out, { recursive: true });

const require = createRequire(import.meta.url);
function loadPlaywright() {
  for (const id of ["playwright", "/opt/node22/lib/node_modules/playwright"]) {
    try {
      return require(id);
    } catch {}
  }
  throw new Error("Playwright not found. Install it with `npm i -D playwright`.");
}
const { chromium } = loadPlaywright();

const args = process.argv.slice(2);
const force = args.includes("--force");
const only = args.filter((a) => !a.startsWith("--"));
const assets = Object.values(media).filter(
  (m) => (only.length ? only.includes(m.id) : true) && (force || only.length || !existsSync(path.join(out, `${m.id}.webp`))),
);

const browser = await chromium.launch(
  existsSync("/opt/pw-browsers/chromium") ? { executablePath: undefined } : {},
);
const script = readFileSync(path.join(here, "recipes.js"), "utf8");
const workers = 4;
let done = 0;
const queue = [...assets];
await Promise.all(
  Array.from({ length: workers }, async () => {
    const page = await browser.newPage();
    await page.setContent("<!doctype html><html><body></body></html>");
    await page.addScriptTag({ content: script });
    while (queue.length) {
      const m = queue.shift()!;
      const url: string = await page.evaluate((spec: unknown) => (window as any).renderMedia(spec), m);
      writeFileSync(path.join(out, `${m.id}.webp`), Buffer.from(url.split(",")[1], "base64"));
      done++;
      process.stdout.write(`\r${done}/${assets.length} ${m.id}`.padEnd(60));
    }
    await page.close();
  }),
);
await browser.close();
console.log(`\nRendered ${done} images to public/media`);
