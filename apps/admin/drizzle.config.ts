import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "postgresql",
  out: "./src/migrations",
  schema: "./src/auth-schema.ts",
  casing: "snake_case",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
