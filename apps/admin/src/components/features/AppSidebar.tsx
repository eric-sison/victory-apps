import { Fragment, useEffect, useState, type FunctionComponent } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@workspace/ui/components/Sidebar"
import { SIDEBAR_FOOTER_ITEMS, SIDEBAR_CONTENT_ITEMS as sidebarItems } from "#/utils/sidebar-items"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@workspace/ui/components/Collapsible"
import { ChevronRight } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/DropdownMenu"
import { Link, useLocation, useNavigate } from "@tanstack/react-router"
import type { auth } from "@workspace/auth/server"

type AppSidebarProps = {
  user: typeof auth.$Infer.Session.user
}

export const AppSidebar: FunctionComponent<AppSidebarProps> = ({ user }) => {
  const { open } = useSidebar()
  const [mounted, setMounted] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const setActiveItem = (path: string | undefined) => {
    if (!path) return false
    return pathname === path || pathname.startsWith(path + "/")
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarContent>
        {sidebarItems(user.id).map((sidebarItem, index) => (
          <SidebarGroup key={index}>
            {sidebarItem.group && (
              <SidebarGroupLabel className="text-[10px] font-bold tracking-wider uppercase">
                {sidebarItem.group}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarItem.items.map((item, index) => {
                  // Render sub items in collapsible
                  if (item.subItems && open) {
                    return (
                      <Collapsible
                        key={index}
                        className="group/collapsible"
                        defaultOpen={item.subItems.some((sub) => sub.path === pathname)}
                        render={
                          <SidebarMenuItem>
                            <CollapsibleTrigger
                              render={
                                <SidebarMenuButton>
                                  {item.icon && <item.icon />}
                                  <span>{item.title}</span>
                                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
                                </SidebarMenuButton>
                              }
                            />
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {item.subItems.map((subItem) => (
                                  <SidebarMenuSubItem key={subItem.title}>
                                    <SidebarMenuSubButton
                                      isActive={setActiveItem(subItem.path)}
                                      render={
                                        <Link to={subItem.path}>
                                          {subItem.icon && <subItem.icon />}
                                          <span>{subItem.title}</span>
                                        </Link>
                                      }
                                    />
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </SidebarMenuItem>
                        }
                      />
                    )
                  }

                  // Render sub-items in a dropdown menu
                  if (item.subItems && !open) {
                    return (
                      <DropdownMenu key={index}>
                        <SidebarMenuItem>
                          <DropdownMenuTrigger
                            render={
                              <SidebarMenuButton tooltip={item.title}>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                              </SidebarMenuButton>
                            }
                          />
                          <DropdownMenuContent align="start" side="right">
                            {item.subItems.map((subItem, index) => {
                              const isLast = index === item.subItems!.length - 1
                              return (
                                <Fragment key={index}>
                                  <DropdownMenuItem onClick={() => navigate({ to: subItem.path })}>
                                    {subItem.icon && <subItem.icon />}
                                    <span>{subItem.title}</span>
                                  </DropdownMenuItem>
                                  {!isLast && <DropdownMenuSeparator />}
                                </Fragment>
                              )
                            })}
                          </DropdownMenuContent>
                        </SidebarMenuItem>
                      </DropdownMenu>
                    )
                  }

                  // Render items as normal sidebar menu item
                  return (
                    item.path && (
                      <SidebarMenuItem key={index}>
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={setActiveItem(item.path)}
                          render={
                            <Link to={item.path}>
                              <item.icon />
                              <span>{item.title}</span>
                            </Link>
                          }
                        />
                      </SidebarMenuItem>
                    )
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {SIDEBAR_FOOTER_ITEMS.map((item, index) => (
            <SidebarMenuItem key={index}>
              {item.path && (
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={setActiveItem(item.path)}
                  render={
                    <Link to={item.path}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  }
                />
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
