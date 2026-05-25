import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/Sidebar";
import { AppSidebar } from "#/components/AppSidebar";
import { MusicPlayer } from "#/components/MusicPlayer";

export const Route = createFileRoute("/(protected)")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SidebarProvider className="">
      <AppSidebar />
      <SidebarInset>
        <main className="flex-1">
          <Outlet />
        </main>
      </SidebarInset>
      <MusicPlayer />
    </SidebarProvider>
  );
}
