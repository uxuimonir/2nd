import type { Fact } from "@/types/content";

/** Figures used in the journey. Each carries its source; update here and it updates everywhere. */
export const countryFacts: Fact[] = [
  { label: "Area", value: "147,570 km²", source: "Bangladesh Bureau of Statistics" },
  { label: "Population", value: "≈ 170 million", source: "Population & Housing Census 2022 (BBS, adjusted)" },
  { label: "Rivers listed", value: "1,008", source: "National River Conservation Commission (2023 list)" },
  { label: "Divisions", value: "8", source: "Government of Bangladesh" },
];

export const deltaFacts: Fact[] = [
  { label: "Great rivers meeting", value: "3", source: "Ganges (Padma) · Brahmaputra (Jamuna) · Meghna" },
  { label: "Sundarbans (total, BD + India)", value: "≈ 10,000 km²", source: "UNESCO World Heritage Centre" },
  { label: "Land that is floodplain", value: "≈ 80%", source: "Commonly cited estimate — editorial" },
];

export const modernFacts: Fact[] = [
  { label: "Padma Bridge", value: "6.15 km", source: "Opened 25 June 2022" },
  { label: "Dhaka Metro, MRT Line 6", value: "Uttara → Motijheel", source: "First section opened 28 December 2022" },
  { label: "Karnaphuli road tunnel", value: "Chattogram", source: "Opened October 2023" },
  { label: "Ready-made garments", value: "Among the world's largest exporters", source: "WTO trade statistics — editorial summary" },
];

export const futureFacts: Fact[] = [
  { label: "Bangladesh Delta Plan 2100", value: "Adopted 2018", source: "Planning Commission, GoB" },
  { label: "Cyclone Preparedness Programme", value: "Since 1972", source: "Bangladesh Red Crescent / GoB" },
  { label: "Floating gardens", value: "FAO GIAHS (2015)", source: "FAO Globally Important Agricultural Heritage Systems" },
];
