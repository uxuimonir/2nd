import Link from "next/link";
import { GEO, VB_H, VB_W } from "@/lib/geo";

const LINKS = [
  ["/map", "Map"],
  ["/land", "Land"],
  ["/rivers", "Rivers"],
  ["/cities", "Cities"],
  ["/history", "History"],
  ["/heritage", "Heritage"],
  ["/culture", "Culture"],
  ["/food", "Food"],
  ["/nature", "Nature"],
  ["/sundarbans", "Sundarbans"],
  ["/modern-bangladesh", "Modern"],
  ["/future", "Future"],
  ["/explore", "Explore"],
  ["/search", "Search"],
  ["/about", "About & credits"],
];

export function SiteFooter() {
  return (
    <footer className="gutter relative overflow-hidden border-t border-white/10 bg-[#07090a] py-16 text-paper">
      <div className="grid grid-cols-12 gap-x-[var(--col-gap)] gap-y-10">
        <div className="col-span-12 md:col-span-5">
          <p className="t-display text-5xl leading-none">Digital Bangladesh</p>
          <p lang="bn" className="t-bn mt-2 opacity-60">
            ডিজিটাল বাংলাদেশ
          </p>
          <p className="mt-6 max-w-sm text-sm opacity-60">A living journey through land, water, history &amp; people. Geography from Natural Earth, geoBoundaries and open elevation data; photography from Wikimedia Commons contributors.</p>
        </div>
        <nav aria-label="Sections" className="col-span-12 md:col-span-6 md:col-start-7">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
            {LINKS.map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="t-kicker link-underline opacity-80 hover:opacity-100">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <svg aria-hidden viewBox={`0 0 ${VB_W} ${VB_H}`} className="pointer-events-none absolute -bottom-40 right-[-4rem] h-[26rem] opacity-[0.07]">
        <path d={GEO.outline} fill="none" stroke="#d9c7a3" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      </svg>
      <p className="t-coord mt-16 opacity-40">20°34′–26°38′ N · 88°01′–92°41′ E</p>
    </footer>
  );
}
