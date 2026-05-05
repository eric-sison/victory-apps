import { type auth } from "@workspace/auth/server"
import { NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3001"
const PUBLIC_ROUTES = ["/auth/sign-in", "/auth/forgot-password", "/auth/reset-password"]
const PUBLIC_PREFIXES = ["/api", "/_next"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)
  const isPublicPrefix = PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  if (isPublicRoute || isPublicPrefix) {
    return NextResponse.next()
  }

  const res = await fetch(`${API_BASE_URL}/api/auth/get-session`, {
    headers: request.headers,
  })

  const session = (await res.json()) as {
    session: typeof auth.$Infer.Session.session | null
    user: typeof auth.$Infer.Session.user | null
  }

  if (!session?.user || !session?.session) {
    const redirectUrl = new URL("/auth/sign-in", request.url)
    redirectUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if ((session?.user || session?.session) && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico|robots.txt|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|otf|css|js|map)$).*)",
  ],
}
