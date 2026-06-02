import { createFileRoute, useLocation } from "@tanstack/react-router";
import {
  Page,
  PageBreadcrumb,
  PageContent,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@workspace/ui/components/Page";
import { iconMap } from "#/utils/route-icons";

export const Route = createFileRoute("/(protected)/sessions/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { pathname } = useLocation();

  return (
    <Page>
      <PageBreadcrumb pathname={pathname} icons={iconMap} />
      <PageHeader>
        <PageTitle>Sessions</PageTitle>
        <PageDescription>
          Monitor and manage active user sessions across all devices.
        </PageDescription>
      </PageHeader>

      <PageContent className="text-justify"></PageContent>
    </Page>
  );
}
