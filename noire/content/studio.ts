import type {
  ArchiveItem,
  Faq,
  LegalPage,
  ProcessStep,
  RecognitionEntry,
  Service,
} from "@/lib/types";

/* ------------------------------------------------------------------ Services */
export const services: Service[] = [
  {
    slug: "identity",
    number: "01",
    title: "Identity",
    summary: "Marks, type and systems for institutions and makers.",
    detail:
      "We build identities from the material outward — a glaze, a building, a printing process — so the system has a reason to look the way it does.",
    includes: ["Strategy workshop", "Mark & typography", "Colour from material", "Guidelines"],
    image: "services-identity",
  },
  {
    slug: "exhibition",
    number: "02",
    title: "Exhibition",
    summary: "Exhibition identities, wall texts and wayfinding.",
    detail:
      "Graphics that support looking rather than compete with it: reading heights, caption systems, signage and printed matter for a show's whole lifespan.",
    includes: [
      "Exhibition identity",
      "Wall texts & captions",
      "Wayfinding",
      "Posters & invitations",
    ],
    image: "services-exhibition",
  },
  {
    slug: "editorial",
    number: "03",
    title: "Editorial & books",
    summary: "Catalogues, monographs and small-press books.",
    detail:
      "From structure to binding. We work closely with editors and printers and stay on press until the last sheet is approved.",
    includes: ["Book structure", "Typography", "Image sequencing", "Production & press checks"],
    image: "services-editorial",
  },
  {
    slug: "spatial",
    number: "04",
    title: "Spatial",
    summary: "Signage and identity that live in buildings.",
    detail:
      "Signage fired, cast, carved or painted into the building. We collaborate with architects from early design so graphics are part of the fabric.",
    includes: ["Signage strategy", "Custom lettering", "Material samples", "Fabrication drawings"],
    image: "services-spatial",
  },
  {
    slug: "digital",
    number: "05",
    title: "Digital & archives",
    summary: "Websites and archives that are fast to use and calm to read.",
    detail:
      "Information architecture first, then design. We favour indexes over carousels and build sites that clients can maintain themselves.",
    includes: ["Content model", "Website design", "CMS setup", "Accessibility review"],
    image: "services-digital",
  },
  {
    slug: "art-direction",
    number: "06",
    title: "Art direction",
    summary: "Photography and campaigns with a point of view.",
    detail:
      "We direct photography for products, spaces and publications — usually with less retouching and more patience than people expect.",
    includes: [
      "Concept & references",
      "Casting locations",
      "On-set direction",
      "Edit & sequencing",
    ],
    image: "services-direction",
  },
];

export const processSteps: ProcessStep[] = [
  {
    number: "01",
    title: "Frame",
    text: "We listen, read and visit. The outcome is a one-page brief we agree on together — including what we will not do.",
  },
  {
    number: "02",
    title: "Explore",
    text: "Several honest directions, tested on real content and real materials rather than mood boards.",
  },
  {
    number: "03",
    title: "Shape",
    text: "One direction, refined in detail. Systems, prototypes, samples and the hard decisions about what stays.",
  },
  {
    number: "04",
    title: "Deliver",
    text: "Production, press checks and handover. We stay close until the last sign is installed or the last page printed.",
  },
];

export const engagementModels = [
  {
    title: "Project",
    text: "A defined scope with a fixed fee and timeline. Most identity, exhibition and book work runs this way.",
    detail: "Typical length: 8 – 20 weeks",
  },
  {
    title: "Retainer",
    text: "Ongoing art direction for institutions with a steady programme — seasons, exhibitions, publications.",
    detail: "Minimum: 6 months",
  },
  {
    title: "Sprint",
    text: "A focused two-week engagement to frame a problem, audit a system or prototype a direction.",
    detail: "Fixed: 2 weeks",
  },
];

export const faqs: Faq[] = [
  {
    question: "How many projects do you take on at once?",
    answer:
      "Usually three or four. The studio is small on purpose, and every project is led by the founder from first meeting to handover.",
  },
  {
    question: "Do you work with clients outside Europe?",
    answer:
      "Yes. About a third of our work is remote. We travel for site visits, press checks and installation when the project needs it.",
  },
  {
    question: "What does a typical project cost?",
    answer:
      "Identity and book projects usually start around €15k. We send a written proposal with a fixed fee after a first conversation — never an hourly estimate.",
  },
  {
    question: "Can you work with our in-house team?",
    answer:
      "Often the best arrangement. We design systems that internal teams can run, and include training and templates in the handover.",
  },
  {
    question: "Do you pitch?",
    answer:
      "We do not take part in unpaid pitches. For competitive processes we are happy to present relevant work and a considered approach.",
  },
];

