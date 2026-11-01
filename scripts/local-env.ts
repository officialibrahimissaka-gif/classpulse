import {
  mkdir,
  writeFile,
  access,
  readFile,
  appendFile,
} from "node:fs/promises";
import { parse } from "dotenv";
import { randomBytes } from "node:crypto";
const secret = () => randomBytes(32).toString("hex");
async function missing(path: string) {
  try {
    await access(path);
    return false;
  } catch {
    return true;
  }
}
await mkdir(".local", { recursive: true, mode: 0o700 });
if (await missing(".env.local")) {
  const admin = secret(),
    app = secret(),
    dispatcher = secret();
  const common = `APP_ENV=development\nAPP_URL=http://127.0.0.1:3000\nDATABASE_URL=postgresql://classpulse_app:${app}@127.0.0.1:55432/classpulse\nREDIS_URL=redis://127.0.0.1:56379/0\nSESSION_KEY=${secret()}\nDATA_KEY=${secret()}\nAUTH_MODE=development\nAWS_REGION=me-central-1\nSTORAGE_DRIVER=local\nARTIFACT_DIRECTORY=.data/artifacts\nMAIL_DRIVER=smtp\nSMTP_URL=smtp://127.0.0.1:11025\nMAIL_FROM=no-reply@example.invalid\n`;
  await writeFile(".env.local", common, { mode: 0o600, flag: "wx" });
  await writeFile(
    ".local/admin.env",
    `ADMIN_DATABASE_URL=postgresql://postgres:${admin}@127.0.0.1:55432/classpulse\nRUNTIME_PASSWORD=${app}\nDISPATCH_PASSWORD=${dispatcher}\n`,
    { mode: 0o600, flag: "wx" },
  );
  await writeFile(".local/docker.env", `POSTGRES_PASSWORD=${admin}\n`, {
    mode: 0o600,
    flag: "wx",
  });
  await writeFile(
    ".local/worker.env",
    `DISPATCH_DATABASE_URL=postgresql://classpulse_dispatch:${dispatcher}@127.0.0.1:55432/classpulse\n`,
    { mode: 0o600, flag: "wx" },
  );
  console.log(
    "Created private local development configuration. No credentials printed.",
  );
} else console.log("Existing configuration preserved.");

if (await missing(".local/retention.env")) {
  const adminConfig = parse(await readFile(".local/admin.env"));
  const url = new URL(adminConfig.ADMIN_DATABASE_URL!);
  url.username = "classpulse_retention";
  url.password = secret();
  await appendFile(".local/admin.env", `RETENTION_PASSWORD=${url.password}\n`, {
    mode: 0o600,
  });
  await writeFile(
    ".local/retention.env",
    `RETENTION_DATABASE_URL=${url.toString()}\n`,
    { mode: 0o600, flag: "wx" },
  );
  console.log(
    "Created separate private maintenance configuration. No credentials printed.",
  );
}
