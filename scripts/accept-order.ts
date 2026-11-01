import { config } from "dotenv";
import { readFile } from "node:fs/promises";
import { acceptOrder } from "../src/operations/commercial";
config({ path: ".local/admin.env", quiet: true });
const url = process.env.BILLING_DATABASE_URL ?? process.env.ADMIN_DATABASE_URL;
if (
  !url ||
  (process.env.APP_ENV === "production" && !process.env.BILLING_DATABASE_URL)
)
  throw Error("Separate billing task credentials required in production");
await acceptOrder(
  url,
  JSON.parse(await readFile(process.argv[2] ?? "", "utf8")),
);
console.log(
  "Reviewed subscription change applied atomically; existing records and module state retained.",
);
