
import { app } from "#/server/app"
import { writeFileSync } from "fs"
import { resolve } from "path"

const spec = app.getOpenAPIDocument({
  openapi: "3.0.0",
  info: {
    title: "Victory API",
    version: "1.0.0",
  },
})

const output = resolve(process.cwd(), "openapi.json")
writeFileSync(output, JSON.stringify(spec, null, 2))
console.log(`✅ OpenAPI spec generated at ${output}`)
