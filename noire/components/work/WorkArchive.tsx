"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { WorkIndex, type IndexRow } from "./WorkIndex";

export type ArchiveItemMeta = { slug: string; category: string; year: number };
export type View = "grid" | "index";

/**
 * Work archive — Grid and Index views with category / year filters.
 * The URL (?view=&category=&year=) is the single source of truth, updated
 * with replaceState — links are shareable and Back restores the same view.
 */
export function WorkArchive({
  items,
  cards,
  rows,
  categories,
  years,
}: {
  items: ArchiveItemMeta[];
  cards: React.ReactNode[];
  rows: IndexRow[];
  categories: string[];
  years: number[];
}) {
  const params = useSearchParams();
  const view: View = params.get("view") === "index" ? "index" : "grid";
  const category = categories.find((c) => c === params.get("category")) ?? null;
  const yearParam = Number(params.get("year"));
  const year = years.includes(yearParam) ? yearParam : null;

  const sync = (next: { view?: View; category?: string | null; year?: number | null }) => {
    const v = next.view ?? view;
    const c = next.category !== undefined ? next.category : category;
    const y = next.year !== undefined ? next.year : year;
    const params = new URLSearchParams();
    if (v !== "grid") params.set("view", v);
    if (c) params.set("category", c);
    if (y) params.set("year", String(y));
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  };

  const visible = useMemo(
    () => items.map((it) => (!category || it.category === category) && (!year || it.year === year)),
    [items, category, year],
  );
  const count = visible.filter(Boolean).length;
  const countFor = (c: string) =>
    items.filter((it) => it.category === c && (!year || it.year === year)).length;

  const reset = () => {
    sync({ category: null, year: null });
  };

  return (
    <>
      <div className="toolbar">
        <div className="filters" role="group" aria-label="Filter by category">
          <span className="filters__label t-label">Filter</span>
          <button
            type="button"
            className="chip"
            aria-pressed={!category}
            onClick={() => {
              sync({ category: null });
            }}
          >
            All
            <span className="chip__count">
              {items.filter((it) => !year || it.year === year).length}
            </span>
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className="chip"
              aria-pressed={category === c}
              onClick={() => {
                const next = category === c ? null : c;
                sync({ category: next });
              }}
            >
              {c}
              <span className="chip__count">{countFor(c)}</span>
            </button>
          ))}
          <label className="visually-hidden" htmlFor="year-filter">
            Filter by year
          </label>
          <select
            id="year-filter"
            className="year-select"
            value={year ?? ""}
            onChange={(e) => {
              const next = e.target.value ? Number(e.target.value) : null;
              sync({ year: next });
            }}
          >
            <option value="">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="segmented" role="group" aria-label="View">
          {(["grid", "index"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => {
                sync({ view: v });
              }}
            >
              {v === "grid" ? "Grid" : "Index"}
            </button>
          ))}
        </div>
      </div>

      <p
        className="work-count t-meta"
        role="status"
        aria-live="polite"
        style={{ marginBottom: "var(--space-8)" }}
      >
        Showing {count} of {items.length} projects
        {category ? ` in ${category}` : ""}
        {year ? ` from ${year}` : ""}
      </p>

      {count === 0 ? (
        <div className="empty-state">
          <p className="t-body-l">No projects match these filters.</p>
          <button type="button" className="btn btn--secondary" onClick={reset}>
            Clear filters
          </button>
        </div>
      ) : view === "grid" ? (
        <ul role="list" className="work-grid">
          {cards.map((card, i) => (visible[i] ? <li key={items[i].slug}>{card}</li> : null))}
        </ul>
      ) : (
        <WorkIndex rows={rows.filter((_, i) => visible[i])} headingLevel={2} />
      )}
    </>
  );
}
