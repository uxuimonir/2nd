import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Prisma client singleton. Returns null when no DATABASE_URL is configured,
 * in which case services fall back to the typed content in /content.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient | null };

export function getPrisma(): PrismaClient | null {
  if (globalForPrisma.prisma !== undefined) return globalForPrisma.prisma;
  const url = process.env.DATABASE_URL;
  const client = url ? new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) }) : null;
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  else globalForPrisma.prisma = client;
  return client;
}
