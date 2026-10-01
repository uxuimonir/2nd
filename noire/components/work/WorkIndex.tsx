"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { MediaAsset, Project } from "@/lib/types";

export type IndexRow = Pick<Project, "slug" | "title" | "year" | "discipline" | "client"> & {
  thumb: Pick<MediaAsset, "src" | "alt" | "focal">;
};

/**
 * Project Card / List — dense, keyboard-friendly index. On desktop with a
 * fine pointer a thumbnail follows the cursor; on touch the row simply links.
 * The preview is decorative: all information is in the row itself.
 */
export function WorkIndex({ rows, headingLevel = 3 }: { rows: IndexRow[]; headingLevel?: 2 | 3 }) {
  const [active, setActive] = useState<IndexRow | null>(null);
  const [enabled, setEnabled] = useState(false);
  const preview = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const H = headingLevel === 2 ? "h2" : "h3";

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    let frame = 0;
    const tick = () => {
      const p = pos.current;
      const k = reduce.matches ? 1 : 0.18;
      p.x += (p.tx - p.x) * k;
      p.y += (p.ty - p.y) * k;
      if (preview.current) {
        preview.current.style.transform = `translate3d(${p.x + 24}px, ${p.y - 120}px, 0)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      mq.removeEventListener("change", update);
      cancelAnimationFrame(frame);
    };
  }, []);

  const onMove = (e: React.PointerEvent) => {
    pos.current.tx = e.clientX;
    pos.current.ty = e.clientY;
    if (!active) {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
    }
  };

  return (
    <div
      className="work-index"
      onPointerMove={enabled ? onMove : undefined}
      onPointerLeave={() => setActive(null)}
    >
      <div className="work-index__head t-label" aria-hidden="true">
        <span className="work-index__year">Year</span>
        <span>Project</span>
        <span className="work-index__discipline">Discipline</span>
        <span className="work-index__client">Client</span>
        <span />
      </div>
      <ul role="list" className="work-index__list">
        {rows.map((row) => (
          <li key={row.slug}>
            <Link
              href={`/work/${row.slug}`}
              className="work-index__row"
              onPointerEnter={enabled ? () => setActive(row) : undefined}
              onFocus={() => setActive(null)}
            >
              <H className="work-index__title">{row.title}</H>
              <span className="work-index__year">{row.year}</span>
              <span className="work-index__discipline">{row.discipline}</span>
              <span className="work-index__client">{row.client}</span>
              <span className="work-index__arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {enabled ? (
        <div
          ref={preview}
          className="work-preview"
          data-visible={Boolean(active)}
          aria-hidden="true"
        >
          {rows.map((row) => (
            <div
              key={row.slug}
              className="media__frame"
              style={{ display: active?.slug === row.slug ? "block" : "none" }}
            >
              <Image
                className="media__img"
                src={row.thumb.src}
                alt=""
                fill
                sizes="300px"
                style={{ objectPosition: row.thumb.focal ?? "50% 50%" }}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
