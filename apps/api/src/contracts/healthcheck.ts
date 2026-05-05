import { z } from "@hono/zod-openapi"

export const HealthCheckResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  code: z.string(),
})
