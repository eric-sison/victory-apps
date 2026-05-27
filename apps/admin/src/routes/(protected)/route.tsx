import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/Sidebar";
import { AppSidebar } from "#/components/AppSidebar";
import { requireAuth } from "#/server-fns/auth-fns";

export const Route = createFileRoute("/(protected)")({
  beforeLoad: async ({ location }) =>
    await requireAuth({
      data: {
        redirectTo: location.href,
      },
    }),
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useRouteContext();

  return (
    <SidebarProvider className="p-4">
      <AppSidebar user={user} />
      <SidebarInset className="rounded-lg">
        <main className="flex-1">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
