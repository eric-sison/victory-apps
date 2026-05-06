import { AppSidebar } from "@/components/features/sidebar/AppSidebar"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/Sidebar"
import { PropsWithChildren } from "react"

export default function MainLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="flex-1 overflow-y-auto px-4 py-2">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
