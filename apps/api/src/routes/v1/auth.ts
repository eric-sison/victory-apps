import type { AppEnv } from "../../types/app-env.js"
import { createRoute, OpenAPIHono } from "@hono/zod-openapi"
import { jsonBody, jsonResponse, commonErrors } from "../../utils/openapi.js"
import { SignInSchema, SignInResponseSchema } from "../../contracts/auth-contract.js"
import { auth } from "../../utils/auth.js"

const signInRoute = createRoute({
  method: "post",
  path: "/sign-in",
  tags: ["Auth"],
  request: jsonBody(SignInSchema),
  responses: {
    200: jsonResponse(SignInResponseSchema, "Sign in successful"),
    401: commonErrors[401],
    429: commonErrors[429],
  },
})

export const authHandler = new OpenAPIHono<AppEnv>().basePath("/v1/auth").openapi(signInRoute, async (c) => {
  const body = c.req.valid("json")
  const res = await auth.api.signInEmail({ body })
  return c.json(res, 200)
})
