import { type auth } from "@workspace/auth/server"
import { NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3001"
const PUBLIC_ROUTES = ["/auth/sign-in", "/auth/forgot-password", "/auth/reset-password"]
const PUBLIC_PREFIXES = ["/api", "/_next"]

export type AuthSession = {
  session: typeof auth.$Infer.Session.session | null
  user: typeof auth.$Infer.Session.user | null
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)
  const isPublicPrefix = PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  if (isPublicPrefix) {
    return NextResponse.next()
  }

  // Strip the Host header so the internal API receives its own hostname,
  // not the browser-facing one. Better Auth uses this to validate origins
  // and set cookie attributes — a mismatch causes silent auth failures in
  // production Docker where the internal hostname differs from the public one.
  const forwardHeaders = new Headers(request.headers)
  forwardHeaders.delete("host")

  let session: AuthSession = { user: null, session: null }

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/get-session`, {
      headers: forwardHeaders,
    })

    if (res.ok) {
      session = (await res.json()) as AuthSession
    }
  } catch {
    // If the API is unreachable, fail open — let Next.js render the page.
    // Protected pages will still be gated client-side by AuthProvider.
    return NextResponse.next()
  }

  const isAuthenticated = !!(session?.user && session?.session)

  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (!isAuthenticated && !isPublicRoute) {
    const redirectUrl = new URL("/auth/sign-in", request.url)
    redirectUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico|robots.txt|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|otf|css|js|map)$).*)",
  ],
}
