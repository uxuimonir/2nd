import { z } from "zod";
import { ApiError, route } from "@/server/api";
import { getTimeline } from "@/services/content";

const year = z.coerce.number().int().min(-5000).max(2100).optional();

export const GET = route(
  z.object({ from: year, to: year, type: z.enum(["ancient", "sultanate", "mughal", "colonial", "nation", "contemporary"]).optional() }),
  async ({ from, to, type }) => {
    if (from != null && to != null && from > to) throw new ApiError(400, "`from` must be earlier than or equal to `to`");
    return (await getTimeline()).filter((t) => (from == null || t.year >= from) && (to == null || t.year <= to) && (!type || t.type === type));
  },
);
