import { Hono } from "hono"
import type { AppEnv } from "../types/app-env.js"
import { rateLimiter } from "../middleware/rate-limiter.js"

export const healthcheckHandler = new Hono<AppEnv>()
  .basePath("/healthcheck")
  .get("/", rateLimiter({ limit: 10 }), (c) => {
    return c.json(
      {
        status: 200,
        message: "ok",
      },
      200
    )
  })
