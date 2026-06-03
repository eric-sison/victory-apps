import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/Sidebar";
import { useEffect } from "react";
import { AppSidebar } from "#/components/AppSidebar";
import { getUserManager } from "#/utils/oidc-helper";

export type AuthContext = {
  user: {
    access_token: string;
    expires_at: number | undefined;
    profile: {
      sub: string;
      name: string | undefined;
      email: string | undefined;
      picture: string | undefined;
    };
  };
};

export const Route = createFileRoute("/(protected)")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return { user: null };

    try {
      const user = await getUserManager().getUser();
      if (user && !user.expired) {
        return {
          user: {
            access_token: user.access_token,
            expires_at: user.expires_at,
            profile: {
              sub: user.profile.sub,
              name: user.profile.name,
              email: user.profile.email,
              picture: user.profile.picture,
            },
          },
        };
      }
    } catch (err) {
      console.error("[requireAuth]", err);
    }

    throw redirect({ to: "/" });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate({ to: "/" });
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="flex flex-col h-full overflow-y-hidden">
      <SidebarProvider className="p-2">
        <AppSidebar user={user} />
        <SidebarInset>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
