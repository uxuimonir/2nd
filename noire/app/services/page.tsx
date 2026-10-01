import type { Metadata } from "next";
import { NoireBlocks, NoireCTA, NoireMarquee, NoirePageHero, NoireProcessSection, NoireServices } from "@/components/sections";
import { site } from "@/content/site";
import { engagementModels, faqs, processSteps, services } from "@/content/studio";
import { hero, img } from "@/lib/view";

export const metadata: Metadata = {
  title: "Services",
  description: "Identity, exhibition, editorial, spatial, digital and art direction — how we work, what we deliver and what it costs.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <NoirePageHero label="Services" title="Six disciplines," accent="one way of working." lede="Most projects combine two or three of these. Every one of them starts with the material and ends in production." meta="" {...hero("hero-services")} />
      <NoireMarquee items={services.map((s) => s.title).join(", ")} speed={40} size={72} dark={false} italic />
      <NoireServices
        label="In detail"
        heading="What we"
        headingItalic="make."
        linkLabel="Start a project"
        link="/contact"
        dark={false}
        items={services.map((s) => ({ number: s.number, title: s.title, summary: s.summary, detail: s.detail, includes: s.includes.join(", "), link: "", image: img(s.image) }))}
      />
      <NoireBlocks variant="cards" label="Engagement" heading="Three ways" accent="to work together." text="" caption="" dark items={engagementModels.map((m, i) => ({ a: String(i + 1).padStart(2, "0"), b: m.title, c: `${m.text} ${m.detail}.`, link: "" }))} />
      <NoireProcessSection label="Process" heading="How a project" headingItalic="moves." steps={processSteps} />
      <NoireBlocks variant="faq" label="Questions" heading="Before you" accent="write." text="" caption="" dark={false} items={faqs.map((f) => ({ a: "", b: f.question, c: f.answer, link: "" }))} />
      <NoireCTA eyebrow={site.availability.label} line1="Tell us what you are" accent="making." email={site.email} buttonLabel="Project enquiry" buttonLink="/contact" />
    </>
  );
}
