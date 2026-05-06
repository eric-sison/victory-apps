import { type Metadata } from "next"
import { CredentialsSignInForm } from "@/components/features/auth/CredentialsSignInForm"

export const metadata: Metadata = {
  title: "Sign In",
}

type SearchParams = {
  callbackUrl?: string
}

export default async function SignInPage(props: PageProps<"/auth/sign-in">) {
  const searchParams = (await props.searchParams) as SearchParams

  return (
    <div className="flex h-full items-center justify-center">
      <CredentialsSignInForm callbackURL={searchParams.callbackUrl} />
    </div>
  )
}
