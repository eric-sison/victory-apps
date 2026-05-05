import * as authSchema from "../auth-schema.js"
import { admin, openAPI } from "better-auth/plugins"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import db from "../db-conn.js"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [process.env.CLIENT_URL_DEV!, process.env.CLIENT_URL_PROD!],
  plugins: [openAPI(), admin()],
})
