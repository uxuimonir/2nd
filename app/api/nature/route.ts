import { z } from "zod";
import { limitSchema, one, route, slugSchema, take } from "@/server/api";
import { getNature } from "@/services/content";

const DIVISIONS = ["dhaka", "chattogram", "khulna", "rajshahi", "rangpur", "sylhet", "barishal", "mymensingh"] as const;

export const GET = route(
  z.object({
    slug: slugSchema.optional(),
    region: z.enum(DIVISIONS).optional(),
    ecosystem: z.enum(["mangrove", "coast", "island", "swamp-forest", "hills", "tea", "wetland", "river"]).optional(),
    limit: limitSchema,
  }),
  async ({ slug, region, ecosystem, limit }) => {
    const items = (await getNature()).filter((n) => (!region || n.region === region) && (!ecosystem || n.ecosystem === ecosystem));
    return slug ? one(items, slug, "Nature spot") : take(items, limit);
  },
);
