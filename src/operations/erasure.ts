import { randomUUID } from "node:crypto";
import { z } from "zod";
import pg from "pg";
import { hash, encrypt } from "@/platform/crypto";
import { removeArtifact } from "@/platform/storage";
export const erasureApproval = z
  .object({
    tenantId: z.uuid(),
    requestId: z.uuid(),
    subjectType: z.enum(["candidate", "contact"]),
    subjectId: z.uuid(),
    operatorReference: z.string().min(10).max(160),
    retentionDispositionReference: z.string().min(10).max(160),
    lawfulErasureReviewed: z.literal(true),
  })
  .strict();
export async function executeErasure(connectionString: string, input: unknown) {
  const a = erasureApproval.parse(input);
  const c = new pg.Client({
    connectionString,
    ssl: ["localhost", "127.0.0.1"].includes(new URL(connectionString).hostname)
      ? false
      : { rejectUnauthorized: true },
  });
  await c.connect();
  let manifest: { objectKey: string; version: string }[] = [],
    eventId: string | undefined;
  async function begin() {
    await c.query("BEGIN");
    await c.query("SET LOCAL ROLE app_retention");
    await c.query("SELECT set_config('app.tenant_id',$1,true)", [a.tenantId]);
    await c.query("SELECT id FROM tenant WHERE id=$1 FOR UPDATE", [a.tenantId]);
  }
  try {
    await begin();
    const request = (
      await c.query(
        "SELECT * FROM privacy_request WHERE tenant_id=$1 AND id=$2 FOR UPDATE",
        [a.tenantId, a.requestId],
      )
    ).rows[0];
    if (
      !request ||
      request.subject_reference_hash !==
        hash(a.subjectType + ":" + a.subjectId) ||
      !request.verified_at
    )
      throw Error("Verified request and subject do not match");
    if (request.state === "completed") {
      await c.query("ROLLBACK");
      return;
    }
    if (
      !["verified_pending_review", "erased_pending_storage"].includes(
        request.state,
      )
    )
      throw Error("Request is not ready for reviewed erasure");
    if (
      (
        await c.query(
          "SELECT id FROM legal_hold WHERE tenant_id=$1 AND released_at IS NULL",
          [a.tenantId],
        )
      ).rowCount
    )
      throw Error(
        "Active legal hold blocks this maintenance workflow. A scoped legal review is required.",
      );
    if (request.state === "verified_pending_review") {
      if (a.subjectType === "candidate") {
        const subject = await c.query(
          "SELECT id FROM candidate WHERE tenant_id=$1 AND id=$2",
          [a.tenantId, a.subjectId],
        );
        if (!subject.rowCount) throw Error("Candidate unavailable");
        if (
          (
            await c.query(
              "SELECT id FROM placement WHERE tenant_id=$1 AND candidate_id=$2 AND status NOT IN ('started','canceled')",
              [a.tenantId, a.subjectId],
            )
          ).rowCount
        )
          throw Error("Active placement blocks this workflow");
        await c.query(
          "UPDATE candidate SET display_name='Erased person',work_email=NULL,source_profile='privacy-erased',source_key=$3,version=version+1 WHERE tenant_id=$1 AND id=$2",
          [a.tenantId, a.subjectId, randomUUID()],
        );
        await c.query(
          "UPDATE placement_task SET label='Erased placement task',completion_evidence_reference=CASE WHEN completion_evidence_reference IS NULL THEN NULL ELSE '[erased]' END,waiver_reason=CASE WHEN waiver_reason IS NULL THEN NULL ELSE '[erased]' END,version=version+1 WHERE tenant_id=$1 AND placement_id IN (SELECT id FROM placement WHERE tenant_id=$1 AND candidate_id=$2)",
          [a.tenantId, a.subjectId],
        );
        for (const table of [
          "placement_transition",
          "placement_date_revision",
          "readiness_decision",
        ])
          await c.query(
            `DELETE FROM ${pg.escapeIdentifier(table)} WHERE tenant_id=$1 AND placement_id IN (SELECT id FROM placement WHERE tenant_id=$1 AND candidate_id=$2)`,
            [a.tenantId, a.subjectId],
          );
        await c.query(
          "UPDATE placement SET source_profile='privacy-erased',source_key=id::text,version=version+1 WHERE tenant_id=$1 AND candidate_id=$2",
          [a.tenantId, a.subjectId],
        );
      } else {
        if (
          !(
            await c.query(
              "SELECT id FROM contact WHERE tenant_id=$1 AND id=$2",
              [a.tenantId, a.subjectId],
            )
          ).rowCount
        )
          throw Error("Contact unavailable");
        const links = (
          await c.query(
            "SELECT membership_id FROM contact_membership_link WHERE tenant_id=$1 AND contact_id=$2",
            [a.tenantId, a.subjectId],
          )
        ).rows;
        for (const link of links) {
          if (
            (
              await c.query(
                "SELECT id FROM membership WHERE tenant_id=$1 AND id=$2 AND is_external=false",
                [a.tenantId, link.membership_id],
              )
            ).rowCount
          )
            throw Error(
              "Internal member requires a separate employment-retention review",
            );
          await c.query(
            "UPDATE principal SET state='erased',issuer='privacy-erased',subject=id::text,version=version+1 WHERE tenant_id=$1 AND id=(SELECT principal_id FROM membership WHERE tenant_id=$1 AND id=$2)",
            [a.tenantId, link.membership_id],
          );
          await c.query(
            "UPDATE membership SET status='inactive',display_name='Erased participant',work_email=$3,membership_revision=membership_revision+1,version=version+1 WHERE tenant_id=$1 AND id=$2",
            [a.tenantId, link.membership_id, randomUUID() + "@example.invalid"],
          );
          await c.query(
            "UPDATE session SET revoked_at=now(),version=version+1 WHERE tenant_id=$1 AND membership_id=$2 AND revoked_at IS NULL",
            [a.tenantId, link.membership_id],
          );
          await c.query(
            "UPDATE placement_task SET completion_evidence_reference=CASE WHEN completion_evidence_reference IS NULL THEN NULL ELSE '[erased]' END,waiver_reason=CASE WHEN waiver_reason IS NULL THEN NULL ELSE '[erased]' END,version=version+1 WHERE tenant_id=$1 AND completed_by_id=$2",
            [a.tenantId, link.membership_id],
          );
        }
        await c.query(
          "UPDATE invitation SET recipient_ciphertext=$3,email_hash=$4,token_hash=$5,revoked_at=now(),version=version+1 WHERE tenant_id=$1 AND contact_id=$2",
          [
            a.tenantId,
            a.subjectId,
            encrypt("erased"),
            hash(randomUUID()),
            hash(randomUUID()),
          ],
        );
        await c.query(
          "UPDATE participant_grant SET revoked_at=now(),version=version+1 WHERE tenant_id=$1 AND contact_id=$2 AND revoked_at IS NULL",
          [a.tenantId, a.subjectId],
        );
        await c.query(
          "UPDATE contact SET display_name='Erased contact',work_email=NULL,work_phone=NULL,version=version+1 WHERE tenant_id=$1 AND id=$2",
          [a.tenantId, a.subjectId],
        );
      }
      manifest = (
        await c.query(
          'SELECT object_key AS "objectKey",object_version AS version FROM export_artifact WHERE tenant_id=$1',
          [a.tenantId],
        )
      ).rows;
      manifest.push(
        ...(
          await c.query(
            "SELECT staging_object_key AS \"objectKey\",'unversioned' AS version FROM import_batch WHERE tenant_id=$1",
            [a.tenantId],
          )
        ).rows,
      );
      eventId = randomUUID();
      await c.query(
        "INSERT INTO outbox_event(id,tenant_id,version,updated_at,event_type,schema_version,aggregate_type,aggregate_id,aggregate_version,occurred_at,correlation_id,payload) VALUES($1,$2,1,now(),'privacy.artifacts.pending_delete',1,'privacy_request',$3,1,now(),$4,$5)",
        [
          eventId,
          a.tenantId,
          a.requestId,
          randomUUID(),
          JSON.stringify(manifest),
        ],
      );
      await c.query(
        "UPDATE tenant SET data_revision=data_revision+1 WHERE id=$1",
        [a.tenantId],
      );
      await c.query(
        "UPDATE report_run SET snapshot_id=NULL,state='privacy_invalidated',version=version+1 WHERE tenant_id=$1 AND snapshot_id IS NOT NULL",
        [a.tenantId],
      );
      for (const table of [
        "download_grant",
        "export_artifact",
        "report_result_row",
        "report_metric_binding",
        "report_snapshot",
        "import_error",
        "import_batch",
      ])
        await c.query(
          `DELETE FROM ${pg.escapeIdentifier(table)} WHERE tenant_id=$1`,
          [a.tenantId],
        );
      await c.query(
        "UPDATE privacy_request SET state='erased_pending_storage',version=version+1 WHERE tenant_id=$1 AND id=$2",
        [a.tenantId, a.requestId],
      );
      await c.query(
        "INSERT INTO deletion_tombstone(id,tenant_id,version,updated_at,record_type,record_id,deleted_at_event,reason_code) VALUES($1,$2,1,now(),$3,$4,now(),'verified_erasure')",
        [randomUUID(), a.tenantId, a.subjectType, a.subjectId],
      );
      await c.query(
        "INSERT INTO audit_event(id,tenant_id,version,updated_at,action,resource_type,resource_id,occurred_at,correlation_id,membership_revision,entitlement_revision,redacted_changes) SELECT $1,id,1,now(),'privacy.erased','privacy_request',$2,now(),$3,0,entitlement_revision,$4 FROM tenant WHERE id=$5",
        [
          randomUUID(),
          a.requestId,
          randomUUID(),
          JSON.stringify({
            operatorReference: a.operatorReference,
            retentionDispositionReference: a.retentionDispositionReference,
          }),
          a.tenantId,
        ],
      );
    } else {
      const e = (
        await c.query(
          "SELECT id,payload FROM outbox_event WHERE tenant_id=$1 AND aggregate_id=$2 AND event_type='privacy.artifacts.pending_delete' AND dispatched_at IS NULL",
          [a.tenantId, a.requestId],
        )
      ).rows[0];
      if (!e) throw Error("Cleanup manifest unavailable");
      eventId = e.id;
      manifest = z
        .array(z.object({ objectKey: z.string(), version: z.string() }))
        .parse(e.payload);
    }
    await c.query("COMMIT");
    for (const object of manifest)
      await removeArtifact(object.objectKey, object.version);
    await begin();
    await c.query(
      "UPDATE privacy_request SET state='completed',completed_at=now(),version=version+1 WHERE tenant_id=$1 AND id=$2 AND state='erased_pending_storage'",
      [a.tenantId, a.requestId],
    );
    await c.query(
      "UPDATE outbox_event SET dispatched_at=now(),version=version+1 WHERE tenant_id=$1 AND id=$2",
      [a.tenantId, eventId],
    );
    await c.query("COMMIT");
  } catch (error) {
    await c.query("ROLLBACK");
    throw error;
  } finally {
    await c.end();
  }
}
