import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { Page } from "@workspace/ui/components/Page";
import { getUserManager } from "#/utils/oidc-helper";

export const Route = createFileRoute("/(protected)/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  async function handleSignOut() {
    await getUserManager().removeUser();
    navigate({ to: "/" });
  }

  return (
    <Page>
      <Button onClick={handleSignOut}>Sign Out</Button>
    </Page>
  );
}
