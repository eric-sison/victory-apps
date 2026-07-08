import { createFileRoute, useLocation } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import {
  Page,
  PageBreadcrumb,
  PageContent,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@workspace/ui/components/Page";
import { DataTable } from "#/components/DataTable";
import { sessionColumns } from "#/components/features/sessions/columns";
import { auth } from "#/lib/auth";
import { routeMap } from "#/utils/route-metadata";

export const getConsentsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders();

    const sessions = await auth.api.listSessions({
      headers,
    });

    return { sessions };
  },
);

export const Route = createFileRoute("/(protected)/sessions/")({
  loader: async () => await getConsentsFn(),
  component: RouteComponent,
});

function RouteComponent() {
  const { sessions } = Route.useLoaderData();

  const { pathname } = useLocation();

  return (
    <Page>
      <PageBreadcrumb pathname={pathname} routes={routeMap} />
      <PageHeader>
        <PageTitle>{routeMap[pathname].label}</PageTitle>
        <PageDescription>
          Monitor and manage active user sessions across all devices.
        </PageDescription>
      </PageHeader>

      <PageContent>
        <DataTable data={sessions} columns={sessionColumns} />
      </PageContent>
    </Page>
  );
}
