import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@workspace/auth/server";
import z from "zod";

export const getSession = createServerFn().handler(async () => {
  try {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({
      headers,
    });

    return session;
  } catch (error) {
    console.error(error);
  }
});

export const requireNoAuth = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSession();

  if (session) {
    throw redirect({
      to: "/dashboard",
    });
  }
});

export const requireAuth = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      redirectTo: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const session = await getSession();

    if (!session) {
      throw redirect({
        to: "/auth/sign-in",
        search: { redirectTo: data.redirectTo },
      });
    }

    return session;
  });
