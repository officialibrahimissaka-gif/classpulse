import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Invitation } from "@/generated/prisma/client";
import type { Tx } from "@/platform/database";
import { tenantTransaction } from "@/platform/database";
import {
  type Context,
  memberContext,
  placementScope,
  requireModule,
  requirePermission,
} from "@/platform/policy";
import { type Identity, createSession } from "@/platform/auth";
import { check } from "@/platform/errors";
import { hash, sign, encrypt, equal } from "@/platform/crypto";
import {
  allocate,
  audit,
  command,
  event,
  expectedVersion,
} from "@/platform/commands";
const inviteSchema = z
  .object({
    placementId: z.uuid(),
    name: z.string().trim().min(1).max(200),
    email: z
      .email()
      .max(320)
      .transform((v) => v.toLowerCase()),
    taskIds: z.array(z.uuid()).min(1).max(50),
    sharedFields: z.array(z.enum(["candidate.name", "planned_start"])).max(2),
  })
  .strict();
export function invitationSecret(tenantId: string, id: string) {
  return sign(`invite:v1:${tenantId}:${id}`);
}
export async function invite(
  tx: Tx,
  ctx: Context,
  request: Request,
  input: unknown,
) {
  requirePermission(ctx, "participants.manage");
  requireModule(ctx, "agency.starts", true);
  const data = inviteSchema.parse(input);
  return command(tx, ctx, request, "participants.invite", data, async () => {
    const placement = await tx.placement.findFirst({
      where: {
        AND: [
          placementScope(ctx, "participants.manage"),
          { id: data.placementId, status: { notIn: ["started", "canceled"] } },
        ],
      },
    });
    check(placement, 404, "NOT_FOUND", "Active placement unavailable");
    const count = await tx.placementTask.count({
      where: {
        tenantId: ctx.tenantId,
        id: { in: data.taskIds },
        placementId: placement.id,
        state: { notIn: ["completed", "waived"] },
      },
    });
    check(
      count === new Set(data.taskIds).size,
      422,
      "INVALID_TASKS",
      "Select unfinished tasks from this placement.",
    );
    const contact = await tx.contact.create({
      data: {
        tenantId: ctx.tenantId,
        clientId: placement.clientId,
        ownerId: ctx.memberId,
        displayName: data.name,
        workEmail: data.email,
      },
    });
    const role = await tx.role.findUniqueOrThrow({
      where: {
        tenantId_roleKey: { tenantId: ctx.tenantId, roleKey: "client" },
      },
    });
    const id = randomUUID();
    await tx.invitation.create({
      data: {
        id,
        tenantId: ctx.tenantId,
        recipientCiphertext: encrypt(data.email),
        emailHash: hash(data.email),
        tokenHash: hash(invitationSecret(ctx.tenantId, id)),
        expiresAt: new Date(Date.now() + 7 * 86400000),
        scopeType: "placement",
        roleId: role.id,
        inviterId: ctx.memberId,
        placementId: placement.id,
        contactId: contact.id,
        taskIds: data.taskIds,
        sharedFields: data.sharedFields,
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
    await audit(tx, ctx, "participant.invited", "placement", placement.id, {
      sharedFields: data.sharedFields,
      taskCount: data.taskIds.length,
    });
    return { id, version: 1, state: "queued" };
  });
}
export const acceptSchema = z
  .object({
    tenantId: z.uuid(),
    invitationId: z.uuid(),
    secret: z.string().min(32).max(160),
  })
  .strict();
export async function accept(identity: Identity, input: unknown) {
  const data = acceptSchema.parse(input);
  return tenantTransaction(data.tenantId, async (tx) => {
    await tx.$queryRaw`SELECT id FROM tenant WHERE id=${data.tenantId}::uuid FOR UPDATE`;
    await tx.$queryRaw`SELECT id FROM invitation WHERE tenant_id=${data.tenantId}::uuid AND id=${data.invitationId}::uuid FOR UPDATE`;
    const invitation = await tx.invitation.findUnique({
      where: {
        tenantId_id: { tenantId: data.tenantId, id: data.invitationId },
      },
    });
    check(
      invitation &&
        !invitation.revokedAt &&
        invitation.expiresAt > new Date() &&
        equal(invitation.tokenHash, hash(data.secret)) &&
        equal(invitation.emailHash, hash(identity.email.toLowerCase())),
      403,
      "INVITATION_UNAVAILABLE",
      "This invitation is expired, revoked, or belongs to a different verified identity.",
    );
    if (invitation.scopeType === "tenant")
      return acceptInternal(tx, identity, invitation);
    check(
      invitation.placementId && invitation.contactId,
      403,
      "INVALID_INVITATION",
      "Placement invitation required",
    );
    const inviter = await memberContext(
      tx,
      data.tenantId,
      invitation.inviterId,
    );
    requirePermission(inviter, "participants.manage");
    requireModule(inviter, "agency.starts", true);
    check(
      await tx.placement.findFirst({
        where: {
          AND: [
            placementScope(inviter, "participants.manage"),
            { id: invitation.placementId },
          ],
        },
      }),
      403,
      "ACCESS_CHANGED",
      "Inviter no longer has placement access.",
    );
    let principal = await tx.principal.findUnique({
      where: {
        tenantId_issuer_subject: {
          tenantId: data.tenantId,
          issuer: identity.issuer,
          subject: identity.subject,
        },
      },
    });
    if (!principal)
      principal = await tx.principal.create({
        data: {
          tenantId: data.tenantId,
          issuer: identity.issuer,
          subject: identity.subject,
          state: "active",
        },
      });
    let member = await tx.membership.findFirst({
      where: { tenantId: data.tenantId, principalId: principal.id },
    });
    if (invitation.acceptedAt) {
      check(member, 403, "INVITATION_USED", "Invitation already used");
      await memberContext(tx, data.tenantId, member.id);
      return createSession(tx, data.tenantId, member.id, identity);
    }
    if (!member)
      member = await tx.membership.create({
        data: {
          tenantId: data.tenantId,
          principalId: principal.id,
          displayName: identity.name,
          workEmail: identity.email,
          status: "active",
          isExternal: true,
        },
      });
    check(
      member.status === "active" && principal.state === "active",
      403,
      "ACCESS_CHANGED",
      "This identity has been deactivated.",
    );
    check(
      member.isExternal,
      409,
      "IDENTITY_BOUNDARY",
      "Internal members must use internal task assignment, not a client-participant identity.",
    );
    const old = await tx.participantGrant.findUnique({
      where: {
        tenantId_placementId_membershipId: {
          tenantId: data.tenantId,
          placementId: invitation.placementId,
          membershipId: member.id,
        },
      },
    });
    check(
      !old || old.revokedAt || old.expiresAt <= new Date(),
      409,
      "GRANT_EXISTS",
      "Revoke the existing participant grant before issuing a replacement.",
    );
    await tx.contactMembershipLink.create({
      data: {
        tenantId: data.tenantId,
        contactId: invitation.contactId,
        membershipId: member.id,
        verifiedAt: new Date(),
        verifiedById: invitation.inviterId,
      },
    });
    const grantData = {
      contactId: invitation.contactId,
      grantedById: invitation.inviterId,
      expiresAt: invitation.expiresAt,
      canCompleteAssignedTasks: true,
      revokedAt: null,
    };
    const grant = old
      ? await tx.participantGrant.update({
          where: { tenantId_id: { tenantId: data.tenantId, id: old.id } },
          data: { ...grantData, version: { increment: 1 } },
        })
      : await tx.participantGrant.create({
          data: {
            ...grantData,
            tenantId: data.tenantId,
            placementId: invitation.placementId,
            membershipId: member.id,
          },
        });
    await tx.sharedField.updateMany({
      where: { tenantId: data.tenantId, grantId: grant.id, deletedAt: null },
      data: { deletedAt: new Date(), version: { increment: 1 } },
    });
    for (const fieldKey of z.array(z.string()).parse(invitation.sharedFields))
      await tx.sharedField.upsert({
        where: {
          tenantId_grantId_fieldKey: {
            tenantId: data.tenantId,
            grantId: grant.id,
            fieldKey,
          },
        },
        create: { tenantId: data.tenantId, grantId: grant.id, fieldKey },
        update: { deletedAt: null, version: { increment: 1 } },
      });
    await tx.roleGrant.create({
      data: {
        tenantId: data.tenantId,
        membershipId: member.id,
        roleId: invitation.roleId,
        scopeType: "placement",
        placementId: invitation.placementId,
        validFrom: new Date(),
        expiresAt: invitation.expiresAt,
      },
    });
    await tx.placementTask.updateMany({
      where: {
        tenantId: data.tenantId,
        placementId: invitation.placementId,
        id: { in: z.array(z.uuid()).parse(invitation.taskIds) },
        state: { notIn: ["completed", "waived"] },
      },
      data: { ownerId: member.id, version: { increment: 1 } },
    });
    await tx.tenant.update({
      where: { id: data.tenantId },
      data: { dataRevision: { increment: 1 } },
    });
    await tx.invitation.update({
      where: { tenantId_id: { tenantId: data.tenantId, id: invitation.id } },
      data: { acceptedAt: new Date(), version: { increment: 1 } },
    });
    await audit(
      tx,
      inviter,
      "participant.accepted",
      "participant_grant",
      grant.id,
    );
    return createSession(tx, data.tenantId, member.id, identity);
  });
}
export async function shared(tx: Tx, ctx: Context) {
  requireModule(ctx, "agency.starts");
  requirePermission(ctx, "placements.read");
  const grants = await tx.participantGrant.findMany({
    where: {
      tenantId: ctx.tenantId,
      membershipId: ctx.memberId,
      placement: placementScope(ctx, "placements.read"),
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: {
      fromSharedField_grant: { where: { deletedAt: null } },
      placement: {
        include: {
          candidate: { select: { displayName: true } },
          fromPlacementTask_placement: {
            where: { ownerId: ctx.memberId },
            select: {
              id: true,
              label: true,
              state: true,
              dueAt: true,
              version: true,
            },
          },
        },
      },
    },
  });
  const projections = [];
  for (const g of grants) {
    const ids = await sharedTaskIds(
      tx,
      ctx.tenantId,
      g.contactId,
      g.placementId,
    );
    projections.push({
      id: g.placementId,
      grantId: g.id,
      status: g.placement.status,
      ...(g.fromSharedField_grant.some((f) => f.fieldKey === "candidate.name")
        ? { candidateName: g.placement.candidate.displayName }
        : {}),
      ...(g.fromSharedField_grant.some((f) => f.fieldKey === "planned_start")
        ? { plannedStart: g.placement.currentPlannedStart }
        : {}),
      tasks: g.placement.fromPlacementTask_placement.filter((t) =>
        ids.includes(t.id),
      ),
    });
  }
  return projections;
}
export async function completeShared(
  tx: Tx,
  ctx: Context,
  request: Request,
  input: unknown,
) {
  requireModule(ctx, "agency.starts", true);
  requirePermission(ctx, "tasks.complete");
  const data = z
    .object({
      placementId: z.uuid(),
      taskId: z.uuid(),
      evidence: z.string().trim().min(3).max(500),
    })
    .strict()
    .parse(input);
  return command(tx, ctx, request, "shared.complete", data, async () => {
    await tx.$queryRaw`SELECT id FROM placement WHERE tenant_id=${ctx.tenantId}::uuid AND id=${data.placementId}::uuid FOR UPDATE`;
    const grant = await tx.participantGrant.findFirst({
      where: {
        tenantId: ctx.tenantId,
        membershipId: ctx.memberId,
        placementId: data.placementId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
        canCompleteAssignedTasks: true,
        placement: placementScope(ctx, "tasks.complete"),
      },
    });
    check(grant, 404, "NOT_FOUND", "Shared placement unavailable");
    check(
      (
        await sharedTaskIds(
          tx,
          ctx.tenantId,
          grant.contactId,
          grant.placementId,
        )
      ).includes(data.taskId),
      404,
      "NOT_FOUND",
      "Assigned task unavailable",
    );
    const placement = await tx.placement.findUniqueOrThrow({
      where: { tenantId_id: { tenantId: ctx.tenantId, id: data.placementId } },
    });
    check(
      !["started", "canceled"].includes(placement.status),
      409,
      "PLACEMENT_CLOSED",
      "Placement is closed",
    );
    const task = await tx.placementTask.findFirst({
      where: {
        tenantId: ctx.tenantId,
        id: data.taskId,
        placementId: placement.id,
        ownerId: ctx.memberId,
      },
    });
    check(task, 404, "NOT_FOUND", "Assigned task unavailable");
    expectedVersion(request, task.version);
    check(
      !["completed", "waived"].includes(task.state),
      409,
      "TASK_CLOSED",
      "Task already completed",
    );
    await tx.placementTask.update({
      where: { tenantId_id: { tenantId: ctx.tenantId, id: task.id } },
      data: {
        state: "completed",
        completedAt: new Date(),
        completedById: ctx.memberId,
        completionEvidenceReference: data.evidence,
        version: { increment: 1 },
      },
    });
    await tx.placement.update({
      where: { tenantId_id: { tenantId: ctx.tenantId, id: placement.id } },
      data: { status: "in_progress", version: { increment: 1 } },
    });
    await audit(tx, ctx, "shared.task.completed", "placement_task", task.id);
    return { id: task.id, version: task.version + 1 };
  });
}
export async function revoke(
  tx: Tx,
  ctx: Context,
  request: Request,
  input: unknown,
) {
  requirePermission(ctx, "participants.manage");
  requireModule(ctx, "agency.starts", true);
  const data = z.object({ grantId: z.uuid() }).strict().parse(input);
  return command(tx, ctx, request, "participants.revoke", data, async () => {
    const grant = await tx.participantGrant.findUnique({
      where: { tenantId_id: { tenantId: ctx.tenantId, id: data.grantId } },
    });
    check(
      grant &&
        (await tx.placement.findFirst({
          where: {
            AND: [
              placementScope(ctx, "participants.manage"),
              { id: grant.placementId },
            ],
          },
        })),
      404,
      "NOT_FOUND",
      "Grant unavailable",
    );
    await tx.participantGrant.update({
      where: { tenantId_id: { tenantId: ctx.tenantId, id: grant.id } },
      data: { revokedAt: new Date(), version: { increment: 1 } },
    });
    await tx.membership.update({
      where: {
        tenantId_id: { tenantId: ctx.tenantId, id: grant.membershipId },
      },
      data: { membershipRevision: { increment: 1 }, version: { increment: 1 } },
    });
    await audit(tx, ctx, "participant.revoked", "participant_grant", grant.id);
    return { id: grant.id, version: grant.version + 1 };
  });
}

async function acceptInternal(
  tx: Tx,
  identity: Identity,
  invitation: Invitation,
) {
  const tenantId = invitation.tenantId,
    inviter = await memberContext(tx, tenantId, invitation.inviterId);
  requirePermission(inviter, "roles.manage");
  requireModule(inviter, "platform.core", true);
  let principal = await tx.principal.findUnique({
    where: {
      tenantId_issuer_subject: {
        tenantId,
        issuer: identity.issuer,
        subject: identity.subject,
      },
    },
  });
  if (!principal)
    principal = await tx.principal.create({
      data: {
        tenantId,
        issuer: identity.issuer,
        subject: identity.subject,
        state: "active",
      },
    });
  const existing = await tx.membership.findFirst({
    where: { tenantId, principalId: principal.id },
  });
  if (invitation.acceptedAt) {
    check(
      existing?.status === "active" && !existing.isExternal,
      403,
      "ACCESS_CHANGED",
      "Membership unavailable",
    );
    return createSession(tx, tenantId, existing.id, identity);
  }
  check(
    !existing && principal.state === "active",
    409,
    "MEMBER_EXISTS",
    "This identity already has a membership. Do not merge client and internal identities.",
  );
  await allocate(tx, inviter, "internal_seats", 1);
  const role = await tx.role.findUniqueOrThrow({
    where: { tenantId_id: { tenantId, id: invitation.roleId } },
  });
  check(
    ["owner", "recruiter"].includes(role.roleKey),
    403,
    "ROLE_UNAVAILABLE",
    "Internal role unavailable",
  );
  const member = await tx.membership.create({
    data: {
      tenantId,
      principalId: principal.id,
      displayName: identity.name,
      workEmail: identity.email,
      status: "active",
      isExternal: false,
    },
  });
  await tx.roleGrant.create({
    data: {
      tenantId,
      membershipId: member.id,
      roleId: role.id,
      scopeType: role.roleKey === "owner" ? "tenant" : "self",
      validFrom: new Date(),
    },
  });
  const team = await tx.team.findFirst({
    where: { tenantId, code: "COORDINATION" },
  });
  if (team)
    await tx.teamMembership.create({
      data: { tenantId, membershipId: member.id, teamId: team.id },
    });
  await tx.invitation.update({
    where: { tenantId_id: { tenantId, id: invitation.id } },
    data: { acceptedAt: new Date(), version: { increment: 1 } },
  });
  await audit(tx, inviter, "member.accepted", "membership", member.id, {
    role: role.roleKey,
  });
  return createSession(tx, tenantId, member.id, identity);
}

async function sharedTaskIds(
  tx: Tx,
  tenantId: string,
  contactId: string,
  placementId: string,
) {
  const invite = await tx.invitation.findFirst({
    where: {
      tenantId,
      contactId,
      placementId,
      acceptedAt: { not: null },
      revokedAt: null,
    },
    orderBy: { acceptedAt: "desc" },
    select: { taskIds: true },
  });
  return invite ? z.array(z.uuid()).parse(invite.taskIds) : [];
}

export async function participants(tx: Tx, ctx: Context, id: string) {
  requireModule(ctx, "agency.starts");
  requirePermission(ctx, "participants.manage");
  const placement = await tx.placement.findFirst({
    where: { AND: [placementScope(ctx, "participants.manage"), { id }] },
  });
  check(placement, 404, "NOT_FOUND", "Placement unavailable");
  const result = {
    grants: await tx.participantGrant.findMany({
      where: { tenantId: ctx.tenantId, placementId: id },
      select: {
        id: true,
        revokedAt: true,
        expiresAt: true,
        contact: { select: { displayName: true } },
      },
    }),
    invitations: await tx.invitation.findMany({
      where: { tenantId: ctx.tenantId, placementId: id },
      select: {
        id: true,
        acceptedAt: true,
        expiresAt: true,
        deliveryRows: { select: { state: true } },
      },
    }),
  };
  await audit(tx, ctx, "participants.inspected", "placement", id);
  return result;
}
