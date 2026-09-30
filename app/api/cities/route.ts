import { z } from "zod";
import { limitSchema, one, route, slugSchema, take } from "@/server/api";
import { getCities } from "@/services/content";

const DIVISIONS = ["dhaka", "chattogram", "khulna", "rajshahi", "rangpur", "sylhet", "barishal", "mymensingh"] as const;

export const GET = route(z.object({ slug: slugSchema.optional(), region: z.enum(DIVISIONS).optional(), limit: limitSchema }), async ({ slug, region, limit }) => {
  const cities = (await getCities()).filter((c) => !region || c.region === region);
  return slug ? one(cities, slug, "City") : take(cities, limit);
});
