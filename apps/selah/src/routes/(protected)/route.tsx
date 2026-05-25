import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/Sidebar";
import { AppSidebar } from "#/components/AppSidebar";

export const Route = createFileRoute("/(protected)")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col h-full overflow-y-hidden">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
