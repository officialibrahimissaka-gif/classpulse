import { Prisma } from "@/generated/prisma/client";
import type { Tx } from "./database";
import { check } from "./errors";
import { hash, canonical } from "./crypto";
export const modules = [
  "platform.core",
  "crm.accounts",
  "agency.starts",
  "platform.analytics",
  "platform.integrations",
] as const;
export type ModuleKey = (typeof modules)[number];
export const rolePermissions = {
  owner: [
    "tenant.manage",
    "roles.manage",
    "billing.manage",
    "audit.read",
    "privacy.manage",
    "accounts.read",
    "accounts.write",
    "contacts.manage",
    "placements.read",
    "placements.write",
    "placements.decide",
    "tasks.assign",
    "tasks.complete",
    "participants.manage",
    "imports.run",
    "reports.read",
    "reports.export",
    "templates.manage",
  ],
  recruiter: [
    "accounts.read",
    "accounts.write",
    "contacts.manage",
    "placements.read",
    "placements.write",
    "tasks.assign",
    "tasks.complete",
    "imports.run",
    "reports.read",
    "reports.export",
  ],
  client: ["placements.read", "tasks.complete"],
  system: ["notifications.send"],
} as const;
export type Grant = {
  permission: string;
  scopeType: string;
  entityId: string | null;
  clientId: string | null;
  placementId: string | null;
};
export type Context = {
  tenantId: string;
  memberId: string;
  name: string;
  email: string;
  external: boolean;
  revision: number;
  dataRevision: number;
  membershipRevision: number;
  mfaAt: Date | null;
  trialEndsAt: Date | null;
  writeEndsAt: Date | null;
  accessEndsAt: Date | null;
  grants: Grant[];
  moduleStates: Record<string, string>;
  csrf: string;
};
export async function memberContext(
  tx: Tx,
  tenantId: string,
  memberId: string,
  csrf = "",
  mfaAt: Date | null = null,
): Promise<Context> {
  const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });
  const member = await tx.membership.findUnique({
    where: { tenantId_id: { tenantId, id: memberId } },
    include: { principal: true },
  });
  check(
    tenant &&
      tenant.status !== "suspended_security" &&
      member?.status === "active" &&
      member.principal.state === "active",
    401,
    "ACCESS_CHANGED",
    "Your access has changed. Sign in again.",
  );
  const now = new Date();
  const rows = await tx.roleGrant.findMany({
    where: {
      tenantId,
      membershipId: memberId,
      revokedAt: null,
      validFrom: { lte: now },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    include: { role: { include: { fromRolePermission_role: true } } },
  });
  const grants: Grant[] = rows.flatMap((g) =>
    g.role.fromRolePermission_role.map((p) => ({
      permission: p.permissionKey,
      scopeType: g.scopeType,
      entityId: g.entityId,
      clientId: g.clientId,
      placementId: g.placementId,
    })),
  );
  const subscription = await tx.subscription.findFirst({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
  const activations = await tx.moduleActivation.findMany({
    where: { tenantId },
  });
  const trialEndsAt = subscription?.trialEndsAt ?? null;
  const writeEndsAt = subscription?.endsAt ?? trialEndsAt;
  const accessEndsAt = writeEndsAt
    ? new Date(writeEndsAt.getTime() + 30 * 86400000)
    : null;
  return {
    tenantId,
    memberId,
    name: member.displayName,
    email: member.workEmail,
    external: member.isExternal,
    revision: tenant.entitlementRevision,
    dataRevision: tenant.dataRevision,
    membershipRevision: member.membershipRevision,
    mfaAt,
    trialEndsAt,
    writeEndsAt,
    accessEndsAt,
    grants,
    moduleStates: Object.fromEntries(
      activations.map((a) => [a.moduleKey, a.state]),
    ),
    csrf,
  };
}
export function has(ctx: Context, permission: string) {
  return ctx.grants.some((g) => g.permission === permission);
}
export function requirePermission(ctx: Context, permission: string) {
  check(
    [
      "tenant.manage",
      "roles.manage",
      "billing.manage",
      "privacy.manage",
      "audit.read",
      "templates.manage",
    ].includes(permission)
      ? ctx.grants.some(
          (g) => g.permission === permission && g.scopeType === "tenant",
        )
      : has(ctx, permission),
    403,
    "FORBIDDEN",
    "You do not have access to this action.",
  );
}
export function requireFreshMfa(ctx: Context) {
  check(
    ctx.mfaAt &&
      ctx.mfaAt.getTime() <= Date.now() &&
      Date.now() - ctx.mfaAt.getTime() < 10 * 60000,
    403,
    "REAUTH_REQUIRED",
    "Sign in again to confirm this sensitive change.",
  );
}
export function requireEntityScope(
  ctx: Context,
  permission: string,
  entityId: string,
  clientId?: string,
) {
  requirePermission(ctx, permission);
  check(
    ctx.grants.some(
      (g) =>
        g.permission === permission &&
        (g.scopeType === "tenant" ||
          g.scopeType === "self" ||
          (g.scopeType === "entity" && g.entityId === entityId) ||
          (g.scopeType === "client" && !!clientId && g.clientId === clientId)),
    ),
    403,
    "FORBIDDEN",
    "This action is outside your authorized entity or client scope.",
  );
}
export function requireModule(ctx: Context, key: ModuleKey, write = false) {
  check(
    modules.includes(key),
    403,
    "FEATURE_UNAVAILABLE",
    "This product is not available in this release.",
  );
  if (key !== "platform.core") {
    check(
      !ctx.accessEndsAt || ctx.accessEndsAt.getTime() > Date.now(),
      403,
      "EXIT_WINDOW_ENDED",
      "The data access window has ended. Contact your administrator.",
    );
    if (write)
      check(
        !(ctx.writeEndsAt ?? ctx.trialEndsAt) ||
          (ctx.writeEndsAt ?? ctx.trialEndsAt)!.getTime() > Date.now(),
        403,
        "TRIAL_ENDED",
        "Your subscription write window has ended. Retained data remains available during the access window.",
      );
  }
  const state = ctx.moduleStates[key];
  check(
    write ? state === "active" : state === "active" || state === "read_only",
    403,
    "MODULE_READ_ONLY",
    "This module is unavailable or read-only. Retained data is not deleted.",
  );
  if (key === "agency.starts") requireModule(ctx, "crm.accounts", write);
}
export function placementScope(
  ctx: Context,
  permission = "placements.read",
): Prisma.PlacementWhereInput {
  if (
    ctx.grants.some(
      (g) => g.permission === permission && g.scopeType === "tenant",
    )
  )
    return { tenantId: ctx.tenantId, deletedAt: null };
  const predicates: Prisma.PlacementWhereInput[] = ctx.grants
    .filter((g) => g.permission === permission)
    .map((g) => {
      if (g.scopeType === "tenant") return {};
      if (g.scopeType === "entity" && g.entityId)
        return { entityId: g.entityId };
      if (g.scopeType === "client" && g.clientId)
        return { clientId: g.clientId };
      if (g.scopeType === "placement" && g.placementId)
        return {
          id: g.placementId,
          fromParticipantGrant_placement: {
            some: {
              membershipId: ctx.memberId,
              revokedAt: null,
              expiresAt: { gt: new Date() },
            },
          },
        };
      if (g.scopeType === "self")
        return permission === "placements.read"
          ? {
              OR: [
                { ownerId: ctx.memberId },
                {
                  fromPlacementTask_placement: {
                    some: { ownerId: ctx.memberId },
                  },
                },
              ],
            }
          : { ownerId: ctx.memberId };
      return { id: "00000000-0000-0000-0000-000000000000" };
    });
  return {
    tenantId: ctx.tenantId,
    deletedAt: null,
    OR: predicates.length
      ? predicates
      : [{ id: "00000000-0000-0000-0000-000000000000" }],
  };
}
export function clientScope(ctx: Context): Prisma.ClientAccountWhereInput {
  const gs = ctx.grants.filter((g) => g.permission === "accounts.read");
  if (gs.some((g) => g.scopeType === "tenant"))
    return { tenantId: ctx.tenantId, deletedAt: null };
  return {
    tenantId: ctx.tenantId,
    deletedAt: null,
    OR: gs.map((g) =>
      g.scopeType === "tenant"
        ? {}
        : g.scopeType === "entity"
          ? { entityId: g.entityId ?? "" }
          : g.scopeType === "client"
            ? { id: g.clientId ?? "" }
            : { ownerId: ctx.memberId },
    ),
  };
}
export function scopeHash(ctx: Context) {
  return hash(
    canonical({
      tenant: ctx.tenantId,
      member: ctx.memberId,
      revision: ctx.revision,
      dataRevision: ctx.dataRevision,
      membership: ctx.membershipRevision,
      grants: [...ctx.grants].sort((a, b) =>
        canonical(a).localeCompare(canonical(b)),
      ),
    }),
  );
}
