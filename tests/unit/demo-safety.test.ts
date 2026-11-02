import { it, expect } from "vitest";
import { assertLocalDemo } from "../../scripts/demo-safety";
const local = {
  APP_ENV: "development",
  AUTH_MODE: "development",
  APP_URL: "http://127.0.0.1:3000",
  STORAGE_DRIVER: "local",
  MAIL_DRIVER: "smtp",
  DATABASE_URL: "postgresql://fixture:fixture@127.0.0.1:55432/classpulse",
  ADMIN_DATABASE_URL: "postgresql://fixture:fixture@127.0.0.1:55432/classpulse",
  DISPATCH_DATABASE_URL:
    "postgresql://fixture:fixture@127.0.0.1:55432/classpulse",
  REDIS_URL: "redis://127.0.0.1:56379",
  SMTP_URL: "smtp://127.0.0.1:11025",
};
it("OWNER-LOCAL01 accepts only the local demonstration stack", () => {
  expect(() => assertLocalDemo(local)).not.toThrow();
  for (const change of [
    { APP_ENV: "production" },
    { NODE_ENV: "production" },
    { AUTH_MODE: "oidc" },
    { APP_URL: "https://portfolio.example" },
    { STORAGE_DRIVER: "s3" },
    { MAIL_DRIVER: "ses" },
    { WORKER_PORT: "9999" },
  ])
    expect(() => assertLocalDemo({ ...local, ...change })).toThrow();
});
it("OWNER-LOCAL02 refuses remote/missing service URLs before migration or seeding", () => {
  for (const key of [
    "DATABASE_URL",
    "ADMIN_DATABASE_URL",
    "DISPATCH_DATABASE_URL",
    "REDIS_URL",
    "SMTP_URL",
  ]) {
    expect(() =>
      assertLocalDemo({
        ...local,
        [key]: "postgresql://fixture:fixture@remote.example/database",
      }),
    ).toThrow(/non-local/);
    expect(() => assertLocalDemo({ ...local, [key]: undefined })).toThrow(
      /Missing local configuration/,
    );
  }
});
