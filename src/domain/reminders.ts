import { Temporal } from "@js-temporal/polyfill";
import type { Tx } from "@/platform/database";
import { tenantTransaction } from "@/platform/database";
import {
  memberContext,
  placementScope,
  requireModule,
  requirePermission,
} from "@/platform/policy";
import { sendMail } from "@/platform/mail";
import { config } from "@/platform/config";
export async function scheduleDigests(tx: Tx, tenantId: string) {
  const entity = await tx.legalEntity.findFirst({ where: { tenantId } });
  if (!entity) return;
  const local = Temporal.Now.zonedDateTimeISO(entity.timeZone);
  if (local.hour < 9) return;
  const day = local.toPlainDate().toString();
  const modules = await tx.moduleActivation.findMany({
    where: {
      tenantId,
      moduleKey: { in: ["agency.starts", "crm.accounts"] },
      state: "active",
    },
  });
  if (modules.length !== 2) return;
  const members = await tx.membership.findMany({
    where: {
      tenantId,
      status: "active",
      isExternal: false,
      principal: { state: "active" },
    },
  });
  for (const member of members) {
    const operationKey = `digest:${day}:${member.id}`;
    await tx.backgroundJob.upsert({
      where: { tenantId_operationKey: { tenantId, operationKey } },
      create: {
        tenantId,
        operationKey,
        jobType: "digest.send",
        moduleKey: "agency.starts",
        resourceType: "membership",
        resourceId: member.id,
        principalId: member.id,
        state: "queued",
        availableAt: new Date(),
      },
      update: {},
    });
  }
}
export async function deliverDigest(tenantId: string, jobId: string) {
  const delivery = await tenantTransaction(tenantId, async (tx) => {
    const job = await tx.backgroundJob.findUniqueOrThrow({
      where: { tenantId_id: { tenantId, id: jobId } },
    });
    const old = await tx.notificationDelivery.findUnique({
      where: {
        tenantId_operationKey: { tenantId, operationKey: job.operationKey },
      },
    });
    if (old) return null;
    return tx.notificationDelivery.create({
      data: {
        tenantId,
        jobId,
        recipientId: job.principalId,
        operationKey: job.operationKey,
        channel: "email",
        state: "sending",
        attemptedAt: new Date(),
      },
    });
  });
  if (!delivery) return;
  try {
    await tenantTransaction(tenantId, async (tx) => {
      await tx.$queryRaw`SELECT id FROM tenant WHERE id=${tenantId}::uuid FOR SHARE`;
      const ctx = await memberContext(tx, tenantId, delivery.recipientId);
      requireModule(ctx, "agency.starts", true);
      requirePermission(ctx, "placements.read");
      const count = await tx.placementTask.count({
        where: {
          tenantId,
          ownerId: ctx.memberId,
          required: true,
          dueAt: { lt: new Date() },
          state: { notIn: ["completed", "waived"] },
          placement: {
            AND: [
              placementScope(ctx),
              { status: { notIn: ["started", "canceled"] } },
            ],
          },
        },
      });
      const reference = count
        ? await sendMail(
            ctx.email,
            "Your placement task digest",
            `You have ${count} overdue required placement task${count === 1 ? "" : "s"}. Sign in to review current assigned work: ${config().APP_URL}/workspace\n\nThis daily digest contains no candidate or client names.`,
          )
        : null;
      await tx.notificationDelivery.update({
        where: { tenantId_id: { tenantId, id: delivery.id } },
        data: {
          state: count ? "accepted_by_provider" : "suppressed_empty",
          providerReference: reference,
          version: { increment: 1 },
        },
      });
    });
  } catch (error) {
    await tenantTransaction(tenantId, async (tx) => {
      await tx.notificationDelivery.update({
        where: { tenantId_id: { tenantId, id: delivery.id } },
        data: { state: "needs_review", version: { increment: 1 } },
      });
    });
    throw error;
  }
}
