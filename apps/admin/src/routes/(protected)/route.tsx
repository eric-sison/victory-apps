import { Navbar } from "#/components/features/Navbar"
import { requireAuth } from "#/lib/auth-fns"
import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/(protected)")({
  beforeLoad: async ({ location }) =>
    await requireAuth({
      data: {
        redirectTo: location.href,
      },
    }),
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = Route.useRouteContext()

  return (
    <div className="h-full">
      <Navbar user={user} />

      <main className="px-10 py-5">
        <Outlet />
      </main>
    </div>
  )
}
