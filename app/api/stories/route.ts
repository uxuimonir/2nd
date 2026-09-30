import { z } from "zod";
import { route } from "@/server/api";
import { getPeople, getStories } from "@/services/content";

export const GET = route(z.object({ chapter: z.string().max(32).optional(), type: z.enum(["story", "people", "all"]).default("all") }), async ({ chapter, type }) => {
  const [stories, people] = await Promise.all([getStories(), getPeople()]);
  const s = stories.filter((x) => !chapter || x.chapter === chapter);
  if (type === "story") return s;
  if (type === "people") return people;
  return { stories: s, people };
});
