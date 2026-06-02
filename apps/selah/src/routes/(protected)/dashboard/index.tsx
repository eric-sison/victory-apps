import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { getUserManager } from "#/utils/oidc-helper";

export const Route = createFileRoute("/(protected)/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  async function handleSignOut() {
    await getUserManager().signoutRedirect({
      post_logout_redirect_uri: "http://localhost:5860",
    });
  }

  return (
    <div>
      <Button onClick={handleSignOut}>Sign Out</Button>
    </div>
  );
}
