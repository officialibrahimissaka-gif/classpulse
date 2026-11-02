import { randomUUID } from "node:crypto";
import { z } from "zod";
import PDFDocument from "pdfkit";
import { spreadsheet } from "@/platform/spreadsheet";
import { stringify } from "csv-stringify/sync";
import { type Tx, tenantTransaction } from "@/platform/database";
import {
  type Context,
  memberContext,
  requirePermission,
  requireModule,
  scopeHash,
} from "@/platform/policy";
import { command, audit } from "@/platform/commands";
import { check } from "@/platform/errors";
import { hash } from "@/platform/crypto";
import { putArtifact, getArtifact, removeArtifact } from "@/platform/storage";
import { filterSchema, type MetricRow } from "./analytics";
import {
  captureSnapshot,
  readSnapshot,
  reportScopeHash,
  exportRowLimit,
} from "./report-snapshots";
export { exportRowLimit } from "./report-snapshots";
const formatSchema = z.enum(["pdf", "csv", "xlsx"]);
export const exportRequestSchema = z.union([
  z.object({ filters: filterSchema, format: formatSchema }).strict(),
  z.object({ snapshotId: z.uuid(), format: formatSchema }).strict(),
]);
export const contentTypes = {
  pdf: "application/pdf",
  csv: "text/csv; charset=utf-8",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};
