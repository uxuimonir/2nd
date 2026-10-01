import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NoireProjectDetail } from "@/components/sections";
import { getAdjacentProjects, getMedia, getProject, getProjects } from "@/lib/cms";
import { img } from "@/lib/view";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const hero = getMedia(project.heroImage);
  return {
    title: project.title,
    description: project.shortDescription,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: { title: project.title, description: project.shortDescription, images: [{ url: hero.src, width: hero.width, height: hero.height, alt: hero.alt }] },
  };
}

const LAYOUT = { full: "full", wide: "wide", inset: "inset", pair: "pair", portrait: "inset" } as const;

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const { next } = getAdjacentProjects(p.slug);
  return (
    <NoireProjectDetail
      title={p.title}
      thesis={p.thesis}
      category={p.category}
      client={p.client}
      year={String(p.year)}
      discipline={p.discipline}
      location={p.location}
      hero={img(p.heroImage)}
      statement={p.shortDescription}
      body={p.longDescription.join("\n\n")}
      gallery={p.gallery.map((g) => ({ image: img(g.image), caption: g.caption, layout: LAYOUT[g.layout] }))}
      role={p.role}
      deliverables={p.deliverables.join(", ")}
      team={p.team.join(", ")}
      credits={p.credits.map((c) => `${c.role} — ${c.name}`).join("; ")}
      outcome={p.outcome ?? ""}
      externalLabel=""
      externalUrl={p.externalUrl ?? ""}
      nextTitle={next.title}
      nextLink={`/work/${next.slug}`}
      nextImage={img(next.heroImage)}
    />
  );
}
