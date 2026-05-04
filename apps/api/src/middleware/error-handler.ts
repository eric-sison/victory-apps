import type { Context } from "hono"
import type { AppEnv } from "../types/app-env.js"
import { HTTPException } from "hono/http-exception"
import { env } from "../utils/env.js"
import { ZodError } from "zod"
import { APIError } from "better-auth/api"
import type { ContentfulStatusCode } from "hono/utils/http-status"

export const errorHandler = (err: Error, c: Context<AppEnv>) => {
  const logger = c.var.logger
  const meta = {
    path: c.req.path,
    method: c.req.method,
    requestId: c.get("requestId"),
  }

  // Zod validation errors (from zValidator)
  if (err instanceof ZodError) {
    logger.warn({ ...meta, msg: "Validation error", issues: err.flatten().fieldErrors })
    return c.json(
      {
        status: 422,
        message: "Validation error",
        details: err.flatten().fieldErrors,
      },
      422
    )
  }

  // Better Auth errors
  if (err instanceof APIError) {
    logger.warn({ ...meta, msg: err.message, status: err.statusCode })
    return c.json(
      {
        status: err.statusCode,
        message: err.message,
        code: err.body?.code,
      },
      err.statusCode as ContentfulStatusCode | undefined
    )
  }

  // Intentional HTTP errors (thrown via new HTTPException)
  if (err instanceof HTTPException) {
    logger.warn({ ...meta, msg: err.message, status: err.status })
    return c.json(
      {
        status: err.status,
        message: err.message,
      },
      err.status
    )
  }

  // Unhandled / unexpected errors
  logger.error({
    ...meta,
    msg: err.message,
    name: err.name,
    stack: env.NODE_ENV !== "production" ? err.stack : undefined,
  })

  return c.json(
    {
      status: 500,
      message: env.NODE_ENV === "production" ? "Internal server error" : err.message,
      ...(env.NODE_ENV !== "production" && { stack: err.stack }),
    },
    500
  )
}
