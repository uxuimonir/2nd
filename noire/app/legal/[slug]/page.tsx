import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageTransition } from "@/components/motion/PageTransition";
import { legalPages } from "@/content/studio";
import { formatDate } from "@/lib/cms";

export const dynamicParams = false;

export function generateStaticParams() {
  return legalPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/legal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = legalPages.find((p) => p.slug === slug);
  return page
    ? { title: page.title, description: page.intro, alternates: { canonical: `/legal/${slug}` } }
    : {};
}

/** Utility / Legal — intentionally quiet, shared minimal layout. */
export default async function LegalPage({ params }: PageProps<"/legal/[slug]">) {
  const { slug } = await params;
  const page = legalPages.find((p) => p.slug === slug);
  if (!page) notFound();
  return (
    <PageTransition>
      <div className="container section quiet-page">
        <aside className="quiet-page__aside t-meta t-muted">
          <p className="t-label">Legal</p>
          <p style={{ marginTop: "var(--space-2)" }}>Updated {formatDate(page.updated)}</p>
          <nav aria-label="Legal pages" style={{ marginTop: "var(--space-6)" }}>
            <ul
              role="list"
              className="stack"
              style={{ "--stack-gap": "var(--space-2)" } as React.CSSProperties}
            >
              {legalPages.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/legal/${p.slug}`}
                    aria-current={p.slug === slug ? "page" : undefined}
                    className={p.slug === slug ? "link-underline" : undefined}
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/colophon">Colophon</Link>
              </li>
            </ul>
          </nav>
        </aside>
        <article className="quiet-page__body">
          <h1 className="t-h1">{page.title}</h1>
          <div className="prose" style={{ marginTop: "var(--space-8)" }}>
            <p className="t-muted">{page.intro}</p>
            {page.sections.map((s) => (
              <section key={s.heading}>
                <h2>{s.heading}</h2>
                {s.body.map((b) => (
                  <p key={b.slice(0, 20)} style={{ marginTop: "0.8em" }}>
                    {b}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </article>
      </div>
    </PageTransition>
  );
}
