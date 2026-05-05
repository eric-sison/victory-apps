"use client"

import { authClient } from "@workspace/auth/client"
import { Button } from "@workspace/ui/components/Button"
import { FunctionComponent } from "react"

export const AddAdminUser: FunctionComponent = () => {
  const handleAddAdminUser = async () => {
    const result = await authClient.admin.createUser({
      email: "user@example.com", // required
      password: "some-secure-password", // required
      name: "James Smith", // required
      role: "user",
    })

    console.log(result)
  }
  return <Button onClick={handleAddAdminUser}>Create user</Button>
}
