import { createFileRoute, useLocation } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import {
  Page,
  PageBreadcrumb,
  PageContent,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@workspace/ui/components/Page";
import { authClient } from "#/lib/auth-client";
import { iconMap } from "#/utils/route-icons";

export const Route = createFileRoute("/(protected)/apps/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { pathname } = useLocation();

  const handleCreateClient = async () => {
    await authClient.oauth2.register({
      redirect_uris: ["http://localhost:5960/oidc/callback"],
      token_endpoint_auth_method: "client_secret_basic",
      grant_types: ["authorization_code"],
      response_types: ["code"],
      client_name: "Selah",
    });
  };

  return (
    <Page>
      <PageBreadcrumb pathname={pathname} icons={iconMap} />
      <PageHeader>
        <PageTitle>Apps</PageTitle>
        <PageDescription>
          Manage connected applications and their access permissions.
        </PageDescription>
      </PageHeader>

      <PageContent className="text-justify">
        <Button onClick={handleCreateClient}>Create App</Button>
      </PageContent>
    </Page>
  );
}
