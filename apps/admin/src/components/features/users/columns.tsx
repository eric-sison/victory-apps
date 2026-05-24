import { type ColumnDef } from "@tanstack/react-table"
import { Badge } from "@workspace/ui/components/Badge"

import { DataTableColumnHeader, selectionColumn } from "#/components/DataTable"
import { type User, type UserRole, type UserStatus } from "#/utils/mocks/users"

// ─── Badge helpers ────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<UserStatus, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  pending: "outline",
  inactive: "secondary",
  suspended: "destructive",
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
  billing: "Billing",
}

// ─── Column definitions ───────────────────────────────────────────────────────

export const columns: ColumnDef<User>[] = [
  selectionColumn<User>(),
  {
    accessorKey: "name",
    meta: { displayName: "Name" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
  },
  {
    accessorKey: "email",
    meta: { displayName: "Email" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
  },
  {
    accessorKey: "role",
    meta: { displayName: "Role" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
    cell: ({ row }) => (
      <span className="text-sm capitalize">{ROLE_LABELS[row.getValue<UserRole>("role")]}</span>
    ),
  },
  {
    accessorKey: "status",
    meta: { displayName: "Status" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue<UserStatus>("status")
      return (
        <Badge variant={STATUS_VARIANT[status]} className="capitalize">
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "joinedAt",
    meta: { displayName: "Joined" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
    cell: ({ row }) =>
      new Date(row.getValue<string>("joinedAt")).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
  },
  {
    accessorKey: "lastSeen",
    meta: { displayName: "Last Seen" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Seen" />,
    cell: ({ row }) =>
      new Date(row.getValue<string>("lastSeen")).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
  },
]
