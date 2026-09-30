"use client";
import { useState, type CSSProperties } from "react";
import { bestSrc, commonsFilePath, getMedia, srcSet } from "@/lib/media";
import { cn } from "@/lib/utils";

interface PhotoProps {
  id?: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
  alt?: string;
  style?: CSSProperties;
  /** decorative images are hidden from assistive tech */
  decorative?: boolean;
  target?: number;
}

/**
 * Responsive photograph from the media registry.
 * Serves Wikimedia thumbnails via srcset; if a size is unavailable it retries through
 * Special:FilePath, and finally falls back to an abstract delta pattern (never a broken image).
 */
export function Photo({ id, className, imgClassName, sizes = "100vw", priority, alt, style, decorative, target = 1280 }: PhotoProps) {
  const asset = getMedia(id);
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [loaded, setLoaded] = useState(false);

  if (!asset || stage === 2) {
    return <PhotoFallback className={className} label={asset?.alt ?? alt} style={style} />;
  }

  const src = stage === 0 ? bestSrc(asset, target) : commonsFilePath(asset.file, target);
  return (
    <div className={cn("relative overflow-hidden bg-ink-3", className)} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={stage}
        src={src}
        srcSet={stage === 0 ? srcSet(asset) : undefined}
        sizes={sizes}
        alt={decorative ? "" : (alt ?? asset.alt)}
        aria-hidden={decorative || undefined}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        referrerPolicy="no-referrer"
        draggable={false}
        onLoad={() => setLoaded(true)}
        onError={() => setStage((s) => (s === 0 ? 1 : 2))}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-[opacity,filter] duration-[1200ms] ease-[var(--ease-out-expo)]",
          loaded ? "opacity-100 blur-0" : "opacity-0 blur-md",
          imgClassName,
        )}
        style={{ objectPosition: asset.focal ?? "50% 50%" }}
      />
    </div>
  );
}

export function PhotoFallback({ className, label, style }: { className?: string; label?: string; style?: CSSProperties }) {
  return (
    <div
      role={label ? "img" : undefined}
      aria-label={label}
      className={cn("relative overflow-hidden bg-river-deep", className)}
      style={style}
    >
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full opacity-60" aria-hidden>
        {Array.from({ length: 14 }, (_, i) => (
          <path
            key={i}
            d={`M-20 ${40 + i * 18} C 80 ${20 + i * 20}, 160 ${70 + i * 16}, 240 ${40 + i * 19} S 380 ${60 + i * 17}, 440 ${30 + i * 20}`}
            fill="none"
            stroke="#8cc7da"
            strokeOpacity={0.12 + (i % 4) * 0.06}
            strokeWidth={1}
          />
        ))}
      </svg>
    </div>
  );
}
