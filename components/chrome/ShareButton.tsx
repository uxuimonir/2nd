"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** Native share sheet where available; otherwise copies the link (with a visible fallback field). */
export function ShareButton({ title, path, className }: { title: string; path?: string; className?: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "manual">("idle");
  const url = typeof window !== "undefined" ? new URL(path ?? window.location.pathname, window.location.origin).toString() : "";

  async function share() {
    const data = { title: `${title} — Digital Bangladesh`, text: `${title} — a living journey through Bangladesh`, url };
    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
        await navigator.share(data);
        return;
      }
    } catch (e) {
      if ((e as DOMException).name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2400);
    } catch {
      setStatus("manual");
    }
  }

  return (
    <span className={cn("relative inline-flex items-center gap-3", className)}>
      <button type="button" onClick={share} className="btn-explore" data-cursor="explore" data-cursor-label="Share">
        <span>{status === "copied" ? "Link copied" : "Share"}</span>
        <span aria-hidden>↗</span>
      </button>
      {status === "manual" && (
        <input
          readOnly
          value={url}
          aria-label="Link to share"
          onFocus={(e) => e.currentTarget.select()}
          autoFocus
          className="t-coord w-64 border border-white/30 bg-black/50 px-2 py-2"
        />
      )}
      <span role="status" aria-live="polite" className="sr-only">
        {status === "copied" ? "Link copied to clipboard" : ""}
      </span>
    </span>
  );
}
