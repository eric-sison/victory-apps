import type { AppEnv } from "../types/app-env.js"
import { createRoute, OpenAPIHono } from "@hono/zod-openapi"
import { commonErrors, jsonResponse } from "../utils/openapi.js"
import { HealthCheckResponseSchema } from "../contracts/healthcheck.js"
import { requireAuth } from "../middleware/require-auth.js"

const healthCheckRoute = createRoute({
  method: "get",
  path: "/healthcheck",
  tags: ["Health Check"],
  description: "Returns the API status to confirm the service is up and reachable.",
  request: {},
  responses: {
    200: jsonResponse(HealthCheckResponseSchema, "Service is healthy and running.", {
      status: 200,
      message: "Service is healthy and running.",
    }),
    429: commonErrors[429],
    500: commonErrors[500],
  },
})

export const healthcheckHandler = new OpenAPIHono<AppEnv>().openapi(healthCheckRoute, (c) => {
  return c.json({
    status: 200,
    message: "Service is healthy and running.",
  })
})
