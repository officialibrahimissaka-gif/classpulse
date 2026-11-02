import { Prisma } from "@/generated/prisma/client";
import { scopeHash } from "@/platform/policy";
import { putArtifact } from "@/platform/storage";
import { hash } from "@/platform/crypto";
import { config as dotenv } from "dotenv";
import { executeErasure } from "@/operations/erasure";
import { requestPrivacy } from "@/domain/privacy";
import { it, expect, afterAll, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse } from "csv-parse/sync";
import readXlsxFile from "read-excel-file/node";
import { tenant, within, request, scopedMember } from "../support/phase6";
import { authenticated } from "@/platform/commands";
import { database, tenantTransaction } from "@/platform/database";
import { createClient, createPlacement, act } from "@/domain/agency";
import { report } from "@/domain/analytics";
import { requestSnapshot, snapshotView } from "@/domain/report-snapshots";
import {
  requestExport,
  generateExport,
  exportStatus,
  download,
} from "@/domain/exports";
const filters = { from: "2026-10-01", to: "2026-10-31" };
async function fixture(count = 1) {
  const s = await tenant();
  const client = await within(
    s,
    (tx, c) =>
      createClient(tx, c, request(s), {
        name: "Frozen source client",
        code: randomUUID(),
      }),
    true,
  );
  const placements = [];
  for (let i = 0; i < count; i++)
    placements.push(
      await within(
        s,
        (tx, c) =>
          createPlacement(tx, c, request(s), {
            clientId: client.id,
            candidateName: "Frozen person " + i,
            candidateKey: randomUUID(),
            sourceProfile: "snapshot-test",
            sourceKey: randomUUID(),
            acceptedOn: "2026-10-01",
            plannedStart: "2026-10-29",
          }),
        true,
      ),
    );
  const snapshot = await within(
    s,
    (tx, c) => requestSnapshot(tx, c, request(s), { filters }),
    true,
  );
  const tenantId = await within(s, async (_, c) => c.tenantId);
  return { s, placements, snapshot, tenantId };
}
it("CONT-SNAP01 frozen dashboard and all three formats reconcile after source mutation without extending expiry", async () => {
  const { s, placements, snapshot, tenantId } = await fixture(12);
  const frozen = await within(s, (tx, c) => snapshotView(tx, c, snapshot.id));
  expect(frozen.data.rows).toHaveLength(12);
  await within(
    s,
    (tx, c) =>
      act(tx, c, request(s, placements[0]!.version), placements[0]!.id, {
        action: "cancel",
        reason: "Synthetic mutation after freeze",
      }),
    true,
  );
  expect(
    (await within(s, (tx, c) => report(tx, c, filters))).metrics.canceled,
  ).toBe(1);
  expect(
    (await within(s, (tx, c) => snapshotView(tx, c, snapshot.id))).data,
  ).toEqual(frozen.data);
  const dir = await mkdtemp(join(tmpdir(), "classpulse-snapshot-"));
  try {
    for (const format of ["pdf", "csv", "xlsx"]) {
      const run = await within(
        s,
        (tx, c) =>
          requestExport(tx, c, request(s), { snapshotId: snapshot.id, format }),
        true,
      );
      await generateExport(tenantId, run.id);
      await generateExport(tenantId, run.id);
      const state = await within(s, (tx, c) => exportStatus(tx, c, run.id));
      expect(state.snapshotId).toBe(snapshot.id);
      expect(state.expiresAt?.toISOString()).toBe(frozen.expiresAt);
      const file = await within(s, (tx, c) =>
        download(tx, c, state.artifactId!),
      );
      expect(file.format).toBe(format);
      if (format === "csv") {
        const records = parse(file.bytes.toString()) as string[][];
        expect(records.find((r) => r[0] === "canceled")?.[1]).toBe("0");
        expect(records.find((r) => r[0] === "As of")?.[1]).toBe(
          frozen.data.asOf,
        );
        expect(
          records.filter((r) => r[0]?.startsWith("Frozen person ")),
        ).toHaveLength(12);
      } else if (format === "xlsx") {
        const sheets = await readXlsxFile(file.bytes);
        const summary = sheets.find((s) => s.sheet === "Summary")!.data;
        expect(summary.find((r) => r[0] === "canceled")?.[1]).toBe(0);
        const rows = sheets.find((s) => s.sheet === "Placements")!.data;
        expect(rows).toHaveLength(13);
        expect(rows.slice(1).every((r) => r[2] === "accepted")).toBe(true);
      } else {
        const path = join(dir, "report.pdf");
        await writeFile(path, file.bytes);
        const text = execFileSync("pdftotext", [path, "-"], {
          encoding: "utf8",
        });
        expect(text).toContain("canceled: 0");
        expect(text).toContain(frozen.data.asOf);
        expect(text.match(/Frozen person /g) ?? []).toHaveLength(12);
      }
    }
    expect(
      await within(s, (tx, c) =>
        tx.reportSnapshot.count({ where: { tenantId: c.tenantId } }),
      ),
    ).toBe(1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
it("CONT-SNAP02 denies cross-tenant and same-tenant other-owner snapshot and export requests", async () => {
  const a = await fixture(),
    b = await tenant();
  const other = await scopedMember(
    a.s,
    "entity",
    await within(
      a.s,
      async (tx, c) =>
        (
          await tx.legalEntity.findFirstOrThrow({
            where: { tenantId: c.tenantId },
          })
        ).id,
    ),
  );
  await expect(
    within(b, (tx, c) => snapshotView(tx, c, a.snapshot.id)),
  ).rejects.toMatchObject({ status: 404 });
  await expect(
    authenticated(request(other), (tx, c) =>
      snapshotView(tx, c, a.snapshot.id),
    ),
  ).rejects.toMatchObject({ status: 404 });
  await expect(
    within(
      b,
      (tx, c) =>
        requestExport(tx, c, request(b), {
          snapshotId: a.snapshot.id,
          format: "csv",
        }),
      true,
    ),
  ).rejects.toMatchObject({ status: 404 });
});
it("CONT-SNAP03 rechecks current record scopes even when the grant fingerprint is unchanged", async () => {
  const f = await fixture();
  const recruiter = await scopedMember(f.s, "self");
  const memberId = await authenticated(
    request(recruiter),
    async (_, c) => c.memberId,
  );
  await within(
    f.s,
    (tx, c) =>
      tx.placement.update({
        where: {
          tenantId_id: { tenantId: c.tenantId, id: f.placements[0]!.id },
        },
        data: { ownerId: memberId, version: { increment: 1 } },
      }),
    true,
  );
  const snap = await authenticated(
    request(recruiter),
    (tx, c) => requestSnapshot(tx, c, request(recruiter), { filters }),
    true,
  );
  const run = await authenticated(
    request(recruiter),
    (tx, c) =>
      requestExport(tx, c, request(recruiter), {
        snapshotId: snap.id,
        format: "csv",
      }),
    true,
  );
  await generateExport(f.tenantId, run.id);
  const state = await authenticated(request(recruiter), (tx, c) =>
    exportStatus(tx, c, run.id),
  );
  await within(
    f.s,
    async (tx, c) => {
      await tx.placementTask.updateMany({
        where: {
          tenantId: c.tenantId,
          placementId: f.placements[0]!.id,
          ownerId: memberId,
        },
        data: { ownerId: c.memberId, version: { increment: 1 } },
      });
      await tx.placement.update({
        where: {
          tenantId_id: { tenantId: c.tenantId, id: f.placements[0]!.id },
        },
        data: { ownerId: c.memberId, version: { increment: 1 } },
      });
    },
    true,
  );
  await expect(
    authenticated(request(recruiter), (tx, c) => snapshotView(tx, c, snap.id)),
  ).rejects.toMatchObject({ status: 404 });
  await expect(
    authenticated(request(recruiter), (tx, c) =>
      download(tx, c, state.artifactId!),
    ),
  ).rejects.toMatchObject({ status: 404 });
});
it("CONT-SNAP04 expiry and append-only summary fence prevent reuse and publication", async () => {
  const f = await fixture();
  await expect(
    within(
      f.s,
      (tx, c) =>
        tx.reportSnapshot.update({
          where: { tenantId_id: { tenantId: c.tenantId, id: f.snapshot.id } },
          data: { summary: { schemaVersion: 1 } },
        }),
      true,
    ),
  ).rejects.toThrow();
  const queued = await within(
    f.s,
    (tx, c) =>
      requestExport(tx, c, request(f.s), {
        snapshotId: f.snapshot.id,
        format: "pdf",
      }),
    true,
  );
  const ctx = await within(f.s, async (_, c) => c);
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(Date.now() + 8 * 86400000);
  try {
    await expect(generateExport(f.tenantId, queued.id)).rejects.toMatchObject({
      status: 404,
    });
    await expect(generateExport(f.tenantId, queued.id)).rejects.toMatchObject({
      status: 404,
    });
    await expect(
      tenantTransaction(f.tenantId, (tx) =>
        snapshotView(tx, ctx, f.snapshot.id),
      ),
    ).rejects.toMatchObject({ status: 404 });
    await expect(
      tenantTransaction(f.tenantId, (tx) =>
        requestExport(tx, ctx, request(f.s), {
          snapshotId: f.snapshot.id,
          format: "pdf",
        }),
      ),
    ).rejects.toMatchObject({ status: 404 });
  } finally {
    vi.useRealTimers();
  }
});
afterAll(async () => database().$disconnect());

it("CONT-SNAP05 reviewed erasure invalidates frozen views, existing artifacts and queued re-exports", async () => {
  const f = await fixture();
  const completed = await within(
    f.s,
    (tx, c) =>
      requestExport(tx, c, request(f.s), {
        snapshotId: f.snapshot.id,
        format: "csv",
      }),
    true,
  );
  await generateExport(f.tenantId, completed.id);
  const state = await within(f.s, (tx, c) => exportStatus(tx, c, completed.id));
  const queued = await within(
    f.s,
    (tx, c) =>
      requestExport(tx, c, request(f.s), {
        snapshotId: f.snapshot.id,
        format: "pdf",
      }),
    true,
  );
  await within(
    f.s,
    (tx, c) =>
      act(tx, c, request(f.s, f.placements[0]!.version), f.placements[0]!.id, {
        action: "cancel",
        reason: "Synthetic source closed for erasure test",
      }),
    true,
  );
  const candidateId = await within(
    f.s,
    async (tx, c) =>
      (
        await tx.placement.findUniqueOrThrow({
          where: {
            tenantId_id: { tenantId: c.tenantId, id: f.placements[0]!.id },
          },
        })
      ).candidateId,
  );
  const privacy = await within(
    f.s,
    (tx, c) =>
      requestPrivacy(tx, c, request(f.s), {
        subjectType: "candidate",
        subjectId: candidateId,
        dueOn: "2026-12-01",
        verificationReference: "Synthetic independently verified requester",
      }),
    true,
  );
  dotenv({ path: ".local/retention.env", quiet: true });
  await executeErasure(process.env.RETENTION_DATABASE_URL!, {
    tenantId: f.tenantId,
    requestId: privacy.id,
    subjectType: "candidate",
    subjectId: candidateId,
    operatorReference: "Synthetic reviewed operator",
    retentionDispositionReference: "Synthetic reviewed retention disposition",
    lawfulErasureReviewed: true,
  });
  await expect(
    within(f.s, (tx, c) => snapshotView(tx, c, f.snapshot.id)),
  ).rejects.toMatchObject({ status: 404 });
  await expect(
    within(f.s, (tx, c) => download(tx, c, state.artifactId!)),
  ).rejects.toMatchObject({ status: 404 });
  await generateExport(f.tenantId, queued.id);
  expect(
    (await within(f.s, (tx, c) => exportStatus(tx, c, queued.id))).state,
  ).toBe("privacy_invalidated");
  expect(
    await within(f.s, (tx, c) =>
      tx.exportArtifact.count({ where: { tenantId: c.tenantId } }),
    ),
  ).toBe(0);
});

it("CONT-SNAP07 legacy artifacts retain their original download fence and cannot be silently upgraded", async () => {
  const f = await fixture(),
    id = randomUUID(),
    bytes = Buffer.from("legacy frozen report"),
    key = `${f.tenantId}/${id}.csv`;
  const version = await putArtifact(key, bytes, "text/csv; charset=utf-8");
  const legacy = await within(
    f.s,
    async (tx, c) => {
      const current = await tx.reportSnapshot.findUniqueOrThrow({
        where: { tenantId_id: { tenantId: c.tenantId, id: f.snapshot.id } },
      });
      const old = await tx.reportSnapshot.create({
        data: {
          tenantId: c.tenantId,
          asOf: current.asOf,
          sourceWatermark: current.sourceWatermark,
          scopeHash: scopeHash(c),
          entitlementRevision: c.revision,
          metricVersions: current.metricVersions as Prisma.InputJsonValue,
          filterSchema: current.filterSchema as Prisma.InputJsonValue,
          timeZone: current.timeZone,
          currencyPolicy: current.currencyPolicy,
          snapshotHash: current.snapshotHash,
          expiresAt: current.expiresAt,
          requesterId: c.memberId,
        },
      });
      await tx.exportArtifact.create({
        data: {
          id,
          tenantId: c.tenantId,
          snapshotId: old.id,
          ownerId: c.memberId,
          format: "csv",
          state: "ready",
          objectKey: key,
          objectVersion: version,
          contentHash: hash(bytes),
          rowCount: 0,
          classification: "C2",
          expiresAt: old.expiresAt,
        },
      });
      return old.id;
    },
    true,
  );
  expect((await within(f.s, (tx, c) => download(tx, c, id))).bytes).toEqual(
    bytes,
  );
  await expect(
    within(f.s, (tx, c) => snapshotView(tx, c, legacy)),
  ).rejects.toMatchObject({ code: "LEGACY_SNAPSHOT" });
  await expect(
    within(
      f.s,
      (tx, c) =>
        requestExport(tx, c, request(f.s), {
          snapshotId: legacy,
          format: "xlsx",
        }),
      true,
    ),
  ).rejects.toMatchObject({ code: "LEGACY_SNAPSHOT" });
  await within(
    f.s,
    (tx, c) =>
      tx.tenant.update({
        where: { id: c.tenantId },
        data: { dataRevision: { increment: 1 } },
      }),
    true,
  );
  await expect(
    within(f.s, (tx, c) => download(tx, c, id)),
  ).rejects.toMatchObject({ status: 404 });
});
