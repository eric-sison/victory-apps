import type { LucideIcon } from "@workspace/ui";
import { SIDEBAR_CONTENT_ITEMS } from "#/utils/sidebar-items";

export type RouteMetadata = {
  label: string;
  icon: LucideIcon;
};

const allItems = SIDEBAR_CONTENT_ITEMS()
  .flatMap((group) => group.items)
  .flatMap((item) => [item, ...item.subItems]);

export const routeMap: Record<string, RouteMetadata> = Object.fromEntries(
  allItems
    .filter((item) => item.path)
    .map((item) => [item.path, { label: item.title, icon: item.icon }]),
);
