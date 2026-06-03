import { oauthProvider } from "@better-auth/oauth-provider";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { admin, jwt, openAPI } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { env } from "#/utils/env.js";
import db from "../database/conn.js";
import * as authSchema from "../database/schemas/auth-schema.js";
import { mailer } from "./mailer.js";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  disabledPaths: ["/token"],
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema: authSchema,
  }),

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
    cookieCache: {
      enabled: env.NODE_ENV !== "development",
      maxAge: 5 * 60, // 5 mins
    },
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, token }) => {
      const callbackUrl = `${process.env.RESET_PASSWORD_CALLBACK}?token=${token}`;

      try {
        await mailer.sendMail({
          from: process.env.SMTP_FROM,
          to: user.email,
          subject: "Reset your password",
          html: `
          <p>Hi ${user.name ?? user.email},</p>
          <p>Click the link below to reset your password. This link expires in 1 hour.</p>
          <p><a href="${callbackUrl}">Reset password</a></p>
          <p>If you did not request a password reset, you can safely ignore this email.</p>
        `,
        });
      } catch (err) {
        // SMTP failures are logged server-side but not exposed to the client.
        console.error("[Auth] Failed to send password reset email:", err);
      }
    },
  },

  trustedOrigins:
    process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()) ?? [],

  advanced: {
    cookies: {
      session_token: {
        name: "_ssid._token",
      },
      session_data: {
        name: "_ssid._data",
      },
    },
  },

  plugins: [
    openAPI(),
    admin(),
    jwt(),
    oauthProvider({
      allowDynamicClientRegistration: true,
      storeClientSecret: "hashed",
      loginPage: "/auth/sign-in",
      consentPage: "/auth/consent",
      scopes: ["openid", "email", "offline_access", "profile"],
      silenceWarnings: {
        oauthAuthServerConfig: true,
        openidConfig: true,
      },
    }),
    tanstackStartCookies(),
  ],
});
