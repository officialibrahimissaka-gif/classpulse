import { readFile } from "node:fs/promises";
import { syncPayment } from "../src/operations/billing";
const [path] = process.argv.slice(2);
if (
  !path ||
  !process.env.BILLING_IMPORT_DATABASE_URL ||
  !process.env.PAYSTACK_SECRET_KEY
)
  throw Error(
    "Private review file, dedicated billing-import URL and Paystack test secret required. Never supply keys in arguments.",
  );
await syncPayment(
  process.env.BILLING_IMPORT_DATABASE_URL,
  JSON.parse(await readFile(path, "utf8")),
  process.env.PAYSTACK_SECRET_KEY,
);
console.log(
  "Test provider observation reconciled; no entitlement or live payment changed.",
);
