import type { AppEnv } from "../types/app-env.js"
import { createMiddleware } from "hono/factory"
import { auth } from "@workspace/auth/server"

export const authSession = createMiddleware<AppEnv>(async (c, next) => {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })

    c.set("user", session?.user ?? null)
    c.set("session", session?.session ?? null)
  } catch (err) {
    c.var.logger.warn({
      msg: "Failed to resolve auth session",
      requestId: c.get("requestId"),
      err,
    })

    c.set("user", null)
    c.set("session", null)
  }

  await next()
})
