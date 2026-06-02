import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { useEffect, useState } from "react";
import { getUserManager } from "#/utils/oidc-helper";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getUserManager()
      .getUser()
      .then((user) => {
        if (user && !user.expired) {
          navigate({ to: "/dashboard" });
        } else {
          setReady(true);
        }
      })
      .catch(() => setReady(true));
  }, [navigate]);

  if (!ready) return null;

  return (
    <div className="p-8">
      <Button onClick={() => getUserManager().signinRedirect()}>Login</Button>
    </div>
  );
}
