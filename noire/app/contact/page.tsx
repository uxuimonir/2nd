import type { Metadata } from "next";
import { LocalTime } from "@/components/chrome/LocalTime";
import { ContactForm } from "@/components/forms/ContactForm";
import { Media } from "@/components/media/Media";
import { PageTransition } from "@/components/motion/PageTransition";
import { PageIntro } from "@/components/ui/PageIntro";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Start a project with ${site.name}. ${site.availability.label}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <PageTransition>
      <PageIntro
        label="Contact"
        title={
          <>
            Let’s talk about what you’re <em>making.</em>
          </>
        }
        lede="Tell us a little about the project. A real person reads every message — usually the founder — and replies within two working days."
      />
      <section className="container section section--flush-top" aria-label="Project enquiry">
        <div className="contact-layout">
          <div className="contact-form-wrap">
            <ContactForm />
          </div>
          <aside className="contact-aside" aria-label="Studio details">
            <Media
              id="contact-studio"
              ratio="landscape"
              sizes="(min-width: 1200px) 28vw, 100vw"
              decorative
              priority
            />
            <dl className="t-body">
              <div>
                <dt className="t-label">Availability</dt>
                <dd>
                  <span className="status">
                    <span className="status__dot" aria-hidden="true" />
                    {site.availability.label}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="t-label">Studio</dt>
                <dd>
                  {site.location} — local time <LocalTime timeZone={site.timeZone} />
                </dd>
              </div>
              <div>
                <dt className="t-label">Email</dt>
                <dd>
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </dd>
              </div>
              <div>
                <dt className="t-label">Elsewhere</dt>
                <dd>
                  <ul
                    role="list"
                    className="stack"
                    style={{ "--stack-gap": "var(--space-1)" } as React.CSSProperties}
                  >
                    {site.social.map((s) => (
                      <li key={s.href}>
                        <a href={s.href} target="_blank" rel="noopener noreferrer">
                          {s.label} <span aria-hidden="true">↗</span>
                          <span className="visually-hidden"> (opens in a new tab)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
    </PageTransition>
  );
}
