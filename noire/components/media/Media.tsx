import Image from "next/image";
import { getMedia } from "@/lib/cms";

type Ratio = "landscape" | "portrait" | "tall" | "square" | "wide" | "cinema" | "native";

const RATIOS: Record<Exclude<Ratio, "native">, string> = {
  landscape: "3 / 2",
  portrait: "4 / 5",
  tall: "3 / 4",
  square: "1 / 1",
  wide: "16 / 9",
  cinema: "21 / 9",
};

type MediaProps = {
  /** Media library id (content/media.ts). */
  id: string;
  /** Crop ratio. "native" keeps the asset's own proportions. */
  ratio?: Ratio;
  /** Responsive sizes hint for next/image — keep it honest to the layout. */
  sizes: string;
  caption?: string;
  captionIndex?: string;
  /** Mark as decorative: empty alt, hidden from assistive tech. */
  decorative?: boolean;
  /** Above-the-fold images load eagerly with high priority. */
  priority?: boolean;
  /** Mask reveal on enter (Hero / Gallery recipe). */
  reveal?: boolean;
  focal?: string;
  className?: string;
};

/**
 * Media / Figure — the one image primitive. Reserves space with an aspect
 * ratio (no layout shift), honours the focal point, lazy-loads below the fold.
 */
export function Media({
  id,
  ratio = "native",
  sizes,
  caption,
  captionIndex,
  decorative,
  priority,
  reveal,
  focal,
  className,
}: MediaProps) {
  const asset = getMedia(id);
  const aspect = ratio === "native" ? `${asset.width} / ${asset.height}` : RATIOS[ratio];
  const Tag = caption ? "figure" : "div";
  return (
    <Tag
      className={["media", className].filter(Boolean).join(" ")}
      data-reveal-mask={reveal ? "" : undefined}
    >
      <div className="media__frame" style={{ "--ratio": aspect } as React.CSSProperties}>
        <Image
          className="media__img"
          src={asset.src}
          alt={decorative ? "" : asset.alt}
          fill
          sizes={sizes}
          priority={priority}
          style={{ objectPosition: focal ?? asset.focal ?? "50% 50%" }}
        />
      </div>
      {caption ? (
        <figcaption className="media__caption">
          <span>{caption}</span>
          {captionIndex ? <span className="media__caption-index">{captionIndex}</span> : null}
        </figcaption>
      ) : null}
    </Tag>
  );
}
