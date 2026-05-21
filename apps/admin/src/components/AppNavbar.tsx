import type { auth } from "@workspace/auth/server"
import { useState, useEffect, type FunctionComponent } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/Avatar"
import { cn } from "@workspace/ui/lib/utils"

type AppNavBarProps = {
  user: typeof auth.$Infer.Session.user
}

export const AppNavBar: FunctionComponent<AppNavBarProps> = ({ user }) => {
  const [visible, setVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      setVisible(currentScrollY < lastScrollY || currentScrollY < 80)
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 flex h-20 items-center rounded-t-lg border-b bg-background p-5 transition-transform duration-300",
        !visible && "-translate-y-full"
      )}
    >
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