export async function requestExport(
  tx: Tx,
  ctx: Context,
  request: Request,
  input: unknown,
) {
  requireModule(ctx, "platform.analytics");
  requireModule(ctx, "agency.starts");
  requirePermission(ctx, "reports.export");
  const data = exportRequestSchema.parse(input);
  return command(tx, ctx, request, "reports.export", data, async () => {
    if ("snapshotId" in data) await readSnapshot(tx, ctx, data.snapshotId);
    const run = await tx.reportRun.create({
      data: {
        tenantId: ctx.tenantId,
        requesterId: ctx.memberId,
        state: "queued",
        filterSchema: {
          ...data,
          requestedScope: reportScopeHash(ctx),
          schemaVersion: 2,
        },
        snapshotId: "snapshotId" in data ? data.snapshotId : null,
      },
    });
    await tx.backgroundJob.create({
      data: {
        tenantId: ctx.tenantId,
        operationKey: "export:" + run.id,
        jobType: "report.generate",
        moduleKey: "platform.analytics",
        resourceType: "report_run",
        resourceId: run.id,
        state: "queued",
        availableAt: new Date(),
        principalId: ctx.memberId,
      },
    });
    await audit(tx, ctx, "report.requested", "report_run", run.id, {
      format: data.format,
    });
    return { id: run.id, version: 1, state: "queued" };
  });
}
export async function exportStatus(tx: Tx, ctx: Context, id: string) {
  requirePermission(ctx, "reports.export");
  requireModule(ctx, "platform.analytics");
  const row = await tx.reportRun.findFirst({
    where: { tenantId: ctx.tenantId, id, requesterId: ctx.memberId },
  });
  check(row, 404, "NOT_FOUND", "Report unavailable");
  requireModule(ctx, "agency.starts");
  if (row.snapshotId) {
    const snapshot = await tx.reportSnapshot.findUnique({
      where: { tenantId_id: { tenantId: ctx.tenantId, id: row.snapshotId } },
    });
    if (snapshot?.summary) await readSnapshot(tx, ctx, row.snapshotId);
  }
  const format = z
    .object({ format: formatSchema })
    .parse(row.filterSchema).format;
  const result = row.result as { artifactId?: string } | null;
  const artifact = row.snapshotId
    ? await tx.exportArtifact.findFirst({
        where: {
          tenantId: ctx.tenantId,
          snapshotId: row.snapshotId,
          ownerId: ctx.memberId,
          format,
          ...(result?.artifactId ? { id: result.artifactId } : {}),
          state: "ready",
          expiresAt: { gt: new Date() },
        },
      })
    : null;
  return {
    id: row.id,
    state: row.state,
    snapshotId: row.snapshotId,
    errorCode: row.errorCode,
    artifactId: artifact?.id,
    expiresAt: artifact?.expiresAt,
  };
}
export function csvSafe(value: string) {
  return /^[\s]*[=+@\-\t\r]/.test(value) ? "'" + value : value;
}
export async function renderReport(
  format: z.infer<typeof formatSchema>,
  data: {
    asOf: string;
    metrics: Record<string, number | null>;
    rows: MetricRow[];
  },
) {
  check(
    data.rows.length <= exportRowLimit,
    422,
    "EXPORT_ROW_LIMIT",
    "An export can contain at most 5,000 source rows. Narrow the report filters.",
  );
  const headings = [
    "Candidate",
    "Client",
    "State",
    "Original start",
    "Current plan",
    "Actual start",
    "Overdue required",
  ];
  const rows = data.rows.map((r) => [
    r.candidate,
    r.client,
    r.status,
    r.original,
    r.planned,
    r.actual ?? "",
    r.overdue,
  ]);
  if (format === "csv")
    return Buffer.from(
      stringify(
        [
          ["As of", data.asOf],
          ...Object.entries(data.metrics),
          [],
          headings,
          ...rows.map((r) =>
            r.map((v) => (typeof v === "string" ? csvSafe(v) : v)),
          ),
        ].map((record) =>
          Array.from(
            { length: headings.length },
            (_, index) => record[index] ?? "",
          ),
        ),
      ),
    );
  if (format === "xlsx") {
    return spreadsheet([
      {
        name: "Summary",
        rows: [["As of", data.asOf], ...Object.entries(data.metrics)],
      },
      { name: "Placements", rows: [headings, ...rows] },
    ]);
  }
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      margin: 45,
      size: "A4",
      font: "assets/fonts/DejaVuSans.ttf",
      info: { Title: "Placement operations report", Author: "ClassPulse" },
    });
    doc.on("data", (b: Buffer) => chunks.push(b));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.fontSize(23).text("Placement operations");
    doc.fontSize(9).text("As of " + data.asOf);
    doc.moveDown();
    for (const [k, v] of Object.entries(data.metrics))
      doc.text(`${k}: ${v ?? "No data"}`);
    doc.moveDown();
    doc.fontSize(12).text("Source records");
    for (const r of data.rows) {
      doc.moveDown(0.5);
      doc.fontSize(10).text(`${r.candidate} · ${r.client}`);
      doc
        .fontSize(9)
        .text(
          `${r.status} | Original ${r.original} | Planned ${r.planned} | Actual ${r.actual ?? "—"} | Overdue ${r.overdue}`,
        );
    }
    doc.end();
  });
}
export async function generateExport(tenantId: string, runId: string) {
  const generated = await tenantTransaction(
    tenantId,
    async (tx) => {
      await tx.$queryRaw`SELECT id FROM tenant WHERE id=${tenantId}::uuid FOR SHARE`;
      await tx.$queryRaw`SELECT id FROM report_run WHERE tenant_id=${tenantId}::uuid AND id=${runId}::uuid FOR UPDATE`;
      const run = await tx.reportRun.findUniqueOrThrow({
        where: { tenantId_id: { tenantId, id: runId } },
      });
      if (run.state !== "queued") return null;
      const metadata = z
        .object({
          requestedScope: z.string(),
          schemaVersion: z.literal(2).optional(),
        })
        .parse(run.filterSchema);
      const raw = run.filterSchema as Record<string, unknown>;
      const input = exportRequestSchema.parse(
        Object.fromEntries(
          Object.entries(raw).filter(
            ([key]) => !["requestedScope", "schemaVersion"].includes(key),
          ),
        ),
      );
      const ctx = await memberContext(tx, tenantId, run.requesterId);
      requirePermission(ctx, "reports.export");
      check(
        (metadata.schemaVersion === 2
          ? reportScopeHash(ctx)
          : scopeHash(ctx)) === metadata.requestedScope,
        403,
        "ACCESS_CHANGED",
        "Report scope changed",
      );
      const { snapshot, data } =
        "snapshotId" in input
          ? await readSnapshot(tx, ctx, input.snapshotId)
          : await captureSnapshot(tx, ctx, input.filters);
      await tx.reportRun.update({
        where: { tenantId_id: { tenantId, id: runId } },
        data: {
          state: "generating",
          snapshotId: snapshot.id,
          version: { increment: 1 },
        },
      });
      return { snapshot, input, data, memberId: ctx.memberId };
    },
    "RepeatableRead",
  );
  if (!generated) return;
  const { snapshot, input, data, memberId } = generated,
    id = randomUUID(),
    key = `${tenantId}/${id}.${input.format}`;
  let version: string | undefined;
  try {
    const bytes = await renderReport(input.format, data);
    version = await putArtifact(key, bytes, contentTypes[input.format]);
    await tenantTransaction(tenantId, async (tx) => {
      await tx.$queryRaw`SELECT id FROM tenant WHERE id=${tenantId}::uuid FOR SHARE`;
      const ctx = await memberContext(tx, tenantId, memberId);
      requirePermission(ctx, "reports.export");
      requireModule(ctx, "platform.analytics");
      requireModule(ctx, "agency.starts");
      check(
        reportScopeHash(ctx) === snapshot.scopeHash,
        403,
        "ACCESS_CHANGED",
        "Report scope changed",
      );
      await readSnapshot(tx, ctx, snapshot.id);
      await tx.exportArtifact.create({
        data: {
          id,
          tenantId,
          snapshotId: snapshot.id,
          ownerId: memberId,
          format: input.format,
          state: "ready",
          objectKey: key,
          objectVersion: version!,
          contentHash: hash(bytes),
          rowCount: data.rows.length,
          classification: "C2",
          expiresAt: snapshot.expiresAt,
        },
      });
      await tx.reportRun.update({
        where: { tenantId_id: { tenantId, id: runId } },
        data: {
          state: "ready",
          result: { artifactId: id },
          version: { increment: 1 },
        },
      });
      await audit(tx, ctx, "report.ready", "export_artifact", id);
    });
  } catch (error) {
    if (version) await removeArtifact(key, version);
    await tenantTransaction(tenantId, async (tx) => {
      await tx.reportRun.update({
        where: { tenantId_id: { tenantId, id: runId } },
        data: {
          state: "failed",
          errorCode: "REPORT_REVIEW_REQUIRED",
          version: { increment: 1 },
        },
      });
    });
    throw error;
  }
}
export async function download(tx: Tx, ctx: Context, id: string) {
  requirePermission(ctx, "reports.export");
  requireModule(ctx, "platform.analytics");
  requireModule(ctx, "agency.starts");
  const artifact = await tx.exportArtifact.findFirst({
    where: {
      tenantId: ctx.tenantId,
      id,
      ownerId: ctx.memberId,
      state: "ready",
      expiresAt: { gt: new Date() },
    },
    include: { snapshot: true },
  });
  check(
    artifact &&
      artifact.snapshot.scopeHash ===
        (artifact.snapshot.summary ? reportScopeHash(ctx) : scopeHash(ctx)),
    404,
    "ARTIFACT_UNAVAILABLE",
    "This export expired or its access scope changed. Generate a new report.",
  );
  if (artifact.snapshot.summary)
    await readSnapshot(tx, ctx, artifact.snapshotId);
  const bytes = await getArtifact(artifact.objectKey, artifact.objectVersion);
  check(
    hash(bytes) === artifact.contentHash,
    500,
    "ARTIFACT_INTEGRITY",
    "Artifact integrity check failed",
  );
  await audit(tx, ctx, "report.downloaded", "export_artifact", id);
  return { bytes, format: formatSchema.parse(artifact.format) };
}
