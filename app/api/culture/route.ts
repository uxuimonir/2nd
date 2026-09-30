import { z } from "zod";
import { limitSchema, one, route, slugSchema, take } from "@/server/api";
import { getCulture } from "@/services/content";

export const GET = route(
  z.object({
    slug: slugSchema.optional(),
    category: z.enum(["language", "music", "craft", "festival", "literature", "performance", "art"]).optional(),
    limit: limitSchema,
  }),
  async ({ slug, category, limit }) => {
    const items = (await getCulture()).filter((c) => !category || c.category === category);
    return slug ? one(items, slug, "Culture item") : take(items, limit);
  },
);
