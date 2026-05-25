import type { LinkProps } from "@tanstack/react-router";
import {
  AudioWaveform,
  Calendar,
  House,
  type LucideIcon,
  Music,
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
        icon: House,
        subItems: [],
      },
      {
        id: "general-song-bank",
        title: "Song Bank",
        path: "/song-bank",
        icon: Music,
        subItems: [],
      },
      {
        id: "general-services",
        title: "Services",
        path: "/services",
        icon: AudioWaveform,
        subItems: [],
      },
      {
        id: "general-teams",
        title: "Teams",
        path: "/teams",
        icon: Users,
        subItems: [],
      },
      {
        id: "general-calendar",
        title: "Calendar",
        path: "/calendar",
        icon: Calendar,
        subItems: [],
      },
      {
        id: "general-settings",
        title: "Settings",
        path: "/settings",
        icon: UserCog,
        subItems: [],
      },
    ],
  },
];

export const SIDEBAR_FOOTER_ITEMS: Item[] = [];
