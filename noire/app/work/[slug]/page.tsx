import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { Media } from "@/components/media/Media";
import { PageTransition } from "@/components/motion/PageTransition";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SectionHead } from "@/components/ui/SectionHead";
import { ProjectCard } from "@/components/work/ProjectCard";
import {
  getAdjacentProjects,
  getMedia,
  getProject,
  getProjects,
  getRelatedProjects,
} from "@/lib/cms";
import type { GalleryLayout } from "@/lib/types";

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
    openGraph: {
      title: project.title,
      description: project.shortDescription,
      images: [{ url: hero.src, width: hero.width, height: hero.height, alt: hero.alt }],
    },
  };
}

const RATIO: Record<
  GalleryLayout,
  "wide" | "landscape" | "square" | "portrait" | "tall" | "native"
> = {
  full: "wide",
  wide: "landscape",
  inset: "square",
  pair: "portrait",
  portrait: "tall",
};

const SIZES: Record<GalleryLayout, string> = {
  full: "100vw",
  wide: "(min-width: 1200px) 84vw, 100vw",
  inset: "(min-width: 1200px) 42vw, (min-width: 768px) 62vw, 100vw",
  pair: "(min-width: 1200px) 42vw, (min-width: 768px) 50vw, 100vw",
  portrait: "(min-width: 1200px) 42vw, (min-width: 768px) 62vw, 100vw",
};

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const related = getRelatedProjects(project);
  const { previous, next } = getAdjacentProjects(project.slug);
  const total = project.gallery.length;

  return (
    <PageTransition>
      <article aria-labelledby="project-title">
        {/* Title / meta */}
        <header className="container project-head">
          <nav className="project-head__crumb t-label" aria-label="Breadcrumb">
            <Link href="/work">Work</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/work?category=${encodeURIComponent(project.category)}`}>
              {project.category}
            </Link>
          </nav>
          <h1 id="project-title" className="project-head__title t-display-l" data-reveal>
            {project.title}
          </h1>
          <p
            className="project-head__thesis t-body-l"
            data-reveal
            style={{ "--reveal-delay": "100ms" } as React.CSSProperties}
          >
            {project.thesis}
          </p>
          <dl className="project-head__meta t-meta" data-reveal-group>
            <div>
              <dt>Client</dt>
              <dd>{project.client}</dd>
            </div>
            <div>
              <dt>Year</dt>
              <dd>{project.year}</dd>
            </div>
            <div>
              <dt>Discipline</dt>
              <dd>{project.discipline}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{project.location}</dd>
            </div>
          </dl>
        </header>

        {/* Hero: one decisive image, morphs from the card that linked here */}
        <div className="container project-hero">
          <ViewTransition name={`project-${project.slug}`} share="morph" default="none">
            <Media
              id={project.heroImage}
              ratio="landscape"
              focal={project.heroFocal}
              sizes="(min-width: 1520px) 1440px, 100vw"
              priority
            />
          </ViewTransition>
        </div>

        {/* Statement */}
        <section className="container section" aria-labelledby="statement-title">
          <div className="statement">
            <h2 id="statement-title" className="statement__label t-label t-muted">
              Statement
            </h2>
            <p className="statement__lead" data-reveal>
              {project.shortDescription}
            </p>
            <div className="statement__body t-body-l" data-reveal-group>
              {project.longDescription.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
            {project.externalUrl ? (
              <p className="statement__actions">
                <ButtonLink href={project.externalUrl} variant="secondary" external>
                  Visit the live project
                </ButtonLink>
              </p>
            ) : null}
          </div>
        </section>

        {/* Visual sequence */}
        <section className="section--flush-top" aria-label="Visual sequence">
          <div className={`gallery container`}>
            {project.gallery.map((item, i) => (
              <div key={item.image} className={`gallery__item gallery__item--${item.layout}`}>
                <Media
                  id={item.image}
                  ratio={RATIO[item.layout]}
                  sizes={SIZES[item.layout]}
                  caption={item.caption}
                  captionIndex={`${String(i + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`}
                  reveal
                />
              </div>
            ))}
          </div>
        </section>

        {/* Details + outcome */}
        <section className="container section" aria-labelledby="details-title">
          <div className="details">
            <h2 id="details-title" className="details__label t-label t-muted">
              Details
            </h2>
            <dl className="details__list meta-list">
              <div>
                <dt>Role</dt>
                <dd>{project.role}</dd>
              </div>
              <div>
                <dt>Scope</dt>
                <dd>
                  <ul role="list">
                    {project.deliverables.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt>Team</dt>
                <dd>{project.team.join(", ")}</dd>
              </div>
              {project.credits.map((c) => (
                <div key={c.role}>
                  <dt>{c.role}</dt>
                  <dd>{c.name}</dd>
                </div>
              ))}
              <div>
                <dt>Year / place</dt>
                <dd>
                  {project.year}, {project.location}
                </dd>
              </div>
            </dl>
            {project.outcome ? (
              <aside className="details__aside outcome" aria-label="Outcome">
                <p className="t-label t-muted">Outcome</p>
                <p>{project.outcome}</p>
              </aside>
            ) : null}
          </div>
        </section>
      </article>

      {/* Related work */}
      {related.length ? (
        <section className="container section section--flush-top" aria-labelledby="related-title">
          <SectionHead
            title="Related work"
            id="related-title"
            link={{ href: "/work", label: "All work" }}
          />
          <ul role="list" className="related-grid">
            {related.map((p) => (
              <li key={p.slug}>
                <ProjectCard
                  project={p}
                  ratio="landscape"
                  sizes="(min-width: 1200px) 30vw, (min-width: 768px) 50vw, 100vw"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Previous / next — generated from the same collection; never a dead end */}
      <nav className="container" aria-label="Project navigation">
        <div className="pager">
          <Link href={`/work/${previous.slug}`}>
            <span className="t-label t-muted">← Previous</span>
            <span className="pager__title">{previous.title}</span>
          </Link>
          <Link href="/work">
            <span className="t-label t-muted">Archive</span>
            <span className="pager__title">All work</span>
          </Link>
        </div>
      </nav>
      <Link
        href={`/work/${next.slug}`}
        className="next-project theme-inverse"
        aria-label={`Next project: ${next.title}`}
      >
        <div className="container next-project__inner">
          <div>
            <p className="t-label t-muted" style={{ marginBottom: "var(--space-6)" }}>
              Next project
            </p>
            <p className="next-project__title t-display-l">{next.title}</p>
            <p className="t-meta t-muted" style={{ marginTop: "var(--space-4)" }}>
              {next.client} — {next.discipline}, {next.year}
            </p>
          </div>
          <Media
            id={next.heroImage}
            ratio="landscape"
            focal={next.heroFocal}
            sizes="(min-width: 768px) 40vw, 100vw"
            decorative
          />
        </div>
      </Link>
    </PageTransition>
  );
}
