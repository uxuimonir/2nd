import { z } from "zod";
import { one, route, slugSchema } from "@/server/api";
import { getRegions } from "@/services/content";

export const GET = route(z.object({ slug: slugSchema.optional() }), async ({ slug }) => one(await getRegions(), slug, "Region"));
