import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(protected)/sessions/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(protected)/sessions/"!</div>;
}
