import type { Article } from "@/lib/types";

/** Journal collection. Demo writing by the fictional studio. */
export const articles: Article[] = [
  {
    title: "On restraint, and what it costs",
    slug: "on-restraint",
    category: "Essay",
    date: "2026-08-14",
    author: "Mira Solberg",
    excerpt:
      "Restraint is usually described as taking things away. In practice it is mostly about deciding, early, what you will refuse to add later.",
    coverImage: "j-on-restraint",
    featured: true,
    body: [
      {
        type: "paragraph",
        text: "Every project reaches a point where something feels missing. The page looks quiet, the room looks empty, the catalogue looks unfinished. The instinct is to add — a second typeface, a colour, a pattern, a line of copy that explains what the image already says.",
      },
      {
        type: "paragraph",
        text: "Most of the time, that feeling is not a sign that something is missing. It is the discomfort of seeing a thing at its actual size. Restraint is learning to sit with that discomfort long enough to tell the difference.",
      },
      { type: "heading", text: "Deciding early" },
      {
        type: "paragraph",
        text: "We now write a short list at the start of each project: the things we will not do. No second display face. No colour that does not come from the material. No motion that does not explain something. The list is never long, and it is never popular in the first meeting.",
      },
      {
        type: "quote",
        text: "A constraint written down in week one is a decision. The same constraint discovered in week ten is a compromise.",
        cite: "Studio notebook, 2025",
      },
      {
        type: "paragraph",
        text: "The list protects the work from our own enthusiasm. When we are tired, or the deadline is close, it is very easy to reach for an effect. The list makes us explain why.",
      },
      {
        type: "image",
        image: "j-on-restraint-break",
        caption: "An empty room is not an unfinished room. Halde Kunsthalle, install week.",
        wide: true,
      },
      { type: "heading", text: "What it costs" },
      {
        type: "paragraph",
        text: "Restraint is not free. Quiet work is harder to sell in a pitch, harder to photograph, and easier to dismiss as unfinished. Clients need to trust that the empty space is intentional, and that trust has to be earned with craft at every other level: spacing, proportion, the weight of a rule, the crop of an image.",
      },
      {
        type: "paragraph",
        text: "When it works, though, the result tends to last. Things that do less tend to age more slowly.",
      },
    ],
    related: ["captions-are-design", "working-in-the-dark"],
  },
  {
    title: "A week at the kiln",
    slug: "a-week-at-the-kiln",
    category: "Process",
    date: "2026-06-02",
    author: "Tomás Vale",
    excerpt:
      "Notes from five days in Kyoto with Kiln Room, watching an identity get fired rather than printed.",
    coverImage: "j-a-week-at-the-kiln",
    featured: false,
    body: [
      {
        type: "paragraph",
        text: "We arrived on a Monday with a box of rubber stamps and a plan. By Wednesday the plan had changed twice. Clay does not behave like paper: a stamp pressed too deep tears the surface, too shallow and the glaze fills it in.",
      },
      {
        type: "paragraph",
        text: "The final mark is about a third shallower than our first drawing, with wider counters. It looks clumsier on screen and much better on a pot.",
      },
      {
        type: "image",
        image: "j-a-week-at-the-kiln-break",
        caption: "Glaze tests from the second firing, ash over iron.",
        wide: true,
      },
      {
        type: "quote",
        text: "The kiln is the last designer on every project. You learn to leave it room.",
      },
      {
        type: "paragraph",
        text: "We now scan the stamped bases at the end of each season and use those scans for print. The identity drifts a little every time, which is exactly what the studio wanted.",
      },
    ],
    related: ["on-restraint", "a-studio-in-january"],
  },
  {
    title: "Captions are design, too",
    slug: "captions-are-design",
    category: "Notes",
    date: "2026-03-21",
    author: "Lea Okafor",
    excerpt:
      "A caption decides how long someone looks at an image. Here is how we write and set them.",
    coverImage: "j-captions-are-design",
    featured: false,
    body: [
      {
        type: "paragraph",
        text: "We spend a surprising amount of time on captions. A good caption slows the reader down by exactly the right amount: enough to look again, not enough to stop looking.",
      },
      { type: "heading", text: "Three rules" },
      {
        type: "paragraph",
        text: "Say where and when before you say what. Never describe what is plainly visible. Keep it to one line where the layout allows, two at most.",
      },
      { type: "quote", text: "If the caption repeats the image, one of them is unnecessary." },
      {
        type: "paragraph",
        text: "Typographically, captions sit one step below body text, in the utility face, with generous tracking. They align to the image edge, never to the page margin — they belong to the picture, not to the column.",
      },
    ],
    related: ["on-restraint", "why-we-index"],
  },
  {
    title: "Working in the dark",
    slug: "working-in-the-dark",
    category: "Process",
    date: "2025-11-09",
    author: "Mira Solberg",
    excerpt: "How we photographed a lighting collection using nothing but the lamps themselves.",
    coverImage: "j-working-in-the-dark",
    featured: false,
    body: [
      {
        type: "paragraph",
        text: "The brief for Lowlight was simple: show what the lamps do, not just what they look like. The only honest way to do that was to switch every other light off.",
      },
      {
        type: "paragraph",
        text: "We shot over six nights in three borrowed apartments. Exposures were long, the camera never moved, and the only retouching was dust.",
      },
      {
        type: "image",
        image: "j-working-in-the-dark-break",
        caption: "Wall wash test, second apartment, 1:40 am.",
        wide: true,
      },
      {
        type: "paragraph",
        text: "The images are darker than any product photography the client had used before. Sales of the two lamps shown only as shadow were, to everyone's surprise, the strongest of the season (demo anecdote).",
      },
    ],
    related: ["on-restraint", "a-studio-in-january"],
  },
  {
    title: "Why we index everything",
    slug: "why-we-index",
    category: "Studio",
    date: "2025-07-30",
    author: "Jonas Erde",
    excerpt:
      "A list is the most underrated layout on the web. Notes on building archives people can actually use.",
    coverImage: "j-why-we-index",
    featured: false,
    body: [
      {
        type: "paragraph",
        text: "Grids are good for browsing. Lists are good for finding. Most portfolio sites only offer the first, which is why so many of them are pleasant to scroll and impossible to use.",
      },
      {
        type: "paragraph",
        text: "Every archive we design now starts as a plain text index: title, year, discipline, place. If it works as a list, images can be added on top. If it does not, no amount of imagery will save it.",
      },
      { type: "quote", text: "An index is a promise that everything has a place." },
      {
        type: "paragraph",
        text: "This site follows the same rule. The work page opens as a grid, but the index view is one click away and remembers your choice.",
      },
    ],
    related: ["captions-are-design", "on-restraint"],
  },
  {
    title: "A studio in January",
    slug: "a-studio-in-january",
    category: "Studio",
    date: "2025-01-18",
    author: "Mira Solberg",
    excerpt: "We close for two weeks every winter. This is what we do instead of working.",
    coverImage: "j-a-studio-in-january",
    featured: false,
    body: [
      {
        type: "paragraph",
        text: "Every January the studio closes to clients for two weeks. We clean, we print, we pin things to the wall that have nothing to do with any brief.",
      },
      {
        type: "paragraph",
        text: "Paper Weather began in one of those weeks. So did the stencil alphabet that became the Tidewater signage. Neither would have happened in a normal month.",
      },
      { type: "quote", text: "Unbilled time is where most of our good ideas are filed." },
      {
        type: "paragraph",
        text: "We publish the results in the studio archive — sketches, tests and fragments that never became projects, and a few that did.",
      },
    ],
    related: ["a-week-at-the-kiln", "why-we-index"],
  },
];
