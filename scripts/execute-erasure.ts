import { config } from "dotenv";
import { readFile } from "node:fs/promises";
import { executeErasure } from "../src/operations/erasure";
config({ path: ".local/retention.env", quiet: true });
if (!process.env.RETENTION_DATABASE_URL)
  throw Error(
    "Separate retention credentials required. The web/queue identity cannot execute erasure.",
  );
await executeErasure(
  process.env.RETENTION_DATABASE_URL,
  JSON.parse(await readFile(process.argv[2] ?? "", "utf8")),
);
console.log(
  "Reviewed live erasure completed. Replay tombstones during restore; provider and backup retention remain separate obligations.",
);
