// utils/openapi.ts
import { z } from "@hono/zod-openapi"

export const jsonBody = <T extends z.ZodType>(schema: T) => ({
  body: {
    content: { "application/json": { schema } },
    required: true as const,
  },
})

export const jsonResponse = <T extends z.ZodType>(schema: T, description: string) => ({
  content: { "application/json": { schema } },
  description,
})

export const ErrorResponseSchema = z
  .object({
    status: z.number(),
    message: z.string(),
    code: z.string().optional(),
  })
  .openapi("ErrorResponse")

export const commonErrors = {
  400: jsonResponse(ErrorResponseSchema, "Bad request"),
  401: jsonResponse(ErrorResponseSchema, "Unauthorized"),
  403: jsonResponse(ErrorResponseSchema, "Forbidden"),
  404: jsonResponse(ErrorResponseSchema, "Not found"),
  409: jsonResponse(ErrorResponseSchema, "Conflict"),
  422: jsonResponse(ErrorResponseSchema, "Validation error"),
  429: jsonResponse(ErrorResponseSchema, "Too many requests"),
  500: jsonResponse(ErrorResponseSchema, "Internal server error"),
} as const
