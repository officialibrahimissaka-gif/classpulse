import { it, expect, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import { config as dotenv } from "dotenv";
import { setup } from "@/domain/setup";
import { authenticated } from "@/platform/commands";
import { database, tenantTransaction } from "@/platform/database";
import { config } from "@/platform/config";
import { createClient, createPlacement, act, detail } from "@/domain/agency";
import { requestPrivacy, createHold } from "@/domain/privacy";
import { executeErasure } from "@/operations/erasure";
dotenv({ path: ".local/retention.env", quiet: true });
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
async function fixture() {
  const s = await setup(
      {
        issuer: "test-only",
        subject: randomUUID(),
        email: "privacy@example.invalid",
        name: "Privacy reviewer",
        authTime: Math.floor(Date.now() / 1000),
        mfa: true,
        expires: Date.now() + 900000,
        nonce: randomUUID(),
      },
      {
        name: "Privacy fixture",
        slug: "privacy-" + randomUUID(),
        country: "AE",
        authority: "Test authority",
        timeZone: "Asia/Dubai",
        currency: "AED",
        retentionDays: 90,
        retentionReference: "Reviewed policy for test",
        acknowledged: true,
      },
    ),
    r = req(s);
  const client = await authenticated(
    r,
    (tx, c) =>
      createClient(tx, c, req(s), {
        name: "Privacy client",
        code: randomUUID(),
      }),
    true,
  );
  const placement = await authenticated(
    r,
    (tx, c) =>
      createPlacement(tx, c, req(s), {
        clientId: client.id,
        candidateName: "Person to erase",
        candidateKey: randomUUID(),
        sourceProfile: "fixture",
        sourceKey: randomUUID(),
        acceptedOn: "2026-10-01",
        plannedStart: "2026-10-29",
      }),
    true,
  );
  const row = await authenticated(r, (tx, c) => detail(tx, c, placement.id));
  const request = await authenticated(
    r,
    (tx, c) =>
      requestPrivacy(tx, c, req(s), {
        subjectType: "candidate",
        subjectId: row.candidateId,
        dueOn: "2026-12-01",
        verificationReference: "Independent verified requester fixture",
      }),
    true,
  );
  const approval = {
    tenantId: row.tenantId,
    requestId: request.id,
    subjectType: "candidate",
    subjectId: row.candidateId,
    operatorReference: "Operator reviewed test record",
    retentionDispositionReference:
      "Reviewed erasure exception for synthetic fixture",
    lawfulErasureReviewed: true,
  };
  return { s, r, row, approval };
}
it("blocks active-placement erasure and performs reviewed terminal-source erasure idempotently", async () => {
  const { s, r, row, approval } = await fixture();
  await expect(
    executeErasure(process.env.RETENTION_DATABASE_URL!, approval),
  ).rejects.toThrow("Active placement");
  const close = req(s, row.version);
  await authenticated(
    close,
    (tx, c) =>
      act(tx, c, close, row.id, { action: "cancel", reason: "Fixture ended" }),
    true,
  );
  await executeErasure(process.env.RETENTION_DATABASE_URL!, approval);
  await executeErasure(process.env.RETENTION_DATABASE_URL!, approval);
  await authenticated(r, async (tx, c) => {
    expect(
      await tx.candidate.findUniqueOrThrow({
        where: { tenantId_id: { tenantId: c.tenantId, id: row.candidateId } },
      }),
    ).toMatchObject({ displayName: "Erased person", workEmail: null });
    expect(
      await tx.privacyRequest.findUniqueOrThrow({
        where: {
          tenantId_id: { tenantId: c.tenantId, id: approval.requestId },
        },
      }),
    ).toMatchObject({ state: "completed" });
    expect(
      await tx.deletionTombstone.count({
        where: { tenantId: c.tenantId, recordId: row.candidateId },
      }),
    ).toBe(1);
  });
});
it("preserves held data and prevents the runtime login assuming maintenance privileges", async () => {
  const { s, r, approval } = await fixture();
  await authenticated(
    r,
    (tx, c) =>
      createHold(tx, c, req(s), {
        reasonCode: "litigation_review",
        authorityReference: "Independent legal hold fixture",
        reviewOn: "2027-01-01",
      }),
    true,
  );
  await expect(
    executeErasure(process.env.RETENTION_DATABASE_URL!, approval),
  ).rejects.toThrow("Active legal hold");
  await expect(
    tenantTransaction(approval.tenantId, async (tx) => {
      await tx.$executeRaw`SET LOCAL ROLE app_retention`;
    }),
  ).rejects.toThrow();
});
afterAll(async () => {
  await database().$disconnect();
});
