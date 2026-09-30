"use client";
import { useRef, useState, type RefObject } from "react";
import { useGsap } from "@/hooks/useGsap";
import { ScrollTrigger } from "@/lib/motion";

/**
 * Scroll progress (0→1) of a tall section with a sticky inner stage.
 * The ref updates every frame without re-rendering; `step` re-renders only when the
 * discrete stage changes (for captions / aria).
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>, steps = 1, onProgress?: (p: number) => void) {
  const progress = useRef(0);
  const cb = useRef(onProgress);
  cb.current = onProgress;
  const [step, setStep] = useState(0);
  useGsap(
    () => {
      if (!ref.current) return;
      const st = ScrollTrigger.create({
        trigger: ref.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          progress.current = self.progress;
          cb.current?.(self.progress);
          const s = Math.min(steps - 1, Math.floor(self.progress * steps));
          setStep((prev) => (prev === s ? prev : s));
        },
      });
      return () => st.kill();
    },
    ref,
    [steps],
  );
  return { progress, step };
}
