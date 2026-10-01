import type { Metadata } from "next";
import Link from "next/link";
import { PageTransition } from "@/components/motion/PageTransition";
import { PageIntro } from "@/components/ui/PageIntro";
import { SectionHead } from "@/components/ui/SectionHead";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Colophon",
  description: "Typefaces, colour, imagery, motion and how this site was built.",
  alternates: { canonical: "/colophon" },
};

const SWATCHES = [
  ["Background", "#F5F2EC"],
  ["Inverse", "#11110F"],
  ["Surface", "#EAE6DE"],
  ["Text muted", "#6D6A64"],
  ["Line", "#D3CFC6"],
  ["Accent", "#D9573F"],
  ["Accent soft", "#F0C8BF"],
] as const;

export default function ColophonPage() {
  return (
    <PageTransition>
      <PageIntro
        label="Colophon"
        title={
          <>
            How this site is <em>made.</em>
          </>
        }
        lede="A short record of the decisions behind the design, for anyone curious — or anyone customising it."
      />
      <div className="container section section--flush-top quiet-page">
        <div className="quiet-page__aside" />
        <div className="quiet-page__body">
          <SectionHead number="01" title="Typefaces" />
          <div className="type-specimen">
            <p className="t-display-l">Instrument Serif</p>
            <p className="t-muted">
              Display — statements, titles, the wordmark. Used at large sizes with tight tracking,
              with italics for emphasis.
            </p>
            <p
              className="t-h2"
              style={{ fontFamily: "var(--font-utility)", letterSpacing: "-0.02em" }}
            >
              Inter Tight
            </p>
            <p className="t-muted">
              Utility — navigation, metadata, captions, forms and body copy.
            </p>
          </div>

          <div className="section--tight" />
          <SectionHead number="02" title="Colour" />
          <ul role="list" className="swatches">
            {SWATCHES.map(([name, hex]) => (
              <li key={hex} className="swatch">
                <span style={{ background: hex }} aria-hidden="true" />
                <span>{name}</span>
                <br />
                <span className="t-muted">{hex}</span>
              </li>
            ))}
          </ul>

          <div className="section--tight" />
          <SectionHead number="03" title="Notes" />
          <div className="prose">
            <h3>Imagery</h3>
            <p>
              Every image in this demo is original, procedurally rendered artwork made for the
              template — stone, water, paper, light, clay, concrete, linen, print and pencil
              studies, graded together with soft contrast and a light grain. Replace them with your
              own photography in <code>content/media.ts</code>.
            </p>
            <h3>Motion</h3>
            <p>
              Quietly cinematic: opacity, short vertical offsets and mask reveals, one page
              transition across every route, and a project image that carries over from card to case
              study. With reduced motion enabled, movement is removed and content appears
              immediately.
            </p>
            <h3>Build</h3>
            <p>
              NOIRÉ 2 v{site.version}. Next.js, React and plain CSS custom properties — no UI
              framework. Content lives in typed collections that mirror a Framer CMS. Designed for
              Framer conversion: components, variants, text and colour styles, CMS collections and
              breakpoints map one-to-one.
            </p>
            <h3>Content</h3>
            <p>
              {site.legalName}, its people, clients, projects, awards and figures are fictional. See
              the <Link href="/legal/terms">terms</Link> and{" "}
              <Link href="/legal/privacy">privacy</Link> pages.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
