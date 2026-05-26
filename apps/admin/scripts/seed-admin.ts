import { DatabaseError } from "pg"
import { users, accounts } from "../src/database/schemas/auth-schema.js"
import { eq } from "drizzle-orm"
import { generateId } from "better-auth"
import { hashPassword } from "better-auth/crypto"
import db from "../src/database/conn.js"

const ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD
const ADMIN_NAME = process.env.DEFAULT_ADMIN_NAME ?? "Admin"

async function seedAdmin() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("❌ DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD must be set")
    process.exit(1)
  }

  console.log("🌱 Seeding admin user...")

  // Remove existing admin if any
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin")).limit(1)

  if (existing.length > 0) {
    const existingId = existing[0].id
    console.log(`🗑️  Removing existing admin (id: ${existingId})...`)

    // Cascades will handle sessions and verifications,
    // but accounts don't always cascade — delete explicitly
    await db.delete(accounts).where(eq(accounts.userId, existingId))
    await db.delete(users).where(eq(users.id, existingId))

    console.log("✅ Existing admin removed")
  }

  try {
    const userId = generateId()
    const hashedPassword = await hashPassword(ADMIN_PASSWORD)

    await db.insert(users).values({
      id: userId,
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      emailVerified: true,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await db.insert(accounts).values({
      id: generateId(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    console.log(`✅ Admin user created: ${ADMIN_EMAIL}`)
    process.exit(0)
  } catch (err) {
    if (err instanceof DatabaseError) {
      switch (err.code) {
        case "23505":
          console.error(`❌ Admin user already exists with email: ${ADMIN_EMAIL}`)
          break
        case "23503":
          console.error("❌ Foreign key constraint failed — check referenced tables")
          break
        case "42P01":
          console.error("❌ Table not found — have you run migrations?")
          break
        default:
          console.error(`❌ Database error (${err.code}): ${err.message}`)
      }
    } else {
      console.error("❌ Unexpected error:", err)
    }
    process.exit(1)
  }
}

seedAdmin().catch((err) => {
  console.error("❌ Failed to seed admin:", err)
  process.exit(1)
})
