import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import type { Tx } from "@/platform/database";
import {
  type Context,
  scopeHash,
  placementScope,
  requireModule,
  requirePermission,
} from "@/platform/policy";
import { command, audit } from "@/platform/commands";
import { canonical, hash } from "@/platform/crypto";
import { check } from "@/platform/errors";
import { filterSchema, report, type MetricRow } from "./analytics";
import { metricDefinitions } from "./metrics";
export const exportRowLimit = 5000;
export function reportScopeHash(ctx: Context) {
  return scopeHash({ ...ctx, dataRevision: 0 });
}
const rowSchema = z
  .object({
    id: z.uuid(),
    version: z.number().int().positive().optional(),
    status: z.string(),
    original: z.string(),
    planned: z.string(),
    actual: z.string().nullable(),
    client: z.string(),
    candidate: z.string(),
    overdue: z.number().int().nonnegative(),
  })
  .strict();
const summarySchema = z
  .object({
    schemaVersion: z.literal(1),
    rowCount: z.number().int().nonnegative().max(exportRowLimit),
    metrics: z
      .object({
        confirmedStarts: z.number(),
        onTimeRate: z.number().nullable(),
        overdueRequired: z.number(),
        medianDelay: z.number().nullable(),
        denominator: z.number(),
        unresolved: z.number(),
        canceled: z.number(),
      })
      .strict(),
    drilldowns: z
      .object({
        confirmedStarts: z.array(z.uuid()),
        onTimeRate: z.array(z.uuid()),
        overdueRequired: z.array(z.uuid()),
        medianDelay: z.array(z.uuid()),
      })
      .strict(),
    distribution: z.record(z.string(), z.number().int().nonnegative()),
  })
  .strict();
