"use client";
import Link from "next/link";
import { useMemo, useRef } from "react";
import { Photo } from "@/components/media/Photo";
import { ShaderCanvas } from "@/components/media/ShaderCanvas";
import { ChapterLabel } from "@/components/type/ChapterLabel";
import { useGsap } from "@/hooks/useGsap";
import { useInView, useReducedMotion, useWebGL } from "@/hooks/useMedia";
import { cn } from "@/lib/utils";
import { useScrollProgress } from "../useScrollProgress";

const PANES = [
  { k: "River", t: "Tides, twice a day", d: "Hundreds of channels divide the forest into islands. Twice a day the sea pushes in, and twice a day the rivers push back. The forest lives on that breath.", media: "sundarbans-largest" },
  { k: "Ecosystem", t: "Roots that breathe", d: "Mangroves such as the sundari send breathing roots up through the mud. They hold the coast together and soften the blow of cyclones from the Bay of Bengal.", media: "sundarbans-mangrove" },
  { k: "Wildlife", t: "The tiger is one voice among many", d: "Royal Bengal tigers swim between islands. Spotted deer, estuarine crocodiles, river dolphins, otters, kingfishers and hundreds of other species share the tide-land.", media: "sundarbans-tiger-canal" },
  { k: "People", t: "Working the forest's edge", d: "Fishers, honey collectors and leaf gatherers enter by boat under permits, reading tide and forest. Millions of people live along its margins.", media: "fishermen" },
  { k: "Conservation", t: "A shared inheritance", d: "Protected as a UNESCO World Heritage Site and a Ramsar wetland, the Sundarbans faces rising seas, salinity and cyclones. Keeping it alive keeps the coast alive.", media: "sundarbans-kachikhali" },
];

const WATER = /* glsl */ `
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.02; a*=.5; } return v; }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  vec2 p = uv * vec2(uRes.x/uRes.y, 1.);
  float dawn = smoothstep(0.08, 0.45, uProgress);
  // sky: from night to a pale mangrove dawn
  vec3 night = vec3(0.012, 0.02, 0.022);
  vec3 dawnSky = mix(vec3(0.07,0.11,0.1), vec3(0.42,0.46,0.4), smoothstep(0.35, 1.0, uv.y));
  vec3 col = mix(night, dawnSky, dawn * 0.85);
  // water in the lower third with moving ripples and a reflected glow
  float horizon = 0.36;
  if (uv.y < horizon) {
    float d = (horizon - uv.y);
    vec2 q = vec2(p.x * 3.0, d * 28.0 / (d + 0.08));
    float r = fbm(q + vec2(uTime * 0.05, -uTime * 0.25));
    float ripple = smoothstep(0.55, 0.9, r) * 0.35;
    vec3 water = mix(vec3(0.01,0.025,0.03), vec3(0.12,0.16,0.14), dawn * 0.7);
    float glow = exp(-pow((uv.x - uPointer.x) * 3.0, 2.0)) * 0.25 * (0.3 + dawn);
    col = water + ripple * vec3(0.5,0.6,0.55) * (0.25 + dawn) + glow * vec3(0.8,0.75,0.6) * (1.0 - d * 2.0);
  }
  // mist: slow bands drifting above the water
  float mist = fbm(p * vec2(1.4, 5.0) + vec2(uTime * 0.03, 0.0));
  mist *= smoothstep(0.05, 0.4, uv.y) * smoothstep(0.85, 0.35, uv.y);
  col += mist * mix(0.06, 0.32, dawn) * vec3(0.75,0.8,0.78);
  // vignette
  col *= 1.0 - 0.55 * length(uv - 0.5);
  gl_FragColor = vec4(col, 1.0);
}
`;

