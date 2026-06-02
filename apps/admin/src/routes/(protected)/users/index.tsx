import { createFileRoute, useLocation } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { Plus } from "@workspace/ui";
import { Button } from "@workspace/ui/components/Button";
import {
  Page,
  PageAction,
  PageBreadcrumb,
  PageContent,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@workspace/ui/components/Page";
import { DataTable } from "#/components/DataTable";
import { usersColumns } from "#/components/features/users/columns";
import { auth } from "#/lib/auth";
import { iconMap } from "#/utils/route-icons";

export const getUsers = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequestHeaders();

  return await auth.api.listUsers({
    query: {},
    headers,
  });
});

export const Route = createFileRoute("/(protected)/users/")({
  loader: async () => await getUsers(),
  component: RouteComponent,
});

function RouteComponent() {
  const { users } = Route.useLoaderData();
  const { pathname } = useLocation();

  return (
    <Page>
      <PageBreadcrumb pathname={pathname} icons={iconMap} />
      <PageHeader>
        <PageTitle>Users</PageTitle>
        <PageDescription>
          Manage user accounts, roles, and access permissions.
        </PageDescription>
        <PageAction>
          <Button>
            <Plus />
            <span>Add User</span>
          </Button>
        </PageAction>
      </PageHeader>

      <PageContent>
        <DataTable data={users} columns={usersColumns} />
      </PageContent>
    </Page>
  );
}
