import type { auth } from "@workspace/auth/server"
import type { FunctionComponent } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/Avatar"

type AppNavBarProps = {
  user: typeof auth.$Infer.Session.user
}

export const AppNavBar: FunctionComponent<AppNavBarProps> = ({ user }) => {
  return (
    <nav className="flex h-20 items-center border-b p-5">
      <section className="flex items-center gap-2">
        <Avatar size="lg">
          {user.image ? <AvatarImage src={user.image} /> : <AvatarFallback>CN</AvatarFallback>}
        </Avatar>
        <div className="-space-y-0.5">
          <h3 className="text-sm font-medium">Hello {user.name}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </section>
    </nav>
  )
}