/** Seeded, deterministic mangrove silhouettes: spreading crowns, leaning trunks, arching prop roots, breathing roots. */
function useMangroves(seed: number, count: number, w: number, h: number) {
  return useMemo(() => {
    let s = seed;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const r = (n: number) => Math.round(n * 10) / 10; // stable across server/client float formatting
    const trunks: { d: string; w: number }[] = [];
    const leaves: { cx: number; cy: number; r: number }[] = [];
    const roots: string[] = [];
    const ground = h * 0.88;
    for (let i = 0; i < count; i++) {
      const x = (i + 0.2 + rnd() * 0.6) * (w / count);
      const top = h * (0.22 + rnd() * 0.28);
      const spread = 90 + rnd() * 140;
      const stems = 2 + Math.floor(rnd() * 3);
      for (let k = 0; k < stems; k++) {
        const bx = x + (rnd() - 0.5) * 30;
        const tx = x + (rnd() - 0.5) * spread * 0.9;
        const ty = top + 30 + rnd() * 60;
        trunks.push({ d: `M${r(bx)} ${r(ground - 30)} C ${r(bx + (rnd() - 0.5) * 40)} ${r(ground - 160)}, ${r(tx + (rnd() - 0.5) * 60)} ${r(ty + 90)}, ${r(tx)} ${r(ty)}`, w: r(2.5 + rnd() * 4) });
      }
      // a spreading crown made of many small leaf masses — a textured, irregular edge
      const clusters = 22 + Math.floor(rnd() * 16);
      for (let k = 0; k < clusters; k++) {
        const a = rnd() * Math.PI * 2;
        const rr = Math.sqrt(rnd());
        leaves.push({ cx: r(x + Math.cos(a) * spread * rr), cy: r(top + 40 + Math.sin(a) * spread * 0.32 * rr), r: r(12 + rnd() * 30) });
      }
      // arching prop roots
      const props = 5 + Math.floor(rnd() * 5);
      for (let k = 0; k < props; k++) {
        const sx = x + (rnd() - 0.5) * 30;
        const sy = ground - 40 - rnd() * 90;
        const ex = sx + (rnd() - 0.5) * 170;
        roots.push(`M${r(sx)} ${r(sy)} Q ${r((sx + ex) / 2 + (rnd() - 0.5) * 30)} ${r(sy - 30 - rnd() * 40)}, ${r(ex)} ${r(ground + 6)}`);
      }
    }
    return { trunks, leaves, roots, ground };
  }, [seed, count, w, h]);
}

function MangroveLayer({ seed, count, opacity, blur = 0, className }: { seed: number; count: number; opacity: number; blur?: number; className?: string }) {
  const W = 1600;
  const H = 900;
  const m = useMangroves(seed, count, W, H);
  const id = `mg-${seed}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className={cn("absolute inset-0 h-full w-full", className)} aria-hidden>
      {blur > 0 && (
        <filter id={id}>
          <feGaussianBlur stdDeviation={blur} />
        </filter>
      )}
      <g fill="#030806" stroke="#030806" opacity={opacity} filter={blur > 0 ? `url(#${id})` : undefined}>
        {m.leaves.map((c, i) => (
          <circle key={i} cx={c.cx} cy={c.cy} r={c.r} stroke="none" />
        ))}
        {m.trunks.map((t, i) => (
          <path key={i} d={t.d} fill="none" strokeWidth={t.w} strokeLinecap="round" />
        ))}
        {m.roots.map((d, i) => (
          <path key={i} d={d} fill="none" strokeWidth={1.8} />
        ))}
        <rect x={0} y={m.ground} width={W} height={H - m.ground} stroke="none" />
        {Array.from({ length: 220 }, (_, i) => {
          const x = (i * 71.3 + seed * 13) % W;
          const hgt = 6 + ((i * 37 + seed) % 20);
          return <rect key={i} x={Math.round(x * 10) / 10} y={m.ground - hgt} width={1.6} height={hgt} stroke="none" />;
        })}
      </g>
    </svg>
  );
}

