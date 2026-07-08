import type { ColumnDef } from "@workspace/ui";
import { format } from "date-fns";
import type { auth } from "#/lib/auth";

type ListSessionsResponse = Awaited<ReturnType<typeof auth.api.listSessions>>;
type Sessions = ListSessionsResponse[number];

export const sessionColumns: ColumnDef<Sessions>[] = [
  {
    accessorKey: "userId",
    header: "User",
    cell: ({ row }) => <div>{row.original.userId}</div>,
  },
  {
    accessorKey: "ipAddress",
    header: "Origin",
    enableSorting: false,
    cell: ({ row }) => <div>{row.original.ipAddress}</div>,
  },
  {
    accessorKey: "userAgent",
    header: "Device",
    cell: ({ row }) => <div>{row.original.userAgent}</div>,
  },
  {
    accessorKey: "expiresAt",
    header: "Expires At",
    enableSorting: false,
    cell: ({ row }) => <>{format(row.original.expiresAt, "MMM dd, yyyy")}</>,
  },
];
