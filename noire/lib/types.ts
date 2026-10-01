/**
 * NOIRÉ 2 content model.
 * Each type mirrors a Framer CMS collection (or a settings component) so the
 * template can be rebuilt 1:1 in Framer. Field names match the CMS field names
 * documented in README.md.
 */

/** Generative recipe used by scripts/media to render the demo imagery. */
export type MediaRecipe =
  | "stone"
  | "water"
  | "paper"
  | "light"
  | "clay"
  | "concrete"
  | "linen"
  | "riso"
  | "studio"
  | "sketch";

export type MediaAsset = {
  id: string;
  src: string;
  width: number;
  height: number;
  /** Meaningful alt text. Empty string marks the image as decorative. */
  alt: string;
  /** CSS object-position, e.g. "50% 40%" — the Hero Focal Point field. */
  focal?: string;
  recipe: MediaRecipe;
  variant: number;
  seed: number;
};

export type GalleryLayout = "full" | "wide" | "inset" | "pair" | "portrait";

export type GalleryItem = {
  image: string;
  caption: string;
  layout: GalleryLayout;
};

export type Credit = { role: string; name: string };

export type ProjectCategory =
  | "Identity"
  | "Exhibition"
  | "Editorial"
  | "Spatial"
  | "Digital"
  | "Art Direction";

export type Project = {
  title: string;
  slug: string;
  client: string;
  year: number;
  category: ProjectCategory;
  discipline: string;
  location: string;
  /** One-line project thesis shown under the title. */
  thesis: string;
  shortDescription: string;
  longDescription: string[];
  heroImage: string;
  heroFocal?: string;
  gallery: GalleryItem[];
  role: string;
  team: string[];
  deliverables: string[];
  credits: Credit[];
  outcome?: string;
  /** Optional, real URL only. When absent no external-link button renders. */
  externalUrl?: string;
  featured: boolean;
  sortOrder: number;
  related: string[];
};

export type JournalCategory = "Essay" | "Process" | "Studio" | "Notes";

export type JournalBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "image"; image: string; caption: string; wide?: boolean };

export type Article = {
  title: string;
  slug: string;
  category: JournalCategory;
  /** ISO date, e.g. 2026-08-14 */
  date: string;
  author: string;
  excerpt: string;
  coverImage: string;
  featured: boolean;
  body: JournalBlock[];
  related: string[];
};

export type Service = {
  slug: string;
  number: string;
  title: string;
  summary: string;
  detail: string;
  includes: string[];
  image: string;
};

export type ProcessStep = { number: string; title: string; text: string };

export type Faq = { question: string; answer: string };

export type ArchiveKind =
  | "Sketch"
  | "Material study"
  | "Process fragment"
  | "Visual note"
  | "Behind the scenes";

export type ArchiveItem = {
  id: string;
  title: string;
  kind: ArchiveKind;
  year: number;
  note: string;
  image: string;
  /** Optional link to the project this fragment belongs to. */
  project?: string;
};

export type RecognitionKind = "Award" | "Exhibition" | "Talk" | "Publication" | "Milestone";

export type RecognitionEntry = {
  year: number;
  kind: RecognitionKind;
  title: string;
  body: string;
  detail: string;
  project?: string;
};

export type LegalPage = {
  slug: string;
  title: string;
  updated: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
};

export type NavItem = { label: string; href: string };

export type SocialLink = { label: string; href: string };
