import type { MediaAsset, MediaRecipe } from "@/lib/types";

/**
 * Media library. Every image is an original, procedurally rendered demo asset
 * (see scripts/media) and is free to redistribute with the template.
 * Replace `src` with your own photography; keep width/height accurate so the
 * layout reserves space and never shifts.
 */

type Size = "L" | "P" | "S" | "W" | "T";
const SIZES: Record<Size, [number, number]> = {
  L: [1800, 1200], // 3:2 landscape
  P: [1280, 1600], // 4:5 portrait
  S: [1400, 1400], // 1:1
  W: [1920, 1080], // 16:9 wide
  T: [1200, 1600], // 3:4 tall
};

type Row = [
  id: string,
  recipe: MediaRecipe,
  variant: number,
  size: Size,
  alt: string,
  focal?: string,
];

const rows: Row[] = [
  // Site-level imagery
  [
    "home-hero",
    "studio",
    2,
    "W",
    "Late sun falling through a tall window as a long parallelogram of light across a plaster wall and floor.",
    "60% 50%",
  ],
  [
    "home-manifesto",
    "concrete",
    6,
    "P",
    "Sunlight falling as a sharp-edged patch across a raw concrete wall.",
    "50% 40%",
  ],
  [
    "about-portrait",
    "studio",
    0,
    "T",
    "A wooden chair beside a window in a quiet studio, half in shadow.",
    "45% 50%",
  ],
  [
    "about-material",
    "studio",
    3,
    "S",
    "Studio shelf holding ceramic tests, paper samples and a small stone.",
    "50% 50%",
  ],
  [
    "services-identity",
    "riso",
    6,
    "S",
    "Overlapping printed shapes in vermilion and blue.",
    "50% 50%",
  ],
  [
    "services-exhibition",
    "stone",
    7,
    "S",
    "Framed works on paper hung low along a gallery wall.",
    "50% 50%",
  ],
  [
    "services-editorial",
    "paper",
    6,
    "S",
    "A stack of folded sheets with a single red thread.",
    "50% 50%",
  ],
  [
    "services-spatial",
    "concrete",
    6,
    "S",
    "Light from a high opening falling across a concrete wall.",
    "50% 50%",
  ],
  [
    "services-digital",
    "sketch",
    6,
    "S",
    "An index grid sketched in pencil on pale paper.",
    "50% 50%",
  ],
  ["services-direction", "light", 6, "S", "A glowing opal lamp in a dark room.", "50% 50%"],
  [
    "contact-studio",
    "studio",
    1,
    "L",
    "Top-down view of a studio desk with paper, a pencil and a cup.",
    "50% 50%",
  ],
  ["notfound", "concrete", 7, "W", "An empty corridor ending in a pool of daylight.", "50% 50%"],

  // Quiet Matter — stone
  [
    "p-quiet-matter-hero",
    "stone",
    0,
    "L",
    "A smooth pale stone sculpture on a low plinth in a warm grey gallery.",
    "50% 55%",
  ],
  [
    "p-quiet-matter-01",
    "stone",
    5,
    "W",
    "Three low plinths in a long gallery, each carrying a rounded stone form.",
  ],
  [
    "p-quiet-matter-02",
    "stone",
    1,
    "P",
    "Two stone forms of different heights side by side on a plinth.",
  ],
  ["p-quiet-matter-03", "stone", 2, "S", "Close-up of a grainy, warm stone surface."],
  [
    "p-quiet-matter-04",
    "stone",
    3,
    "L",
    "Small framed works on paper hung at low height along a gallery wall.",
  ],
  [
    "p-quiet-matter-05",
    "stone",
    4,
    "P",
    "Rounded stone forms on low plinths seen from the gallery floor.",
  ],
  [
    "p-quiet-matter-06",
    "stone",
    8,
    "P",
    "A single stone form in raking light with a long soft shadow.",
  ],

  // Tidewater — water
  [
    "p-tidewater-hero",
    "water",
    0,
    "L",
    "A tiled indoor pool with green glazed walls and calm water.",
    "50% 60%",
  ],
  [
    "p-tidewater-01",
    "water",
    3,
    "W",
    "Warm light from an arched window reflected in dark pool water.",
  ],
  [
    "p-tidewater-02",
    "water",
    1,
    "P",
    "A wall of green glazed square tiles with subtle colour variation.",
  ],
  ["p-tidewater-03", "water", 5, "P", "Rippling caustic light patterns on a pale pool floor."],
  ["p-tidewater-04", "water", 4, "S", "A depth marker reading 1.40 fired into a white tile."],
  ["p-tidewater-05", "water", 2, "L", "A calm sea horizon in soft bands of blue and grey."],

  // Ninefold — paper
  [
    "p-ninefold-hero",
    "paper",
    0,
    "L",
    "An open book showing a typeset spread with a single red rule.",
    "50% 50%",
  ],
  ["p-ninefold-01", "paper", 7, "L", "A book spread with a block of text and generous margins."],
  [
    "p-ninefold-02",
    "paper",
    1,
    "T",
    "Nine slim books stacked, their cloth spines in muted colours.",
  ],
  ["p-ninefold-03", "paper", 2, "S", "A large sheet folded into sections, lit from the side."],
  ["p-ninefold-04", "paper", 3, "P", "Detail of typeset lines of text on cream paper."],
  ["p-ninefold-05", "paper", 5, "P", "The uncut fore-edge of a book showing layered pages."],
  [
    "p-ninefold-06",
    "paper",
    4,
    "W",
    "Nine book covers laid out in a row, each a different muted colour.",
  ],

  // Lowlight — light
  [
    "p-lowlight-hero",
    "light",
    0,
    "L",
    "A dome pendant lamp casting a warm pool of light in a dark room.",
    "50% 40%",
  ],
  ["p-lowlight-01", "light", 7, "T", "A pendant lamp hanging low over a table at night."],
  ["p-lowlight-02", "light", 1, "W", "Warm light washing up a dark wall from a hidden source."],
  ["p-lowlight-03", "light", 2, "S", "A glowing opal glass globe against darkness."],
  ["p-lowlight-04", "light", 3, "L", "A row of five lamps of different shapes, each softly lit."],
  ["p-lowlight-05", "light", 4, "P", "The shadow of a lamp shade cast across a hallway wall."],
  ["p-lowlight-06", "light", 5, "P", "A small table lamp photographed on a dark ground."],

  // Field Notes on Clay — clay
  [
    "p-field-notes-on-clay-hero",
    "clay",
    3,
    "L",
    "Two handmade ceramic vessels, one unglazed and one glazed, on a wooden surface.",
    "50% 55%",
  ],
  [
    "p-field-notes-on-clay-01",
    "clay",
    1,
    "L",
    "A shelf holding a row of ceramic vessels in earthy glazes.",
  ],
  [
    "p-field-notes-on-clay-02",
    "clay",
    2,
    "S",
    "Close-up of a speckled ash glaze over dark iron clay.",
  ],
  [
    "p-field-notes-on-clay-03",
    "clay",
    6,
    "W",
    "A pair of vessels against a pale wall in morning light.",
  ],
  ["p-field-notes-on-clay-04", "clay", 4, "P", "A ceramic bowl seen from directly above."],
  ["p-field-notes-on-clay-05", "clay", 5, "P", "A tall jar standing by a studio window."],
  [
    "p-field-notes-on-clay-06",
    "clay",
    0,
    "T",
    "A single rounded vessel with a stamped base, shown in profile.",
  ],

  // Index of Rooms — concrete
  [
    "p-index-of-rooms-hero",
    "concrete",
    0,
    "L",
    "A concrete corridor in perspective with a shaft of sunlight across the floor.",
    "40% 50%",
  ],
  [
    "p-index-of-rooms-01",
    "concrete",
    8,
    "W",
    "A long corridor with daylight entering from side openings.",
  ],
  ["p-index-of-rooms-02", "concrete", 1, "T", "A stair with a sharp diagonal shadow on the wall."],
  [
    "p-index-of-rooms-03",
    "concrete",
    2,
    "P",
    "A facade made of a regular grid of deep window openings.",
  ],
  ["p-index-of-rooms-04", "concrete", 4, "P", "A tall opening seen from inside a dim room."],
  [
    "p-index-of-rooms-05",
    "concrete",
    3,
    "L",
    "A pencil-weight architectural plan of rooms and walls.",
  ],
  ["p-index-of-rooms-06", "concrete", 5, "S", "Stripes of column shadow across a pale floor."],

  // The Long Table — linen
  [
    "p-the-long-table-hero",
    "linen",
    0,
    "L",
    "A table seen from above with linen, plates and glasses set for dinner.",
    "50% 50%",
  ],
  ["p-the-long-table-01", "linen", 2, "L", "A long table set with many places, seen from above."],
  ["p-the-long-table-02", "linen", 1, "S", "A single plate on a linen tablecloth."],
  ["p-the-long-table-03", "linen", 3, "P", "A glass and a piece of bread on linen before service."],
  ["p-the-long-table-04", "linen", 4, "P", "A printed menu card resting on a linen cloth."],
  ["p-the-long-table-05", "linen", 5, "W", "Folded linen napkins in soft light."],

  // Paper Weather — riso
  [
    "p-paper-weather-hero",
    "riso",
    0,
    "L",
    "A risograph print of overlapping circles in vermilion, blue and yellow.",
    "50% 50%",
  ],
  [
    "p-paper-weather-01",
    "riso",
    3,
    "T",
    "A risograph poster with bands of vermilion representing rainfall.",
  ],
  ["p-paper-weather-02", "riso", 4, "L", "Three prints hung side by side on a white wall."],
  ["p-paper-weather-03", "riso", 2, "S", "Halftone dots of yellow over blue."],
  ["p-paper-weather-04", "riso", 1, "P", "An exhibition poster with horizontal colour bands."],
  ["p-paper-weather-05", "riso", 5, "P", "Misregistered shapes printed slightly out of alignment."],

  // Journal
  ["j-on-restraint", "paper", 8, "L", "Blank folded sheets of paper in soft side light."],
  [
    "j-on-restraint-break",
    "stone",
    9,
    "W",
    "A small stone form on a plinth, seen from across an empty room.",
  ],
  ["j-a-week-at-the-kiln", "clay", 7, "L", "A group of unglazed vessels waiting to be fired."],
  ["j-a-week-at-the-kiln-break", "clay", 8, "W", "A row of glaze test tiles in earthy colours."],
  ["j-captions-are-design", "paper", 9, "L", "A page of small captions set beneath an image."],
  [
    "j-working-in-the-dark",
    "light",
    8,
    "L",
    "A lamp on the floor of a dark studio lighting a wall.",
  ],
  [
    "j-working-in-the-dark-break",
    "light",
    9,
    "W",
    "A warm horizontal glow along the base of a wall.",
  ],
  ["j-why-we-index", "concrete", 9, "L", "Rows of shelving in a quiet archive room."],
  ["j-a-studio-in-january", "studio", 4, "L", "A pinboard of sheets and swatches in winter light."],

  // Studio / Archive
  ["a-01", "sketch", 0, "S", "Pencil construction lines and circles for a letterform."],
  ["a-02", "sketch", 3, "P", "A sketch of vessel profiles drawn side by side."],
  ["a-03", "clay", 9, "S", "A tray of small glaze test tiles."],
  ["a-04", "sketch", 1, "L", "A gridded floor plan sketched in pencil."],
  ["a-05", "riso", 7, "P", "A risograph proof with misprinted edges."],
  [
    "a-06",
    "studio",
    5,
    "L",
    "Behind the scenes: a lamp set up on a studio floor with paper reflectors.",
  ],
  ["a-07", "sketch", 2, "S", "Studies of curved strokes for a stencil alphabet."],
  ["a-08", "water", 7, "S", "Tile samples in three greens laid out on a table."],
  ["a-09", "sketch", 4, "L", "A perspective sketch of a room with one window."],
  ["a-10", "paper", 10, "P", "Paper stock samples fanned out."],
  ["a-11", "sketch", 5, "P", "A page of handwritten notes with arrows and boxes."],
  ["a-12", "stone", 10, "S", "A small stone sample next to a pencil for scale."],
];

export const media: Record<string, MediaAsset> = Object.fromEntries(
  rows.map(([id, recipe, variant, size, alt, focal], index) => {
    const [width, height] = SIZES[size];
    return [
      id,
      {
        id,
        src: `/media/${id}.webp`,
        width,
        height,
        alt,
        focal,
        recipe,
        variant,
        seed: 1009 + index * 7919,
      } satisfies MediaAsset,
    ];
  }),
);
