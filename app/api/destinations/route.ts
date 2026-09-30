import { z } from "zod";
import { limitSchema, one, route, slugSchema, take } from "@/server/api";
import { getDestinations } from "@/services/content";

export const GET = route(
  z.object({ slug: slugSchema.optional(), category: z.enum(["infrastructure", "memorial", "landmark", "urban"]).optional(), limit: limitSchema }),
  async ({ slug, category, limit }) => {
    const items = (await getDestinations()).filter((d) => !category || d.category === category);
    return slug ? one(items, slug, "Destination") : take(items, limit);
  },
);
