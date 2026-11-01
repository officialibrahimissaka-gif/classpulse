import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Tx } from "@/platform/database";
import {
  type Context,
  requirePermission,
  requireFreshMfa,
  requireModule,
  placementScope,
} from "@/platform/policy";
import {
  expectedVersion,
  audit,
  command,
  event,
  release,
} from "@/platform/commands";
import { hash, encrypt } from "@/platform/crypto";
import { check } from "@/platform/errors";
import { invitationSecret } from "./collaboration";
export async function internalInvite(
  tx: Tx,
  ctx: Context,
  request: Request,
  input: unknown,
) {
  requirePermission(ctx, "roles.manage");
  requireFreshMfa(ctx);
  const data = z
    .object({
      name: z.string().trim().min(1).max(200),
      email: z
        .email()
        .max(320)
        .transform((v) => v.toLowerCase()),
      role: z.enum(["owner", "recruiter"]),
    })
    .strict()
    .parse(input);
  return command(tx, ctx, request, "members.invite", data, async () => {
    const role = await tx.role.findUniqueOrThrow({
        where: {
          tenantId_roleKey: { tenantId: ctx.tenantId, roleKey: data.role },
        },
      }),
      id = randomUUID();
    await tx.invitation.create({
      data: {
        id,
        tenantId: ctx.tenantId,
        roleId: role.id,
        inviterId: ctx.memberId,
        recipientCiphertext: encrypt(data.email),
        tokenHash: hash(invitationSecret(ctx.tenantId, id)),
        emailHash: hash(data.email),
        expiresAt: new Date(Date.now() + 7 * 86400000),
        scopeType: "tenant",
        taskIds: [],
        sharedFields: [],
      },
    });
    await tx.invitationDelivery.create({
      data: { tenantId: ctx.tenantId, invitationId: id, state: "queued" },
    });
    await event(
      tx,
      ctx,
      "collaboration.invitation.requested",
      "invitation",
      id,
      1,
    );
    await audit(tx, ctx, "member.invited", "invitation", id, {
      role: data.role,
    });
    return { id, version: 1, state: "queued" };
  });
}
export async function deactivate(
  tx: Tx,
  ctx: Context,
  request: Request,
  input: unknown,
) {
  requirePermission(ctx, "roles.manage");
  requireFreshMfa(ctx);
  const data = z.object({ membershipId: z.uuid() }).strict().parse(input);
  check(
    data.membershipId !== ctx.memberId,
    409,
    "OWNER_LOCKOUT",
    "You cannot deactivate your own current membership.",
  );
  return command(tx, ctx, request, "members.deactivate", data, async () => {
    const member = await tx.membership.findUnique({
      where: { tenantId_id: { tenantId: ctx.tenantId, id: data.membershipId } },
    });
    check(
      member && member.status === "active",
      404,
      "NOT_FOUND",
      "Active member unavailable",
    );
    await tx.membership.update({
      where: { tenantId_id: { tenantId: ctx.tenantId, id: member.id } },
      data: {
        status: "inactive",
        membershipRevision: { increment: 1 },
        version: { increment: 1 },
      },
    });
    if (!member.isExternal) await release(tx, ctx, "internal_seats");
    await audit(tx, ctx, "member.deactivated", "membership", member.id);
    return { id: member.id, version: member.version + 1 };
  });
}
export async function assign(
  tx: Tx,
  ctx: Context,
  request: Request,
  input: unknown,
) {
  requirePermission(ctx, "tasks.assign");
  requireModule(ctx, "agency.starts", true);
  const data = z
    .object({ taskId: z.uuid(), ownerId: z.uuid() })
    .strict()
    .parse(input);
  return command(tx, ctx, request, "tasks.assign", data, async () => {
    const task = await tx.placementTask.findFirst({
      where: {
        tenantId: ctx.tenantId,
        id: data.taskId,
        placement: {
          AND: [
            placementScope(ctx, "placements.write"),
            { status: { notIn: ["started", "canceled"] } },
          ],
        },
      },
    });
    check(task, 404, "NOT_FOUND", "Assignable task unavailable");
    expectedVersion(request, task.version);
    const member = await tx.membership.findFirst({
      where: {
        tenantId: ctx.tenantId,
        id: data.ownerId,
        status: "active",
        isExternal: false,
      },
    });
    check(member, 404, "NOT_FOUND", "Active internal member unavailable");
    await tx.placementTask.update({
      where: { tenantId_id: { tenantId: ctx.tenantId, id: task.id } },
      data: { ownerId: member.id, version: { increment: 1 } },
    });
    await tx.tenant.update({
      where: { id: ctx.tenantId },
      data: { dataRevision: { increment: 1 } },
    });
    await audit(tx, ctx, "task.assigned", "placement_task", task.id);
    return { id: task.id, version: task.version + 1 };
  });
}
export async function requestPlan(
  tx: Tx,
  ctx: Context,
  request: Request,
  input: unknown,
) {
  requirePermission(ctx, "billing.manage");
  const data = z
    .object({
      planKey: z.enum(["starter", "growth"]),
      requestType: z
        .enum(["upgrade", "downgrade", "cancel"])
        .default("upgrade"),
      reason: z.string().trim().min(3).max(300),
    })
    .strict()
    .parse(input);
  return command(tx, ctx, request, "commercial.request", data, async () => {
    const row = await tx.commercialChangeRequest.create({
      data: {
        tenantId: ctx.tenantId,
        requesterId: ctx.memberId,
        planKey: data.planKey,
        requestType: data.requestType,
        state: "requested",
        reason: data.reason,
      },
    });
    await audit(
      tx,
      ctx,
      "commercial.requested",
      "commercial_change_request",
      row.id,
      { plan: data.planKey },
    );
    return { id: row.id, version: 1, state: "requested" };
  });
}
