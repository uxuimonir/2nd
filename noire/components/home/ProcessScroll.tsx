"use client";

import { useEffect, useRef, useState } from "react";
import type { ProcessStep } from "@/lib/types";

/**
 * Process — Frame → Explore → Shape → Deliver. Scroll progress drives a thin
 * bar and highlights the current step; no content is ever hidden. Desktop
 * pins the summary beside the steps; tablet/mobile read as a vertical list.
 */
export function ProcessScroll({ steps, title }: { steps: ProcessStep[]; title: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const [enhanced, setEnhanced] = useState(false);

  useEffect(() => {
    const el = root.current;
    const ol = list.current;
    if (!el || !ol) return;
    setEnhanced(true);
    let frame = 0;
    const update = () => {
      frame = 0;
      const items = Array.from(ol.children) as HTMLElement[];
      const mid = window.innerHeight * 0.55;
      let current = 0;
      items.forEach((item, i) => {
        if (item.getBoundingClientRect().top < mid) current = i;
      });
      const first = items[0].getBoundingClientRect();
      const last = items[items.length - 1].getBoundingClientRect();
      const span = last.bottom - first.top;
      const progress = Math.min(1, Math.max(0, (mid - first.top) / span));
      el.style.setProperty("--progress", progress.toFixed(3));
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="process__layout" ref={root}>
      <div className="process__aside">
        <h2 className="process__aside-title t-display-l">{title}</h2>
        <div className="process__progress" aria-hidden="true">
          <div className="process__progress-bar" />
        </div>
        <p className="process__current t-label" aria-hidden="true">
          <span>{steps[active].title}</span>
          <span>
            {steps[active].number} / {String(steps.length).padStart(2, "0")}
          </span>
        </p>
      </div>
      <ol className="process__steps" role="list" ref={list} data-enhanced={enhanced}>
        {steps.map((step, i) => (
          <li
            key={step.number}
            className="process__step"
            data-active={i === active}
            aria-current={i === active ? "step" : undefined}
          >
            <span className="process__step-num">{step.number}</span>
            <div>
              <h3>{step.title}</h3>
              <p className="t-body-l">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
