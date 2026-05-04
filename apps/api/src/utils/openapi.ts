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
  400: jsonResponse(ErrorResponseSchema, "Bad request. Missing or invalid parameters."),
  401: jsonResponse(ErrorResponseSchema, "Unauthorized. Missing or invalid authentication."),
  403: jsonResponse(ErrorResponseSchema, "Forbidden. Insufficient permissions."),
  404: jsonResponse(ErrorResponseSchema, "Not found. Resource does not exist."),
  409: jsonResponse(ErrorResponseSchema, "Conflict. Resource already exists."),
  422: jsonResponse(ErrorResponseSchema, "Unprocessable. Request body failed validation."),
  429: jsonResponse(ErrorResponseSchema, "Rate limited. Too many requests, try again later."),
  500: jsonResponse(ErrorResponseSchema, "Internal server error. Something went wrong."),
  502: jsonResponse(ErrorResponseSchema, "Bad gateway. Upstream returned an invalid response."),
  503: jsonResponse(ErrorResponseSchema, "Service unavailable. Server is temporarily down."),
  504: jsonResponse(ErrorResponseSchema, "Gateway timeout. Upstream did not respond in time."),
} as const
