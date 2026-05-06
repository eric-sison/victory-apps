import { Gauge, LayoutGrid, LucideIcon, Mail, Settings, UserPen, Users } from "lucide-react"
import { UrlObject } from "url"

export type Item = {
  title: string
  path?: UrlObject | string
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

export const SIDEBAR_CONTENT_ITEMS = (userId?: string): SidebarItem[] => [
  {
    group: "General",
    items: [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: Gauge,
      },
      {
        title: "Apps",
        path: "/apps",
        icon: LayoutGrid,
      },
      {
        title: "Users",
        path: "/users",
        icon: Users,
      },

      {
        title: "Settings",
        path: "/settings",
        icon: Settings,
        subItems: [
          {
            title: "Profile",
            path: "/profile",
            icon: UserPen,
          },
          {
            title: "Email Settings",
            path: "/email",
            icon: Mail,
          },
        ],
      },
    ],
  },
]

export const SIDEBAR_FOOTER_ITEMS: Item[] = []
