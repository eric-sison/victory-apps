"use client"

import { createContext, useContext, type FunctionComponent, type PropsWithChildren } from "react"
import { AuthSession } from "../proxy"
import { authClient } from "@workspace/auth/client"

const AuthContext = createContext<AuthSession | undefined>(undefined)

export const AuthProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const { data: auth, isPending, error } = authClient.useSession()

  if (isPending) {
    return null // or a spinner/skeleton
  }

  if (error) {
    return null // session fetch failed, middleware will handle redirect
  }

  if (!auth?.user || !auth?.session) {
    return null // unauthenticated, middleware will handle redirect
  }

  return (
    <AuthContext.Provider value={{ user: auth.user, session: auth.session }}>{children}</AuthContext.Provider>
  )
}

export const useAuth = (): AuthSession => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
