import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NoireArticle } from "@/components/sections";
import { formatDate, getAdjacentArticles, getArticle, getArticles, getMedia } from "@/lib/cms";
import { articleBody, img } from "@/lib/view";

export const dynamicParams = false;

export function generateStaticParams() {
  return getArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/journal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return {};
  const cover = getMedia(a.coverImage);
  return {
    title: a.title,
    description: a.excerpt,
    alternates: { canonical: `/journal/${a.slug}` },
    openGraph: { type: "article", title: a.title, description: a.excerpt, publishedTime: a.date, authors: [a.author], images: [{ url: cover.src, width: cover.width, height: cover.height, alt: cover.alt }] },
  };
}

export default async function ArticlePage({ params }: PageProps<"/journal/[slug]">) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();
  const { newer, older } = getAdjacentArticles(a.slug);
  return (
    <NoireArticle
      category={a.category}
      title={a.title}
      date={formatDate(a.date)}
      author={a.author}
      excerpt={a.excerpt}
      cover={img(a.coverImage)}
      body={articleBody(a)}
      backLabel="All journal entries"
      backLink="/journal"
      prevLabel={newer?.title ?? ""}
      prevLink={newer ? `/journal/${newer.slug}` : ""}
      nextLabel={older?.title ?? ""}
      nextLink={older ? `/journal/${older.slug}` : ""}
    />
  );
}
