import type { AppEnv } from "../types/app-env.js"
import { createMiddleware } from "hono/factory"
import { HTTPException } from "hono/http-exception"
import { ErrorMessages } from "../utils/openapi.js"

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const user = c.var.user
  const session = c.var.session

  if (!user || !session) {
    throw new HTTPException(401, { message: "Unauthorized" })
  }

  if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
    c.var.logger.warn({
      msg: "Expired session",
      requestId: c.get("requestId"),
      userId: user.id,
    })

    throw new HTTPException(401, { message: ErrorMessages[401] })
  }

  if (!user.emailVerified) {
    throw new HTTPException(403, { message: ErrorMessages[403] })
  }

  c.var.logger.info({
    msg: "Authenticated request",
    requestId: c.get("requestId"),
    userId: user.id,
  })

  await next()
})
