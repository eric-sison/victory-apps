import { CircleCheck, CircleX, type ColumnDef } from "@workspace/ui";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/Avatar";
import { Badge } from "@workspace/ui/components/Badge";
import { format } from "date-fns";
import type { auth } from "#/lib/auth";

type ListUsersResponse = Awaited<ReturnType<typeof auth.api.listUsers>>;
type User = ListUsersResponse["users"][number];

export const usersColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Avatar>
            {row.original.image ? (
              <AvatarImage src={row.original.image} />
            ) : (
              <AvatarFallback>CN</AvatarFallback>
            )}
          </Avatar>
          <div>
            <p>{row.original.name}</p>
            <p className="text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "emailVerified",
    header: "Verified",
    enableSorting: false,
    cell: ({ getValue }) =>
      getValue() === true ? (
        <CircleCheck className="text-green-500 size-4" />
      ) : (
        <CircleX className="text-rose-500 size-4" />
      ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => <Badge variant="secondary">{row.original.role}</Badge>,
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    enableSorting: false,
    cell: ({ row }) => <>{format(row.original.createdAt, "MMM dd, yyyy")}</>,
  },
];
