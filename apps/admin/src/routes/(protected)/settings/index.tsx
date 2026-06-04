import { createFileRoute, useLocation } from "@tanstack/react-router";
import {
  Page,
  PageBreadcrumb,
  PageContent,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@workspace/ui/components/Page";
import { routeMap } from "#/utils/route-metadata";

export const Route = createFileRoute("/(protected)/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { pathname } = useLocation();

  return (
    <Page>
      <PageBreadcrumb pathname={pathname} routes={routeMap} />
      <PageHeader>
        <PageTitle>Settings</PageTitle>
        <PageDescription>
          Manage your account preferences and application configuration.
        </PageDescription>
      </PageHeader>

      <PageContent className="text-justify"></PageContent>
    </Page>
  );
}
