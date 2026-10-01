import type { Metadata } from "next";
import { NoireArticle } from "@/components/sections";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Colophon",
  description: "Typefaces, colour, imagery, motion and how this site was built.",
  alternates: { canonical: "/colophon" },
};

const BODY = `## Typefaces

Instrument Serif for statements, titles and the wordmark — used large, with tight tracking and italics for emphasis. Inter Tight for navigation, metadata, captions, forms and body copy.

## Colour

Warm off-white #F5F2EC and near-black #11110F as a true light/dark pairing, a surface tone #EAE6DE, muted text #6D6A64, hairlines #D3CFC6 and one accent — vermilion #D9573F — kept to a small share of every screen.

## Imagery

Every image in this demo is original, procedurally rendered artwork made for the template — stone, water, paper, light, clay, concrete, linen, print and pencil studies, graded together with soft contrast and a light grain. Replace them with your own photography.

## Motion

Quietly cinematic: mask reveals on titles, a hero that settles as you scroll, project cards that stack, a manifesto that lights up word by word. With reduced motion enabled, movement is removed and content appears immediately.

## Build

NOIRÉ 2 v${site.version}. Every section is a self-contained Framer code component with property controls, also used to render this Next.js site. Content lives in typed collections that mirror a Framer CMS.

## Content

${site.legalName}, its people, clients, projects, awards and figures are fictional.`;

export default function ColophonPage() {
  return <NoireArticle category="Colophon" title="How this site is made." date="" author="" excerpt="A short record of the decisions behind the design — for anyone curious, or anyone customising it." body={BODY} backLabel="Back home" backLink="/" prevLabel="" prevLink="" nextLabel="Privacy" nextLink="/legal/privacy" />;
}
