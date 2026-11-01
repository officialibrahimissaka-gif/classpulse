import { config as dotenv } from "dotenv";
import { z } from "zod";
dotenv({ path: ".env.local", quiet: true });

const schema = z.object({
  APP_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.url(),
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
  SESSION_KEY: z.string().regex(/^[a-f0-9]{64}$/),
  DATA_KEY: z.string().regex(/^[a-f0-9]{64}$/),
  AUTH_MODE: z.enum(["oidc", "development"]).default("oidc"),
  OIDC_ISSUER: z.string().optional(),
  OIDC_CLIENT_ID: z.string().optional(),
  OIDC_CLIENT_SECRET: z.string().optional(),
  COGNITO_USER_POOL_ID: z.string().optional(),
  AWS_REGION: z.literal("me-central-1").default("me-central-1"),
  STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
  ARTIFACT_DIRECTORY: z.string().default(".data/artifacts"),
  S3_BUCKET: z.string().optional(),
  MAIL_DRIVER: z.enum(["smtp", "ses"]).default("smtp"),
  SMTP_URL: z.string().optional(),
  MAIL_FROM: z.string().default("ClassPulse <no-reply@example.invalid>"),
});
export function config() {
  const result = schema.safeParse(process.env);
  if (!result.success)
    throw new Error(
      `Missing/invalid configuration names: ${result.error.issues.map((i) => i.path.join(".")).join(", ")}`,
    );
  const c = result.data;
  if (
    c.APP_ENV === "production" &&
    (new URL(c.APP_URL).protocol !== "https:" ||
      c.AUTH_MODE !== "oidc" ||
      c.STORAGE_DRIVER !== "s3" ||
      c.MAIL_DRIVER !== "ses")
  )
    throw new Error("Production requires HTTPS, OIDC, S3 and SES");
  if (
    c.AUTH_MODE === "development" &&
    (process.env.NODE_ENV === "production" ||
      c.APP_ENV === "production" ||
      !["localhost", "127.0.0.1"].includes(new URL(c.APP_URL).hostname))
  )
    throw new Error(
      "Development identities are forbidden outside a local development server",
    );
  return c;
}
