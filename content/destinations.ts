import type { Destination } from "@/types/content";

/** Modern landmarks and infrastructure that belong on the map. */
export const destinations: Destination[] = [
  {
    slug: "padma-bridge",
    name: "Padma Bridge",
    nameBn: "পদ্মা সেতু",
    region: "dhaka",
    coordinates: [90.26, 23.45],
    layer: "future",
    category: "infrastructure",
    opened: "25 June 2022",
    summary: "A 6.15 km road-and-rail bridge across one of the world's most powerful rivers.",
    description: [
      "The Padma is wide, deep and constantly shifting — for decades the crossing between Mawa and Janjira meant ferries and long waits. The two-level bridge now carries a four-lane road above and a railway below.",
      "It connects the south-west, including Khulna and Barishal divisions, directly to Dhaka.",
    ],
    media: ["padma-bridge", "padma-bridge-night"],
  },
  {
    slug: "dhaka-metro-rail",
    name: "Dhaka Metro Rail",
    nameBn: "ঢাকা মেট্রো রেল",
    region: "dhaka",
    coordinates: [90.378, 23.78],
    layer: "future",
    category: "urban",
    opened: "28 December 2022 (first section)",
    summary: "MRT Line 6 — the capital's first elevated metro, from Uttara to Motijheel.",
    description: [
      "The first section of MRT Line 6 opened between Uttara North and Agargaon in December 2022 and was extended to Motijheel in 2023. More lines are planned to form a network across the city.",
    ],
    media: ["metro-uttara", "metro-motijheel"],
  },
  {
    slug: "jamuna-bridge",
    name: "Jamuna Bridge",
    nameBn: "যমুনা সেতু",
    region: "rajshahi",
    coordinates: [89.78, 24.4],
    layer: "future",
    category: "infrastructure",
    opened: "1998",
    summary: "The multipurpose bridge that first tied the east and west of the country together.",
    description: [
      "Opened in 1998 across the braided Jamuna near Sirajganj, the bridge carries road, rail, a gas pipeline and power lines between the eastern and western halves of the country.",
    ],
    media: ["jamuna-bridge", "jamuna-from-bridge"],
  },
  {
    slug: "hatirjheel",
    name: "Hatirjheel",
    nameBn: "হাতিরঝিল",
    region: "dhaka",
    coordinates: [90.415, 23.765],
    layer: "future",
    category: "urban",
    summary: "A lake and ring of roads and bridges that became the capital's evening promenade.",
    description: [
      "Hatirjheel's waterfront, bridges and walkways turned a neglected wetland into public space, and its lights have become an image of the new Dhaka.",
    ],
    media: ["hatirjheel-night"],
  },
  {
    slug: "sadarghat",
    name: "Sadarghat",
    nameBn: "সদরঘাট",
    region: "dhaka",
    coordinates: [90.41, 23.705],
    layer: "rivers",
    category: "landmark",
    summary: "The river terminal of Old Dhaka, where launches leave for the southern delta.",
    description: [
      "Every evening, multi-deck launches pull away from Sadarghat on the Buriganga, bound for Barishal, Bhola, Chandpur and beyond — journeys that still connect much of the south by water.",
    ],
    media: ["boats", "barishal-launch"],
  },
];
