import type { Metadata } from "next";
import Link from "next/link";
import { JournalCard } from "@/components/journal/JournalCard";
import { PageTransition } from "@/components/motion/PageTransition";
import { PageIntro } from "@/components/ui/PageIntro";
import { SectionHead } from "@/components/ui/SectionHead";
import { formatDate, getArticleCategories, getArticles, getFeaturedArticle } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Journal",
  description: "Essays, process notes and studio news on making things slowly.",
  alternates: { canonical: "/journal" },
};

export default async function JournalPage({ searchParams }: PageProps<"/journal">) {
  const sp = await searchParams;
  const categories = getArticleCategories();
  const raw = Array.isArray(sp.category) ? sp.category[0] : sp.category;
  const category = categories.find((c) => c.toLowerCase() === raw?.toLowerCase()) ?? null;
  const all = getArticles();
  const featured = getFeaturedArticle();
  const list = category
    ? all.filter((a) => a.category === category)
    : all.filter((a) => a.slug !== featured.slug);

  return (
    <PageTransition>
      <PageIntro
        label={`Journal — ${all.length} entries`}
        title={
          <>
            Notes on making things <em>slowly.</em>
          </>
        }
        lede="Essays, process diaries and the occasional studio update. Written by the people who did the work."
      />

      {!category ? (
        <section className="container journal-feature" aria-label="Featured story">
          <div data-reveal="section">
            <JournalCard
              article={featured}
              feature
              priority
              headingLevel={2}
              ratio="wide"
              sizes="(min-width: 1520px) 1440px, 100vw"
            />
          </div>
        </section>
      ) : null}

      <section className="container section section--flush-top" aria-labelledby="archive-title">
        <h2 id="archive-title" className="visually-hidden">
          {category ? `${category} entries` : "All entries"}
        </h2>
        <nav className="toolbar" aria-label="Journal categories">
          <div className="filters">
            <span className="filters__label t-label">Category</span>
            <Link href="/journal" className="chip" aria-current={!category ? "page" : undefined}>
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c}
                href={`/journal?category=${c.toLowerCase()}`}
                className="chip"
                aria-current={category === c ? "page" : undefined}
              >
                {c}
                <span className="chip__count">{all.filter((a) => a.category === c).length}</span>
              </Link>
            ))}
          </div>
        </nav>
        <ul role="list" className="journal-list">
          {list.map((article) => (
            <li key={article.slug} data-reveal="section">
              <JournalCard
                article={article}
                headingLevel={3}
                sizes="(min-width: 1200px) 30vw, (min-width: 768px) 50vw, 100vw"
                showExcerpt
              />
            </li>
          ))}
        </ul>
      </section>

      {/* Compact index */}
      <section
        className="container section section--flush-top"
        aria-labelledby="journal-index-title"
      >
        <SectionHead title="Index" id="journal-index-title" />
        <ul role="list" className="journal-index">
          {all.map((a) => (
            <li key={a.slug}>
              <Link href={`/journal/${a.slug}`}>
                <time className="journal-index__meta t-meta" dateTime={a.date}>
                  {formatDate(a.date, "short")}
                </time>
                <span className="journal-index__title">{a.title}</span>
                <span className="journal-index__meta t-label">{a.category}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PageTransition>
  );
}
