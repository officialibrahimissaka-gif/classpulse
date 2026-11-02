import { readFile, writeFile } from "node:fs/promises";
import { createTestCheckout } from "../src/billing/paystack";
const [input, output] = process.argv.slice(2);
if (!input || !output || !process.env.PAYSTACK_SECRET_KEY)
  throw Error(
    "Private reviewed input/output paths and securely injected Paystack test key are required.",
  );
const checkout = await createTestCheckout(
  JSON.parse(await readFile(input, "utf8")),
  process.env.PAYSTACK_SECRET_KEY,
);
await writeFile(output, JSON.stringify(checkout), { mode: 0o600, flag: "wx" });
console.log(
  "Test checkout written to private file. No entitlement granted. Do not log the URL or blindly retry an ambiguous initialization.",
);
