import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "#/lib/auth";

const oidcSignOut = createServerFn({ method: "POST" }).handler(async () => {
  const headers = getRequestHeaders();
  await auth.api.signOut({
    headers,
  });
});

export const Route = createFileRoute("/auth/oidc/sign-out")({
  beforeLoad: async () => oidcSignOut(),
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/auth/oidc/sign-out"!</div>;
}
