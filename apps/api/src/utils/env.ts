import { z } from "zod"

const envSchema = z.object({
  // App
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().min(1).max(65535).default(3001),
  BETTER_AUTH_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string(),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid connection string"),

  // pgAdmin (optional — only needed in local/dev)
  PGADMIN_DEFAULT_EMAIL: z.string().email().optional(),
  PGADMIN_DEFAULT_PASSWORD: z.string().min(8).optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error("Invalid environment variables:")
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
export type Env = typeof env
