"use client";
import { useEffect, useRef, useState } from "react";
import { useFinePointer, useReducedMotion } from "@/hooks/useMedia";

type CursorState = "default" | "explore" | "view" | "drag" | "map" | "discover";

const LABEL: Record<CursorState, string> = {
  default: "",
  explore: "Explore",
  view: "View",
  drag: "Drag",
  map: "Map",
  discover: "Discover",
};

/**
 * Desktop-only contextual cursor. Elements opt in with data-cursor="explore|view|drag|map|discover"
 * and an optional data-cursor-label. Disabled on touch devices and hidden from assistive tech.
 */
export function Cursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CursorState>("default");
  const [label, setLabel] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!fine) return;
    document.documentElement.classList.add("has-cursor");
    const pos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let raf = 0;
    const loop = () => {
      const k = reduced ? 1 : 0.18;
      ringPos.x += (pos.x - ringPos.x) * k;
      ringPos.y += (pos.y - ringPos.y) * k;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pos.x = e.clientX;
      pos.y = e.clientY;
      setVisible(true);
      const el = (e.target as Element | null)?.closest?.("[data-cursor]");
      const s = (el?.getAttribute("data-cursor") as CursorState) || ((e.target as Element)?.closest?.("a,button,[role=button]") ? "explore" : "default");
      setState(s in LABEL ? s : "default");
      setLabel(el?.getAttribute("data-cursor-label") ?? LABEL[s] ?? "");
    };
    const onLeave = () => setVisible(false);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [fine, reduced]);

  if (!fine) return null;
  const big = state !== "default";
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0" style={{ zIndex: "var(--z-cursor)", opacity: visible ? 1 : 0, transition: "opacity .3s" }}>
      <div ref={dot} className="absolute left-0 top-0">
        <div className="-translate-x-1/2 -translate-y-1/2 rounded-full bg-paper mix-blend-difference" style={{ width: big ? 0 : 6, height: big ? 0 : 6, transition: "width .3s, height .3s" }} />
      </div>
      <div ref={ring} className="absolute left-0 top-0">
        <div
          className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-paper/70 text-paper backdrop-blur-[2px]"
          style={{
            width: big ? 88 : 34,
            height: big ? 88 : 34,
            background: big ? (state === "view" ? "rgba(18,17,16,.55)" : state === "map" ? "rgba(15,40,51,.55)" : "rgba(181,83,47,.75)") : "transparent",
            transition: "width .5s var(--ease-out-expo), height .5s var(--ease-out-expo), background .4s",
          }}
        >
          <span className="t-coord max-w-[76px] truncate text-center text-[10px] uppercase" style={{ opacity: big ? 1 : 0, transition: "opacity .3s" }}>
            {state === "drag" ? "← Drag →" : label}
          </span>
        </div>
      </div>
    </div>
  );
}
