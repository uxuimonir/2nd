import type { Gallery, Story } from "@/types/content";

/** Short connective stories used between chapters. */
export const stories: Story[] = [
  {
    slug: "shaped-by-water",
    chapter: "delta",
    title: "Shaped by water",
    body: [
      "Three of Asia's great rivers — the Ganges, the Brahmaputra and the Meghna — meet in Bangladesh and carry sediment from the Himalayas to the Bay of Bengal. Over thousands of years that silt built the land itself.",
      "Every monsoon the rivers rise, spread, and lay down new soil. Chars appear and disappear; banks move. Life here is organised around water: boats, raised homesteads, floating gardens, three rice seasons.",
    ],
    media: ["sundarbans-satellite", "jamuna-from-bridge"],
    refs: [{ kind: "nature", slug: "sundarbans" }],
  },
  {
    slug: "a-delta-that-adapts",
    chapter: "future",
    title: "A delta that adapts",
    body: [
      "A low-lying delta on the front line of climate change, Bangladesh has also become a place the world learns from: community cyclone warning systems, raised shelters, floating gardens and long-term planning for water.",
      "The Bangladesh Delta Plan 2100 sets out how the country intends to live with its rivers for the rest of the century — managing floods, securing fresh water and protecting the coast.",
    ],
    media: ["tanguar-haor", "coxs-bazar-dusk"],
    refs: [],
  },
];

export const galleries: Gallery[] = [
  { slug: "water", title: "Water", media: ["padma-boatman", "ratargul", "tanguar-haor", "barishal-launch", "meghna-narsingdi", "surma"] },
  { slug: "hands", title: "Hands", media: ["jamdani-weaving-2", "nakshi-kantha-maker", "potters", "fishermen", "rice-field", "rickshaw-wallah"] },
  { slug: "brick-and-stone", title: "Brick & Stone", media: ["paharpur-aerial", "sixty-dome", "kantajew-terracotta", "lalbagh-pari-bibi", "panam-city", "parliament"] },
];
