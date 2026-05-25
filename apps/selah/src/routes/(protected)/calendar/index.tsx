import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/calendar/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(protected)/calendar/"!</div>
}
