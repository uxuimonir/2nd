import type { Metadata } from "next";
import { NoireContact, NoirePageHero } from "@/components/sections";
import { budgetRanges, projectTypes, site } from "@/content/site";
import { hero, img } from "@/lib/view";

export const metadata: Metadata = {
  title: "Contact",
  description: `Start a project with ${site.name}. ${site.availability.label}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <NoirePageHero label="Contact" title="Let’s talk about" accent="what you’re making." lede="A real person reads every message — usually the founder — and replies within two working days." meta="" {...hero("hero-contact")} />
      <NoireContact
        endpoint="/api/contact"
        email={site.email}
        availability={site.availability.label}
        location={site.location}
        timeZone={site.timeZone}
        projectTypes={projectTypes.join(", ")}
        budgets={budgetRanges.join(", ")}
        image={{ ...img("contact-studio"), alt: "" }}
      />
    </>
  );
}
