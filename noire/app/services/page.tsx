import type { Metadata } from "next";
import { ProcessScroll } from "@/components/home/ProcessScroll";
import { Media } from "@/components/media/Media";
import { PageTransition } from "@/components/motion/PageTransition";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PageIntro } from "@/components/ui/PageIntro";
import { SectionHead } from "@/components/ui/SectionHead";
import { site } from "@/content/site";
import { engagementModels, faqs, processSteps, services } from "@/content/studio";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Identity, exhibition, editorial, spatial, digital and art direction — how we work, what we deliver and what it costs.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  const deliverables = [...new Set(services.flatMap((s) => s.includes))];
  return (
    <PageTransition>
      <PageIntro
        label="Services"
        title={
          <>
            Six disciplines, <em>one way of working.</em>
          </>
        }
        lede="Most projects combine two or three of these. Every one of them starts with the material and ends in production."
      />

      {/* Service index */}
      <nav className="container" aria-label="Service index">
        <ul role="list" className="service-index">
          {services.map((s) => (
            <li key={s.slug}>
              <a href={`#${s.slug}`}>
                <span>{s.number}</span>
                <span className="service-index__title">{s.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Detailed modules */}
      <section className="container section" aria-label="Services in detail">
        {services.map((s) => (
          <article
            key={s.slug}
            id={s.slug}
            className="service-module"
            aria-labelledby={`${s.slug}-title`}
          >
            <div className="service-module__head">
              <span className="service-module__num">{s.number}</span>
              <h2 id={`${s.slug}-title`} className="t-h1">
                {s.title}
              </h2>
            </div>
            <div className="service-module__text" data-reveal>
              <p className="t-body-l">{s.summary}</p>
              <p className="service-module__detail" style={{ marginTop: "var(--space-4)" }}>
                {s.detail}
              </p>
              <ul role="list" aria-label={`${s.title} includes`}>
                {s.includes.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
            <div className="service-module__media">
              <Media
                id={s.image}
                ratio="square"
                sizes="(min-width: 1200px) 22vw, (min-width: 768px) 34vw, 100vw"
                reveal
              />
            </div>
          </article>
        ))}
      </section>

      {/* Engagement model */}
      <section className="container section section--flush-top" aria-labelledby="engagement-title">
        <SectionHead number="01" title="Engagement" id="engagement-title" />
        <ul role="list" className="engagement" data-reveal-group>
          {engagementModels.map((m) => (
            <li key={m.title}>
              <h3>{m.title}</h3>
              <p>{m.text}</p>
              <p className="t-label">{m.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Process */}
      <section className="container section section--flush-top" aria-label="Process">
        <ProcessScroll
          steps={processSteps}
          title={
            <>
              How a project <em>moves.</em>
            </>
          }
        />
      </section>

      {/* Deliverables */}
      <section className="container section" aria-labelledby="deliverables-title">
        <SectionHead number="02" title="Typical deliverables" id="deliverables-title" />
        <ul role="list" className="deliverables t-body-l">
          {deliverables.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section className="container section section--flush-top" aria-labelledby="faq-title">
        <SectionHead number="03" title="Questions" id="faq-title" />
        <div className="faq">
          {faqs.map((f) => (
            <details key={f.question}>
              <summary>{f.question}</summary>
              <p className="t-body-l">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Enquiry CTA */}
      <section className="container cta" aria-labelledby="services-cta">
        <h2 id="services-cta" className="cta__title t-display-l" data-reveal>
          Tell us what you are <em>making.</em>
        </h2>
        <div className="cta__foot">
          <ButtonLink href="/contact">Project enquiry</ButtonLink>
          <a className="link-underline t-body-l" href={`mailto:${site.email}`}>
            {site.email}
          </a>
        </div>
      </section>
    </PageTransition>
  );
}
