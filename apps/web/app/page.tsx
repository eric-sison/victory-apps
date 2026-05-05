import { AddAdminUser } from "@/components/features/auth/AddAdminUser"
import { Button } from "@workspace/ui/components/button"

export default function Page() {
  return (
    <div className="flex h-full items-center justify-center border-8">
      <AddAdminUser />
    </div>
  )
}
