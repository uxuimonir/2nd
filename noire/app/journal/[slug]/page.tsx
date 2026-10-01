import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JournalCard } from "@/components/journal/JournalCard";
import { Media } from "@/components/media/Media";
import { PageTransition } from "@/components/motion/PageTransition";
import { SectionHead } from "@/components/ui/SectionHead";
import {
  formatDate,
  getAdjacentArticles,
  getArticle,
  getArticles,
  getMedia,
  getRelatedArticles,
  readingTime,
} from "@/lib/cms";

export const dynamicParams = false;

export function generateStaticParams() {
  return getArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/journal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const cover = getMedia(article.coverImage);
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/journal/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      publishedTime: article.date,
      authors: [article.author],
      images: [{ url: cover.src, width: cover.width, height: cover.height, alt: cover.alt }],
    },
  };
}

export default async function ArticlePage({ params }: PageProps<"/journal/[slug]">) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const related = getRelatedArticles(article);
  const { newer, older } = getAdjacentArticles(article.slug);
  const minutes = readingTime(article);

  return (
    <PageTransition>
      <article aria-labelledby="article-title">
        <header className="container article-head">
          <p className="article-head__meta t-label">
            <Link href={`/journal?category=${article.category.toLowerCase()}`}>
              {article.category}
            </Link>
            <time dateTime={article.date}>{formatDate(article.date)}</time>
            <span>{minutes} min read</span>
          </p>
          <h1 id="article-title" className="article-head__title t-display-l" data-reveal>
            {article.title}
          </h1>
          <p
            className="article-head__excerpt t-body-l"
            data-reveal
            style={{ "--reveal-delay": "100ms" } as React.CSSProperties}
          >
            {article.excerpt}
          </p>
        </header>

        <div className="container">
          <Media
            id={article.coverImage}
            ratio="wide"
            sizes="(min-width: 1520px) 1440px, 100vw"
            priority
          />
        </div>

        <div className="container section article-body">
          <aside className="article-body__aside t-meta" aria-label="Article details">
            <p>By {article.author}</p>
            <p>{formatDate(article.date)}</p>
            <p>{minutes} min read</p>
            <p style={{ marginTop: "var(--space-4)" }}>
              <Link className="link-underline" href="/journal">
                ← All journal entries
              </Link>
            </p>
          </aside>
          <div className="article-body__content prose">
            {article.body.map((block, i) => {
              switch (block.type) {
                case "paragraph":
                  return <p key={i}>{block.text}</p>;
                case "heading":
                  return <h2 key={i}>{block.text}</h2>;
                case "quote":
                  return (
                    <blockquote key={i} className="pull-quote" data-reveal>
                      <p>“{block.text}”</p>
                      {block.cite ? <cite>{block.cite}</cite> : null}
                    </blockquote>
                  );
                case "image":
                  return (
                    <div
                      key={i}
                      className={`article-figure${block.wide ? " article-figure--wide" : ""}`}
                    >
                      <Media
                        id={block.image}
                        ratio="wide"
                        sizes="(min-width: 1200px) 75vw, 100vw"
                        caption={block.caption}
                        reveal
                      />
                    </div>
                  );
              }
            })}
          </div>
        </div>
      </article>

      {related.length ? (
        <section className="container section section--flush-top" aria-labelledby="related-title">
          <SectionHead
            title="Related reading"
            id="related-title"
            link={{ href: "/journal", label: "Journal" }}
          />
          <ul role="list" className="related-grid">
            {related.map((a) => (
              <li key={a.slug}>
                <JournalCard
                  article={a}
                  sizes="(min-width: 1200px) 30vw, (min-width: 768px) 50vw, 100vw"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <nav className="container section section--flush-top" aria-label="More entries">
        <div className="pager">
          {newer ? (
            <Link href={`/journal/${newer.slug}`}>
              <span className="t-label t-muted">← Newer</span>
              <span className="pager__title">{newer.title}</span>
            </Link>
          ) : (
            <Link href="/journal">
              <span className="t-label t-muted">← Journal</span>
              <span className="pager__title">All entries</span>
            </Link>
          )}
          {older ? (
            <Link href={`/journal/${older.slug}`}>
              <span className="t-label t-muted">Older →</span>
              <span className="pager__title">{older.title}</span>
            </Link>
          ) : (
            <Link href="/journal">
              <span className="t-label t-muted">Journal →</span>
              <span className="pager__title">All entries</span>
            </Link>
          )}
        </div>
      </nav>
    </PageTransition>
  );
}
