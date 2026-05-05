import "dotenv/config"
import type { AppEnv } from "./types/app-env.js"
import { OpenAPIHono } from "@hono/zod-openapi"
import { Scalar } from "@scalar/hono-api-reference"
import { auth } from "./utils/auth.js"
import { cors } from "./middleware/cors.js"
import { logger } from "./middleware/logger.js"
import { requestId } from "hono/request-id"
import { secureHeaders } from "hono/secure-headers"
import { healthcheckHandler } from "./routes/healthcheck.js"
import { errorHandler } from "./middleware/error-handler.js"
import { authSession } from "./middleware/auth-session.js"
import { rateLimiter } from "./middleware/rate-limiter.js"

export const app = new OpenAPIHono<AppEnv>().basePath("/api")

app.use(secureHeaders())
app.use(cors())
app.use(requestId())
app.use(logger())
app.use(authSession)

// Rate limit specific auth routes before the catch-all
app.use("/auth/sign-in", rateLimiter({ windowMs: 60 * 1000, limit: 5 }))
app.use("/auth/sign-up", rateLimiter({ windowMs: 60 * 1000, limit: 5 }))
app.use("/auth/forget-password", rateLimiter({ windowMs: 60 * 1000, limit: 3 }))

app.on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw))

const routes = [healthcheckHandler] as const
routes.forEach((route) => app.route("/", route))

app.doc("/docs/spec", {
  openapi: "3.0.0",
  info: {
    title: "Victory API",
    description: "This API provides access to application resources and operations.",
    version: "1.0.0",
  },
})

app.get(
  "/docs",
  Scalar({
    url: "/api/docs/spec",
    pageTitle: "Victory API",
    servers: [
      {
        url: "http://localhost:3001/api",
        description: "Local development server",
      },
    ],
  })
)

// Handle errors thrown globally
app.onError(errorHandler)
