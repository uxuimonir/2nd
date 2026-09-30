import type { AmbientId } from "@/types/content";

export interface Chapter {
  id: string;
  title: string;
  titleBn: string;
  kicker: string;
  /** standalone route for this chapter */
  href: string;
  /** chapter atmosphere */
  tone: "night" | "earth" | "water" | "sand" | "green" | "ink" | "clay";
  ambient: AmbientId;
}

/** The journey. Order is the narrative: land → water → people → time → place → future → return. */
export const chapters: Chapter[] = [
  { id: "enter", title: "Enter Bangladesh", titleBn: "প্রবেশ", kicker: "A light in the dark", href: "/", tone: "night", ambient: "river" },
  { id: "land", title: "The Land", titleBn: "ভূমি", kicker: "From map to terrain", href: "/land", tone: "earth", ambient: "forest" },
  { id: "rivers", title: "The Rivers", titleBn: "নদী", kicker: "Follow the river", href: "/rivers", tone: "water", ambient: "river" },
  { id: "delta", title: "The Delta", titleBn: "ব-দ্বীপ", kicker: "Shaped by water", href: "/rivers#delta", tone: "water", ambient: "rain" },
  { id: "regions", title: "The Regions", titleBn: "বিভাগ", kicker: "Eight divisions", href: "/map", tone: "sand", ambient: "market" },
  { id: "cities", title: "The Cities", titleBn: "নগর", kicker: "Cities from coordinates", href: "/cities", tone: "ink", ambient: "city" },
  { id: "people", title: "The People", titleBn: "মানুষ", kicker: "Life, work, ambition", href: "/explore#people", tone: "clay", ambient: "market" },
  { id: "history", title: "The History", titleBn: "ইতিহাস", kicker: "Drag through time", href: "/history", tone: "earth", ambient: "rain" },
  { id: "heritage", title: "The Heritage", titleBn: "ঐতিহ্য", kicker: "Brick, stone, terracotta", href: "/heritage", tone: "clay", ambient: "forest" },
  { id: "culture", title: "The Culture", titleBn: "সংস্কৃতি", kicker: "Language, song, craft", href: "/culture", tone: "ink", ambient: "market" },
  { id: "food", title: "The Food", titleBn: "খাবার", kicker: "A map you can taste", href: "/food", tone: "sand", ambient: "market" },
  { id: "nature", title: "The Nature", titleBn: "প্রকৃতি", kicker: "Hills, haors, coast", href: "/nature", tone: "green", ambient: "forest" },
  { id: "sundarbans", title: "The Sundarbans", titleBn: "সুন্দরবন", kicker: "Where the forest breathes with the tide", href: "/sundarbans", tone: "night", ambient: "forest" },
  { id: "modern", title: "Modern Bangladesh", titleBn: "আধুনিক বাংলাদেশ", kicker: "Bridges, rails, cities", href: "/modern-bangladesh", tone: "ink", ambient: "city" },
  { id: "future", title: "The Future", titleBn: "ভবিষ্যৎ", kicker: "A delta that adapts", href: "/future", tone: "water", ambient: "sea" },
  { id: "final", title: "Final Journey", titleBn: "সমাপ্তি", kicker: "Everything becomes Bangladesh", href: "/#final", tone: "night", ambient: "river" },
];

export const chapterIndex = (id: string) => chapters.findIndex((c) => c.id === id);
