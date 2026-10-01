"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useRef, useState } from "react";

export type CapabilityRow = {
  slug: string;
  number: string;
  title: string;
  summary: string;
  detail: string;
  includes: string[];
  thumb: { src: string; focal?: string };
};

/**
 * Capabilities — rows that expand on click/tap/Enter (a real accordion, so it
 * works without hover). On desktop with a fine pointer, hovering a row draws a
 * thin line and reveals a decorative thumbnail.
 */
export function Capabilities({ rows }: { rows: CapabilityRow[] }) {
  const [open, setOpen] = useState<string | null>(rows[0]?.slug ?? null);
  const [hover, setHover] = useState<{ slug: string; y: number } | null>(null);
  const list = useRef<HTMLUListElement>(null);
  const base = useId();

  const onEnter = (slug: string, e: React.PointerEvent<HTMLLIElement>) => {
    if (e.pointerType !== "mouse" || !list.current) return;
    const top = e.currentTarget.offsetTop;
    setHover({ slug, y: top });
  };

  return (
    <div className="caps" data-hover={Boolean(hover)} onPointerLeave={() => setHover(null)}>
      <ul role="list" ref={list}>
        {rows.map((row) => {
          const isOpen = open === row.slug;
          const panelId = `${base}-${row.slug}`;
          return (
            <li
              key={row.slug}
              className="cap-row"
              data-open={isOpen || hover?.slug === row.slug}
              onPointerEnter={(e) => onEnter(row.slug, e)}
            >
              <h3>
                <button
                  type="button"
                  className="cap-row__btn"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : row.slug)}
                >
                  <span className="cap-row__num">{row.number}</span>
                  <span className="cap-row__title">{row.title}</span>
                  <span className="cap-row__summary">{row.summary}</span>
                  <span className="cap-row__icon" aria-hidden="true" />
                </button>
              </h3>
              <div
                className="cap-row__panel"
                id={panelId}
                role="region"
                aria-label={row.title}
                inert={!isOpen}
              >
                <div className="cap-row__panel-inner">
                  <div className="cap-row__panel-body">
                    <p className="t-body-l">{row.detail}</p>
                    <div>
                      <ul role="list" aria-label={`${row.title} includes`}>
                        {row.includes.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                      <p style={{ marginTop: "var(--space-6)" }}>
                        <Link href={`/services#${row.slug}`} className="link-arrow">
                          {row.title} in detail{" "}
                          <span className="link-arrow__icon" aria-hidden="true">
                            →
                          </span>
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <div
        className="caps__thumb"
        aria-hidden="true"
        style={{ "--thumb-y": `${hover?.y ?? 0}px` } as React.CSSProperties}
      >
        {rows.map((row) => (
          <div
            key={row.slug}
            className="media__frame"
            style={
              {
                "--ratio": "4 / 3",
                display: hover?.slug === row.slug ? "block" : "none",
              } as React.CSSProperties
            }
          >
            <Image
              className="media__img"
              src={row.thumb.src}
              alt=""
              fill
              sizes="220px"
              style={{ objectPosition: row.thumb.focal ?? "50% 50%" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
