"use client";

import { useEffect, useRef } from "react";

/**
 * Hero transition: a tiny scroll-linked scale (1 → `to`) as the element
 * leaves the viewport. Linear mapping, eased value; disabled for reduced motion.
 */
export function ScrollScale({
  children,
  to = 0.96,
  className,
}: {
  children: React.ReactNode;
  to?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (mq.matches) {
        el.style.transform = "";
        return;
      }
      const rect = el.getBoundingClientRect();
      // 0 while the element sits in place, 1 once it has scrolled its own height
      const t = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height)));
      const eased = 1 - Math.pow(1 - t, 2);
      el.style.transform = `scale(${1 - (1 - to) * eased})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    mq.addEventListener("change", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      mq.removeEventListener("change", onScroll);
    };
  }, [to]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ transformOrigin: "50% 0%", willChange: "transform" }}
    >
      {children}
    </div>
  );
}
