import { z } from "zod";
import { one, route, slugSchema } from "@/server/api";
import { getRivers } from "@/services/content";

export const GET = route(z.object({ slug: slugSchema.optional() }), async ({ slug }) => one(await getRivers(), slug, "River"));
