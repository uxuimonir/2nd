import { chapters } from "@/content/chapters";
import { pad2 } from "@/lib/utils";
import { cn } from "@/lib/utils";

/** "03 / 16 — THE RIVERS · নদী" */
export function ChapterLabel({ id, className }: { id: string; className?: string }) {
  const i = chapters.findIndex((c) => c.id === id);
  const c = chapters[i];
  if (!c) return null;
  return (
    <p className={cn("t-kicker flex flex-wrap items-center gap-x-3 gap-y-1 opacity-80", className)}>
      <span className="tabular-nums">
        {pad2(i + 1)} / {pad2(chapters.length)}
      </span>
      <span aria-hidden className="inline-block h-px w-8 bg-current opacity-50" />
      <span>{c.title}</span>
      <span aria-hidden className="t-bn normal-case tracking-normal opacity-70">
        {c.titleBn}
      </span>
    </p>
  );
}
