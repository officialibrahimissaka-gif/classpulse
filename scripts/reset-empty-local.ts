import { config } from "dotenv";
import { Client } from "pg";
config({ path: ".local/admin.env", quiet: true });
const url = process.env.ADMIN_DATABASE_URL!;
if (new URL(url).hostname !== "127.0.0.1") throw Error("Local databases only");
const c = new Client({ connectionString: url });
await c.connect();
const exists = await c.query("SELECT to_regclass('tenant') AS name");
const count = exists.rows[0].name
  ? await c.query("SELECT count(*) FROM tenant")
  : { rows: [{ count: 0 }] };
if (Number(count.rows[0].count) !== 0)
  throw Error("Refusing to reset a populated workspace");
await c.query(
  "DROP SCHEMA public CASCADE; DROP SCHEMA IF EXISTS control CASCADE; DROP SCHEMA IF EXISTS app CASCADE; CREATE SCHEMA public",
);
await c.end();
