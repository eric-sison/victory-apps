import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/auth/oidc/consent")({
  component: RouteComponent,
});

function RouteComponent() {
  const handleConsent = async () => {
    await authClient.oauth2.consent({ accept: true });
  };

  return (
    <div className="flex h-full items-center justify-center">
      <Button onClick={handleConsent}>Consent</Button>
    </div>
  );
}
