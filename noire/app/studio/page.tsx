import type { Metadata } from "next";
import Link from "next/link";
import { Media } from "@/components/media/Media";
import { PageTransition } from "@/components/motion/PageTransition";
import { PageIntro } from "@/components/ui/PageIntro";
import { archive } from "@/content/studio";
import { getProject } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Studio Archive",
  description:
    "Sketches, material studies, process fragments and behind-the-scenes notes from the studio.",
  alternates: { canonical: "/studio" },
};

const RATIO = { S: "square", P: "portrait", L: "landscape" } as const;

export default function StudioPage() {
  return (
    <PageTransition>
      <PageIntro
        label={`Studio archive — ${archive.length} fragments`}
        title={
          <>
            What happens <em>before</em> the work.
          </>
        }
        lede="Sketches, glaze tests, misprints and notes from first meetings. Some became projects; most did not, and that is the point."
      />
      <section className="container section section--flush-top" aria-label="Archive">
        <ul role="list" className="archive-grid">
          {archive.map((item, i) => {
            const project = item.project ? getProject(item.project) : undefined;
            const ratio = RATIO[(["S", "P", "L"] as const)[i % 3]];
            return (
              <li key={item.id} className="archive-item" data-reveal="section">
                <Media
                  id={item.image}
                  ratio={ratio}
                  priority={i < 3}
                  sizes="(min-width: 1200px) 30vw, (min-width: 640px) 50vw, 100vw"
                />
                <p className="archive-item__meta t-label">
                  <span>{item.kind}</span>
                  <span>{item.year}</span>
                </p>
                <h2 className="archive-item__title">{item.title}</h2>
                <p className="archive-item__note t-meta">{item.note}</p>
                {project ? (
                  <p className="archive-item__link t-meta">
                    <Link className="link-underline" href={`/work/${project.slug}`}>
                      From {project.title}
                    </Link>
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
    </PageTransition>
  );
}
