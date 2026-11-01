import { config } from "dotenv";
import { spawnSync } from "node:child_process";
import pg from "pg";
config({ path: ".local/admin.env", quiet: true });
const url = process.env.ADMIN_DATABASE_URL;
if (!url)
  throw new Error("ADMIN_DATABASE_URL is required for the migration task only");
const result = spawnSync("node_modules/.bin/prisma", ["migrate", "deploy"], {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: url },
});
if (result.status !== 0) process.exit(result.status ?? 1);
const db = new pg.Client({ connectionString: url });
await db.connect();
try {
  for (const [user, password, role] of [
    ["classpulse_app", process.env.RUNTIME_PASSWORD, "app_runtime"],
    ["classpulse_dispatch", process.env.DISPATCH_PASSWORD, "app_dispatcher"],
    ["classpulse_retention", process.env.RETENTION_PASSWORD, "app_retention"],
  ]) {
    if (!password)
      throw new Error(
        "Missing local role password; never use the owner as the application login",
      );
    const existing = await db.query("SELECT 1 FROM pg_roles WHERE rolname=$1", [
      user,
    ]);
    if (!existing.rowCount)
      await db.query(
        `CREATE ROLE ${pg.escapeIdentifier(user!)} LOGIN PASSWORD ${pg.escapeLiteral(password)}`,
      );
    await db.query(
      `GRANT ${pg.escapeIdentifier(role!)} TO ${pg.escapeIdentifier(user!)}`,
    );
  }
} finally {
  await db.end();
}
