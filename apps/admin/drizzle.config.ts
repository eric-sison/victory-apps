import { env } from "#/utils/env"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "postgresql",
  out: "./src/database/migrations",
  schema: "./src/database/schemas/*",
  casing: "snake_case",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
