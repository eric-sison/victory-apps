import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(protected)/teams/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(protected)/teams/"!</div>;
}
