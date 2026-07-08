import type { LinkProps } from "@tanstack/react-router";
import {
  Home,
  KeyRound,
  LayoutGrid,
  type LucideIcon,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
} from "@workspace/ui";

type AppPath = LinkProps["to"];

export type Item = {
  id: string;
  title: string;
  path?: AppPath;
  icon: LucideIcon;
  description?: string | undefined;
};

export type SidebarItem = {
  group?: string | undefined;
  groupId: string;
  items: Array<
    Item & {
      subItems: Array<Item>;
    }
  >;
};

export const SIDEBAR_CONTENT_ITEMS = (_userId?: string): SidebarItem[] => [
  {
    group: "General",
    groupId: "general",
    items: [
      {
        id: "general-dashboard",
        title: "Dashboard",
        path: "/dashboard",
        icon: Home,
        subItems: [],
      },
      {
        id: "general-apps",
        title: "Client Apps",
        path: "/apps",
        icon: LayoutGrid,
        subItems: [],
      },
      {
        id: "general-user-management",
        title: "User Management",
        path: "/users",
        icon: UserCog,
        subItems: [
          {
            id: "general-user-management-users",
            title: "Users",
            path: "/users",
            icon: Users,
          },
          {
            id: "general-user-management-consent",
            title: "Consents",
            path: "/consents",
            icon: ShieldCheck,
          },
          {
            id: "general-user-management-sessions",
            title: "Sessions",
            path: "/sessions",
            icon: KeyRound,
          },
        ],
      },
      {
        id: "general-settings",
        title: "Settings",
        path: "/settings",
        icon: Settings,
        subItems: [],
      },
    ],
  },
];

export const SIDEBAR_FOOTER_ITEMS: Item[] = [];
