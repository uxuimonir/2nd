import type { Metadata } from "next";
import Link from "next/link";
import { PageTransition } from "@/components/motion/PageTransition";
import { PageIntro } from "@/components/ui/PageIntro";
import { recognition } from "@/content/studio";
import { getProject } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Recognition",
  description: "Awards, exhibitions, talks, publications and milestones.",
  alternates: { canonical: "/recognition" },
};

export default function RecognitionPage() {
  const years = [...new Set(recognition.map((r) => r.year))].sort((a, b) => b - a);
  const kinds = [...new Set(recognition.map((r) => r.kind))];
  return (
    <PageTransition>
      <PageIntro
        label="Recognition"
        title={
          <>
            Awards, shows, talks <em>& print.</em>
          </>
        }
        lede={`${recognition.length} entries across ${kinds.length} kinds — ${kinds.join(", ").toLowerCase()}. All entries are fictional demo content; replace with your own.`}
      />
      <section className="container section section--flush-top" aria-label="Recognition by year">
        {years.map((year) => (
          <div key={year} className="rec-year">
            <h2 className="rec-year__label">{year}</h2>
            <ul role="list" className="rec-list">
              {recognition
                .filter((r) => r.year === year)
                .map((r) => {
                  const project = r.project ? getProject(r.project) : undefined;
                  return (
                    <li key={r.title} data-reveal>
                      <span className="t-label t-muted">{r.kind}</span>
                      <div>
                        <p className="rec-list__title">{r.title}</p>
                        <p className="rec-list__body t-meta">{r.body}</p>
                      </div>
                      <p className="rec-list__detail t-meta">
                        {r.detail}{" "}
                        {project ? (
                          <Link className="link-underline" href={`/work/${project.slug}`}>
                            View project
                          </Link>
                        ) : null}
                      </p>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </section>
    </PageTransition>
  );
}
