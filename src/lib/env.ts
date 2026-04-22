import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().url().startsWith("mysql://"),
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET must be at least 16 chars"),
  AUTH_TRUST_HOST: z.enum(["true", "false"]).default("true"),
  NEXT_PUBLIC_SITE_NAME: z.string().min(1).default("OldGlory"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("https://oldglory.net"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  MERCADOPAGO_ACCESS_TOKEN: z.string().optional(),
  MERCADOPAGO_WEBHOOK_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  MAIL_FROM: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:\n", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables. See logs above.");
}

export const env = parsed.data;
