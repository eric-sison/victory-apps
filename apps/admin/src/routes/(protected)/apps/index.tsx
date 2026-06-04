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
import { routeMap } from "#/utils/route-metadata";

export const Route = createFileRoute("/(protected)/apps/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { pathname } = useLocation();

  // TODO: Refine. Temporary only
  // Make sure to pass the enable_end_session: true flag to enable client sign out
  // But this flag can only be set when creating a client app on the server-side
  const handleCreateClient = async () => {
    const app = await authClient.oauth2.register({
      redirect_uris: ["http://localhost:5860/callback"],
      post_logout_redirect_uris: ["http://localhost:5860"],
      token_endpoint_auth_method: "client_secret_basic",
      grant_types: ["authorization_code"],
      response_types: ["code"],
      scope: "openid profile email offline_access",
      client_name: "Selah",
    });

    console.log(app);
  };

  return (
    <Page>
      <PageBreadcrumb pathname={pathname} routes={routeMap} />
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
