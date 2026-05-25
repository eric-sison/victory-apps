import { Fragment, type FunctionComponent } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@workspace/ui/components/Sidebar";
import { SIDEBAR_FOOTER_ITEMS, SIDEBAR_CONTENT_ITEMS as sidebarItems } from "#/utils/sidebar-items";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@workspace/ui/components/Collapsible";
import { ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/DropdownMenu";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import type { auth } from "@workspace/auth/server";

type AppSidebarProps = {
  user: typeof auth.$Infer.Session.user;
};

export const AppSidebar: FunctionComponent<AppSidebarProps> = ({ user }) => {
  const { open } = useSidebar();
  const { pathname } = useLocation();

  const navigate = useNavigate();

  const setActiveItem = (path: string | undefined) => {
    if (!path) return false;
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              onClick={() => navigate({ to: "/dashboard" })}
            >
              <div className="flex aspect-square size-8 items-center justify-center text-sidebar-primary-foreground">
                <img
                  src="/victory-logo.png"
                  alt="v-logo"
                  loading="lazy"
                  decoding="async"
                  width={800}
                  height={600}
                  className="size-8 shrink-0"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Victory</span>
                <span className="truncate text-xs font-medium text-muted-foreground">Admin App</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {sidebarItems(user.id).map((sidebarItem) => (
          <SidebarGroup key={sidebarItem.groupId}>
            {sidebarItem.group && (
              <SidebarGroupLabel className="text-[10px] font-bold tracking-wider uppercase">
                {sidebarItem.group}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarItem.items.map((item) => {
                  // Render sub items in collapsible
                  if (item.subItems && open) {
                    return (
                      <Collapsible
                        key={item.id}
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
                    );
                  }

                  // Render sub-items in a dropdown menu
                  if (item.subItems && !open) {
                    return (
                      <DropdownMenu key={item.id}>
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
                              const isLast = index === item.subItems.length - 1;
                              return (
                                <Fragment key={subItem.id}>
                                  <DropdownMenuItem onClick={() => navigate({ to: subItem.path })}>
                                    {subItem.icon && <subItem.icon />}
                                    <span>{subItem.title}</span>
                                  </DropdownMenuItem>
                                  {!isLast && <DropdownMenuSeparator />}
                                </Fragment>
                              );
                            })}
                          </DropdownMenuContent>
                        </SidebarMenuItem>
                      </DropdownMenu>
                    );
                  }

                  // Render items as normal sidebar menu item
                  return (
                    item.path && (
                      <SidebarMenuItem key={item.id}>
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
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {SIDEBAR_FOOTER_ITEMS.map((item) => (
            <SidebarMenuItem key={item.id}>
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
  );
};
