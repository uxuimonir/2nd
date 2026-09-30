import { cn } from "@/lib/utils";
import { TextReveal } from "./TextReveal";

const SIZE = { lg: "var(--step-4)", xl: "var(--step-5)", xxl: "var(--step-6)" } as const;

/** Large editorial chapter title, optionally with a Bangla counterpart. */
export function ChapterTitle({
  title,
  bn,
  kicker,
  className,
  size = "xl",
  id,
}: {
  title: string;
  bn?: string;
  kicker?: string;
  className?: string;
  size?: keyof typeof SIZE;
  id?: string;
}) {
  return (
    <header className={cn("relative", className)}>
      {kicker && <p className="t-kicker mb-5 opacity-70">{kicker}</p>}
      <TextReveal as="h2" id={id} text={title} className="t-display" style={{ fontSize: SIZE[size] }} />
      {bn && (
        <p lang="bn" className="t-bn mt-3 opacity-60" style={{ fontSize: "var(--step-2)" }}>
          {bn}
        </p>
      )}
    </header>
  );
}
