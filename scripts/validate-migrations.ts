import { config } from "dotenv";
import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import pg from "pg";
config({ path: ".local/admin.env", quiet: true });
const source = process.env.ADMIN_DATABASE_URL;
if (!source || new URL(source).hostname !== "127.0.0.1")
  throw Error(
    "Migration replay requires a local disposable PostgreSQL instance",
  );
const url = new URL(source),
  name = "classpulse_check_" + randomUUID().replaceAll("-", "");
url.pathname = "/postgres";
const admin = new pg.Client({ connectionString: url.toString() });
await admin.connect();
try {
  await admin.query(`CREATE DATABASE ${pg.escapeIdentifier(name)}`);
  url.pathname = "/" + name;
  const env = { ...process.env, DATABASE_URL: url.toString() };
  for (const args of [
    ["migrate", "deploy"],
    [
      "migrate",
      "diff",
      "--from-config-datasource",
      "--to-schema",
      "prisma/r1/schema.prisma",
      "--exit-code",
    ],
  ]) {
    const result = spawnSync("node_modules/.bin/prisma", args, {
      env,
      stdio: "inherit",
    });
    if (result.status !== 0)
      throw Error("Migration replay or schema-drift validation failed");
  }
  const db = new pg.Client({ connectionString: url.toString() });
  await db.connect();
  try {
    const result = await db.query(
      "SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename<>'_prisma_migrations' AND NOT(rowsecurity AND (SELECT relforcerowsecurity FROM pg_class WHERE oid=(quote_ident(schemaname)||'.'||quote_ident(tablename))::regclass))",
    );
    if (result.rowCount) throw Error("A customer table lacks forced RLS");
  } finally {
    await db.end();
  }
  console.log(
    "Fresh migration replay, schema drift, and FORCE RLS checks passed.",
  );
} finally {
  await admin.query(
    `DROP DATABASE IF EXISTS ${pg.escapeIdentifier(name)} WITH (FORCE)`,
  );
  await admin.end();
}
