// Dev helper: renders a contact sheet of public/media to a PNG for review.
import { createRequire } from "node:module";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
const require = createRequire(import.meta.url);
let pw; for (const id of ["playwright", "/opt/node22/lib/node_modules/playwright"]) { try { pw = require(id); break; } catch {} }
const [dir, outFile, filter = ""] = process.argv.slice(2);
const files = readdirSync(dir).filter((f) => f.endsWith(".webp") && f.includes(filter)).sort();
const cells = files.map((f) => `<figure><img src="data:image/webp;base64,${readFileSync(path.join(dir, f)).toString("base64")}"><figcaption>${f}</figcaption></figure>`).join("");
const b = await pw.chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
await p.setContent(`<style>body{margin:0;background:#222;display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:6px;font:12px sans-serif;color:#ccc}img{width:100%;height:260px;object-fit:contain;background:#111}figure{margin:0}</style>${cells}`);
await p.screenshot({ path: outFile, fullPage: true }); await b.close();
