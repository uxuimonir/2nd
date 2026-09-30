import { cn } from "@/lib/utils";
import { TextReveal } from "./TextReveal";

/** Editorial text block: kicker, heading, paragraphs. */
export function StoryBlock({ kicker, title, body, className }: { kicker?: string; title?: string; body: string[]; className?: string }) {
  return (
    <div className={cn("max-w-[62ch]", className)}>
      {kicker && <p className="t-kicker mb-4 opacity-70">{kicker}</p>}
      {title && <TextReveal as="h3" text={title} className="t-display mb-6" />}
      <div className="space-y-5">
        {body.map((p, i) => (
          <p key={i} className="t-body opacity-85">
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
