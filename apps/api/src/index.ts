import "dotenv/config"
import type { AppEnv } from "./types/app-env.js"
import { Hono } from "hono"
import { serve } from "@hono/node-server"
import { auth } from "./utils/auth.js"
import { env } from "./utils/env.js"
import { healthcheckHandler } from "./routes/healthcheck.js"
import { requestId } from "hono/request-id"
import { structuredLogger } from "@hono/structured-logger"
import pino from "pino"

const rootLogger = pino({
  ...(env.NODE_ENV === "development" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        levelFirst: true,
        translateTime: "SYS:HH:MM:ss",
        ignore: "pid,hostname",
        messageFormat: "{msg} {requestId}",
      },
    },
  }),
})

const app = new Hono<AppEnv>().basePath("/api")

// Middleware
app.use(requestId())
app.use(
  structuredLogger({
    createLogger: (c) => rootLogger.child({ requestId: c.var.requestId }),
  })
)

app.on(["POST", "GET"], "/auth/*", (c) => {
  return auth.handler(c.req.raw)
})

const routes = [healthcheckHandler] as const
routes.forEach((route) => app.route("/", route))

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  }
)
