import { it, expect, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import { setup } from "@/domain/setup";
import { authenticated } from "@/platform/commands";
import { config } from "@/platform/config";
import { database } from "@/platform/database";
import { requestPlan } from "@/domain/admin";
import { acceptOrder } from "@/operations/commercial";
import { stageImport, commitImport } from "@/domain/imports";
import { createPlacement } from "@/domain/agency";
import { report } from "@/domain/analytics";
import { requireModule } from "@/platform/policy";
type Session = Awaited<ReturnType<typeof setup>>;
function req(s: Session) {
  return new Request(config().APP_URL + "/api/v1/test", {
    method: "POST",
    headers: {
      cookie: s.cookie.split(";")[0]!,
      origin: config().APP_URL,
      "X-CSRF-Token": s.csrf,
      "Idempotency-Key": randomUUID(),
    },
  });
}
it("applies reviewed paid orders, retains over-capacity records on downgrade, and preserves cancellation export access", async () => {
  const s = await setup(
      {
        issuer: "test-only",
        subject: randomUUID(),
        email: "commercial@example.invalid",
        name: "Commercial owner",
        authTime: Math.floor(Date.now() / 1000),
        mfa: true,
        expires: Date.now() + 900000,
        nonce: randomUUID(),
      },
      {
        name: "Commercial fixture",
        slug: "commercial-" + randomUUID(),
        country: "AE",
        authority: "Test authority",
        timeZone: "Asia/Dubai",
        currency: "AED",
        retentionDays: 90,
        retentionReference: "Test retention policy",
        acknowledged: true,
      },
    ),
    r = req(s),
    tenantId = s.cookie.split("=")[1]!.split(".")[0]!;
  async function approve(planKey: string, requestType: string) {
    const request = await authenticated(
      r,
      (tx, c) =>
        requestPlan(tx, c, req(s), {
          planKey,
          requestType,
          reason: "Synthetic accepted commercial terms",
        }),
      true,
    );
    const approval = {
      tenantId,
      requestId: request.id,
      orderReference: "TEST-ORDER-" + randomUUID(),
      operatorReference: "TEST-BILLING-OPERATOR",
      effectiveAt: new Date().toISOString(),
      acceptedOrderVerified: true,
    };
    await acceptOrder(config().DATABASE_URL, approval);
    await acceptOrder(config().DATABASE_URL, approval);
  }
  await approve("growth", "upgrade");
  const csv =
    "clientCode,clientName,candidateKey,candidateName,placementKey,acceptedOn,plannedStart\n" +
    Array.from(
      { length: 101 },
      (_, i) =>
        `COMM,Commercial client,CAND-${i},Candidate ${i},PLACE-${i},2026-10-01,2026-10-29`,
    ).join("\n");
  const batch = await authenticated(
    r,
    (tx, c) =>
      stageImport(tx, c, req(s), { sourceProfile: "commercial-test", csv }),
    true,
  );
  await authenticated(
    r,
    (tx, c) => commitImport(tx, c, req(s), batch.id),
    true,
  );
  await approve("starter", "downgrade");
  const clientId = await authenticated(r, async (tx, c) => {
    const counter = await tx.usageCounter.findUniqueOrThrow({
      where: {
        tenantId_resourceKey_periodKey: {
          tenantId,
          resourceKey: "active_placements",
          periodKey: "gauge",
        },
      },
    });
    expect(counter.used).toBe(101n);
    expect(counter.hardLimit).toBe(100n);
    expect(await tx.placement.count({ where: { tenantId: c.tenantId } })).toBe(
      101,
    );
    return (await tx.clientAccount.findFirstOrThrow({ where: { tenantId } }))
      .id;
  });
  await expect(
    authenticated(
      r,
      (tx, c) =>
        createPlacement(tx, c, req(s), {
          clientId,
          candidateName: "Capacity blocked",
          candidateKey: randomUUID(),
          sourceProfile: "commercial-test",
          sourceKey: randomUUID(),
          acceptedOn: "2026-10-01",
          plannedStart: "2026-10-29",
        }),
      true,
    ),
  ).rejects.toMatchObject({ code: "CAPACITY_REACHED" });
  await approve("starter", "cancel");
  await authenticated(r, async (tx, c) => {
    expect(c.writeEndsAt!.getTime()).toBeLessThanOrEqual(Date.now());
    expect(c.accessEndsAt!.getTime() - c.writeEndsAt!.getTime()).toBe(
      30 * 86400000,
    );
    expect(() => requireModule(c, "agency.starts", true)).toThrow();
    expect(() => requireModule(c, "agency.starts")).not.toThrow();
    expect(
      (await report(tx, c, { from: "2026-10-01", to: "2026-10-31" })).rows,
    ).toHaveLength(101);
  });
});
afterAll(async () => {
  await database().$disconnect();
});
