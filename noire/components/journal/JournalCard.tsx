import Link from "next/link";
import { Media } from "@/components/media/Media";
import { formatDate, readingTime } from "@/lib/cms";
import type { Article } from "@/lib/types";

/** Journal Card / Feature and Journal Card / Default. */
export function JournalCard({
  article,
  feature,
  sizes,
  ratio = feature ? "landscape" : "landscape",
  headingLevel = 3,
  showExcerpt = feature,
  priority,
}: {
  article: Article;
  feature?: boolean;
  sizes: string;
  ratio?: "landscape" | "portrait" | "square" | "wide";
  headingLevel?: 2 | 3;
  showExcerpt?: boolean;
  priority?: boolean;
}) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <Link
      href={`/journal/${article.slug}`}
      className={`journal-card${feature ? " journal-card--feature" : ""}`}
    >
      <Media id={article.coverImage} ratio={ratio} sizes={sizes} decorative priority={priority} />
      <p className="journal-card__meta t-meta">
        <span className="t-label">{article.category}</span>
        <time dateTime={article.date}>{formatDate(article.date)}</time>
        <span>{readingTime(article)} min read</span>
      </p>
      <H className="journal-card__title">{article.title}</H>
      {showExcerpt ? <p className="journal-card__excerpt">{article.excerpt}</p> : null}
    </Link>
  );
}
