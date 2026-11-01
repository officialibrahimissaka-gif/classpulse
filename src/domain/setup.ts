import { z } from "zod";
import { tenantTransaction, database } from "@/platform/database";
import { createSession, type Identity } from "@/platform/auth";
import { hash, canonical, stableUuid } from "@/platform/crypto";
import { check } from "@/platform/errors";
import { memberContext, modules, rolePermissions } from "@/platform/policy";
import { audit } from "@/platform/commands";
export const setupSchema = z
  .object({
    name: z.string().trim().min(2).max(240),
    slug: z.string().regex(/^[a-z][a-z0-9-]{2,59}$/),
    country: z.string().regex(/^[A-Z]{2}$/),
    authority: z.string().trim().min(2).max(80),
    timeZone: z.string().refine((v) => {
      try {
        new Intl.DateTimeFormat("en", { timeZone: v });
        return true;
      } catch {
        return false;
      }
    }, "Use an IANA time zone"),
    currency: z.string().regex(/^[A-Z]{3}$/),
    retentionDays: z.number().int().min(30).max(3650),
    retentionReference: z.string().trim().min(10).max(500),
    acknowledged: z.literal(true),
  })
  .strict();
export async function setup(identity: Identity, input: unknown) {
  const data = setupSchema.parse(input),
    tenantId = stableUuid(identity.issuer + identity.subject + identity.nonce),
    digest = hash(canonical(data));
  return tenantTransaction(tenantId, async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${tenantId},0))::text`;
    const old = await tx.tenant.findUnique({ where: { id: tenantId } });
    if (old) {
      check(
        old.registrationPayloadHash === digest,
        409,
        "REGISTRATION_CONFLICT",
        "This registration was submitted with different values. Sign in to your existing workspace.",
      );
      const member = await tx.membership.findFirstOrThrow({
        where: {
          tenantId,
          principal: { issuer: identity.issuer, subject: identity.subject },
        },
      });
      return createSession(tx, tenantId, member.id, identity);
    }
    await tx.tenant.create({
      data: {
        id: tenantId,
        slug: data.slug,
        name: data.name,
        residencyCell: "ae-1",
        status: "active",
        registrationHash: hash(identity.nonce),
        registrationPayloadHash: digest,
      },
    });
    const principal = await tx.principal.create({
      data: {
        tenantId,
        issuer: identity.issuer,
        subject: identity.subject,
        state: "active",
      },
    });
    const member = await tx.membership.create({
      data: {
        tenantId,
        principalId: principal.id,
        status: "active",
        displayName: identity.name,
        workEmail: identity.email,
      },
    });
    const entity = await tx.legalEntity.create({
      data: {
        tenantId,
        code: "PRIMARY",
        name: data.name,
        countryCode: data.country,
        authorityCode: data.authority,
        timeZone: data.timeZone,
        defaultCurrency: data.currency,
      },
    });
    const team = await tx.team.create({
      data: {
        tenantId,
        entityId: entity.id,
        code: "COORDINATION",
        name: "Placement coordination",
      },
    });
    await tx.teamMembership.create({
      data: { tenantId, membershipId: member.id, teamId: team.id },
    });
    for (const [key, permissions] of Object.entries(rolePermissions)) {
      const role = await tx.role.create({
        data: { tenantId, roleKey: key, name: key },
      });
      await tx.rolePermission.createMany({
        data: permissions.map((permissionKey) => ({
          tenantId,
          roleId: role.id,
          permissionKey,
        })),
      });
      if (key === "owner")
        await tx.roleGrant.create({
          data: {
            tenantId,
            membershipId: member.id,
            roleId: role.id,
            scopeType: "tenant",
            validFrom: new Date(),
          },
        });
    }
    const now = new Date();
    await tx.subscription.create({
      data: {
        tenantId,
        planKey: "trial",
        state: "trialing",
        effectiveAt: now,
        trialEndsAt: new Date(now.getTime() + 14 * 86400000),
        orderReference: "self-service-trial",
      },
    });
    await tx.moduleActivation.createMany({
      data: modules.map((moduleKey) => ({
        tenantId,
        moduleKey,
        state: "active",
        entitlementRevision: 1,
        everActivated: true,
        changedAt: now,
      })),
    });
    await tx.usageCounter.createMany({
      data: [
        ["internal_seats", 5, 1],
        ["active_placements", 25, 0],
        ["legal_entities", 1, 1],
      ].map(([resourceKey, hardLimit, used]) => ({
        tenantId,
        resourceKey: String(resourceKey),
        periodKey: "gauge",
        hardLimit: Number(hardLimit),
        used: Number(used),
        reserved: 0,
      })),
    });
    await tx.retentionPolicy.create({
      data: {
        tenantId,
        recordClass: "agency.coordination",
        triggerCode: "placement_closed",
        retentionDays: data.retentionDays,
        policyVersion: 1,
        validFrom: now,
        authorityReference: data.retentionReference,
        entityId: entity.id,
        reviewerId: member.id,
      },
    });
    const template = await tx.workflowTemplate.create({
      data: {
        tenantId,
        templateKey: "placement-start-v1",
        name: "Accepted placement to start",
        moduleKey: "agency.starts",
      },
    });
    const version = await tx.templateVersion.create({
      data: {
        tenantId,
        templateId: template.id,
        revision: 1,
        state: "published",
        publishedAt: now,
        publisherId: member.id,
      },
    });
    await tx.taskDefinition.createMany({
      data: [
        ["confirm", "Confirm client start arrangements", true, -3],
        ["check", "Confirm candidate readiness", true, -1],
        ["welcome", "Send first-day information", false, -1],
      ].map(([taskKey, label, required, offset], sortOrder) => ({
        tenantId,
        templateVersionId: version.id,
        taskKey: String(taskKey),
        label: String(label),
        milestoneKey: "pre-start",
        required: Boolean(required),
        sortOrder,
        dueOffsetDays: Number(offset),
        dueTime: "17:00",
      })),
    });
    const ctx = await memberContext(tx, tenantId, member.id);
    await audit(tx, ctx, "tenant.created", "tenant", tenantId, {
      policyAttested: true,
    });
    return createSession(tx, tenantId, member.id, identity);
  });
}
export async function loginWorkspace(identity: Identity, slug: string) {
  const result = await database().$queryRaw<
    { id: string | null }[]
  >`SELECT app.resolve_workspace(${slug}) AS id`;
  const tenantId = result[0]?.id;
  check(
    tenantId,
    401,
    "WORKSPACE_DENIED",
    "This identity cannot access this workspace.",
  );
  return tenantTransaction(tenantId, async (tx) => {
    const member = await tx.membership.findFirst({
      where: {
        tenantId,
        status: "active",
        principal: {
          issuer: identity.issuer,
          subject: identity.subject,
          state: "active",
        },
      },
    });
    check(
      member,
      401,
      "WORKSPACE_DENIED",
      "This identity cannot access this workspace.",
    );
    await memberContext(tx, tenantId, member.id);
    return createSession(tx, tenantId, member.id, identity);
  });
}
