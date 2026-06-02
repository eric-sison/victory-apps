import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/Sidebar";
import z from "zod";
import { AppSidebar } from "#/components/AppSidebar";
import { auth } from "#/lib/auth";

export const requireAuth = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      redirectTo: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({
      headers,
    });

    if (!session) {
      throw redirect({
        to: "/auth/sign-in",
        search: { redirectTo: data.redirectTo },
      });
    }

    return session;
  });

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
