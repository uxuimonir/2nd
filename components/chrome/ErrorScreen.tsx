"use client";
import Link from "next/link";
import { GEO, VB_H, VB_W } from "@/lib/geo";

/** Shared screen for 404 and runtime errors — the map drifts away, a route back is offered. */
export function ErrorScreen({
  code,
  title,
  body,
  action,
}: {
  code: string;
  title: string;
  body: string;
  action: { label: string; href?: string; onClick?: () => void };
}) {
  return (
    <main id="main" className="relative grid min-h-[100svh] place-items-center overflow-hidden bg-[#07090a] text-paper">
      <svg aria-hidden viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute right-[-18vw] top-1/2 h-[120vh] -translate-y-1/2 opacity-[0.14]" style={{ animation: "err-drift 30s ease-in-out infinite alternate" }}>
        <path d={GEO.outline} fill="none" stroke="#d9c7a3" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        {GEO.rivers.map((r) => (
          <path key={r.id} d={r.path} fill="none" stroke="#8cc7da" strokeWidth={1} vectorEffect="non-scaling-stroke" className="river-flow-slow" />
        ))}
      </svg>
      <style>{`@keyframes err-drift{from{transform:translate(0,-50%) rotate(-3deg)}to{transform:translate(-4vw,-48%) rotate(2deg)}}`}</style>
      <div className="gutter relative max-w-5xl">
        <p className="t-kicker mb-6 opacity-60">{code}</p>
        <h1 className="t-display" style={{ fontSize: "var(--step-5)" }}>
          {title}
        </h1>
        <p className="t-lede mt-6 opacity-80">{body}</p>
        <div className="mt-10">
          {action.href ? (
            <Link href={action.href} className="btn-explore" data-cursor="explore">
              <span>{action.label}</span>
              <span aria-hidden>→</span>
            </Link>
          ) : (
            <button type="button" onClick={action.onClick} className="btn-explore" data-cursor="explore">
              <span>{action.label}</span>
              <span aria-hidden>↻</span>
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
