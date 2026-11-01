import { randomUUID } from "node:crypto";
import { setup } from "@/domain/setup";
import { authenticated } from "@/platform/commands";
import { createSession, type Identity } from "@/platform/auth";
import { config } from "@/platform/config";
import type { Tx } from "@/platform/database";
import type { Context } from "@/platform/policy";
export type TestSession = Awaited<ReturnType<typeof setup>>;
export function testIdentity(): Identity {
  return {
    issuer: "phase6-test-only",
    subject: randomUUID(),
    email: `qa-${randomUUID()}@example.invalid`,
    name: "Synthetic QA actor",
    authTime: Math.floor(Date.now() / 1000),
    mfa: true,
    expires: Date.now() + 900000,
    nonce: randomUUID(),
  };
}
export async function tenant() {
  return setup(testIdentity(), {
    name: "Phase 6 synthetic tenant",
    slug: "qa-" + randomUUID(),
    country: "AE",
    authority: "TEST ONLY",
    timeZone: "Asia/Dubai",
    currency: "AED",
    retentionDays: 90,
    retentionReference: "TEST ONLY reviewed fixture policy",
    acknowledged: true,
  });
}
export function request(
  s: TestSession,
  version?: number,
  key: string = randomUUID(),
) {
  return new Request(config().APP_URL + "/api/v1/audit-test", {
    method: "POST",
    headers: {
      cookie: s.cookie.split(";")[0]!,
      origin: config().APP_URL,
      "X-CSRF-Token": s.csrf,
      "Idempotency-Key": key,
      ...(version ? { "If-Match": `"v${version}"` } : {}),
    },
  });
}
export function within<T>(
  s: TestSession,
  fn: (tx: Tx, ctx: Context) => Promise<T>,
  write = false,
) {
  return authenticated(request(s), fn, write);
}
export async function scopedMember(
  s: TestSession,
  scope: "entity" | "self",
  entityId?: string,
) {
  return within(
    s,
    async (tx, c) => {
      const identity = testIdentity();
      const p = await tx.principal.create({
        data: {
          tenantId: c.tenantId,
          issuer: identity.issuer,
          subject: identity.subject,
          state: "active",
        },
      });
      const m = await tx.membership.create({
        data: {
          tenantId: c.tenantId,
          principalId: p.id,
          displayName: identity.name,
          workEmail: identity.email,
          status: "active",
        },
      });
      const role = await tx.role.findUniqueOrThrow({
        where: {
          tenantId_roleKey: {
            tenantId: c.tenantId,
            roleKey: scope === "entity" ? "owner" : "recruiter",
          },
        },
      });
      await tx.roleGrant.create({
        data: {
          tenantId: c.tenantId,
          membershipId: m.id,
          roleId: role.id,
          scopeType: scope,
          entityId: entityId ?? null,
          validFrom: new Date(),
        },
      });
      return createSession(tx, c.tenantId, m.id, identity);
    },
    true,
  );
}
