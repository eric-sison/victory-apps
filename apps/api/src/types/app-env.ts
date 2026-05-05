import type { auth } from "@workspace/auth/server"
import type pino from "pino"

export type AppEnv = {
  Variables: {
    logger: pino.Logger
    user: typeof auth.$Infer.Session.user | null
    session: typeof auth.$Infer.Session.session | null
  }
}
