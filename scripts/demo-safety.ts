import { readFile } from "node:fs/promises";
import { parse } from "dotenv";
export type DemoSettings = Record<string, string | undefined>;
export function assertLocalDemo(settings: DemoSettings) {
  if (
    settings.NODE_ENV === "production" ||
    settings.APP_ENV !== "development" ||
    settings.AUTH_MODE !== "development" ||
    settings.APP_URL !== "http://127.0.0.1:3000" ||
    settings.STORAGE_DRIVER !== "local" ||
    settings.MAIL_DRIVER !== "smtp" ||
    (settings.WORKER_PORT && settings.WORKER_PORT !== "3001")
  )
    throw Error(
      "This helper runs a local demonstration only. Existing configuration is not local demo configuration; use a separate clone. Nothing was reset.",
    );
  for (const name of [
    "DATABASE_URL",
    "REDIS_URL",
    "SMTP_URL",
    "ADMIN_DATABASE_URL",
    "DISPATCH_DATABASE_URL",
  ]) {
    const value = settings[name];
    if (!value)
      throw Error(
        `Missing local configuration: ${name}. Run the standard local setup or use a fresh clone.`,
      );
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw Error(`Invalid local configuration: ${name}.`);
    }
    if (
      !["localhost", "127.0.0.1"].includes(url.hostname) ||
      !["postgres:", "postgresql:", "redis:", "smtp:"].includes(url.protocol)
    )
      throw Error(
        `Refusing non-local service configuration: ${name}. No remote service was changed.`,
      );
  }
}
export async function localSettings(): Promise<DemoSettings> {
  const values: DemoSettings = {};
  for (const path of [".env.local", ".local/admin.env", ".local/worker.env"]) {
    try {
      Object.assign(values, parse(await readFile(path)));
    } catch (e) {
      if (!(e instanceof Error && "code" in e && e.code === "ENOENT")) throw e;
    }
  }
  for (const [key, value] of Object.entries(process.env))
    if (value !== undefined) values[key] = value;
  return values;
}
