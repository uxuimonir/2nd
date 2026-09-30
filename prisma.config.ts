import "dotenv/config";
import { defineConfig } from "prisma/config";

// DATABASE_URL is optional: without it `prisma generate` still works and the site
// serves the typed content in /content. Migrations and seeding require it.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" },
  datasource: { url: process.env.DATABASE_URL ?? "postgresql://localhost:5432/unset" },
});
