"use client"

import { createContext, useContext, type FunctionComponent, type PropsWithChildren } from "react"
import { AuthSession } from "../proxy"
import { authClient } from "@workspace/auth/client"
import { useQuery } from "@tanstack/react-query"

const AuthContext = createContext<AuthSession | undefined>(undefined)

export const AuthProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const { data: auth, error } = useQuery({
    queryKey: ["get-session"],
    queryFn: async () => {
      return await authClient.getSession()
    },
  })

  if (error) {
    return null // session fetch failed, middleware will handle redirect
  }

  if (!auth?.data?.user || !auth?.data.session) {
    return null // unauthenticated, middleware will handle redirect
  }

  return (
    <AuthContext.Provider
      value={{
        user: auth.data.user,
        session: auth.data.session,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthSession => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
