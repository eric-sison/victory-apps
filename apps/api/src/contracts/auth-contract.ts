import { z } from "@hono/zod-openapi"

export const SignInSchema = z
  .object({
    email: z.email(),
    password: z.string(),
    callbackURL: z.url().optional(),
    rememberMe: z.coerce.boolean().optional(),
  })
  .openapi("SignInSchema")

export const SignInResponseSchema = z
  .object({
    token: z.string(),
    redirect: z.boolean(),
    url: z.string().optional(),
    user: z.object({
      id: z.string(),
      email: z.email(),
      name: z.string(),
      image: z.string().nullable().optional(),
      emailVerified: z.boolean(),
      createdAt: z.iso.datetime(),
      updatedAt: z.iso.datetime(),
    }),
  })
  .openapi("SignInResponse")
