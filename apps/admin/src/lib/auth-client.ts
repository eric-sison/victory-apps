import { createClientAuth } from "@workspace/auth/client"

export const authClient = createClientAuth({
  baseURL: import.meta.env.VITE_API_URL ?? "",
  basePath: "/api/auth",
})