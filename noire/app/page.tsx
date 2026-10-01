import Link from "next/link";
import { Capabilities } from "@/components/home/Capabilities";
import { ProcessScroll } from "@/components/home/ProcessScroll";
import { JournalCard } from "@/components/journal/JournalCard";
import { Media } from "@/components/media/Media";
import { PageTransition } from "@/components/motion/PageTransition";
import { ScrollScale } from "@/components/motion/ScrollScale";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SectionHead } from "@/components/ui/SectionHead";
import { ProjectCard } from "@/components/work/ProjectCard";
import { WorkIndex } from "@/components/work/WorkIndex";
import { toIndexRows } from "@/components/work/toIndexRows";
import { site } from "@/content/site";
import { clients, processSteps, recognition, services } from "@/content/studio";
import {
  getArticles,
  getFeaturedArticle,
  getFeaturedProjects,
  getMedia,
  getProjects,
} from "@/lib/cms";

export default function HomePage() {
  const featured = getFeaturedProjects();
  const [lead, a, b] = featured;
  const projects = getProjects();
  const featuredArticle = getFeaturedArticle();
  const otherArticles = getArticles()
    .filter((x) => x.slug !== featuredArticle.slug)
    .slice(0, 2);
  const capabilityRows = services.map((s) => {
    const m = getMedia(s.image);
    return { ...s, thumb: { src: m.src, focal: m.focal } };
  });

  return (
    <PageTransition>
      {/* 02 — Hero statement */}
      <section className="container hero" aria-labelledby="hero-title">
        <h1 id="hero-title" className="hero__statement t-display-xl" data-reveal>
          Identities, exhibitions and rooms that <em>hold attention.</em>
        </h1>
        <div
          className="hero__foot"
          data-reveal
          style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
        >
          <p className="hero__descriptor t-body-l">
            {site.name} is an independent studio in {site.city} working with cultural institutions
            and makers — from first idea to the last printed sheet.
          </p>
          <ButtonLink href="/work">See selected work</ButtonLink>
        </div>

        {/* 03 — Hero transition: mask reveal, then a quiet scroll-linked scale */}
        <div className="hero__media">
          <ScrollScale>
            <Media
              id="home-hero"
              ratio="wide"
              sizes="(min-width: 1520px) 1440px, 100vw"
              priority
              reveal
            />
          </ScrollScale>
          <p className="hero__caption t-meta" data-reveal>
            <span>Studio, Rua da Boavista — late afternoon</span>
            <span>Selected work 2022 — 2026 ↓</span>
          </p>
        </div>
      </section>

      {/* 04 — Featured work */}
      <section className="container section" aria-labelledby="featured-title">
        <SectionHead
          number="01"
          title="Featured work"
          id="featured-title"
          link={{ href: "/work", label: "All projects" }}
        />
        <div className="featured">
          <div className="featured__lead" data-reveal="section">
            <ProjectCard
              project={lead}
              ratio="landscape"
              lead
              morph
              priority
              sizes="(min-width: 1200px) 62vw, 100vw"
            />
          </div>
          <div
            className="featured__a"
            data-reveal="section"
            style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
          >
            <ProjectCard
              project={a}
              ratio="tall"
              morph
              sizes="(min-width: 1200px) 22vw, (min-width: 768px) 48vw, 100vw"
            />
          </div>
          <div className="featured__b" data-reveal="section">
            <ProjectCard
              project={b}
              ratio="square"
              morph
              sizes="(min-width: 1200px) 30vw, (min-width: 768px) 48vw, 100vw"
            />
          </div>
        </div>
      </section>

      {/* 05 — Work index */}
      <section className="container section section--flush-top" aria-labelledby="index-title">
        <SectionHead
          number="02"
          title="Index"
          id="index-title"
          link={{ href: "/work?view=index", label: "Open archive" }}
        />
        <WorkIndex rows={toIndexRows(projects)} />
      </section>

      {/* 06 — Manifesto: the emotional reset */}
      <section className="section theme-inverse" aria-labelledby="manifesto-title">
        <div className="container manifesto__grid">
          <div className="manifesto__body">
            <h2
              id="manifesto-title"
              className="t-label t-muted"
              style={{ marginBottom: "var(--space-8)" }}
            >
              Manifesto
            </h2>
            <div data-reveal-group>
              <p className="manifesto__text t-display-l">We start with the material,</p>
              <p className="manifesto__text t-display-l">add as little as we can,</p>
              <p className="manifesto__text t-display-l">
                and stay until it is <em>made.</em>
              </p>
            </div>
            <p className="manifesto__sign t-meta" data-reveal>
              {site.founder}, founder —{" "}
              <Link className="link-underline" href="/about">
                About the studio
              </Link>
            </p>
          </div>
          <div className="manifesto__media">
            <Media
              id="home-manifesto"
              ratio="portrait"
              sizes="(min-width: 1200px) 22vw, (min-width: 768px) 36vw, 70vw"
              reveal
            />
          </div>
        </div>
      </section>

      {/* 07 — Capabilities */}
      <section className="container section" aria-labelledby="caps-title">
        <SectionHead
          number="03"
          title="Capabilities"
          id="caps-title"
          link={{ href: "/services", label: "Services" }}
        />
        <Capabilities rows={capabilityRows} />
      </section>

      {/* 08 — Process */}
      <section className="container section section--flush-top" aria-label="Process">
        <ProcessScroll
          steps={processSteps}
          title={
            <>
              Four steps, <em>no shortcuts.</em>
            </>
          }
        />
      </section>

      {/* 09 — Recognition / trust */}
      <section
        className="section"
        style={{ background: "var(--color-surface)" }}
        aria-labelledby="trust-title"
      >
        <div className="container">
          <SectionHead
            number="04"
            title="Clients & recognition"
            id="trust-title"
            link={{ href: "/recognition", label: "Recognition" }}
          />
          <div className="trust__grid">
            <div className="trust__clients">
              <ul role="list" className="client-list" data-reveal>
                {clients.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <p className="trust__note t-meta">All clients shown are fictional demo content.</p>
            </div>
            <dl className="facts trust__facts t-meta">
              <div>
                <dt>Founded</dt>
                <dd>2021, {site.city}</dd>
              </div>
              <div>
                <dt>Projects at a time</dt>
                <dd>Three to four, each founder-led</dd>
              </div>
              {recognition.slice(0, 3).map((r) => (
                <div key={r.title}>
                  <dt>
                    {r.year} · {r.kind}
                  </dt>
                  <dd>
                    {r.title} — {r.body}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* 10 — Journal */}
      <section className="container section" aria-labelledby="journal-title">
        <SectionHead
          number="05"
          title="Journal"
          id="journal-title"
          link={{ href: "/journal", label: "All notes" }}
        />
        <div className="journal-preview">
          <div className="journal-preview__feature" data-reveal="section">
            <JournalCard
              article={featuredArticle}
              feature
              sizes="(min-width: 1200px) 56vw, 100vw"
            />
          </div>
          <div className="journal-preview__side">
            {otherArticles.map((article) => (
              <div key={article.slug} data-reveal="section">
                <JournalCard
                  article={article}
                  sizes="(min-width: 1200px) 30vw, (min-width: 768px) 48vw, 100vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11 — Contact statement */}
      <section className="container cta" aria-labelledby="cta-title">
        <p className="t-label t-muted" style={{ marginBottom: "var(--space-8)" }}>
          {site.availability.label}
        </p>
        <h2 id="cta-title" className="cta__title t-display-xl" data-reveal>
          Have something that should <em>last?</em>
        </h2>
        <div className="cta__foot" data-reveal>
          <a className="cta__email link-underline" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          <ButtonLink href="/contact">Project enquiry</ButtonLink>
        </div>
      </section>
    </PageTransition>
  );
}
