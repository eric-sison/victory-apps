import "dotenv/config"
import type { AppEnv } from "./types/app-env.js"
import { serve } from "@hono/node-server"
import { auth } from "./utils/auth.js"
import { env } from "./utils/env.js"
import { cors } from "./middleware/cors.js"
import { logger } from "./middleware/logger.js"
import { requestId } from "hono/request-id"
import { secureHeaders } from "hono/secure-headers"
import { healthcheckHandler } from "./routes/healthcheck.js"
import { authHandler } from "./routes/v1/auth.js"
import { errorHandler } from "./middleware/error-handler.js"
import { OpenAPIHono } from "@hono/zod-openapi"
import { Scalar } from "@scalar/hono-api-reference"

const app = new OpenAPIHono<AppEnv>().basePath("/api")

// Middleware
app.use(secureHeaders())
app.use(cors())
app.use(requestId())
app.use(logger())

app.onError(errorHandler)

app.on(["POST", "GET"], "/auth/*", (c) => {
  return auth.handler(c.req.raw)
})

const routes = [healthcheckHandler, authHandler] as const
routes.forEach((route) => app.route("/", route))

app.doc("/docs/spec", {
  openapi: "3.0.0",
  info: {
    title: "Victory API",
    version: "1.0.0",
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}/api`,
      description: "Local",
    },
  ],
})

app.get(
  "/docs",
  Scalar({
    url: "/api/docs/spec",
    pageTitle: "Victory API",
  })
)

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  }
)
