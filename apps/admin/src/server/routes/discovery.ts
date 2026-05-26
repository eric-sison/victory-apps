import {
  oauthProviderAuthServerMetadata,
  oauthProviderOpenIdConfigMetadata,
} from "@better-auth/oauth-provider";
import { OpenAPIHono } from "@hono/zod-openapi";
import { auth } from "#/lib/auth.js";
import type { AppEnv } from "../../utils/app-env.js";

export const discoveryHandler = new OpenAPIHono<AppEnv>()
  .get("/.well-known/openid-configuration", (c) =>
    oauthProviderOpenIdConfigMetadata(auth)(c.req.raw),
  )
  .get("/.well-known/oauth-authorization-server/api/auth", (c) =>
    oauthProviderAuthServerMetadata(auth)(c.req.raw),
  );
