import type { AppEnv } from "../types/app-env.js"
import { createMiddleware } from "hono/factory"
import { HTTPException } from "hono/http-exception"

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

    throw new HTTPException(401, { message: "Session expired" })
  }

  if (!user.emailVerified) {
    throw new HTTPException(403, { message: "Email not verified" })
  }

  c.var.logger.info({
    msg: "Authenticated request",
    requestId: c.get("requestId"),
    userId: user.id,
  })

  await next()
})