/* ------------------------------------------------------------------ About */
export const principles = [
  {
    title: "Material first",
    text: "Start from what the thing is made of — paper, clay, stone, light — and let the system grow from there.",
  },
  {
    title: "Fewer, better decisions",
    text: "One typeface pairing. One accent. One idea per page. Every addition has to argue for its place.",
  },
  {
    title: "Built to be used",
    text: "Signs people can read from a distance, books that open flat, websites that load on a train.",
  },
  {
    title: "Slow on purpose",
    text: "We take on a small number of projects and see each one through to production.",
  },
];

export const timeline = [
  {
    years: "2021 —",
    title: "Noiré, Lisbon",
    text: "Independent studio for art direction, identity and spatial design.",
  },
  {
    years: "2016 — 2021",
    title: "Design lead, Atelier Kvist",
    text: "Exhibition and identity work for cultural institutions in Scandinavia.",
  },
  {
    years: "2013 — 2016",
    title: "Designer, Ferro Editions",
    text: "Book design and production for a small art-book press.",
  },
  {
    years: "2009 — 2013",
    title: "BA Graphic Design",
    text: "With a final year spent mostly in the letterpress workshop.",
  },
];

/** Demo clients — all fictional. */
export const clients = [
  "Halde Kunsthalle",
  "Baía Baths",
  "Ferro Editions",
  "Atelier Ombra",
  "Kiln Room",
  "Marrow Architects",
  "Sobremesa",
  "Northlight Theatre",
  "Casa Vela",
  "Museum of Small Things",
];

export const personalNotes = [
  "Reads mostly exhibition catalogues and cookbooks.",
  "Keeps a drawer of paper offcuts that is now three drawers.",
  "Believes every studio needs one good chair and one long table.",
  "Swims in the Atlantic from May to October, sometimes November.",
];

/* ------------------------------------------------------------------ Archive */
export const archive: ArchiveItem[] = [
  {
    id: "a-01",
    title: "Construction of a lowercase a",
    kind: "Sketch",
    year: 2026,
    note: "First drawing for the Quiet Matter wall-text face.",
    image: "a-01",
    project: "quiet-matter",
  },
  {
    id: "a-02",
    title: "Vessel profiles",
    kind: "Sketch",
    year: 2024,
    note: "Three profiles traced from Kiln Room's best sellers.",
    image: "a-02",
    project: "field-notes-on-clay",
  },
  {
    id: "a-03",
    title: "Glaze tile tray",
    kind: "Material study",
    year: 2024,
    note: "Twenty tiles, two firings. The palette came from the bottom row.",
    image: "a-03",
    project: "field-notes-on-clay",
  },
  {
    id: "a-04",
    title: "Plan for a reading room",
    kind: "Sketch",
    year: 2023,
    note: "Redrawn by hand to test the index-of-rooms taxonomy.",
    image: "a-04",
    project: "index-of-rooms",
  },
  {
    id: "a-05",
    title: "Riso proof, misprinted",
    kind: "Process fragment",
    year: 2022,
    note: "A feed error that became week 31.",
    image: "a-05",
    project: "paper-weather",
  },
  {
    id: "a-06",
    title: "Lamp set, night two",
    kind: "Behind the scenes",
    year: 2024,
    note: "Two paper reflectors and patience.",
    image: "a-06",
    project: "lowlight",
  },
  {
    id: "a-07",
    title: "Stencil stroke studies",
    kind: "Sketch",
    year: 2025,
    note: "Curves for the Tidewater depth numerals.",
    image: "a-07",
    project: "tidewater",
  },
  {
    id: "a-08",
    title: "Three greens",
    kind: "Material study",
    year: 2025,
    note: "Tile samples from the factory, chosen under pool light.",
    image: "a-08",
    project: "tidewater",
  },
  {
    id: "a-09",
    title: "A room with one window",
    kind: "Visual note",
    year: 2025,
    note: "Drawn on a train. No project yet.",
    image: "a-09",
  },
  {
    id: "a-10",
    title: "Paper stock fan",
    kind: "Material study",
    year: 2025,
    note: "Eleven uncoated stocks considered for Ninefold.",
    image: "a-10",
    project: "ninefold",
  },
  {
    id: "a-11",
    title: "Notes from a first meeting",
    kind: "Process fragment",
    year: 2026,
    note: "Most briefs start as a page like this.",
    image: "a-11",
  },
  {
    id: "a-12",
    title: "Stone sample, for scale",
    kind: "Material study",
    year: 2026,
    note: "Limestone offcut from the Halde plinth maker.",
    image: "a-12",
    project: "quiet-matter",
  },
];

