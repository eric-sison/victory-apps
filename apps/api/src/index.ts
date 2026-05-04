import "dotenv/config"
import { Hono } from "hono"
import { serve } from "@hono/node-server"
import { auth } from "./utils/auth.js"

const app = new Hono().basePath("/api")

app.on(["POST", "GET"], "/auth/*", (c) => {
  return auth.handler(c.req.raw)
})

serve(
  {
    fetch: app.fetch,
    port: 3001,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  }
)
