import { openAPI } from "better-auth/plugins"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import db from "../db/conn.js"
import * as authSchema from "../db/schemas/auth-schema.js"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema: authSchema,
  }),

  emailAndPassword: {
    enabled: true,
  },

  plugins: [openAPI()],
})
