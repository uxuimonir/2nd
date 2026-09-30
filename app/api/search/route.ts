import { z } from "zod";
import { route } from "@/server/api";
import { buildPlaces, searchPlaces } from "@/lib/places";
import { getJourney } from "@/services/content";
import type { PlaceKind } from "@/types/content";

const KINDS = ["city", "heritage", "nature", "destination", "food", "culture", "story"] as const;

export const GET = route(
  z.object({
    q: z.string().trim().min(1, "Query is required").max(80),
    kind: z
      .string()
      .optional()
      .transform((v) => (v ? v.split(",").filter(Boolean) : undefined))
      .pipe(z.array(z.enum(KINDS)).optional()),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
  async ({ q, kind, limit }) => {
    const j = await getJourney();
    return searchPlaces(buildPlaces(j), j.rivers, q, { kinds: kind as PlaceKind[] | undefined, limit });
  },
);