export type ReportData = Awaited<ReturnType<typeof report>>;
function access(ctx: Context) {
  requireModule(ctx, "platform.analytics");
  requireModule(ctx, "agency.starts");
  requirePermission(ctx, "reports.read");
  requirePermission(ctx, "reports.export");
}
export async function captureSnapshot(tx: Tx, ctx: Context, filters: unknown) {
  access(ctx);
  const data = await report(tx, ctx, filters);
  check(
    data.rows.length <= exportRowLimit,
    422,
    "EXPORT_ROW_LIMIT",
    "An export can contain at most 5,000 source rows. Narrow the report filters.",
  );
  const snapshot = await tx.reportSnapshot.create({
    data: {
      tenantId: ctx.tenantId,
      asOf: new Date(data.asOf),
      sourceWatermark: new Date(data.sourceWatermark),
      scopeHash: reportScopeHash(ctx),
      entitlementRevision: ctx.revision,
      metricVersions: Object.fromEntries(
        metricDefinitions.map((d) => [d.metricKey, d.revision]),
      ),
      filterSchema: data.filters,
      timeZone: "UTC",
      currencyPolicy: "no_money",
      snapshotHash: hash(canonical(data)),
      summary: {
        schemaVersion: 1,
        metrics: data.metrics,
        drilldowns: data.drilldowns,
        distribution: data.distribution,
        rowCount: data.rows.length,
      },
      expiresAt: new Date(Date.now() + 7 * 86400000),
      requesterId: ctx.memberId,
    },
  });
  for (const def of metricDefinitions) {
    const metric = await tx.metricDefinition.upsert({
      where: {
        tenantId_metricKey_revision: {
          tenantId: ctx.tenantId,
          metricKey: def.metricKey,
          revision: def.revision,
        },
      },
      create: {
        tenantId: ctx.tenantId,
        metricKey: def.metricKey,
        revision: def.revision,
        sourceModule: "agency.starts",
        definitionHash: def.definitionHash,
        state: "active",
      },
      update: {},
    });
    check(
      metric.definitionHash === def.definitionHash,
      409,
      "METRIC_VERSION_CONFLICT",
      "Metric definition changed without a version increment",
    );
    await tx.reportMetricBinding.create({
      data: {
        tenantId: ctx.tenantId,
        snapshotId: snapshot.id,
        metricId: metric.id,
        definitionHash: def.definitionHash,
      },
    });
  }
  await tx.reportResultRow.createMany({
    data: data.rows.map((r, i) => ({
      tenantId: ctx.tenantId,
      snapshotId: snapshot.id,
      rowKey: String(i),
      sourceType: "placement",
      sourceId: r.id,
      sourceVersion: r.version ?? null,
      projection: r as unknown as Prisma.InputJsonValue,
      classification: "C2",
    })),
  });

  await audit(
    tx,
    ctx,
    "report.snapshot_created",
    "report_snapshot",
    snapshot.id,
  );
  return { snapshot, data };
}
export async function requestSnapshot(
  tx: Tx,
  ctx: Context,
  request: Request,
  input: unknown,
) {
  access(ctx);
  const data = z.object({ filters: filterSchema }).strict().parse(input);
  return command(tx, ctx, request, "reports.snapshot", data, async () => {
    const { snapshot } = await captureSnapshot(tx, ctx, data.filters);
    return { id: snapshot.id, version: 1, state: "ready" };
  });
}
export async function readSnapshot(tx: Tx, ctx: Context, id: string) {
  access(ctx);
  const snapshot = await tx.reportSnapshot.findFirst({
    where: {
      tenantId: ctx.tenantId,
      id,
      requesterId: ctx.memberId,
      expiresAt: { gt: new Date() },
    },
  });
  check(
    snapshot,
    404,
    "SNAPSHOT_UNAVAILABLE",
    "This snapshot expired or is unavailable. Freeze a new report.",
  );
  check(
    snapshot.summary !== null,
    409,
    "LEGACY_SNAPSHOT",
    "This older snapshot cannot be reused. Freeze a new report.",
  );
  check(
    snapshot.scopeHash === reportScopeHash(ctx),
    404,
    "SNAPSHOT_UNAVAILABLE",
    "This snapshot expired or its access scope changed. Freeze a new report.",
  );
  const summary = summarySchema.parse(snapshot.summary);
  const stored = await tx.reportResultRow.findMany({
    where: { tenantId: ctx.tenantId, snapshotId: id },
    take: exportRowLimit + 1,
  });
  stored.sort((a, b) => Number(a.rowKey) - Number(b.rowKey));
  check(
    stored.length === summary.rowCount,
    500,
    "SNAPSHOT_INTEGRITY",
    "Snapshot integrity check failed.",
  );
  const rows: MetricRow[] = stored.map((r, i) => {
    const row = rowSchema.parse(r.projection);
    check(
      r.rowKey === String(i) &&
        r.sourceType === "placement" &&
        r.sourceId === row.id &&
        r.sourceVersion === (row.version ?? null),
      500,
      "SNAPSHOT_INTEGRITY",
      "Snapshot integrity check failed.",
    );
    return row;
  });
  if (rows.length) {
    const allowed = await tx.placement.count({
      where: {
        AND: [placementScope(ctx), { id: { in: rows.map((r) => r.id) } }],
      },
    });
    check(
      allowed === rows.length,
      404,
      "SNAPSHOT_UNAVAILABLE",
      "Source record access changed. Freeze a new report.",
    );
  }
  const data: ReportData = {
    asOf: snapshot.asOf.toISOString(),
    sourceWatermark: snapshot.sourceWatermark.toISOString(),
    filters: filterSchema.parse(snapshot.filterSchema),
    metrics: summary.metrics,
    drilldowns: summary.drilldowns,
    distribution: summary.distribution,
    rows,
  };
  check(
    hash(canonical(data)) === snapshot.snapshotHash,
    500,
    "SNAPSHOT_INTEGRITY",
    "Snapshot integrity check failed.",
  );
  return { snapshot, data };
}
export async function snapshotView(tx: Tx, ctx: Context, id: string) {
  const { snapshot, data } = await readSnapshot(tx, ctx, id);
  await audit(tx, ctx, "report.snapshot_inspected", "report_snapshot", id);
  return { id: snapshot.id, expiresAt: snapshot.expiresAt.toISOString(), data };
}
