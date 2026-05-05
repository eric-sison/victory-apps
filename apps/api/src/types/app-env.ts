import type pino from "pino"
import type { auth } from "../utils/auth.js"

export type AppEnv = {
  Variables: {
    logger: pino.Logger
    user: typeof auth.$Infer.Session.user | null
    session: typeof auth.$Infer.Session.session | null
  }
}
