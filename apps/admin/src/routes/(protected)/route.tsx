import { AppNavBar } from "#/components/features/AppNavbar"
import { AppSidebar } from "#/components/features/AppSidebar"
import { requireAuth } from "#/lib/auth-fns"
import { createFileRoute, Outlet } from "@tanstack/react-router"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/Sidebar"

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
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <AppNavBar user={user} />
        <main className="flex-1 overflow-y-auto p-5">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
