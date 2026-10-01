import type { NavItem, SocialLink } from "@/lib/types";

/**
 * Site settings — the single place a buyer edits brand, contact and SEO.
 * Everything here is demo content for a fictional studio.
 */
export const site = {
  /** Brand name and wordmark text. */
  name: "Noiré",
  wordmark: "NOIRÉ",
  legalName: "Noiré Studio (demo)",
  descriptor: "Independent studio for art direction, identity and spatial design.",
  founder: "Mira Solberg",
  location: "Lisbon, Portugal",
  city: "Lisbon",
  /** IANA time zone for the live clock in the micro header. */
  timeZone: "Europe/Lisbon",
  availability: {
    open: true,
    label: "Booking projects from January 2027",
  },
  /** Reserved .example domain — replace with your own address. */
  email: "hello@noire.example",
  seo: {
    title: "Noiré — Art direction, identity & spatial design",
    description:
      "Noiré is an independent studio making identities, exhibitions, books and rooms for cultural institutions and makers. A NOIRÉ 2 template demo.",
  },
  nav: [
    { label: "Work", href: "/work" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Journal", href: "/journal" },
    { label: "Contact", href: "/contact" },
  ] satisfies NavItem[],
  /** Secondary pages listed in the footer. */
  footerNav: [
    { label: "Studio Archive", href: "/studio" },
    { label: "Recognition", href: "/recognition" },
    { label: "Colophon", href: "/colophon" },
  ] satisfies NavItem[],
  legalNav: [
    { label: "Privacy", href: "/legal/privacy" },
    { label: "Terms", href: "/legal/terms" },
  ] satisfies NavItem[],
  /** Platform roots as neutral defaults. Replace with your profiles. */
  social: [
    { label: "Instagram", href: "https://www.instagram.com/" },
    { label: "Are.na", href: "https://www.are.na/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
  ] satisfies SocialLink[],
  version: "2.0.0",
} as const;

export const projectTypes = [
  "Identity",
  "Exhibition",
  "Editorial / book",
  "Spatial",
  "Digital",
  "Art direction",
  "Something else",
] as const;

export const budgetRanges = [
  "Under €15k",
  "€15k – €40k",
  "€40k – €80k",
  "€80k +",
  "Not sure yet",
] as const;

export const timelines = [
  "As soon as possible",
  "Within 3 months",
  "3 – 6 months",
  "Flexible",
] as const;
