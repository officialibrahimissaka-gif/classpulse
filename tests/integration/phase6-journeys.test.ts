import { it, expect, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import {
  tenant,
  within,
  request,
  scopedMember,
  testIdentity,
} from "../support/phase6";
import { database } from "@/platform/database";
import {
  createClient,
  createPlacement,
  detail,
  act,
  listPlacements,
} from "@/domain/agency";
import {
  invite,
  accept,
  invitationSecret,
  shared,
} from "@/domain/collaboration";
import { changeModule } from "@/domain/modules";
import {
  requestExport,
  generateExport,
  exportStatus,
  download,
} from "@/domain/exports";
import { GET } from "@/app/api/v1/[...path]/route";
import { deliverInvitation, runWorker } from "@/platform/jobs";
async function fixture() {
  const s = await tenant(),
    client = await within(
      s,
      (tx, c) =>
        createClient(tx, c, request(s), {
          name: "QA source client",
          code: randomUUID(),
        }),
      true,
    ),
    p = await within(
      s,
      (tx, c) =>
        createPlacement(tx, c, request(s), {
          clientId: client.id,
          candidateName: "Synthetic workflow person",
          candidateKey: randomUUID(),
          sourceProfile: "phase6",
          sourceKey: randomUUID(),
          acceptedOn: "2026-10-01",
          plannedStart: "2026-10-29",
        }),
      true,
    );
  return { s, p };
}
it("P6-ISO-001 two populated tenants deny swapped detail, write, participant and export IDs", async () => {
  const a = await fixture(),
    b = await fixture();
  expect(await within(b.s, (tx, c) => listPlacements(tx, c))).toHaveLength(1);
  await expect(
    within(b.s, (tx, c) => detail(tx, c, a.p.id)),
  ).rejects.toMatchObject({ code: "NOT_FOUND" });
  await expect(
    within(
      b.s,
      (tx, c) =>
        act(tx, c, request(b.s, 1), a.p.id, {
          action: "cancel",
          reason: "Must not cross tenant",
        }),
      true,
    ),
  ).rejects.toMatchObject({ code: "NOT_FOUND" });
  const response = await GET(request(b.s), {
    params: Promise.resolve({ path: ["participants", a.p.id] }),
  });
  expect(response.status).toBe(404);
  const run = await within(
    a.s,
    (tx, c) =>
      requestExport(tx, c, request(a.s), {
        filters: { from: "2026-10-01", to: "2026-10-31" },
        format: "csv",
      }),
    true,
  );
  const tenantId = await within(a.s, async (_tx, c) => c.tenantId);
  await generateExport(tenantId, run.id);
  const status = await within(a.s, (tx, c) => exportStatus(tx, c, run.id));
  await expect(
    within(b.s, (tx, c) => download(tx, c, status.artifactId!)),
  ).rejects.toMatchObject({ code: "ARTIFACT_UNAVAILABLE" });
});
it("P6-WF-001 full approval/exception/waiver/reschedule/start/reopen/cancel history preserves quota and original date", async () => {
  const { s, p } = await fixture();
  async function current() {
    return within(s, (tx, c) => detail(tx, c, p.id));
  }
  async function perform(input: unknown, key?: string) {
    const row = await current();
    return within(
      s,
      (tx, c) => act(tx, c, request(s, row.version, key), p.id, input),
      true,
    );
  }
  await expect(
    perform({ action: "ready", reason: "Premature" }),
  ).rejects.toMatchObject({ code: "NOT_READY" });
  await perform({
    action: "reschedule",
    date: "2026-10-30",
    reason: "Client reviewed revised plan",
  });
  await perform({ action: "exception", category: "documentation" });
  let row = await current();
  for (const t of row.fromPlacementTask_placement.filter((t) => t.required))
    await perform({
      action: "waive",
      taskId: t.id,
      reason: "Authorized synthetic fixture waiver",
    });
  await expect(
    perform({ action: "ready", reason: "Exception still open" }),
  ).rejects.toMatchObject({ code: "NOT_READY" });
  row = await current();
  await perform({
    action: "resolve",
    exceptionId: row.fromPlacementException_placement[0]!.id,
    reason: "Resolved by reviewer",
  });
  await perform({ action: "ready", reason: "Human verified readiness" });
  expect((await current()).actualStart).toBeNull();
  await expect(
    perform({
      action: "start",
      date: "2099-01-01",
      reason: "Future date rejected",
    }),
  ).rejects.toMatchObject({ code: "INVALID_DATE" });
  await perform({
    action: "start",
    date: "2026-10-29",
    reason: "Human confirmed actual start",
  });
  await perform({
    action: "reopen",
    reason: "Start reversed for coordination review",
  });
  row = await current();
  expect(row.originalPlannedStart.toISOString().slice(0, 10)).toBe(
    "2026-10-29",
  );
  expect(row.currentPlannedStart.toISOString().slice(0, 10)).toBe("2026-10-30");
  expect(row.actualStart).toBeNull();
  expect(
    row.fromPlacementTransition_placement.some((t) =>
      t.previousActualStart?.toISOString().startsWith("2026-10-29"),
    ),
  ).toBe(true);
  const key = randomUUID(),
    r = request(s, row.version, key);
  await within(
    s,
    (tx, c) =>
      act(tx, c, r, p.id, { action: "cancel", reason: "Closed after review" }),
    true,
  );
  const replay = await within(
    s,
    (tx, c) =>
      act(tx, c, r, p.id, { action: "cancel", reason: "Closed after review" }),
    true,
  );
  expect(replay.state).toBe("replayed");
  await within(s, async (tx, c) => {
    expect(
      (
        await tx.usageCounter.findUniqueOrThrow({
          where: {
            tenantId_resourceKey_periodKey: {
              tenantId: c.tenantId,
              resourceKey: "active_placements",
              periodKey: "gauge",
            },
          },
        })
      ).used,
    ).toBe(0n);
  });
});
it("P6-SUB-001 module-off stops queued invitation effects, permits retained export and reactivation preserves records", async () => {
  const { s, p } = await fixture(),
    d = await within(s, (tx, c) => detail(tx, c, p.id)),
    identity = testIdentity(),
    i = await within(
      s,
      (tx, c) =>
        invite(tx, c, request(s), {
          placementId: p.id,
          name: "Synthetic client",
          email: identity.email,
          taskIds: [d.fromPlacementTask_placement[0]!.id],
          sharedFields: [],
        }),
      true,
    );
  await within(
    s,
    (tx, c) =>
      changeModule(tx, c, request(s), {
        module: "agency.starts",
        state: "read_only",
        cascade: false,
      }),
    true,
  );
  await expect(deliverInvitation(d.tenantId, i.id)).rejects.toMatchObject({
    code: "MODULE_READ_ONLY",
  });
  const run = await within(
    s,
    (tx, c) =>
      requestExport(tx, c, request(s), {
        filters: { from: "2026-10-01", to: "2026-10-31" },
        format: "xlsx",
      }),
    true,
  );
  await generateExport(d.tenantId, run.id);
  expect((await within(s, (tx, c) => exportStatus(tx, c, run.id))).state).toBe(
    "ready",
  );
  await within(
    s,
    (tx, c) =>
      changeModule(tx, c, request(s), {
        module: "agency.starts",
        state: "active",
        cascade: false,
      }),
    true,
  );
  expect((await within(s, (tx, c) => detail(tx, c, p.id))).id).toBe(p.id);
  await within(s, async (tx, c) => {
    expect(
      (
        await tx.invitationDelivery.findFirstOrThrow({
          where: { tenantId: c.tenantId, invitationId: i.id },
        })
      ).state,
    ).toBe("needs_review");
  });
});
it("P6-INV-001 expired invitations and client/internal identity mixing are denied", async () => {
  const { s, p } = await fixture(),
    d = await within(s, (tx, c) => detail(tx, c, p.id));
  const internal = await scopedMember(s, "self");
  const person = await within(internal, async (tx, c) =>
    tx.membership.findUniqueOrThrow({
      where: { tenantId_id: { tenantId: c.tenantId, id: c.memberId } },
      include: { principal: true },
    }),
  );
  const i = await within(
    s,
    (tx, c) =>
      invite(tx, c, request(s), {
        placementId: p.id,
        name: "Internal actor",
        email: person.workEmail,
        taskIds: [d.fromPlacementTask_placement[0]!.id],
        sharedFields: [],
      }),
    true,
  );
  const identity = {
    ...testIdentity(),
    issuer: person.principal.issuer,
    subject: person.principal.subject,
    email: person.workEmail,
  };
  await expect(
    accept(identity, {
      tenantId: d.tenantId,
      invitationId: i.id,
      secret: invitationSecret(d.tenantId, i.id),
    }),
  ).rejects.toMatchObject({ code: "IDENTITY_BOUNDARY" });
  await within(
    s,
    async (tx, c) => {
      await tx.invitation.update({
        where: { tenantId_id: { tenantId: c.tenantId, id: i.id } },
        data: { expiresAt: new Date(0), version: { increment: 1 } },
      });
    },
    true,
  );
  await expect(
    accept(identity, {
      tenantId: d.tenantId,
      invitationId: i.id,
      secret: invitationSecret(d.tenantId, i.id),
    }),
  ).rejects.toMatchObject({ code: "INVITATION_UNAVAILABLE" });
});
it("P6-OPS-001 a prior ambiguous digest intent becomes needs_review, never completed or automatically resent", async () => {
  const s = await tenant();
  const job = await within(
    s,
    async (tx, c) => {
      const operationKey = "qa-ambiguous:" + randomUUID();
      const job = await tx.backgroundJob.create({
        data: {
          tenantId: c.tenantId,
          operationKey,
          jobType: "digest.send",
          moduleKey: "agency.starts",
          resourceType: "membership",
          resourceId: c.memberId,
          principalId: c.memberId,
          state: "queued",
          availableAt: new Date(),
        },
      });
      await tx.notificationDelivery.create({
        data: {
          tenantId: c.tenantId,
          operationKey,
          jobId: job.id,
          recipientId: c.memberId,
          channel: "email",
          state: "sending",
          attemptedAt: new Date(),
        },
      });
      return job;
    },
    true,
  );
  const close = await runWorker();
  try {
    await expect
      .poll(
        async () =>
          within(
            s,
            async (tx, c) =>
              (
                await tx.backgroundJob.findUniqueOrThrow({
                  where: { tenantId_id: { tenantId: c.tenantId, id: job.id } },
                })
              ).state,
          ),
        { timeout: 20000 },
      )
      .toBe("needs_review");
  } finally {
    await close();
  }
});
it("P6-INV-002 expired participant grants produce no shared projection", async () => {
  const { s, p } = await fixture(),
    d = await within(s, (tx, c) => detail(tx, c, p.id)),
    identity = testIdentity(),
    i = await within(
      s,
      (tx, c) =>
        invite(tx, c, request(s), {
          placementId: p.id,
          name: "Expiring participant",
          email: identity.email,
          taskIds: [d.fromPlacementTask_placement[0]!.id],
          sharedFields: ["candidate.name"],
        }),
      true,
    ),
    client = await accept(identity, {
      tenantId: d.tenantId,
      invitationId: i.id,
      secret: invitationSecret(d.tenantId, i.id),
    });
  await within(
    s,
    async (tx, c) => {
      await tx.participantGrant.updateMany({
        where: { tenantId: c.tenantId, placementId: p.id },
        data: { expiresAt: new Date(0), version: { increment: 1 } },
      });
    },
    true,
  );
  expect(await within(client, (tx, c) => shared(tx, c))).toEqual([]);
});
afterAll(async () => {
  await database().$disconnect();
});

it("P6-QUOTA-001 concurrent last-slot allocation admits exactly one placement with no partial second write", async () => {
  const { s, p } = await fixture();
  const info = await within(s, async (tx, c) => {
    const row = await tx.placement.findUniqueOrThrow({
      where: { tenantId_id: { tenantId: c.tenantId, id: p.id } },
      include: { client: true },
    });
    return row.client;
  });
  const { stageImport, commitImport } = await import("@/domain/imports");
  const csv =
    "clientCode,clientName,candidateKey,candidateName,placementKey,acceptedOn,plannedStart\n" +
    Array.from(
      { length: 23 },
      (_, i) =>
        `${info.accountCode},${info.name},race-candidate-${i},Synthetic race person ${i},race-placement-${i},2026-10-01,2026-10-29`,
    ).join("\n");
  const batch = await within(
    s,
    (tx, c) =>
      stageImport(tx, c, request(s), { sourceProfile: "phase6-race", csv }),
    true,
  );
  await within(s, (tx, c) => commitImport(tx, c, request(s), batch.id), true);
  const results = await Promise.allSettled(
    [0, 1].map((i) =>
      within(
        s,
        (tx, c) =>
          createPlacement(tx, c, request(s), {
            clientId: info.id,
            candidateName: "Concurrent fixture " + i,
            candidateKey: "last-" + i,
            sourceProfile: "phase6-race",
            sourceKey: "last-" + i,
            acceptedOn: "2026-10-01",
            plannedStart: "2026-10-29",
          }),
        true,
      ),
    ),
  );
  expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  expect(results.find((r) => r.status === "rejected")).toMatchObject({
    reason: { code: "CAPACITY_REACHED" },
  });
  await within(s, async (tx, c) => {
    expect(await tx.placement.count({ where: { tenantId: c.tenantId } })).toBe(
      25,
    );
    expect(
      (
        await tx.usageCounter.findUniqueOrThrow({
          where: {
            tenantId_resourceKey_periodKey: {
              tenantId: c.tenantId,
              resourceKey: "active_placements",
              periodKey: "gauge",
            },
          },
        })
      ).used,
    ).toBe(25n);
  });
});
it("P6-SUB-002 expired trial retains reads, blocks writes, and closes source access after the exit window", async () => {
  const { s, p } = await fixture();
  await within(
    s,
    async (tx, c) => {
      await tx.subscription.updateMany({
        where: { tenantId: c.tenantId },
        data: {
          trialEndsAt: new Date(Date.now() - 60000),
          version: { increment: 1 },
        },
      });
    },
    true,
  );
  expect((await within(s, (tx, c) => detail(tx, c, p.id))).id).toBe(p.id);
  await expect(
    within(
      s,
      (tx, c) =>
        createClient(tx, c, request(s), {
          name: "Expired write",
          code: randomUUID(),
        }),
      true,
    ),
  ).rejects.toMatchObject({ code: "TRIAL_ENDED" });
  await within(
    s,
    async (tx, c) => {
      await tx.subscription.updateMany({
        where: { tenantId: c.tenantId },
        data: {
          effectiveAt: new Date(Date.now() - 60 * 86400000),
          trialEndsAt: new Date(Date.now() - 31 * 86400000),
          version: { increment: 1 },
        },
      });
    },
    true,
  );
  await expect(within(s, (tx, c) => detail(tx, c, p.id))).rejects.toMatchObject(
    { code: "EXIT_WINDOW_ENDED" },
  );
});
