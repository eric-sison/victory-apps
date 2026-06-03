import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
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
    <div>
      <Button onClick={handleSignOut}>Sign Out</Button>
    </div>
  );
}
