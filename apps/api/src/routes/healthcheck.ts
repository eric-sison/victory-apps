import { Hono } from "hono"
import type { AppEnv } from "../types/app-env.js"

export const healthcheckHandler = new Hono<AppEnv>().basePath("/healthcheck").get("/", (c) => {
  return c.json({ status: "ok" })
})
