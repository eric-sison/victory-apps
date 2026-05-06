import { LucideIcon, SquareDashedMousePointerIcon } from "lucide-react"
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

export const SIDEBAR_CONTENT_ITEMS: SidebarItem[] = [
  {
    group: "General",
    items: [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: SquareDashedMousePointerIcon,
      },
    ],
  },
]

export const SIDEBAR_FOOTER_ITEMS: Item[] = []
