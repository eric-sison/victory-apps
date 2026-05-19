import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

console.log("[auth] DATABASE_URL at init:", process.env.DATABASE_URL ? "✓ present" : "✗ undefined")

function createPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("[auth] DATABASE_URL is not set — check env loading order")
  }

  return new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    keepAlive: true,
  })
}

const db = drizzle(createPool())

export default db
