import { createFileRoute } from "@tanstack/react-router";
import { CredentialsSignInForm } from "#/components/features/auth/CredentialsSignInForm";

export const Route = createFileRoute("/auth/oidc/sign-in")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-full items-center justify-center">
      <CredentialsSignInForm signInType="oidc" />
    </div>
  );
}
