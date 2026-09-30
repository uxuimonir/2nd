import type { Region } from "@/types/content";

/** The eight administrative divisions of Bangladesh. */
export const regions: Region[] = [
  {
    slug: "dhaka",
    name: "Dhaka",
    nameBn: "ঢাকা",
    capital: "dhaka",
    summary: "The central floodplain between the Padma, Jamuna and Meghna, home to the capital.",
    description: [
      "Dhaka Division sits at the heart of the delta, ringed by the country's three great rivers. The capital grew on the banks of the Buriganga, and the division reaches out to Sonargaon, Narayanganj's Jamdani villages and the red-soil Madhupur tract.",
    ],
    character: ["Capital region", "Buriganga & Sitalakhya", "Jamdani weaving", "Mughal & colonial Dhaka"],
    media: ["hatirjheel-night", "panam-city"],
  },
  {
    slug: "chattogram",
    name: "Chattogram",
    nameBn: "চট্টগ্রাম",
    capital: "chattogram",
    summary: "Hills, the port city and the long south-eastern coastline down to Teknaf.",
    description: [
      "Chattogram Division holds most of the country's hill country — the Chittagong Hill Tracts of Rangamati, Khagrachhari and Bandarban — along with the port on the Karnaphuli, the beach at Cox's Bazar and Saint Martin's Island.",
    ],
    character: ["Hill Tracts", "Karnaphuli port", "Cox's Bazar coastline", "Indigenous communities"],
    media: ["sajek", "karnaphuli-night"],
  },
  {
    slug: "khulna",
    name: "Khulna",
    nameBn: "খুলনা",
    capital: "khulna",
    summary: "The south-western delta: tidal rivers, shrimp ponds and the Sundarbans.",
    description: [
      "Khulna Division is where the active delta meets the sea. Tidal rivers such as the Rupsha and Pasur thread through it, the Mosque City of Bagerhat rises from its fields, and the Sundarbans cover its southern edge.",
    ],
    character: ["Sundarbans", "Mosque City of Bagerhat", "Tidal rivers", "Shrimp farming"],
    media: ["sundarbans-largest", "sixty-dome"],
  },
  {
    slug: "rajshahi",
    name: "Rajshahi",
    nameBn: "রাজশাহী",
    capital: "rajshahi",
    summary: "The north-western plains along the Padma — mangoes, silk and ancient Buddhist sites.",
    description: [
      "Rajshahi Division stretches along the Padma as it enters Bangladesh. The higher Barind tract, the ruins of Paharpur and Mahasthangarh, and the mango orchards of Chapai Nawabganj give the region its long memory.",
    ],
    character: ["Padma riverfront", "Barind tract", "Paharpur & Mahasthangarh", "Mango orchards"],
    media: ["rajshahi-padma", "paharpur-aerial"],
  },
  {
    slug: "rangpur",
    name: "Rangpur",
    nameBn: "রংপুর",
    capital: "rangpur",
    summary: "The northern plains watered by the Teesta, reaching toward the Himalayan foothills.",
    description: [
      "Rangpur Division is the country's northern tip, shaped by the Teesta and the upper Brahmaputra. It holds the terracotta Kantajew Temple of Dinajpur and the palace of Tajhat.",
    ],
    character: ["Teesta floodplain", "Kantajew Temple", "Northern plains"],
    media: ["tajhat", "teesta-barrage"],
    established: "2010",
  },
  {
    slug: "sylhet",
    name: "Sylhet",
    nameBn: "সিলেট",
    capital: "sylhet",
    summary: "Tea hills, haor wetlands and the Surma valley in the north-east.",
    description: [
      "Sylhet Division is a landscape of contrasts: rolling tea estates around Srimangal, the seasonal inland seas of the haors, the flooded forest of Ratargul and the clear rivers that descend from the Meghalaya hills at Jaflong.",
    ],
    character: ["Tea gardens", "Haor wetlands", "Surma valley", "Swamp forest"],
    media: ["tea-srimangal", "ratargul"],
  },
  {
    slug: "barishal",
    name: "Barishal",
    nameBn: "বরিশাল",
    capital: "barishal",
    summary: "The river country of the lower delta, where life moves by launch and boat.",
    description: [
      "Barishal Division is laced with rivers and canals. Multi-deck launches connect it to Dhaka, and the islands of Bhola sit in the mouth of the Meghna.",
    ],
    character: ["Launch routes", "Lower Meghna", "Islands & chars", "Canals"],
    media: ["barishal-launch", "kirtankhola"],
  },
  {
    slug: "mymensingh",
    name: "Mymensingh",
    nameBn: "ময়মনসিংহ",
    capital: "mymensingh",
    summary: "The Old Brahmaputra valley, folk ballads and the border hills of Garo country.",
    description: [
      "Mymensingh Division follows the Old Brahmaputra. The region is known for its folk ballads, its agricultural university and the Garo hills along its northern border.",
    ],
    character: ["Old Brahmaputra", "Folk ballads", "Garo hills"],
    media: ["shashi-lodge", "paddy"],
    established: "2015",
  },
];
