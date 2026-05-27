import { SIDEBAR_CONTENT_ITEMS } from "#/utils/sidebar-items";

const allItems = SIDEBAR_CONTENT_ITEMS()
  .flatMap((group) => group.items)
  .flatMap((item) => [item, ...item.subItems]);

export const iconMap = Object.fromEntries(
  allItems.filter((item) => item.path).map((item) => [item.path, item.icon]),
);
