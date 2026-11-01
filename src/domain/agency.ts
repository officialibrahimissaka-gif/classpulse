import { z } from "zod";
import { Temporal } from "@js-temporal/polyfill";
import type { Tx } from "@/platform/database";
import {
  type Context,
  clientScope,
  placementScope,
  requireModule,
  requirePermission,
} from "@/platform/policy";
import { check } from "@/platform/errors";
import {
  allocate,
  audit,
  event,
  release,
  expectedVersion,
  command,
} from "@/platform/commands";
export const dateSchema = z.iso.date().refine((v) => {
  try {
    Temporal.PlainDate.from(v);
    return true;
  } catch {
    return false;
  }
});
const text = z.string().trim().min(1).max(200);
export const clientSchema = z
  .object({
    code: z.string().trim().min(1).max(60),
    name: text,
    entityId: z.uuid().optional(),
  })
  .strict();
export const placementSchema = z
  .object({
    clientId: z.uuid(),
    candidateName: text,
    candidateKey: z.string().trim().min(1).max(160),
    sourceProfile: z.string().trim().min(1).max(80),
    sourceKey: z.string().trim().min(1).max(160),
    acceptedOn: dateSchema,
    plannedStart: dateSchema,
  })
  .strict()
  .refine(
    (d) => d.plannedStart >= d.acceptedOn,
    "Start cannot precede acceptance",
  );
export function dueInstant(
  date: string,
  offset: number,
  time: string,
  zone: string,
) {
  return new Date(
    Temporal.PlainDate.from(date)
      .add({ days: offset })
      .toPlainDateTime(Temporal.PlainTime.from(time))
      .toZonedDateTime(zone, { disambiguation: "reject" }).epochMilliseconds,
  );
}
export const pageSchema = z
  .object({
    after: z.uuid().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(100),
  })
  .strict();
