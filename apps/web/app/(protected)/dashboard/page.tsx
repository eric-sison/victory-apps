"use client"

import { authClient } from "@workspace/auth/client"
import { Button } from "@workspace/ui/components/Button"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const router = useRouter()

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth/sign-in")
        },
      },
    })
  }

  return (
    <div>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  )
}
