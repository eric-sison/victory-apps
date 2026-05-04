import { env } from "../utils/env.js"
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
        messageFormat: "{msg}",
      },
    },
  }),
})

export const logger = () => {
  return structuredLogger({
    createLogger: (c) => rootLogger.child({ requestId: c.var.requestId }),
  })
}