/* ------------------------------------------------------------------ Recognition (demo) */
export const recognition: RecognitionEntry[] = [
  {
    year: 2026,
    kind: "Exhibition",
    title: "Quiet Matter",
    body: "Halde Kunsthalle, Bergen",
    detail: "Identity and catalogue for the survey exhibition.",
    project: "quiet-matter",
  },
  {
    year: 2026,
    kind: "Talk",
    title: "Designing for slow looking",
    body: "Northern Design Days (demo)",
    detail: "On exhibition graphics that support attention.",
  },
  {
    year: 2025,
    kind: "Award",
    title: "Book of the Year, shortlist",
    body: "Independent Book Design Prize (demo)",
    detail: "For Ninefold, Ferro Editions.",
    project: "ninefold",
  },
  {
    year: 2025,
    kind: "Award",
    title: "Heritage reuse, shortlist",
    body: "Regional Architecture & Design Awards (demo)",
    detail: "Spatial identity for Baía Baths.",
    project: "tidewater",
  },
  {
    year: 2025,
    kind: "Publication",
    title: "Tiles that talk",
    body: "Surface Quarterly, issue 18 (demo)",
    detail: "Feature on the Tidewater signage system.",
    project: "tidewater",
  },
  {
    year: 2024,
    kind: "Publication",
    title: "Photographing by lamplight",
    body: "Interior Notes (demo)",
    detail: "Interview on the Lowlight campaign.",
    project: "lowlight",
  },
  {
    year: 2024,
    kind: "Talk",
    title: "An identity you fire",
    body: "Material Matters symposium (demo)",
    detail: "With Kiln Room, on stamps and seasonal drift.",
    project: "field-notes-on-clay",
  },
  {
    year: 2023,
    kind: "Milestone",
    title: "Index of Rooms launches",
    body: "Marrow Architects",
    detail: "1,200 rooms indexed across thirty years of work.",
    project: "index-of-rooms",
  },
  {
    year: 2022,
    kind: "Exhibition",
    title: "Paper Weather",
    body: "Studio show, Lisbon",
    detail: "Fifty-two risograph prints hung in sequence.",
    project: "paper-weather",
  },
  {
    year: 2021,
    kind: "Milestone",
    title: "Studio founded",
    body: "Lisbon",
    detail: "Noiré opens in a former print shop.",
  },
];

/* ------------------------------------------------------------------ Legal */
export const legalPages: LegalPage[] = [
  {
    slug: "privacy",
    title: "Privacy",
    updated: "2026-09-01",
    intro:
      "This page explains what information this website collects and why. It is template text — have it reviewed for your own jurisdiction before publishing.",
    sections: [
      {
        heading: "What we collect",
        body: [
          "When you send an enquiry through the contact form we receive your name, email address and the details you choose to share. We use them only to reply to you.",
          "This site does not use advertising cookies or third-party tracking scripts.",
        ],
      },
      {
        heading: "How long we keep it",
        body: [
          "Enquiries are kept for up to twelve months and then deleted, unless they become a project.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You can ask to see, correct or delete any information we hold about you by writing to the studio email address listed on the contact page.",
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms",
    updated: "2026-09-01",
    intro:
      "The terms below cover the use of this website. They are template text and are not legal advice.",
    sections: [
      {
        heading: "Content",
        body: [
          "All text and images on this site belong to the studio or its clients and are shown for portfolio purposes. Please ask before reproducing them.",
        ],
      },
      {
        heading: "Demo content",
        body: [
          "The studio, people, clients, projects, awards and figures shown in this template are fictional. Imagery is original, procedurally generated demo artwork included with the template.",
        ],
      },
      {
        heading: "Liability",
        body: [
          "We work hard to keep the information here accurate but cannot guarantee it is complete or current.",
        ],
      },
    ],
  },
];
