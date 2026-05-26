import { execSync } from "child_process"
import { resolve } from "path"

const RESET = "\x1b[0m"
const RED = "\x1b[31m"
const YELLOW = "\x1b[33m"
const CYAN = "\x1b[36m"
const BOLD = "\x1b[1m"

// Run docker compose from the repo root
const repoRoot = resolve(import.meta.dirname, "../../..")

function isPostgresRunning(): boolean {
  try {
    const result = execSync("docker compose ps --services --filter status=running", {
      cwd: repoRoot,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    })
    return result.split("\n").some((s) => s.trim() === "postgres")
  } catch {
    return false
  }
}

if (!isPostgresRunning()) {
  console.error(`
${BOLD}${RED}✖ Database is not running.${RESET}

${BOLD}The API requires PostgreSQL to be running before it can start.${RESET}

${CYAN}To start the database and run migrations:${RESET}

  ${YELLOW}pnpm db:auth:migrate${RESET}          ${CYAN}# starts postgres, runs migrations, seeds admin${RESET}

${CYAN}Or if the database is already migrated, just start it:${RESET}

  ${YELLOW}docker compose up -d${RESET}     ${CYAN}# starts postgres and pgAdmin${RESET}

${CYAN}Then retry:${RESET}

  ${YELLOW}pnpm --filter api dev${RESET}
`)
  process.exit(1)
}
