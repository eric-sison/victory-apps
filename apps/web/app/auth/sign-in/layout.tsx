import { PropsWithChildren, Suspense } from "react"

export default function AuthLayout({ children }: PropsWithChildren) {
  return <Suspense fallback={<>Loading...</>}>{children}</Suspense>
}