export async function listClients(
  tx: Tx,
  ctx: Context,
  page: { after?: string; limit: number } = { limit: 100 },
) {
  requireModule(ctx, "crm.accounts");
  requirePermission(ctx, "accounts.read");
  return tx.clientAccount.findMany({
    where: {
      AND: [clientScope(ctx), page.after ? { id: { gt: page.after } } : {}],
    },
    select: { id: true, name: true, accountCode: true, version: true },
    orderBy: { id: "asc" },
    take: page.limit,
  });
}
export async function createClient(
  tx: Tx,
  ctx: Context,
  request: Request,
  input: unknown,
) {
  requireModule(ctx, "crm.accounts", true);
  requirePermission(ctx, "accounts.write");
  check(!ctx.external, 403, "FORBIDDEN", "Internal access required");
  const data = clientSchema.parse(input);
  return command(tx, ctx, request, "accounts.create", data, async () => {
    const entity = await tx.legalEntity.findFirstOrThrow({
      where: {
        tenantId: ctx.tenantId,
        ...(data.entityId ? { id: data.entityId } : {}),
      },
    });
    const row = await tx.clientAccount.create({
      data: {
        tenantId: ctx.tenantId,
        accountCode: data.code,
        name: data.name,
        status: "active",
        entityId: entity.id,
        ownerId: ctx.memberId,
      },
    });
    await audit(tx, ctx, "account.created", "client_account", row.id);
    return { id: row.id, version: row.version };
  });
}
export async function listPlacements(
  tx: Tx,
  ctx: Context,
  page: { after?: string; limit: number } = { limit: 100 },
) {
  requireModule(ctx, "agency.starts");
  requirePermission(ctx, "placements.read");
  check(!ctx.external, 403, "FORBIDDEN", "Use the shared placement portal.");
  return tx.placement.findMany({
    where: {
      AND: [placementScope(ctx), page.after ? { id: { gt: page.after } } : {}],
    },
    select: {
      id: true,
      status: true,
      timeZone: true,
      originalPlannedStart: true,
      currentPlannedStart: true,
      actualStart: true,
      version: true,
      candidate: { select: { displayName: true } },
      client: { select: { name: true } },
      fromPlacementTask_placement: {
        select: { state: true, required: true, dueAt: true },
      },
    },
    orderBy: { id: "asc" },
    take: page.limit,
  });
}
export async function detail(tx: Tx, ctx: Context, id: string) {
  requireModule(ctx, "agency.starts");
  requirePermission(ctx, "placements.read");
  check(!ctx.external, 403, "FORBIDDEN", "Use the shared placement portal.");
  const row = await tx.placement.findFirst({
    where: { AND: [placementScope(ctx), { id }] },
    include: {
      candidate: true,
      client: true,
      fromPlacementTask_placement: { orderBy: { dueAt: "asc" } },
      fromPlacementException_placement: true,
      fromPlacementTransition_placement: { orderBy: { occurredAt: "asc" } },
    },
  });
  check(row, 404, "NOT_FOUND", "Placement unavailable");
  return row;
}
export async function createPlacement(
  tx: Tx,
  ctx: Context,
  request: Request,
  input: unknown,
) {
  requireModule(ctx, "agency.starts", true);
  requirePermission(ctx, "placements.write");
  check(!ctx.external, 403, "FORBIDDEN", "Internal access required");
  const data = placementSchema.parse(input);
  return command(tx, ctx, request, "placements.create", data, async () => {
    const client = await tx.clientAccount.findFirst({
      where: {
        AND: [clientScope(ctx), { id: data.clientId, status: "active" }],
      },
    });
    check(
      client,
      404,
      "CLIENT_UNAVAILABLE",
      "Choose an accessible active client.",
    );
    const entity = await tx.legalEntity.findUniqueOrThrow({
      where: { tenantId_id: { tenantId: ctx.tenantId, id: client.entityId } },
    });
    const template = await tx.templateVersion.findFirstOrThrow({
      where: {
        tenantId: ctx.tenantId,
        state: "published",
        template: { moduleKey: "agency.starts" },
      },
      orderBy: { revision: "desc" },
      include: { fromTaskDefinition_templateVersion: true },
    });
    await allocate(tx, ctx, "active_placements", 1);
    let candidate = await tx.candidate.findUnique({
      where: {
        tenantId_sourceProfile_sourceKey: {
          tenantId: ctx.tenantId,
          sourceProfile: data.sourceProfile,
          sourceKey: data.candidateKey,
        },
      },
    });
    if (candidate)
      check(
        candidate.displayName === data.candidateName,
        409,
        "SOURCE_CONFLICT",
        "This source candidate has different values. Review the source record.",
      );
    else
      candidate = await tx.candidate.create({
        data: {
          tenantId: ctx.tenantId,
          displayName: data.candidateName,
          sourceProfile: data.sourceProfile,
          sourceKey: data.candidateKey,
          ownerId: ctx.memberId,
        },
      });
    const row = await tx.placement.create({
      data: {
        tenantId: ctx.tenantId,
        acceptedOn: new Date(data.acceptedOn),
        originalPlannedStart: new Date(data.plannedStart),
        currentPlannedStart: new Date(data.plannedStart),
        timeZone: entity.timeZone,
        sourceProfile: data.sourceProfile,
        sourceKey: data.sourceKey,
        candidateId: candidate.id,
        clientId: client.id,
        entityId: entity.id,
        ownerId: ctx.memberId,
        templateVersionId: template.id,
      },
    });
    const milestone = await tx.milestone.create({
      data: {
        tenantId: ctx.tenantId,
        placementId: row.id,
        milestoneKey: "pre-start",
        label: "Before the first day",
        sortOrder: 0,
      },
    });
    await tx.placementTask.createMany({
      data: template.fromTaskDefinition_templateVersion.map((d) => ({
        tenantId: ctx.tenantId,
        placementId: row.id,
        milestoneId: milestone.id,
        definitionId: d.id,
        label: d.label,
        required: d.required,
        ownerId: ctx.memberId,
        dueAt: dueInstant(
          data.plannedStart,
          d.dueOffsetDays,
          d.dueTime,
          entity.timeZone,
        ),
      })),
    });
    await audit(tx, ctx, "placement.created", "placement", row.id);
    await event(tx, ctx, "agency.placement.created", "placement", row.id, 1);
    return { id: row.id, version: 1 };
  });
}
export const actionSchema = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("complete"),
      taskId: z.uuid(),
      evidence: z.string().trim().min(3).max(500),
    })
    .strict(),
  z
    .object({
      action: z.literal("waive"),
      taskId: z.uuid(),
      reason: z.string().trim().min(3).max(300),
    })
    .strict(),
  z.object({ action: z.literal("ready"), reason: text }).strict(),
  z
    .object({ action: z.literal("start"), date: dateSchema, reason: text })
    .strict(),
  z.object({ action: z.literal("cancel"), reason: text }).strict(),
  z.object({ action: z.literal("reopen"), reason: text }).strict(),
  z
    .object({ action: z.literal("reschedule"), date: dateSchema, reason: text })
    .strict(),
  z
    .object({
      action: z.literal("exception"),
      category: z.enum([
        "candidate",
        "client",
        "documentation",
        "scheduling",
        "other",
      ]),
    })
    .strict(),
  z
    .object({
      action: z.literal("resolve"),
      exceptionId: z.uuid(),
      reason: text,
    })
    .strict(),
]);
export async function act(
  tx: Tx,
  ctx: Context,
  request: Request,
  id: string,
  input: unknown,
) {
  requireModule(ctx, "agency.starts", true);
  check(
    !ctx.external,
    403,
    "FORBIDDEN",
    "Use assigned task actions in the client portal.",
  );
  const data = actionSchema.parse(input);
  requirePermission(
    ctx,
    ["ready", "start", "cancel", "reopen", "waive"].includes(data.action)
      ? "placements.decide"
      : data.action === "complete"
        ? "tasks.complete"
        : "placements.write",
  );
  return command(
    tx,
    ctx,
    request,
    "placements." + data.action,
    { id, ...data },
    async () => {
      await tx.$queryRaw`SELECT id FROM placement WHERE tenant_id=${ctx.tenantId}::uuid AND id=${id}::uuid FOR UPDATE`;
      const row = await tx.placement.findFirst({
        where: {
          AND: [
            placementScope(
              ctx,
              data.action === "complete"
                ? "placements.read"
                : hasDecision(data.action)
                  ? "placements.decide"
                  : "placements.write",
            ),
            { id },
          ],
        },
      });
      check(row, 404, "NOT_FOUND", "Placement unavailable");
      expectedVersion(request, row.version);
      const terminal = ["started", "canceled"].includes(row.status);
      check(
        data.action === "reopen" ? terminal : !terminal,
        409,
        "INVALID_TRANSITION",
        "This action is not available in the current state.",
      );
      let status = row.status,
        actualStart = row.actualStart;
      if (data.action === "complete" || data.action === "waive") {
        const task = await tx.placementTask.findFirst({
          where: { tenantId: ctx.tenantId, id: data.taskId, placementId: id },
        });
        check(
          task &&
            (data.action !== "complete" ||
              task.ownerId === ctx.memberId ||
              row.ownerId === ctx.memberId) &&
            !["completed", "waived"].includes(task.state),
          409,
          "TASK_UNAVAILABLE",
          "Task is already complete or unavailable.",
        );
        await tx.placementTask.update({
          where: { tenantId_id: { tenantId: ctx.tenantId, id: task.id } },
          data: {
            state: data.action === "complete" ? "completed" : "waived",
            completedAt: new Date(),
            completedById: ctx.memberId,
            completionEvidenceReference:
              data.action === "complete" ? data.evidence : null,
            waiverReason: data.action === "waive" ? data.reason : null,
            version: { increment: 1 },
          },
        });
        status = "in_progress";
      } else if (data.action === "exception") {
        await tx.placementException.create({
          data: {
            tenantId: ctx.tenantId,
            placementId: id,
            category: data.category,
            openedAt: new Date(),
            ownerId: ctx.memberId,
          },
        });
        status = "in_progress";
      } else if (data.action === "resolve") {
        const ex = await tx.placementException.findFirst({
          where: {
            tenantId: ctx.tenantId,
            id: data.exceptionId,
            placementId: id,
            state: "open",
          },
        });
        check(ex, 404, "NOT_FOUND", "Open exception unavailable");
        await tx.placementException.update({
          where: { tenantId_id: { tenantId: ctx.tenantId, id: ex.id } },
          data: {
            state: "closed",
            closedAt: new Date(),
            resolutionCode: data.reason.slice(0, 60),
            version: { increment: 1 },
          },
        });
      } else if (data.action === "reschedule") {
        check(
          data.date >= row.acceptedOn.toISOString().slice(0, 10),
          422,
          "INVALID_DATE",
          "Start cannot precede acceptance.",
        );
        await tx.placementDateRevision.create({
          data: {
            tenantId: ctx.tenantId,
            placementId: id,
            previousDate: row.currentPlannedStart,
            newDate: new Date(data.date),
            reasonCode: data.reason.slice(0, 60),
            changedAt: new Date(),
            actorId: ctx.memberId,
          },
        });
        const tasks = await tx.placementTask.findMany({
          where: {
            tenantId: ctx.tenantId,
            placementId: id,
            state: { notIn: ["completed", "waived"] },
          },
          include: { definition: true },
        });
        for (const t of tasks)
          await tx.placementTask.update({
            where: { tenantId_id: { tenantId: ctx.tenantId, id: t.id } },
            data: {
              dueAt: dueInstant(
                data.date,
                t.definition.dueOffsetDays,
                t.definition.dueTime,
                row.timeZone,
              ),
              version: { increment: 1 },
            },
          });
        await tx.placement.update({
          where: { tenantId_id: { tenantId: ctx.tenantId, id } },
          data: {
            currentPlannedStart: new Date(data.date),
            version: { increment: 1 },
            status: "in_progress",
          },
        });
        await audit(tx, ctx, "placement.rescheduled", "placement", id);
        return { id, version: row.version + 1, state: "in_progress" };
      } else if (data.action === "ready" || data.action === "start") {
        const incomplete = await tx.placementTask.count({
            where: {
              tenantId: ctx.tenantId,
              placementId: id,
              required: true,
              state: { notIn: ["completed", "waived"] },
            },
          }),
          exceptions = await tx.placementException.count({
            where: { tenantId: ctx.tenantId, placementId: id, state: "open" },
          });
        check(
          !incomplete && !exceptions,
          409,
          "NOT_READY",
          "Complete or explicitly waive required tasks and resolve exceptions first.",
        );
        if (data.action === "ready") {
          status = "ready";
          await tx.readinessDecision.create({
            data: {
              tenantId: ctx.tenantId,
              placementId: id,
              actorId: ctx.memberId,
              decision: "ready",
              reasonCode: data.reason.slice(0, 60),
              placementVersion: row.version,
              decidedAt: new Date(),
            },
          });
        } else {
          check(
            row.status === "ready",
            409,
            "REVIEW_REQUIRED",
            "A human readiness decision is required before confirming the start.",
          );
          const today = Temporal.Now.plainDateISO(row.timeZone).toString();
          check(
            data.date <= today &&
              data.date >= row.acceptedOn.toISOString().slice(0, 10),
            422,
            "INVALID_DATE",
            "Actual start must be between acceptance and today in the placement time zone.",
          );
          status = "started";
          actualStart = new Date(data.date);
          await release(tx, ctx, "active_placements");
        }
      } else if (data.action === "cancel") {
        status = "canceled";
        await release(tx, ctx, "active_placements");
      } else if (data.action === "reopen") {
        await allocate(tx, ctx, "active_placements", 1);
        status = "in_progress";
        actualStart = null;
      }
      const updated = await tx.placement.update({
        where: { tenantId_id: { tenantId: ctx.tenantId, id } },
        data: { status, actualStart, version: { increment: 1 } },
      });
      await tx.placementTransition.create({
        data: {
          tenantId: ctx.tenantId,
          placementId: id,
          actorId: ctx.memberId,
          fromStatus: row.status,
          toStatus: status,
          fromVersion: row.version,
          toVersion: updated.version,
          actualStart,
          previousActualStart: row.actualStart,
          reasonCode: "reason" in data ? data.reason.slice(0, 80) : data.action,
          occurredAt: new Date(),
        },
      });
      await audit(tx, ctx, "placement." + data.action, "placement", id, {
        from: row.status,
        to: status,
      });
      await event(
        tx,
        ctx,
        "agency.placement.changed",
        "placement",
        id,
        updated.version,
      );
      return { id, version: updated.version, state: status };
    },
  );
}
function hasDecision(action: string) {
  return ["ready", "start", "cancel", "reopen", "waive"].includes(action);
}
