/**
 * QA crawler — run against a running server (default http://localhost:3000):
 *   npm run qa:links -- http://localhost:3000
 * Visits every internal page reachable from "/", and fails on:
 *   - empty, "#" or javascript: hrefs     - internal links that don't return 200
 *   - external links without target/rel  - <img> without an alt attribute
 *   - buttons without an accessible name   - pages without exactly one <h1>
 */
const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const seen = new Set();
const queue = ["/"];
const problems = [];
const statusCache = new Map();

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? m[1] : null;
};

async function status(path) {
  if (!statusCache.has(path)) {
    const res = await fetch(base + path, { redirect: "manual" });
    statusCache.set(path, res.status);
  }
  return statusCache.get(path);
}

while (queue.length) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  seen.add(path);
  const res = await fetch(base + path);
  if (res.status !== 200) {
    problems.push(`${path}: HTTP ${res.status}`);
    continue;
  }
  const html = await res.text();
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) problems.push(`${path}: ${h1} <h1> elements`);
  for (const [tag] of html.matchAll(/<a\s[^>]*>/g)) {
    const href = attr(tag, "href");
    if (href === null || href === "" || href === "#" || href.startsWith("javascript:")) {
      problems.push(`${path}: dead link ${tag.slice(0, 80)}`);
      continue;
    }
    if (/^https?:\/\//.test(href)) {
      if (attr(tag, "target") !== "_blank" || !/noopener/.test(attr(tag, "rel") || ""))
        problems.push(`${path}: external link without target/rel → ${href}`);
      continue;
    }
    if (href.startsWith("mailto:")) continue;
    const url = new URL(href, base + path);
    const internal = url.pathname + url.search;
    if ((await status(url.pathname)) !== 200) problems.push(`${path}: broken link → ${href}`);
    if (url.hash) {
      const target =
        url.pathname === new URL(base + path).pathname
          ? html
          : await (await fetch(base + url.pathname)).text();
      if (!target.includes(`id="${url.hash.slice(1)}"`))
        problems.push(`${path}: missing anchor → ${href}`);
    }
    if (!url.search && !seen.has(url.pathname)) queue.push(url.pathname);
    else if (url.search && !seen.has(internal)) queue.push(internal);
  }
  for (const [tag] of html.matchAll(/<img\s[^>]*>/g))
    if (attr(tag, "alt") === null) problems.push(`${path}: <img> without alt`);
  for (const [, attrs, inner] of html.matchAll(/<button([^>]*)>([\s\S]*?)<\/button>/g)) {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    if (!text && !/aria-label="[^"]+"/.test(attrs))
      problems.push(`${path}: button without accessible name`);
  }
}

const notFound = await status("/this-page-does-not-exist");
if (notFound !== 404) problems.push(`404 route returned ${notFound}`);

console.log(`Crawled ${seen.size} pages.`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log("No dead, empty or placeholder links. Every page has one <h1>, every image an alt.");
