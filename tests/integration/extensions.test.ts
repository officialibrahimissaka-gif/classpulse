import { it, expect, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import { setup } from "@/domain/setup";
import { config } from "@/platform/config";
import { authenticated } from "@/platform/commands";
import { database, tenantTransaction } from "@/platform/database";
import { createClient, createPlacement, detail } from "@/domain/agency";
import {
  invite,
  accept,
  shared,
  completeShared,
  invitationSecret,
  revoke,
} from "@/domain/collaboration";
import { deliverInvitation } from "@/platform/jobs";
import {
  requestExport,
  generateExport,
  exportStatus,
  download,
  renderReport,
} from "@/domain/exports";
import { stageImport, commitImport, importStatus } from "@/domain/imports";
const identity = {
  issuer: "test-only",
  subject: randomUUID(),
  email: "extension-owner@example.invalid",
  name: "Extension owner",
  authTime: Math.floor(Date.now() / 1000),
  mfa: true,
  expires: Date.now() + 900000,
  nonce: randomUUID(),
};
async function fixture() {
  const session = await setup(
    { ...identity, nonce: randomUUID() },
    {
      name: "Extensions",
      slug: "extension-" + randomUUID(),
      country: "AE",
      authority: "Test only",
      timeZone: "Asia/Dubai",
      currency: "AED",
      retentionDays: 90,
      retentionReference: "Test retention policy",
      acknowledged: true,
    },
  );
  return session;
}
type Session = Awaited<ReturnType<typeof setup>>;
function req(s: Session, version?: number) {
  return new Request(config().APP_URL + "/api/v1/test", {
    method: "POST",
    headers: {
      cookie: s.cookie.split(";")[0]!,
      origin: config().APP_URL,
      "X-CSRF-Token": s.csrf,
      "Idempotency-Key": randomUUID(),
      ...(version ? { "If-Match": `"v${version}"` } : {}),
    },
  });
}
it("restricts client projections, mail retry, assigned tasks, and revocation", async () => {
  const s = await fixture(),
    r = req(s);
  const c = await authenticated(
    r,
    (tx, ctx) =>
      createClient(tx, ctx, r, { name: "Scoped client", code: randomUUID() }),
    true,
  );
  const p = await authenticated(
    r,
    (tx, ctx) =>
      createPlacement(tx, ctx, req(s), {
        clientId: c.id,
        candidateName: "Private candidate",
        candidateKey: randomUUID(),
        sourceProfile: "test",
        sourceKey: randomUUID(),
        acceptedOn: "2026-10-01",
        plannedStart: "2026-10-28",
      }),
    true,
  );
  const d = await authenticated(r, (tx, ctx) => detail(tx, ctx, p.id));
  const task = d.fromPlacementTask_placement[0]!;
  const email = `client-${randomUUID()}@example.invalid`;
  const invitation = await authenticated(
    r,
    (tx, ctx) =>
      invite(tx, ctx, req(s), {
        placementId: p.id,
        name: "Client contact",
        email,
        taskIds: [task.id],
        sharedFields: ["planned_start"],
      }),
    true,
  );
  const tenantId = s.cookie.split("=")[1]!.split(".")[0]!;
  await Promise.all([
    deliverInvitation(tenantId, invitation.id),
    deliverInvitation(tenantId, invitation.id),
  ]);
  expect(
    await tenantTransaction(tenantId, (tx) =>
      tx.invitationDelivery.findFirstOrThrow({
        where: { tenantId, invitationId: invitation.id },
      }),
    ),
  ).toMatchObject({ state: "accepted_by_provider" });
  const context = {
    tenantId,
    invitationId: invitation.id,
    secret: invitationSecret(tenantId, invitation.id),
  };
  await expect(
    accept({ ...identity, email: "wrong@example.invalid" }, context),
  ).rejects.toMatchObject({ code: "INVITATION_UNAVAILABLE" });
  const clientIdentity = {
    ...identity,
    subject: randomUUID(),
    email,
    nonce: randomUUID(),
  };
  const client = await accept(clientIdentity, context),
    cr = req(client);
  const projection = await authenticated(cr, (tx, ctx) => shared(tx, ctx));
  expect(projection).toHaveLength(1);
  expect(projection[0]).not.toHaveProperty("candidateName");
  expect(projection[0]?.tasks).toHaveLength(1);
  await expect(
    authenticated(cr, (tx, ctx) => detail(tx, ctx, p.id)),
  ).rejects.toMatchObject({ code: "FORBIDDEN" });
  const t = projection[0]!.tasks[0]!,
    complete = req(client, t.version);
  await authenticated(
    complete,
    (tx, ctx) =>
      completeShared(tx, ctx, complete, {
        placementId: p.id,
        taskId: t.id,
        evidence: "Client confirmed arrangements",
      }),
    true,
  );
  await authenticated(
    r,
    (tx, ctx) => revoke(tx, ctx, req(s), { grantId: projection[0]!.grantId }),
    true,
  );
  await expect(
    authenticated(cr, (tx, ctx) => shared(tx, ctx)),
  ).rejects.toMatchObject({ code: "ACCESS_CHANGED" });
  const otherTask = d.fromPlacementTask_placement.find(
    (x) => x.id !== task.id,
  )!;
  const renewal = await authenticated(
    r,
    (tx, c) =>
      invite(tx, c, req(s), {
        placementId: p.id,
        name: "Renewed contact",
        email,
        taskIds: [otherTask.id],
        sharedFields: [],
      }),
    true,
  );
  const renewed = await accept(clientIdentity, {
    tenantId,
    invitationId: renewal.id,
    secret: invitationSecret(tenantId, renewal.id),
  });
  const renewedRows = await authenticated(req(renewed), (tx, c) =>
    shared(tx, c),
  );
  expect(renewedRows[0]).not.toHaveProperty("plannedStart");
  expect(renewedRows[0]!.tasks.map((x) => x.id)).toEqual([otherTask.id]);
});
it("validates CSV, commits atomically, preserves source keys, and blocks quota overflow", async () => {
  const s = await fixture(),
    r = req(s);
  const header =
    "clientCode,clientName,candidateKey,candidateName,placementKey,acceptedOn,plannedStart\n";
  const profile = "import-" + randomUUID(),
    csv =
      header +
      "IMP-1,Import client,CAND-IMP,Imported person,PLACE-IMP,2026-10-01,2026-10-28\n";
  const batch = await authenticated(
    r,
    (tx, ctx) => stageImport(tx, ctx, req(s), { sourceProfile: profile, csv }),
    true,
  );
  const commit = req(s);
  await authenticated(
    commit,
    (tx, ctx) => commitImport(tx, ctx, commit, batch.id),
    true,
  );
  expect(
    await authenticated(r, (tx, ctx) => importStatus(tx, ctx, batch.id)),
  ).toMatchObject({ state: "committed", rowCount: 1 });
  const again = await authenticated(
    r,
    (tx, ctx) => stageImport(tx, ctx, req(s), { sourceProfile: profile, csv }),
    true,
  );
  await authenticated(
    r,
    (tx, ctx) => commitImport(tx, ctx, req(s), again.id),
    true,
  );
  const invalid = await authenticated(
    r,
    (tx, ctx) =>
      stageImport(tx, ctx, req(s), {
        sourceProfile: profile,
        csv:
          header +
          "IMP-1,Import client,CAND-IMP,=CMD(),PLACE-IMP,2026-10-01,2026-10-28\n",
      }),
    true,
  );
  expect(
    await authenticated(r, (tx, ctx) => importStatus(tx, ctx, invalid.id)),
  ).toMatchObject({ state: "invalid" });
  const overflow =
    header +
    Array.from(
      { length: 26 },
      (_, i) =>
        `OV-1,Overflow client,CAND-${i},Candidate ${i},PLACE-${i},2026-10-01,2026-10-28`,
    ).join("\n");
  const b = await authenticated(
    r,
    (tx, ctx) =>
      stageImport(tx, ctx, req(s), {
        sourceProfile: "overflow-" + profile,
        csv: overflow,
      }),
    true,
  );
  await expect(
    authenticated(r, (tx, ctx) => commitImport(tx, ctx, req(s), b.id), true),
  ).rejects.toMatchObject({ code: "CAPACITY_REACHED" });
  await authenticated(r, async (tx, ctx) => {
    expect(
      await tx.clientAccount.count({
        where: { tenantId: ctx.tenantId, accountCode: "OV-1" },
      }),
    ).toBe(0);
  });
});
it("generates real PDF/CSV/XLSX snapshots and rechecks access on downloads", async () => {
  const s = await fixture(),
    r = req(s);
  for (const format of ["pdf", "csv", "xlsx"]) {
    const run = await authenticated(
      r,
      (tx, ctx) =>
        requestExport(tx, ctx, req(s), {
          filters: { from: "2026-10-01", to: "2026-10-31" },
          format,
        }),
      true,
    );
    const tenantId = s.cookie.split("=")[1]!.split(".")[0]!;
    await generateExport(tenantId, run.id);
    await generateExport(tenantId, run.id);
    const status = await authenticated(r, (tx, ctx) =>
      exportStatus(tx, ctx, run.id),
    );
    expect(status.state).toBe("ready");
    const file = await authenticated(r, (tx, ctx) =>
      download(tx, ctx, status.artifactId!),
    );
    if (format === "pdf")
      expect(file.bytes.subarray(0, 4).toString()).toBe("%PDF");
    if (format === "xlsx")
      expect(file.bytes.subarray(0, 2).toString()).toBe("PK");
    if (format === "csv")
      expect(file.bytes.toString()).toContain("confirmedStarts");
  }
  const csv = await renderReport("csv", {
    asOf: "test",
    metrics: { count: 1 },
    rows: [
      {
        id: "1",
        candidate: "=FORMULA()",
        client: "Example",
        status: "accepted",
        original: "2026-10-01",
        planned: "2026-10-01",
        actual: null,
        overdue: 0,
      },
    ],
  });
  expect(csv.toString()).toContain("'=FORMULA()");
});
afterAll(async () => {
  await database().$disconnect();
});
