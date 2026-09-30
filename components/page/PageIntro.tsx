import { cn } from "@/lib/utils";
import { TextReveal } from "@/components/type/TextReveal";

/** Opening block for standalone section pages. */
export function PageIntro({ kicker, title, bn, lede, className, tone = "ink" }: { kicker: string; title: string; bn?: string; lede?: string; className?: string; tone?: "ink" | "paper" }) {
  return (
    <header className={cn("gutter pb-12 pt-36", tone === "paper" ? "bg-paper text-ink" : "bg-ink text-paper", className)}>
      <p className="t-kicker opacity-70">{kicker}</p>
      <TextReveal as="h1" text={title} immediate className="t-display mt-5" style={{ fontSize: "var(--step-5)" }} />
      {bn && (
        <p lang="bn" className="t-bn opacity-60" style={{ fontSize: "var(--step-2)" }}>
          {bn}
        </p>
      )}
      {lede && <p className="t-lede mt-6 opacity-85">{lede}</p>}
    </header>
  );
}
