"use client";

import { useEffect } from "react";

const SELECTOR = "[data-reveal],[data-reveal-group],[data-reveal-mask]";

/**
 * One observer for the whole site. Server components opt in with
 * data-reveal / data-reveal-group / data-reveal-mask; this marks them
 * data-inview="true" once, as they enter. New nodes (route changes,
 * filtered lists) are picked up through a MutationObserver.
 */
export function RevealObserver() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      document.documentElement.classList.remove("js");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-inview", "true");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const seen = new WeakSet<Element>();
    const scan = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        if (el.dataset.inview !== "true" && !seen.has(el)) {
          seen.add(el);
          io.observe(el);
        }
      });
    };
    scan(document);
    const mo = new MutationObserver((records) => {
      for (const r of records)
        r.addedNodes.forEach((n) => n instanceof Element && scan(n.parentNode ?? n));
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}
