import { z } from "zod";

const envSchema = z.object({
  ADMIN_URL: z.url(),
  CLIENT_ID: z.string(),
  CLIENT_SECRET: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(z.treeifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
