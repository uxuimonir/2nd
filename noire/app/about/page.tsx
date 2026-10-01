import type { Metadata } from "next";
import { NoireBlocks, NoireCTA, NoireMarquee, NoirePageHero } from "@/components/sections";
import { site } from "@/content/site";
import { clients, personalNotes, principles, timeline } from "@/content/studio";
import { hero, img } from "@/lib/view";

export const metadata: Metadata = {
  title: "About",
  description: `${site.name} is led by ${site.founder}: an independent studio for art direction, identity and spatial design in ${site.city}.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <NoirePageHero label={`About — ${site.founder}, founder`} title="A small studio for work" accent="made, not assembled." lede={`Founded in ${site.city} in 2021 after a decade designing exhibitions and books for cultural institutions.`} meta="" {...hero("hero-about")} />
      <NoireMarquee items="Material first, Fewer decisions, Built to be used, Slow on purpose" speed={45} size={72} dark={false} italic />
      <NoireBlocks
        variant="split"
        label="Profile"
        heading="We start from"
        accent="the material."
        text={`We work with museums, publishers, architects and makers — usually on projects where the material matters as much as the message: a stone, a glaze, a sheet of paper, a room.\n\nThe studio is small on purpose. Every project is led by ${site.founder} from first meeting to the last sign installed.`}
        image={img("about-portrait")}
        caption="The studio chair, Lisbon. We prefer to show the room rather than ourselves."
        items={[]}
        dark={false}
      />
      <NoireBlocks variant="cards" label="Principles" heading="How we" accent="work." text="" caption="" dark items={principles.map((p, i) => ({ a: String(i + 1).padStart(2, "0"), b: p.title, c: p.text, link: "" }))} />
      <NoireBlocks variant="rows" label="Experience" heading="Ten years," accent="four rooms." text="" caption="" dark={false} items={timeline.map((t) => ({ a: t.years, b: t.title, c: t.text, link: "" }))} />
      <NoireBlocks variant="rows" label="Selected clients & notes" heading="Who we work with," accent="and who we are." text="" caption="" dark={false} items={[...clients.slice(0, 4).map((c) => ({ a: "Client", b: c, c: "Fictional demo client.", link: "" })), ...personalNotes.map((n, i) => ({ a: `Note ${i + 1}`, b: n, c: "", link: "" }))]} />
      <NoireCTA eyebrow={site.availability.label} line1="Working on something with a" accent="material story?" email={site.email} buttonLabel="Start a conversation" buttonLink="/contact" />
    </>
  );
}
