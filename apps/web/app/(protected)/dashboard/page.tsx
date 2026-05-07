"use client"

import { useAuth } from "@/components/AuthProvider"
import { authClient } from "@workspace/auth/client"
import { Button } from "@workspace/ui/components/Button"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const router = useRouter()
  const auth = useAuth()

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth/sign-in")
        },
      },
    })
  }

  const handlePasswordReset = async () => {
    await authClient.requestPasswordReset({
      email: auth.user?.email as string,
      fetchOptions: {
        onSuccess(ctx) {
          console.log(ctx.response)
        },
      },
    })
  }

  return (
    <div>
      <Button onClick={handleLogout}>Logout</Button>
      <Button onClick={handlePasswordReset}>Reset Password</Button>
    </div>
  )
}
