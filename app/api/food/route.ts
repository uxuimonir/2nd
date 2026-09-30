import { z } from "zod";
import { limitSchema, one, route, slugSchema, take } from "@/server/api";
import { getFood } from "@/services/content";

const DIVISIONS = ["dhaka", "chattogram", "khulna", "rajshahi", "rangpur", "sylhet", "barishal", "mymensingh"] as const;

export const GET = route(
  z.object({
    slug: slugSchema.optional(),
    region: z.enum(DIVISIONS).optional(),
    category: z.enum(["fish", "rice", "street", "sweet", "everyday", "festive"]).optional(),
    limit: limitSchema,
  }),
  async ({ slug, region, category, limit }) => {
    const items = (await getFood()).filter((f) => (!region || f.region === region) && (!category || f.category === category));
    return slug ? one(items, slug, "Food") : take(items, limit);
  },
);
