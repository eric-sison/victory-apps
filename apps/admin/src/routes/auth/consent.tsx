import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest, getRequestHeaders } from "@tanstack/react-start/server";
import { Button } from "@workspace/ui/components/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/Card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@workspace/ui/components/Item";
import { toast } from "@workspace/ui/components/Sonner";
import { Spinner } from "@workspace/ui/components/Spinner";
import { auth } from "#/lib/auth";
import { authClient } from "#/lib/auth-client";
import { ErrorMessages } from "#/utils/error-messages";
import { mapScopes } from "#/utils/oidc-scopes";

const getConsentDataFn = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  const headers = getRequestHeaders();

  const urlSearch = new URL(request.url).searchParams;
  const session = await auth.api.getSession({ headers });

  if (!session) {
    throw redirect({
      to: "/",
      search: {
        error: "invalid-session",
      },
    });
  }

  const oauthClient = await auth.api.getOAuthClient({
    headers,
    query: {
      client_id: urlSearch.get("client_id") as string,
    },
  });

  return {
    user: {
      name: session.user.name,
      email: session.user.email,
      image: session.user.image as string | undefined,
    },
    client: {
      name: oauthClient.client_name,
      description: oauthClient.software_statement,
    },
    requestedScopes: urlSearch.get("scope")?.split(" ") as string[],
  };
});

export const Route = createFileRoute("/auth/consent")({
  loader: async () => await getConsentDataFn(),
  component: RouteComponent,
});

function RouteComponent() {
  const { client, requestedScopes } = Route.useLoaderData();

  const { mutate, isPending } = useMutation({
    mutationFn: async (allow: boolean) => {
      const { data, error } = await authClient.oauth2.consent({
        accept: allow,
      });

      if (error) {
        let errorMessage = "";

        switch (error.status) {
          case 400: {
            errorMessage = ErrorMessages[400].CONSENT_EXPIRED.short;
            break;
          }
          case 429: {
            errorMessage = ErrorMessages[429].TOO_MANY_REQUESTS.short;
            break;
          }
          default: {
            errorMessage = "Something went wrong. Please try again.";
            console.error("[User Consent]", error);
            break;
          }
        }

        toast.error(errorMessage, {
          position: "top-center",
        });
      }

      return data;
    },
  });

  return (
    <div className="flex flex-col gap-5 h-full items-center justify-center">
      <Card className="w-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Authorize Access</CardTitle>
          <CardDescription>
            <span className="text-foreground font-medium">{client.name}</span>{" "}
            is requesting permission to access your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* <Item variant="muted">
            <Avatar size="lg">
              <AvatarImage src={user.image} />
            </Avatar>
            <ItemContent className="-space-y-1">
              <ItemTitle>{user.name}</ItemTitle>
              <ItemDescription>{user.email}</ItemDescription>
            </ItemContent>
          </Item> */}

          <section className="space-y-2">
            {mapScopes(requestedScopes)?.map((scope) => {
              return (
                <Item key={scope.id} className="" variant="muted">
                  <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <scope.icon className="size-5 text-primary" />
                  </div>
                  <ItemContent>
                    <ItemTitle>{scope.label}</ItemTitle>
                    <ItemDescription>{scope.description}</ItemDescription>
                  </ItemContent>
                </Item>
              );
            })}
          </section>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button
            disabled={isPending}
            className="w-full"
            size="lg"
            onClick={() => mutate(true)}
          >
            {isPending && <Spinner />}
            Allow Access
          </Button>
          <Button
            size="lg"
            className="w-full"
            variant="secondary"
            onClick={() => mutate(false)}
          >
            Deny
          </Button>
        </CardFooter>
      </Card>

      <div className="flex items-center justify-end gap-2 w-xl"></div>
    </div>
  );
}
