"use client";
import { useRef } from "react";
import { useGsap } from "@/hooks/useGsap";
import { cn } from "@/lib/utils";
import { Photo } from "./Photo";

/** Image that drifts against the scroll — depth without spectacle. */
export function ParallaxImage({ id, className, strength = 12, sizes }: { id: string; className?: string; strength?: number; sizes?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGsap(
    ({ gsap, reduced }) => {
      if (reduced || !ref.current) return;
      const inner = ref.current.firstElementChild as HTMLElement;
      gsap.fromTo(
        inner,
        { yPercent: -strength },
        { yPercent: strength, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true } },
      );
    },
    ref,
    [id],
  );
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <div className="absolute" style={{ inset: `-${strength}% 0` }}>
        <Photo id={id} className="h-full w-full" sizes={sizes} />
      </div>
    </div>
  );
}
