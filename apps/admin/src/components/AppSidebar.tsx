import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { AudioLines, ChevronRight } from "@workspace/ui";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/Collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/DropdownMenu";
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
import {
  type ComponentPropsWithoutRef,
  Fragment,
  type FunctionComponent,
  useState,
} from "react";
import type { auth } from "#/lib/auth";
import {
  type Item,
  SIDEBAR_FOOTER_ITEMS,
  SIDEBAR_CONTENT_ITEMS as sidebarItems,
} from "#/utils/sidebar-items";

type AppSidebarProps = {
  user: typeof auth.$Infer.Session.user;
};

function CollapsibleMenuItem({
  item,
  pathname,
  isActive,
}: {
  item: Item & { subItems: Item[] };
  pathname: string;
  isActive: (path: string | undefined) => boolean;
}) {
  const [isOpen, setIsOpen] = useState(() =>
    item.subItems.some((sub) => sub.path === pathname),
  );

  return (
    <Collapsible
      className="group/collapsible"
      open={isOpen}
      onOpenChange={setIsOpen}
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
                <SidebarMenuSubItem key={subItem.id}>
                  <SidebarMenuSubButton
                    isActive={isActive(subItem.path)}
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

export const AppSidebar: FunctionComponent<
  ComponentPropsWithoutRef<typeof Sidebar> & AppSidebarProps
> = ({ user, ...props }) => {
  const { open } = useSidebar();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string | undefined) => {
    if (!path) return false;
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              onClick={() => navigate({ to: "/" })}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-sidebar-primary-foreground">
                <AudioLines className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Victory</span>
                <span className="truncate text-xs">Admin App</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {sidebarItems().map((sidebarItem) => (
          <SidebarGroup key={sidebarItem.groupId}>
            {sidebarItem.group && (
              <SidebarGroupLabel className="text-[10px] font-bold tracking-wider uppercase">
                {sidebarItem.group}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarItem.items.map((item) => {
                  if (item.subItems.length > 0 && open) {
                    return (
                      <CollapsibleMenuItem
                        key={item.id}
                        item={item}
                        pathname={pathname}
                        isActive={isActive}
                      />
                    );
                  }

                  if (item.subItems.length > 0 && !open) {
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
                                  <DropdownMenuItem
                                    onClick={() =>
                                      navigate({ to: subItem.path })
                                    }
                                  >
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

                  return (
                    item.path && (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={isActive(item.path)}
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
                  isActive={isActive(item.path)}
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
