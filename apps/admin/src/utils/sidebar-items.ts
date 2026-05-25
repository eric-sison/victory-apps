import type { LinkProps } from "@tanstack/react-router";
import {
  type LucideIcon,
  CircleGauge,
  KeyRound,
  LayoutGrid,
  PackagePlus,
  Settings,
  ShieldOff,
  UserCog,
  Users,
} from "lucide-react";

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
        icon: CircleGauge,
        subItems: [],
      },
      {
        id: "general-apps",
        title: "Apps",
        path: "/",
        icon: LayoutGrid,
        subItems: [],
      },
      {
        id: "general-users",
        title: "Users",
        path: "/users",
        icon: Users,
        subItems: [],
      },
      {
        id: "general-roles-permissions",
        title: "Roles & Permissions",
        path: "/",
        icon: ShieldOff,
        subItems: [],
      },
      {
        id: "general-sessions",
        title: "Sessions",
        path: "/sessions",
        icon: KeyRound,
        subItems: [],
      },
      {
        id: "general-profile",
        title: "Profile",
        path: "/",
        icon: UserCog,
        subItems: [],
      },
      {
        id: "general-settings",
        title: "Settings",
        path: "/settings",
        icon: Settings,
        subItems: [],
      },
      {
        id: "general-integrations",
        title: "Integrations",
        path: "/",
        icon: PackagePlus,
        subItems: [],
      },
    ],
  },
];

export const SIDEBAR_FOOTER_ITEMS: Item[] = [];