/** 13 — THE SUNDARBANS. Darkness → water → mist → mangrove → river, ecosystem, wildlife, people, conservation. */
export function Sundarbans() {
  const root = useRef<HTMLElement>(null);
  const webgl = useWebGL();
  const reduced = useReducedMotion();
  const visible = useInView(root, "100px");
  const { progress, step } = useScrollProgress(root, 7);
  const pane = Math.max(0, Math.min(PANES.length - 1, step - 2));
  const showPanes = step >= 2;

  useGsap(
    ({ gsap, reduced: r }) => {
      if (r || !root.current) return;
      const q = gsap.utils.selector(root.current);
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.8 } });
      tl.fromTo(q("[data-s-far]"), { yPercent: 35 }, { yPercent: 0, duration: 0.25, ease: "power2.out" }, 0.04)
        .fromTo(q("[data-s-near]"), { yPercent: 50 }, { yPercent: 8, duration: 0.3, ease: "power2.out" }, 0.06)
        .to(q("[data-s-near]"), { yPercent: 30, opacity: 0.4, duration: 0.5 }, 0.3)
        .fromTo(q("[data-s-intro]"), { opacity: 1 }, { opacity: 0, duration: 0.06 }, 0.24);
      return () => tl.scrollTrigger?.kill();
    },
    root,
  );

  return (
    <section ref={root} id="chapter-sundarbans" data-chapter="sundarbans" aria-labelledby="sundarbans-title" className="relative h-[720svh] bg-[#020504] text-paper">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          {webgl && !reduced ? (
            <ShaderCanvas fragment={WATER} progress={progress} paused={!visible} />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#0b1411_0%,#1c2a24_55%,#06100f_62%,#020504_100%)]" />
          )}
        </div>
        <div data-s-far className="absolute inset-0">
          <MangroveLayer seed={7} count={9} opacity={0.5} blur={3} />
        </div>
        <div data-s-near className="absolute inset-0">
          <MangroveLayer seed={42} count={5} opacity={0.96} className="scale-110" />
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3" style={{ background: "linear-gradient(to top, rgba(2,5,4,.9), transparent)" }} />

        <div data-s-intro className="gutter absolute inset-x-0 top-[22svh]">
          <ChapterLabel id="sundarbans" />
          <h2 id="sundarbans-title" className="t-display mt-6" style={{ fontSize: "var(--step-6)" }}>
            Sundarbans
          </h2>
          <p lang="bn" className="t-bn opacity-70" style={{ fontSize: "var(--step-2)" }}>
            সুন্দরবন
          </p>
          <p className="t-kicker mt-8 opacity-60">Darkness · water · mist · mangrove</p>
        </div>

        {/* the five panes */}
        <div className={cn("gutter absolute inset-0 grid grid-cols-12 items-center gap-x-[var(--col-gap)] transition-opacity duration-1000", showPanes ? "opacity-100" : "pointer-events-none opacity-0")}>
          <div className="col-span-12 mt-16 md:col-span-6 md:col-start-7 md:mt-0">
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              {PANES.map((p, i) => (
                <div key={p.k} className="absolute inset-0 transition-[opacity,clip-path] duration-[1400ms] ease-[var(--ease-in-out-quart)]" style={{ opacity: i === pane ? 1 : 0, clipPath: i === pane ? "inset(0 0 0 0)" : "inset(0 0 100% 0)" }}>
                  {Math.abs(i - pane) <= 1 && <Photo id={p.media} className="absolute inset-0" sizes="(min-width:768px) 48vw, 100vw" target={1280} />}
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-12 md:col-span-5 md:row-start-1" aria-live="polite">
            <ol className="mb-6 flex flex-wrap gap-x-4 gap-y-1">
              {PANES.map((p, i) => (
                <li key={p.k} className={cn("t-kicker transition-opacity", i === pane ? "opacity-100" : "opacity-35")}>
                  {p.k}
                </li>
              ))}
            </ol>
            <p className="t-display" style={{ fontSize: "var(--step-3)" }}>
              {PANES[pane].t}
            </p>
            <p className="t-body mt-4 opacity-85">{PANES[pane].d}</p>
            {pane === PANES.length - 1 && (
              <Link href="/sundarbans" className="btn-explore mt-8" data-cursor="explore">
                <span>Into the forest</span>
                <span aria-hidden>→</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
