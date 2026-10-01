import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NoireArticle } from "@/components/sections";
import { legalPages } from "@/content/studio";
import { formatDate } from "@/lib/cms";

export const dynamicParams = false;

export function generateStaticParams() {
  return legalPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/legal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = legalPages.find((p) => p.slug === slug);
  return page ? { title: page.title, description: page.intro, alternates: { canonical: `/legal/${slug}` } } : {};
}

/** Utility / Legal — intentionally quiet, shared minimal layout. */
export default async function LegalPage({ params }: PageProps<"/legal/[slug]">) {
  const { slug } = await params;
  const page = legalPages.find((p) => p.slug === slug);
  if (!page) notFound();
  const other = legalPages.find((p) => p.slug !== slug);
  const body = page.sections.map((s) => [`## ${s.heading}`, ...s.body].join("\n\n")).join("\n\n");
  return (
    <NoireArticle
      category="Legal"
      title={page.title}
      date={`Updated ${formatDate(page.updated)}`}
      author=""
      excerpt={page.intro}
      body={body}
      backLabel="Back home"
      backLink="/"
      prevLabel=""
      prevLink=""
      nextLabel={other?.title ?? "Colophon"}
      nextLink={other ? `/legal/${other.slug}` : "/colophon"}
    />
  );
}
