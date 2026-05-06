"use client"

import type { FunctionComponent } from "react"
import z from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { authClient } from "@workspace/auth/client"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/Card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@workspace/ui/components/Field"
import { Input } from "@workspace/ui/components/Input"
import { Button } from "@workspace/ui/components/Button"
import { toast } from "@workspace/ui/components/Sonner"
import { ErrorMessages } from "@/utils/error-messages"
import { Spinner } from "@workspace/ui/components/Spinner"

type CredentialsSignInFormProps = {
  callbackURL?: string
}

const CredentialsSignInFormSchema = z.object({
  email: z.email({ error: "Please enter a valid email." }),
  password: z.string().min(8, { error: "Password must be at least 8 characters." }),
})

export const CredentialsSignInForm: FunctionComponent<CredentialsSignInFormProps> = ({ callbackURL }) => {
  const form = useForm<z.infer<typeof CredentialsSignInFormSchema>>({
    resolver: zodResolver(CredentialsSignInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const { isPending, mutate } = useMutation({
    mutationKey: ["credentials-sign-in"],
    mutationFn: async () => {
      await authClient.signIn.email({
        ...form.getValues(),
        callbackURL: callbackURL ?? "/",
        fetchOptions: {
          onError(ctx) {
            let errorMessage = ""

            switch (ctx.error.status) {
              case 401: {
                errorMessage = ErrorMessages[401].INVALID_CREDENTIALS.short
                break
              }
              case 429: {
                errorMessage = ErrorMessages[429].TOO_MANY_REQUESTS.short
                break
              }
              case 500: {
                errorMessage = ErrorMessages[500].SERVER_ERROR.short
                break
              }
            }

            toast.error(`${errorMessage}`, {
              position: "top-center",
            })
          },
        },
      })
    },
  })

  return (
    <Card className="w-sm">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials below to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="credentials-signin-form" onSubmit={form.handleSubmit(() => mutate())}>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="credentials-form-email">Email address</FieldLabel>
                  <Input
                    {...field}
                    id="credentials-form-email"
                    aria-invalid={fieldState.invalid}
                    placeholder="johndoe@example.com"
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    <FieldDescription>Please enter your active email address.</FieldDescription>
                  )}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="credentials-form-password">Password</FieldLabel>
                  <Input
                    {...field}
                    id="credentials-form-password"
                    type="password"
                    aria-invalid={fieldState.invalid}
                    placeholder="••••••••••"
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    <FieldDescription>Must be at least 8 characters long.</FieldDescription>
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field>
          <Button disabled={isPending} type="submit" form="credentials-signin-form">
            {isPending && <Spinner />} <span>{isPending ? "Signing in..." : "Sign In"}</span>
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
