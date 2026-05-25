import type { QueryClient } from "@tanstack/react-query"
import { HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools"
import { Toaster } from "@workspace/ui/components/Sonner"
import { themeScript } from "#/utils/theme"
import appCss from "@workspace/ui/globals.css?url"

type MyRouterContext = {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Victory | Admin",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: () => <div>Not found!</div>,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const envScript = `window.__ENV__=${JSON.stringify({ VITE_API_URL: import.meta.env.VITE_API_URL ?? "" })}`

  return (
    <html lang="en" className="h-svh antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: envScript }} />
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="h-full overflow-x-hidden">
        <>{children}</>
        <Toaster />
        <TanStackDevtools
          eventBusConfig={{ debug: false }}
          config={{ position: "bottom-right" }}
          plugins={[
            { name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> },
            { name: "Tanstack Query", render: <ReactQueryDevtoolsPanel /> },
            formDevtoolsPlugin(),
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}