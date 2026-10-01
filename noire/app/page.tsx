import {
  NoireClients,
  NoireCTA,
  NoireHero,
  NoireIndex,
  NoireJournalPreview,
  NoireManifesto,
  NoireMarquee,
  NoireProcessSection,
  NoireServices,
  NoireStackedWork,
} from "@/components/sections";
import { site } from "@/content/site";
import { clients, processSteps, recognition, services } from "@/content/studio";
import { getArticles, getFeaturedArticle, getProjects } from "@/lib/cms";
import { img, indexRow, stackedProject, story } from "@/lib/view";

export default function HomePage() {
  const projects = getProjects();
  const featured = getFeaturedArticle();
  const stories = [featured, ...getArticles().filter((a) => a.slug !== featured.slug)].slice(0, 3);

  return (
    <>
      <NoireHero
        eyebrow={`Independent studio — ${site.city}`}
        line1="Identities, exhibitions"
        line2="and rooms that"
        accent="hold attention."
        descriptor={`${site.name} works with cultural institutions and makers — from first idea to the last printed sheet.`}
        ctaLabel="See selected work"
        ctaLink="/work"
        image={img("home-hero")}
        caption="Studio, late afternoon"
      />
      <NoireMarquee items={services.map((s) => s.title).join(", ")} speed={40} size={72} dark={false} italic />
      <NoireStackedWork
        label="Selected work"
        heading="Four projects,"
        headingItalic="one way of working."
        allLabel="All projects"
        allLink="/work"
        projects={projects.slice(0, 4).map(stackedProject)}
      />
      <NoireIndex label="Index" heading="Every project, at a glance." linkLabel="Open archive" link="/work?view=index" items={projects.map(indexRow)} showHeading />
      <NoireManifesto
        label="Manifesto"
        text="We start with the material, add as little as we can, and stay until it is made. Restraint is not an aesthetic — it is a decision we make early and keep."
        accentWords="made., decision"
        signature={`${site.founder}, founder — About the studio`}
        signatureLink="/about"
        image={img("home-manifesto")}
      />
      <NoireServices
        label="Capabilities"
        heading="Six disciplines,"
        headingItalic="one way of working."
        linkLabel="Services"
        link="/services"
        dark
        items={services.map((s) => ({ number: s.number, title: s.title, summary: s.summary, detail: s.detail, includes: s.includes.join(", "), link: "/services", image: img(s.image) }))}
      />
      <NoireProcessSection label="Process" heading="Four steps," headingItalic="no shortcuts." steps={processSteps} />
      <NoireClients
        label="Clients & recognition"
        facts={[
          { value: "2021", label: `Founded in ${site.city}` },
          { value: "3–4", label: "Projects at a time" },
          { value: String(services.length), label: "Disciplines" },
          { value: "1", label: "Founder on every project" },
        ]}
        clients={clients.join(", ")}
        note="Clients, awards and figures are fictional demo content."
        entries={recognition.slice(0, 4).map((r) => ({ year: String(r.year), kind: r.kind, title: `${r.title} — ${r.body}` }))}
        linkLabel="Recognition"
        link="/recognition"
      />
      <NoireJournalPreview label="Journal" heading="Notes on making things slowly." allLabel="All notes" allLink="/journal" stories={stories.map(story)} />
      <NoireCTA eyebrow={site.availability.label} line1="Have something that should" accent="last?" email={site.email} buttonLabel="Start a project" buttonLink="/contact" />
    </>
  );
}
