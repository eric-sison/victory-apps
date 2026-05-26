import { createFileRoute, useSearch } from "@tanstack/react-router";
import z from "zod";
import { CredentialsSignInForm } from "#/components/features/auth/CredentialsSignInForm";
import { requireNoAuth } from "#/server-fns/auth-fns";

export const Route = createFileRoute("/auth/sign-in")({
  beforeLoad: async () => await requireNoAuth(),
  validateSearch: z.object({
    redirectTo: z.string().optional(),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { redirectTo } = useSearch({ from: "/auth/sign-in" });

  return (
    <div className="flex h-full items-center justify-center">
      <CredentialsSignInForm callbackURL={redirectTo ?? "/dashboard"} />
    </div>
  );
}
