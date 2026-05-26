import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { AppEnv } from "../../utils/app-env.js";
import { commonErrors, jsonResponse } from "../../utils/openapi.js";

export const HealthCheckResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  code: z.string(),
});

const healthCheckRoute = createRoute({
  method: "get",
  path: "/healthcheck",
  tags: ["Health Check"],
  description:
    "Returns the API status to confirm the service is up and reachable.",
  request: {},
  responses: {
    200: jsonResponse(
      HealthCheckResponseSchema,
      "Service is healthy and running.",
      {
        status: 200,
        message: "Service is healthy and running.",
        code: "OK",
      },
    ),
    429: commonErrors[429],
    500: commonErrors[500],
  },
});

export const healthcheckHandler = new OpenAPIHono<AppEnv>().openapi(
  healthCheckRoute,
  (c) => {
    return c.json({
      status: 200,
      message: "Service is healthy and running.",
      code: "OK",
    });
  },
);
