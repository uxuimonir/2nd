"use client";
import { useRef } from "react";
import { useGsap } from "@/hooks/useGsap";

/**
 * Page transition: a curtain the colour of the delta at night lifts on every route change,
 * so moving between places reads as a change of context rather than a jump.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const curtain = useRef<HTMLDivElement>(null);
  useGsap(
    ({ gsap, reduced }) => {
      if (!curtain.current) return;
      if (reduced) {
        gsap.set(curtain.current, { display: "none" });
        return;
      }
      gsap.fromTo(curtain.current, { scaleY: 1 }, { scaleY: 0, transformOrigin: "top", duration: 1.1, ease: "power4.inOut", delay: 0.05 });
    },
    curtain,
  );
  return (
    <>
      <div ref={curtain} aria-hidden className="pointer-events-none fixed inset-0 bg-[#07090a]" style={{ zIndex: "var(--z-overlay)", transform: "scaleY(0)" }} />
      {children}
    </>
  );
}
