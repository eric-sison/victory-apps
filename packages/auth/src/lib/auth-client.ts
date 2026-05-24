import { adminClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

type ClientAuthOptions = {
  baseURL: string
  basePath: string
}

export const createClientAuth = ({ baseURL, basePath }: ClientAuthOptions) =>
  createAuthClient({
    baseURL,
    basePath,
    fetchOptions: {
      baseURL: baseURL + basePath,
    },
    plugins: [adminClient()],
  })
