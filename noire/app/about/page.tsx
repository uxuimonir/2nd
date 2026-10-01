import type { Metadata } from "next";
import { Media } from "@/components/media/Media";
import { PageTransition } from "@/components/motion/PageTransition";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SectionHead } from "@/components/ui/SectionHead";
import { site } from "@/content/site";
import { clients, personalNotes, principles, timeline } from "@/content/studio";

export const metadata: Metadata = {
  title: "About",
  description: `${site.name} is led by ${site.founder}: an independent studio for art direction, identity and spatial design in ${site.city}.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <PageTransition>
      {/* Profile statement + portrait/material image */}
      <section className="container page-intro" aria-labelledby="about-title">
        <p className="page-intro__label t-label t-muted" data-reveal>
          About — {site.founder}, founder
        </p>
        <div className="about-hero">
          <div className="about-hero__text">
            <h1 id="about-title" className="t-display-l" data-reveal>
              A small studio for work that is <em>made, not assembled.</em>
            </h1>
            <div
              className="stack t-body-l t-muted"
              style={{ marginTop: "var(--space-12)", maxWidth: "34em" }}
              data-reveal-group
            >
              <p>
                {site.name} was founded in {site.city} in 2021 by {site.founder}, after a decade
                designing exhibitions and books for cultural institutions in Scandinavia.
              </p>
              <p>
                We work with museums, publishers, architects and makers — usually on projects where
                the material matters as much as the message: a stone, a glaze, a sheet of paper, a
                room.
              </p>
            </div>
          </div>
          <div className="about-hero__portrait">
            <Media
              id="about-portrait"
              ratio="tall"
              sizes="(min-width: 1200px) 30vw, (min-width: 768px) 60vw, 100vw"
              caption="The studio chair, Lisbon. We prefer to show the room rather than ourselves."
              priority
              reveal
            />
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="container section" aria-labelledby="principles-title">
        <SectionHead number="01" title="Principles" id="principles-title" />
        <ol role="list" className="principles" data-reveal-group>
          {principles.map((p) => (
            <li key={p.title}>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Experience timeline */}
      <section className="container section section--flush-top" aria-labelledby="experience-title">
        <SectionHead
          number="02"
          title="Experience"
          id="experience-title"
          link={{ href: "/recognition", label: "Recognition" }}
        />
        <ol role="list" className="timeline">
          {timeline.map((t) => (
            <li key={t.years} data-reveal>
              <span className="timeline__years t-meta">{t.years}</span>
              <span className="timeline__title">{t.title}</span>
              <span className="timeline__text">{t.text}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Selected clients + personal notes */}
      <section
        className="section"
        style={{ background: "var(--color-surface)" }}
        aria-label="Clients and notes"
      >
        <div className="container split">
          <div className="split__a">
            <h2 className="t-label t-muted" style={{ marginBottom: "var(--space-8)" }}>
              Selected clients
            </h2>
            <ul role="list" className="client-list" data-reveal>
              {clients.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <p className="trust__note t-meta">Fictional demo clients.</p>
          </div>
          <div className="split__b">
            <h2 className="t-label t-muted" style={{ marginBottom: "var(--space-8)" }}>
              Personal notes
            </h2>
            <ul role="list" className="notes" data-reveal-group>
              {personalNotes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
            <div style={{ marginTop: "var(--space-12)" }}>
              <Media
                id="about-material"
                ratio="landscape"
                sizes="(min-width: 1200px) 45vw, 100vw"
                caption="Things on the studio shelf, autumn 2026."
                reveal
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container cta" aria-labelledby="about-cta">
        <h2 id="about-cta" className="cta__title t-display-l" data-reveal>
          Working on something with a <em>material story?</em>
        </h2>
        <div className="cta__foot">
          <ButtonLink href="/contact">Start a conversation</ButtonLink>
          <ButtonLink href="/work" variant="text">
            See the work first
          </ButtonLink>
        </div>
      </section>
    </PageTransition>
  );
}
