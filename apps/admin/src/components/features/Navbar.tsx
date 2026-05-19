import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/DropdownMenu"
import { Button } from "@workspace/ui/components/Button"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/Avatar"
import { Search, Layers, Sun, Moon, User, Settings, LogOut } from "lucide-react"
import { Link, useRouter } from "@tanstack/react-router"
import { useState, type FunctionComponent } from "react"
import { authClient } from "#/lib/auth-client"
import type { auth } from "@workspace/auth/server"

type NavbarProps = {
  user: typeof auth.$Infer.Session.user
}

export const Navbar: FunctionComponent<NavbarProps> = ({ user }) => {
  const router = useRouter()
  const [dark, setDark] = useState(false)

  const toggleTheme = () => {
    setDark((prev) => !prev)
    document.documentElement.classList.toggle("dark")
  }

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess() {
          router.navigate({
            to: "/auth/sign-in",
            replace: true,
          })
        },
      },
    })
  }

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-14 items-center justify-between px-10">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1.5">
          <div className="flex size-6.5 items-center justify-center rounded-md bg-foreground text-background">
            <Layers className="size-3.5" />
          </div>
          <span className="text-[15px] font-medium">Acme</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="size-4" />
          </Button>

          <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggleTheme}>
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              nativeButton={false}
              render={
                <Avatar>
                  {user.image ? (
                    <AvatarImage src={user.image} alt={user.name} />
                  ) : (
                    <AvatarFallback>CN</AvatarFallback>
                  )}
                </Avatar>
              }
            />
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem render={<Link to="/" />}>
                <User className="size-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link to="/" />}>
                <Settings className="size-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
                <LogOut className="size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
