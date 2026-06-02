import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/Card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/Field";
import { Input } from "@workspace/ui/components/Input";
import { toast } from "@workspace/ui/components/Sonner";
import { Spinner } from "@workspace/ui/components/Spinner";
import type { FunctionComponent } from "react";
import z from "zod";
import { authClient } from "#/lib/auth-client";
import { ErrorMessages } from "#/utils/error-messages";

type CredentialsSignInFormProps = {
  callbackURL?: string;
};

const CredentialsSignInFormSchema = z.object({
  email: z.email({ error: "Please enter a valid email." }),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters." }),
});

export const CredentialsSignInForm: FunctionComponent<
  CredentialsSignInFormProps
> = ({ callbackURL }) => {
  const form = useForm({
    validators: {
      onSubmit: CredentialsSignInFormSchema,
    },
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => await mutateAsync(value),
  });

  const { isPending, mutateAsync } = useMutation({
    mutationKey: ["credentials-sign-in"],
    mutationFn: async (data: z.infer<typeof CredentialsSignInFormSchema>) => {
      await authClient.signIn.email({
        ...data,
        callbackURL: callbackURL ?? "/dashboard",
        rememberMe: true, // TODO: add control here
        fetchOptions: {
          onError(ctx) {
            let errorMessage = "";

            switch (ctx.error.status) {
              case 401: {
                errorMessage = ErrorMessages[401].INVALID_CREDENTIALS.short;
                break;
              }
              case 403: {
                errorMessage = ErrorMessages[403].EMAIL_NOT_VERIFIED.short;
                break;
              }
              case 404: {
                errorMessage = ErrorMessages[404].RESOURCE_NOT_FOUND.short;
                break;
              }
              case 429: {
                errorMessage = ErrorMessages[429].TOO_MANY_REQUESTS.short;
                break;
              }
              case 500: {
                errorMessage = ErrorMessages[500].SERVER_ERROR.short;
                break;
              }
              default: {
                errorMessage = "Something went wrong. Please try again.";
                console.error(ctx.error);
                break;
              }
            }

            toast.error(`${errorMessage}`, {
              position: "top-center",
            });
          },
        },
      });
    },
  });

  return (
    <Card className="w-sm">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your credentials below to continue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="credentials-signin-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="email">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Email address</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="johndoe@example.com"
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : (
                      <FieldDescription>
                        Please enter your active email address.
                      </FieldDescription>
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="password">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type="password"
                      aria-invalid={isInvalid}
                      placeholder="Please enter your password"
                      autoComplete="off"
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : (
                      <FieldDescription>
                        Must be at least 8 characters long.
                      </FieldDescription>
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field>
          <Button
            disabled={isPending}
            type="submit"
            form="credentials-signin-form"
          >
            {isPending && <Spinner />}{" "}
            <span>{isPending ? "Signing in..." : "Sign In"}</span>
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
};
