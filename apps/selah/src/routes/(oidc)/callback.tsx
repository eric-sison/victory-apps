import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { z } from "zod";
import { getUserManager } from "#/utils/oidc-helper";

const OIDCCodeFlowCallbackSchema = z.object({
  state: z.string(),
  code: z.string(),
});

export const Route = createFileRoute("/(oidc)/callback")({
  ssr: false,
  validateSearch: (search: z.infer<typeof OIDCCodeFlowCallbackSchema>) => ({
    state: search.state,
    code: search.code,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { code, state } = Route.useSearch();
  const navigate = useNavigate();
  const processed = useRef(false);

  const callback = useMutation({
    mutationFn: () => {
      const url = `${window.location.origin}/oidc/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
      return getUserManager().signinCallback(url);
    },
    onSuccess: (user) => {
      const returnTo = (user?.state as string) ?? "/dashboard";
      navigate({ to: returnTo });
    },
    onError: (err) => {
      console.error("OIDC callback failed:", err);
      navigate({ to: "/" });
    },
  });

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    callback.mutate();
  }, [callback.mutate]);

  return <p>Signing you in…</p>;
}
