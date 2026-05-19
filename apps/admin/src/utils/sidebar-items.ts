import type { LinkProps } from "@tanstack/react-router"
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
} from "lucide-react"

type AppPath = LinkProps["to"]

export type Item = {
  title: string
  path?: AppPath
  icon: LucideIcon
  description?: string | undefined
}

export type SidebarItem = {
  group?: string | undefined
  items: Array<
    Item & {
      subItems?: Array<Item>
    }
  >
}

export const SIDEBAR_CONTENT_ITEMS = (_userId?: string): SidebarItem[] => [
  {
    group: "General",
    items: [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: CircleGauge,
      },
      {
        title: "Apps",
        path: "/",
        icon: LayoutGrid,
      },
      {
        title: "Users",
        path: "/",
        icon: Users,
      },
      {
        title: "Roles & Permissions",
        path: "/",
        icon: ShieldOff,
      },
      {
        title: "Sessions",
        path: "/",
        icon: KeyRound,
      },
      {
        title: "Profile",
        path: "/",
        icon: UserCog,
      },
      {
        title: "Settings",
        path: "/",
        icon: Settings,
      },
      {
        title: "Integrations",
        path: "/",
        icon: PackagePlus,
      },
    ],
  },
]

export const SIDEBAR_FOOTER_ITEMS: Item[] = []
