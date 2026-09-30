"use client";
import { createElement, useRef, type CSSProperties, type ElementType } from "react";
import { useGsap } from "@/hooks/useGsap";
import { cn } from "@/lib/utils";

/**
 * Words rise from beneath a baseline mask as the text enters view.
 * The text stays a single accessible string (aria-label) while visual words animate.
 */
export function TextReveal({
  text,
  as = "p",
  className,
  delay = 0,
  stagger = 0.045,
  scrub = false,
  immediate = false,
  style,
  id,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
  scrub?: boolean;
  immediate?: boolean;
  style?: CSSProperties;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useGsap(
    ({ gsap, reduced }) => {
      if (reduced || !ref.current) return;
      const words = ref.current.querySelectorAll<HTMLElement>("[data-w]");
      gsap.fromTo(
        words,
        { yPercent: 110, rotate: 2 },
        {
          yPercent: 0,
          rotate: 0,
          duration: 1.3,
          ease: "expo.out",
          stagger,
          delay,
          scrollTrigger: immediate ? undefined : scrub ? { trigger: ref.current, start: "top 85%", end: "top 45%", scrub: 0.6 } : { trigger: ref.current, start: "top 88%", once: true },
        },
      );
    },
    ref,
    [text],
  );
  const words = text.split(" ");
  return createElement(
    as,
    { ref, id, style, className: cn(className), "aria-label": text },
    words.map((w, i) => (
      <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
        <span data-w className="inline-block will-change-transform">
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      </span>
    )),
  );
}
