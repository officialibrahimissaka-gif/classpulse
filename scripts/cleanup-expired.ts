import { config as dotenv } from "dotenv";
import { z } from "zod";
import pg from "pg";
import { removeArtifact } from "../src/platform/storage";
dotenv({ path: ".local/retention.env", quiet: true });
const tenantId = z.uuid().parse(process.argv[2]);
const url = process.env.RETENTION_DATABASE_URL;
if (!url) throw Error("Separate maintenance credentials required");
const c = new pg.Client({
  connectionString: url,
  ssl: ["localhost", "127.0.0.1"].includes(new URL(url).hostname)
    ? false
    : { rejectUnauthorized: true },
});
await c.connect();
let removed = 0;
try {
  await c.query("BEGIN");
  await c.query("SET LOCAL ROLE app_retention");
  await c.query("SELECT set_config('app.tenant_id',$1,true)", [tenantId]);
  await c.query("SELECT id FROM tenant WHERE id=$1 FOR UPDATE", [tenantId]);
  if (
    (
      await c.query(
        "SELECT id FROM legal_hold WHERE tenant_id=$1 AND released_at IS NULL",
        [tenantId],
      )
    ).rowCount
  )
    throw Error("Active legal hold: no cleanup performed");
  const artifacts = (
    await c.query(
      "SELECT id,object_key,object_version FROM export_artifact WHERE tenant_id=$1 AND expires_at<now()",
      [tenantId],
    )
  ).rows;
  for (const a of artifacts) {
    await removeArtifact(a.object_key, a.object_version);
    await c.query(
      "DELETE FROM download_grant WHERE tenant_id=$1 AND artifact_id=$2",
      [tenantId, a.id],
    );
    await c.query("DELETE FROM export_artifact WHERE tenant_id=$1 AND id=$2", [
      tenantId,
      a.id,
    ]);
    removed++;
  }
  const snapshots = (
    await c.query(
      "SELECT id FROM report_snapshot s WHERE tenant_id=$1 AND expires_at<now() AND NOT EXISTS(SELECT 1 FROM export_artifact a WHERE a.tenant_id=s.tenant_id AND a.snapshot_id=s.id)",
      [tenantId],
    )
  ).rows;
  for (const s of snapshots) {
    await c.query(
      "UPDATE report_run SET snapshot_id=NULL,state='expired',version=version+1 WHERE tenant_id=$1 AND snapshot_id=$2",
      [tenantId, s.id],
    );
    await c.query(
      "DELETE FROM report_result_row WHERE tenant_id=$1 AND snapshot_id=$2",
      [tenantId, s.id],
    );
    await c.query(
      "DELETE FROM report_metric_binding WHERE tenant_id=$1 AND snapshot_id=$2",
      [tenantId, s.id],
    );
    await c.query("DELETE FROM report_snapshot WHERE tenant_id=$1 AND id=$2", [
      tenantId,
      s.id,
    ]);
  }
  const imports = (
    await c.query(
      "SELECT id,staging_object_key FROM import_batch WHERE tenant_id=$1 AND expires_at<now()",
      [tenantId],
    )
  ).rows;
  for (const b of imports) {
    await removeArtifact(b.staging_object_key, "unversioned");
    await c.query(
      "DELETE FROM import_error WHERE tenant_id=$1 AND batch_id=$2",
      [tenantId, b.id],
    );
    await c.query("DELETE FROM import_batch WHERE tenant_id=$1 AND id=$2", [
      tenantId,
      b.id,
    ]);
    removed++;
  }
  await c.query("COMMIT");
  console.log(
    `Removed ${removed} expired private artifacts/staging objects from the explicitly selected tenant.`,
  );
} catch (error) {
  await c.query("ROLLBACK");
  throw error;
} finally {
  await c.end();
}
