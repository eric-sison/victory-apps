import { createFileRoute, redirect, useSearch } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import z from "zod";
import { CredentialsSignInForm } from "#/components/features/auth/CredentialsSignInForm";
import { auth } from "#/lib/auth";

export const requireNoAuth = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({
      headers,
    });

    if (session) {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
);

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
