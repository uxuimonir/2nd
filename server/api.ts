import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { z, type ZodType } from "zod";
import { contentSource } from "@/services/content";

export const slugSchema = z.string().regex(/^[a-z0-9-]{1,64}$/, "Invalid slug");
export const limitSchema = z.coerce.number().int().min(1).max(100).optional();

const CACHE = "public, s-maxage=3600, stale-while-revalidate=86400";

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

function errorResponse(status: number, message: string, details?: unknown) {
  return NextResponse.json({ error: { status, message, ...(details ? { details } : {}) } }, { status });
}

/**
 * Wraps a GET handler with query validation, consistent envelopes and error handling.
 * Response shape: { data, meta: { count, source } } or { error: { status, message, details? } }.
 */
export function route<S extends ZodType>(schema: S, handler: (query: z.infer<S>, req: NextRequest) => Promise<unknown>) {
  return async function GET(req: NextRequest) {
    try {
      const raw = Object.fromEntries(req.nextUrl.searchParams.entries());
      const parsed = schema.safeParse(raw);
      if (!parsed.success) {
        return errorResponse(400, "Invalid query parameters", z.flattenError(parsed.error).fieldErrors);
      }
      const data = await handler(parsed.data, req);
      const count = Array.isArray(data) ? data.length : 1;
      return NextResponse.json({ data, meta: { count, source: contentSource() } }, { headers: { "Cache-Control": CACHE } });
    } catch (err) {
      if (err instanceof ApiError) return errorResponse(err.status, err.message, err.details);
      console.error("[api]", err);
      return errorResponse(500, "The journey was interrupted. Please try again.");
    }
  };
}

export function one<T>(items: T[], slug: string | undefined, label: string): T | T[] {
  if (!slug) return items;
  const found = items.find((i) => (i as { slug: string }).slug === slug);
  if (!found) throw new ApiError(404, `${label} "${slug}" not found`);
  return found;
}

export const take = <T>(items: T[], limit?: number) => (limit ? items.slice(0, limit) : items);
