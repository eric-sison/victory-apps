import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/services/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(protected)/services/"!</div>
}
