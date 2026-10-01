import { validateContent } from "../lib/cms";
import { media } from "../content/media";
import { existsSync } from "node:fs";
import path from "node:path";

const errors = validateContent();
for (const m of Object.values(media)) {
  if (!existsSync(path.join(process.cwd(), "public", m.src)))
    errors.push(`file missing for media "${m.id}" (${m.src}) — run npm run media:generate`);
}
if (errors.length) {
  console.error(`CMS check failed (${errors.length}):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log("CMS check passed: all slugs unique, references resolve, media present.");
