import { AddAdminUser } from "@/components/features/auth/AddAdminUser"

export default function Page() {
  return (
    <div className="flex h-full items-center justify-center border-8">
      <h3 className="text-2xl">Hello</h3>
      <AddAdminUser />
    </div>
  )
}
