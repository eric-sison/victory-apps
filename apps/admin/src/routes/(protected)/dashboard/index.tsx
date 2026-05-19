import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/(protected)/dashboard/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = Route.useRouteContext()

  return <div>Hello {user.name}!</div>
}
