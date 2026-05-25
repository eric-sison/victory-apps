import { createClientAuth } from "@workspace/auth/client"

declare global {
  interface Window {
    __ENV__?: { VITE_API_URL?: string }
  }
}

const apiUrl =
  typeof window !== "undefined"
    ? (window.__ENV__?.VITE_API_URL ?? "")
    : (process.env.VITE_API_URL ?? "")

export const authClient = createClientAuth({
  baseURL: apiUrl,
  basePath: "/api/auth",
})