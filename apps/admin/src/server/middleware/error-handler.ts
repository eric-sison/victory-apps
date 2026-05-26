import { APIError } from "better-auth";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ZodError, z } from "zod";
import type { AppEnv } from "../../utils/app-env.js";
import { env } from "../../utils/env.js";
import { ErrorMessages } from "../../utils/openapi.js";

export const errorHandler = (err: Error, c: Context<AppEnv>) => {
  const logger = c.var.logger;
  const meta = {
    path: c.req.path,
    method: c.req.method,
    requestId: c.get("requestId"),
  };

  // Zod validation errors (from zValidator)
  if (err instanceof ZodError) {
    logger.warn({
      ...meta,
      msg: ErrorMessages[422],
      issues: z.treeifyError(err),
    });

    return c.json(
      {
        status: 422,
        message: ErrorMessages[422],
        details: z.treeifyError(err),
      },
      422,
    );
  }

  // Better Auth errors
  if (err instanceof APIError) {
    const message =
      ErrorMessages[err.statusCode as keyof typeof ErrorMessages] ??
      err.message;
    logger.warn({ ...meta, msg: message, status: err.statusCode });

    return c.json(
      {
        status: err.statusCode,
        message,
        code: err.body?.code,
      },
      err.statusCode as ContentfulStatusCode | undefined,
    );
  }

  // Intentional HTTP errors (thrown via new HTTPException)
  if (err instanceof HTTPException) {
    const message =
      ErrorMessages[err.status as keyof typeof ErrorMessages] ?? err.message;
    logger.warn({ ...meta, msg: message, status: err.status });

    return c.json(
      {
        status: err.status,
        message,
      },
      err.status,
    );
  }

  // Unhandled / unexpected errors
  logger.error({
    ...meta,
    msg: err.message,
    name: err.name,
    stack: env.NODE_ENV !== "production" ? err.stack : undefined,
  });

  return c.json(
    {
      status: 500,
      message: env.NODE_ENV === "production" ? ErrorMessages[500] : err.message,
      ...(env.NODE_ENV !== "production" && { stack: err.stack }),
    },
    500,
  );
};
