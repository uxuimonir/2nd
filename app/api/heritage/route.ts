import { z } from "zod";
import { limitSchema, one, route, slugSchema, take } from "@/server/api";
import { getHeritage } from "@/services/content";

const DIVISIONS = ["dhaka", "chattogram", "khulna", "rajshahi", "rangpur", "sylhet", "barishal", "mymensingh"] as const;

export const GET = route(z.object({ slug: slugSchema.optional(), region: z.enum(DIVISIONS).optional(), limit: limitSchema }), async ({ slug, region, limit }) => {
  const items = (await getHeritage()).filter((h) => !region || h.region === region);
  return slug ? one(items, slug, "Heritage site") : take(items, limit);
});
