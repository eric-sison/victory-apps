import { admin, openAPI } from "better-auth/plugins"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import db from "../db-conn.js"
import * as authSchema from "../auth-schema.js"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema: authSchema,
  }),

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 mins
    },
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },

  trustedOrigins: process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()) ?? [],

  advanced: {
    cookiePrefix: "_ssid",
  },

  plugins: [openAPI(), admin()],
})
