import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { contextStorage } from "hono/context-storage";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { auth } from "#/lib/auth.js";
import type { AppEnv } from "../utils/app-env.js";
import { ErrorMessages } from "../utils/openapi.js";
import { authSession } from "./middleware/auth-session.js";
import { cors } from "./middleware/cors.js";
import { errorHandler } from "./middleware/error-handler.js";
import { logger } from "./middleware/logger.js";
import { rateLimiter } from "./middleware/rate-limiter.js";
import { discoveryHandler } from "./routes/discovery.js";
import { healthcheckHandler } from "./routes/healthcheck.js";

export const app = new OpenAPIHono<AppEnv>().basePath("/api");

app.use(secureHeaders());
app.use(cors());
app.use(requestId());
app.use(contextStorage());
app.use(logger());
app.use(authSession);

// Rate limit specific auth routes before the catch-all
app.use("/auth/sign-in/email", rateLimiter({ windowMs: 60 * 1000, limit: 5 }));
app.use("/auth/sign-up/email", rateLimiter({ windowMs: 60 * 1000, limit: 5 }));
app.use("/auth/reset-password", rateLimiter({ windowMs: 60 * 1000, limit: 3 }));
app.use("/auth/oauth2/consent", rateLimiter({ windowMs: 60 * 1000, limit: 3 }));

app.on(["POST", "GET"], "/auth/*", async (c) => {
  const response = await auth.handler(c.req.raw);

  if (c.req.path.includes("/oauth2/authorize")) {
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      const text = await response.clone().text();

      if (text) {
        try {
          const data = JSON.parse(text);
          if (data.redirect === true && data.url) {
            return c.redirect(data.url);
          }
        } catch {
          // not valid JSON, fall through
        }
      }
    }
  }

  return response;
});

const routes = [healthcheckHandler, discoveryHandler] as const;

// biome-ignore lint/suspicious/useIterableCallbackReturn: This is intended
routes.forEach((route) => app.route("/", route));

app.doc("/docs/spec", {
  openapi: "3.0.0",
  info: {
    title: "Victory API",
    description:
      "This API provides access to application resources and operations.",
    version: "1.0.0",
  },
});

app.get(
  "/docs",
  Scalar({
    url: "/api/docs/spec",
    pageTitle: "Victory API",
    servers: [
      {
        url: "http://localhost:3001",
        description: "Local development server",
      },
    ],
  }),
);

// Handle errors thrown globally
app.onError(errorHandler);
app.notFound((c) => c.json({ status: 404, message: ErrorMessages[404] }, 404));
