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

export const Route = createFileRoute("/(protected)/consents/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { pathname } = useLocation();

  return (
    <Page>
      <PageBreadcrumb pathname={pathname} routes={routeMap} />
      <PageHeader>
        <PageTitle>{routeMap[pathname].label}</PageTitle>
        <PageDescription>
          Review and manage permissions granted to third-party applications
          accessing your platform.
        </PageDescription>
      </PageHeader>

      <PageContent className="text-justify"></PageContent>
    </Page>
  );
}
