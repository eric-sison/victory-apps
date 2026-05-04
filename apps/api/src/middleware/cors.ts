import { cors as honoCors } from "hono/cors"
import { env } from "../utils/env.js"

export const cors = () =>
  honoCors({
    origin: (origin) => {
      if (!origin) return null // block non-browser / server-side requests with no origin
      return env.ALLOWED_ORIGINS.includes(origin) ? origin : null
    },
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    exposeHeaders: ["X-Request-Id"],
    maxAge: 600, // cache preflight for 10 min
    credentials: true,
  })
