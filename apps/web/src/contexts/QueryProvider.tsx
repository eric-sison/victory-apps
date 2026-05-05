import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { FunctionComponent, PropsWithChildren } from "react"

type QueryClientContext =
  | {
      queryClient: QueryClient
    }
  | undefined

let context: QueryClientContext

export function getContext() {
  if (context) {
    return context
  }

  const queryClient = new QueryClient()

  context = {
    queryClient,
  }

  return context
}

export const QueryProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const { queryClient } = getContext()
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
