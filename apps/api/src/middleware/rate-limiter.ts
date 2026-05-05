import { rateLimiter as honoRateLimiter } from "hono-rate-limiter"
import type { AppEnv } from "../types/app-env.js"
import { ErrorMessages } from "../utils/openapi.js"

type RateLimiterOptions = {
  windowMs?: number
  limit?: number
}

export const rateLimiter = ({
  // 15 mins
  windowMs = 15 * 60 * 1000,
  limit = 5,
}: RateLimiterOptions = {}) => {
  return honoRateLimiter<AppEnv>({
    windowMs,
    limit,
    keyGenerator: (c) => c.req.header("X-Forwarded-For") ?? c.req.header("X-Real-IP") ?? "",
    handler: (c) => {
      c.var.logger.warn({
        msg: "Rate limit exceeded",
        ip: c.req.header("X-Forwarded-For") ?? c.req.header("X-Real-IP"),
        path: c.req.path,
        method: c.req.method,
      })

      return c.json(
        {
          status: 429,
          message: ErrorMessages[429],
        },
        429
      )
    },
  })
}
