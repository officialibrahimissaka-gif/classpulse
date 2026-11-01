import { scheduleDigests, deliverDigest } from "@/domain/reminders";
import { Queue, Worker } from "bullmq";
import { Pool } from "pg";
import { config as dotenv } from "dotenv";
import { config } from "./config";
import { tenantTransaction } from "./database";
import {
  memberContext,
  requireModule,
  requirePermission,
  placementScope,
} from "./policy";
import { check } from "./errors";
import { decrypt } from "./crypto";
import { invitationSecret } from "@/domain/collaboration";
import { generateExport } from "@/domain/exports";
import { sendMail } from "./mail";
function connection() {
  const url = new URL(config().REDIS_URL);
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    db: Number(url.pathname.slice(1) || 0),
    password: url.password || undefined,
    ...(url.protocol === "rediss:"
      ? { tls: { rejectUnauthorized: true } }
      : {}),
  };
}
export async function deliverInvitation(tenantId: string, id: string) {
  // Commit a durable intent before making an external call. Unknown outcomes never automatically resend.
  const reserved = await tenantTransaction(tenantId, async (tx) => {
    await tx.$queryRaw`SELECT id FROM tenant WHERE id=${tenantId}::uuid FOR SHARE`;
    const rows = await tx.$queryRaw<
      { id: string }[]
    >`UPDATE invitation_delivery SET state='sending',attempted_at=now(),version=version+1 WHERE tenant_id=${tenantId}::uuid AND invitation_id=${id}::uuid AND state='queued' RETURNING id`;
    return rows[0]?.id;
  });
  if (!reserved) {
    const row = await tenantTransaction(tenantId, (tx) =>
      tx.invitationDelivery.findUnique({
        where: { tenantId_invitationId: { tenantId, invitationId: id } },
      }),
    );
    return row?.state ?? "needs_review";
  }
  try {
    await tenantTransaction(tenantId, async (tx) => {
      await tx.$queryRaw`SELECT id FROM tenant WHERE id=${tenantId}::uuid FOR SHARE`;
      const invite = await tx.invitation.findUniqueOrThrow({
        where: { tenantId_id: { tenantId, id } },
      });
      check(
        !invite.revokedAt &&
          !invite.acceptedAt &&
          invite.expiresAt > new Date(),
        409,
        "INVITATION_CLOSED",
        "Invitation closed",
      );
      const ctx = await memberContext(tx, tenantId, invite.inviterId);
      requireModule(
        ctx,
        invite.scopeType === "tenant" ? "platform.core" : "agency.starts",
        true,
      );
      requirePermission(
        ctx,
        invite.scopeType === "tenant" ? "roles.manage" : "participants.manage",
      );
      if (invite.scopeType !== "tenant")
        check(
          await tx.placement.findFirst({
            where: {
              AND: [
                placementScope(ctx, "participants.manage"),
                { id: invite.placementId! },
              ],
            },
          }),
          403,
          "ACCESS_CHANGED",
          "Inviter no longer has placement access.",
        );
      const fragment = new URLSearchParams({
        tenantId,
        invitationId: id,
        secret: invitationSecret(tenantId, id),
      }).toString();
      const reference = await sendMail(
        decrypt(invite.recipientCiphertext),
        "Your placement coordination invitation",
        `Your agency has invited you to its placement coordination workspace.\n\nOpen ${config().APP_URL}/invite#${fragment}\n\nSign in with the invited email address. The invitation expires ${invite.expiresAt.toISOString()}. No readiness or employment decision is automated.`,
      );
      await tx.invitationDelivery.update({
        where: { tenantId_id: { tenantId, id: reserved } },
        data: {
          state: "accepted_by_provider",
          providerReference: reference,
          version: { increment: 1 },
        },
      });
    });
    return "accepted_by_provider";
  } catch (error) {
    await tenantTransaction(tenantId, async (tx) => {
      await tx.invitationDelivery.update({
        where: { tenantId_id: { tenantId, id: reserved } },
        data: { state: "needs_review", version: { increment: 1 } },
      });
    });
    throw error;
  }
}
export async function runWorker() {
  dotenv({ path: ".local/worker.env", quiet: true });
  const url = process.env.DISPATCH_DATABASE_URL;
  check(
    url,
    503,
    "DISPATCH_NOT_CONFIGURED",
    "Worker directory credentials required",
  );
  const local = ["localhost", "127.0.0.1"].includes(new URL(url).hostname);
  const directory = new Pool({
    connectionString: url,
    ssl: local ? false : { rejectUnauthorized: true },
    max: 1,
  });
  const queue = new Queue("classpulse-jobs", { connection: connection() });
  const worker = new Worker<{ tenantId: string; jobId: string }>(
    "classpulse-jobs",
    async (job) => {
      const { tenantId, jobId } = job.data;
      const record = await tenantTransaction(tenantId, (tx) =>
        tx.backgroundJob.findUniqueOrThrow({
          where: { tenantId_id: { tenantId, id: jobId } },
        }),
      );
      if (record.state === "completed" || record.state === "needs_review")
        return;
      try {
        if (record.jobType === "digest.send") {
          const state = await deliverDigest(tenantId, jobId);
          check(
            state === "accepted_by_provider" || state === "suppressed_empty",
            409,
            "DELIVERY_REVIEW_REQUIRED",
            "Digest outcome requires review",
          );
        } else if (record.jobType === "report.generate")
          await generateExport(tenantId, record.resourceId);
        else {
          const state = await deliverInvitation(tenantId, record.resourceId);
          check(
            state === "accepted_by_provider",
            409,
            "DELIVERY_REVIEW_REQUIRED",
            "Delivery outcome requires review",
          );
        }
        if (record.jobType === "report.generate") {
          const run = await tenantTransaction(tenantId, (tx) =>
            tx.reportRun.findUniqueOrThrow({
              where: { tenantId_id: { tenantId, id: record.resourceId } },
            }),
          );
          check(
            run.state === "ready",
            409,
            "REPORT_REVIEW_REQUIRED",
            "Report generation requires review",
          );
        }
        await tenantTransaction(tenantId, async (tx) => {
          await tx.backgroundJob.update({
            where: { tenantId_id: { tenantId, id: jobId } },
            data: {
              state: "completed",
              attemptCount: { increment: 1 },
              version: { increment: 1 },
            },
          });
        });
      } catch {
        await tenantTransaction(tenantId, async (tx) => {
          if (record.jobType === "report.generate")
            await tx.reportRun.updateMany({
              where: {
                tenantId,
                id: record.resourceId,
                state: { not: "ready" },
              },
              data: {
                state: "failed",
                errorCode: "REPORT_REVIEW_REQUIRED",
                version: { increment: 1 },
              },
            });
          await tx.backgroundJob.update({
            where: { tenantId_id: { tenantId, id: jobId } },
            data: {
              state: "needs_review",
              lastErrorCode: "DELIVERY_REVIEW_REQUIRED",
              attemptCount: { increment: 1 },
              version: { increment: 1 },
            },
          });
        });
      }
    },
    { connection: connection(), concurrency: 4 },
  );
  let stopped = false;
  async function poll() {
    const tenants = await directory.query<{ tenant_id: string }>(
      "SELECT tenant_id FROM control.directory",
    );
    for (const { tenant_id: tenantId } of tenants.rows) {
      const jobs = await tenantTransaction(tenantId, async (tx) => {
        await scheduleDigests(tx, tenantId);
        const events = await tx.outboxEvent.findMany({
          where: {
            tenantId,
            eventType: "collaboration.invitation.requested",
            dispatchedAt: null,
          },
          take: 100,
        });
        for (const event of events) {
          const invitation = await tx.invitation.findUniqueOrThrow({
            where: { tenantId_id: { tenantId, id: event.aggregateId } },
          });
          await tx.backgroundJob.upsert({
            where: {
              tenantId_operationKey: {
                tenantId,
                operationKey: "invite:" + invitation.id,
              },
            },
            create: {
              tenantId,
              operationKey: "invite:" + invitation.id,
              jobType: "invitation.send",
              moduleKey: "agency.starts",
              resourceType: "invitation",
              resourceId: invitation.id,
              state: "queued",
              availableAt: new Date(),
              principalId: invitation.inviterId,
            },
            update: {},
          });
          await tx.outboxEvent.update({
            where: { tenantId_id: { tenantId, id: event.id } },
            data: { dispatchedAt: new Date(), version: { increment: 1 } },
          });
        }
        return tx.backgroundJob.findMany({
          where: {
            tenantId,
            state: "queued",
            availableAt: { lte: new Date() },
          },
          take: 100,
        });
      });
      for (const job of jobs)
        await queue.add(
          "invitation",
          { tenantId, jobId: job.id },
          { jobId: job.id, removeOnComplete: 100, removeOnFail: 100 },
        );
    }
  }
  worker.on("error", () =>
    console.error("Worker transport error; no payload logged."),
  );
  const timer = setInterval(() => {
    if (!stopped)
      void poll().catch(() =>
        console.error("Worker poll failed; no payload logged."),
      );
  }, 5000);
  await poll();
  const close = async () => {
    stopped = true;
    clearInterval(timer);
    await worker.close();
    await queue.close();
    await directory.end();
  };
  return close;
}
