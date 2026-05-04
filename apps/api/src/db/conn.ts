import { drizzle } from "drizzle-orm/node-postgres"
import { env } from "../utils/env.js"

const db = drizzle(env.DATABASE_URL)
export default db
