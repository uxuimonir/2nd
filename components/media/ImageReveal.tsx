"use client";
import { useRef } from "react";
import { useGsap } from "@/hooks/useGsap";
import { ScrollTrigger } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Photo } from "./Photo";

/**
 * Photography that opens like a doorway when it enters the viewport:
 * the mask draws back while the image settles from a slight zoom.
 */
export function ImageReveal({
  id,
  className,
  from = "bottom",
  sizes,
  priority,
  scrub = false,
}: {
  id: string;
  className?: string;
  from?: "bottom" | "left" | "circle";
  sizes?: string;
  priority?: boolean;
  scrub?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useGsap(
    ({ gsap, reduced }) => {
      if (reduced || !ref.current) return;
      const el = ref.current;
      const inner = el.querySelector("img")?.parentElement ?? el.firstElementChild;
      const start = from === "circle" ? "circle(0% at 50% 60%)" : from === "left" ? "inset(0% 100% 0% 0%)" : "inset(100% 0% 0% 0%)";
      const end = from === "circle" ? "circle(80% at 50% 50%)" : "inset(0% 0% 0% 0%)";
      const tl = gsap.timeline({
        scrollTrigger: scrub
          ? { trigger: el, start: "top 90%", end: "top 30%", scrub: 0.8 }
          : { trigger: el, start: "top 85%", once: true },
      });
      tl.fromTo(el, { clipPath: start }, { clipPath: end, duration: 1.6, ease: "power3.inOut" });
      if (inner) tl.fromTo(inner, { scale: 1.18 }, { scale: 1, duration: 2.2, ease: "expo.out" }, 0);
      return () => {
        tl.scrollTrigger?.kill();
        ScrollTrigger.refresh();
      };
    },
    ref,
    [id],
  );
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)} data-cursor="view">
      <Photo id={id} className="absolute inset-0" sizes={sizes} priority={priority} />
    </div>
  );
}
