import { it, expect, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import {
  tenant,
  request,
  within,
  scopedMember,
  testIdentity,
} from "../support/phase6";
import { database } from "@/platform/database";
import { createClient, createPlacement, detail } from "@/domain/agency";
import {
  invite,
  accept,
  invitationSecret,
  revoke,
} from "@/domain/collaboration";
import { GET } from "@/app/api/v1/[...path]/route";
import { requestPlan } from "@/domain/admin";
import { acceptOrder } from "@/operations/commercial";
import { config } from "@/platform/config";
import { renderReport } from "@/domain/exports";
import { allocate } from "@/platform/commands";
it("P6-SCOPE-001 entity-scoped writers cannot create accounts or placements outside their entity", async () => {
  const s = await tenant();
  const entities = await within(
    s,
    async (tx, c) => {
      const own = await tx.legalEntity.findFirstOrThrow({
        where: { tenantId: c.tenantId },
      });
      const other = await tx.legalEntity.create({
        data: {
          tenantId: c.tenantId,
          code: "SECOND",
          name: "Other entity",
          countryCode: "AE",
          authorityCode: "TEST",
          timeZone: "Asia/Dubai",
          defaultCurrency: "AED",
        },
      });
      return { own, other };
    },
    true,
  );
  const restricted = await scopedMember(s, "entity", entities.own.id);
  await expect(
    within(
      restricted,
      (tx, c) =>
        createClient(tx, c, request(restricted), {
          name: "Forbidden client",
          code: randomUUID(),
          entityId: entities.other.id,
        }),
      true,
    ),
  ).rejects.toMatchObject({ code: "FORBIDDEN" });
  const client = await within(
    s,
    (tx, c) =>
      createClient(tx, c, request(s), {
        name: "Other entity client",
        code: randomUUID(),
        entityId: entities.other.id,
      }),
    true,
  );
  await expect(
    within(
      restricted,
      (tx, c) =>
        createPlacement(tx, c, request(restricted), {
          clientId: client.id,
          candidateName: "Must not create",
          candidateKey: randomUUID(),
          sourceProfile: "qa",
          sourceKey: randomUUID(),
          acceptedOn: "2026-10-01",
          plannedStart: "2026-10-29",
        }),
      true,
    ),
  ).rejects.toBeDefined();
});
it("P6-SCOPE-002 participant listing and revocation honor placement scope inside the same tenant", async () => {
  const s = await tenant();
  const first = await within(s, async (tx, c) =>
    tx.legalEntity.findFirstOrThrow({ where: { tenantId: c.tenantId } }),
  );
  const client = await within(
    s,
    (tx, c) =>
      createClient(tx, c, request(s), {
        name: "Private client",
        code: randomUUID(),
      }),
    true,
  );
  const p = await within(
    s,
    (tx, c) =>
      createPlacement(tx, c, request(s), {
        clientId: client.id,
        candidateName: "Private candidate",
        candidateKey: randomUUID(),
        sourceProfile: "qa",
        sourceKey: randomUUID(),
        acceptedOn: "2026-10-01",
        plannedStart: "2026-10-29",
      }),
    true,
  );
  const d = await within(s, (tx, c) => detail(tx, c, p.id));
  const identity = testIdentity(),
    i = await within(
      s,
      (tx, c) =>
        invite(tx, c, request(s), {
          placementId: p.id,
          name: "Private contact",
          email: identity.email,
          taskIds: [d.fromPlacementTask_placement[0]!.id],
          sharedFields: [],
        }),
      true,
    );
  await accept(identity, {
    tenantId: d.tenantId,
    invitationId: i.id,
    secret: invitationSecret(d.tenantId, i.id),
  });
  const grant = await within(s, async (tx, c) =>
    tx.participantGrant.findFirstOrThrow({
      where: { tenantId: c.tenantId, placementId: p.id },
    }),
  );
  const other = await within(
    s,
    async (tx, c) =>
      tx.legalEntity.create({
        data: {
          tenantId: c.tenantId,
          code: "OTHER",
          name: "Other scope",
          countryCode: "AE",
          authorityCode: "TEST",
          timeZone: "Asia/Dubai",
          defaultCurrency: "AED",
        },
      }),
    true,
  );
  expect(other.id).not.toBe(first.id);
  const restricted = await scopedMember(s, "entity", other.id);
  const response = await GET(request(restricted), {
    params: Promise.resolve({ path: ["participants", p.id] }),
  });
  expect(response.status).toBe(404);
  await expect(
    within(
      restricted,
      (tx, c) => revoke(tx, c, request(restricted), { grantId: grant.id }),
      true,
    ),
  ).rejects.toMatchObject({ code: "NOT_FOUND" });
});
it("P6-COM-001 accepted order retries reject a changed effective-date payload", async () => {
  const s = await tenant(),
    r = await within(
      s,
      (tx, c) =>
        requestPlan(tx, c, request(s), {
          planKey: "starter",
          reason: "Synthetic reviewed order",
        }),
      true,
    ),
    tenantId = await within(s, async (_tx, c) => c.tenantId),
    a = {
      tenantId,
      requestId: r.id,
      orderReference: "QA-" + randomUUID(),
      operatorReference: "QA-OPERATOR",
      effectiveAt: new Date().toISOString(),
      acceptedOrderVerified: true,
    };
  await acceptOrder(config().DATABASE_URL, a);
  await expect(
    acceptOrder(config().DATABASE_URL, {
      ...a,
      effectiveAt: new Date(Date.now() - 1000).toISOString(),
    }),
  ).rejects.toThrow();
});
it("P6-COM-002 allocations reject zero, negative, noninteger and unsafe quantities before changing counters", async () => {
  const s = await tenant();
  for (const quantity of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])
    await expect(
      within(
        s,
        (tx, c) => allocate(tx, c, "active_placements", quantity),
        true,
      ),
    ).rejects.toMatchObject({ code: "INVALID_QUANTITY" });
});
it("P6-EXP-001 all export formats enforce the approved 5000-row cap", async () => {
  const row = {
    id: randomUUID(),
    candidate: "Synthetic",
    client: "Synthetic",
    status: "accepted",
    original: "2026-10-01",
    planned: "2026-10-29",
    actual: null,
    overdue: 0,
  };
  for (const format of ["pdf", "csv", "xlsx"] as const)
    await expect(
      renderReport(format, {
        asOf: new Date().toISOString(),
        metrics: { count: 5001 },
        rows: Array.from({ length: 5001 }, () => row),
      }),
    ).rejects.toMatchObject({ code: "EXPORT_ROW_LIMIT" });
});
afterAll(async () => {
  await database().$disconnect();
});

it("P6-COM-003 distinct subscription requests cannot process the same accepted external order twice", async () => {
  const s = await tenant();
  const { config } = await import("@/platform/config");
  const tenantId = await within(s, async (_tx, c) => c.tenantId),
    orderReference = "REUSE-" + randomUUID();
  for (let i = 0; i < 2; i++) {
    const r = await within(
      s,
      (tx, c) =>
        requestPlan(tx, c, request(s), {
          planKey: "starter",
          reason: "Duplicate external order fixture",
        }),
      true,
    );
    const input = {
      tenantId,
      requestId: r.id,
      orderReference,
      operatorReference: "QA-OPERATOR",
      effectiveAt: new Date().toISOString(),
      acceptedOrderVerified: true,
    };
    if (i === 0) await acceptOrder(config().DATABASE_URL, input);
    else
      await expect(acceptOrder(config().DATABASE_URL, input)).rejects.toThrow(
        "already applied",
      );
  }
});
