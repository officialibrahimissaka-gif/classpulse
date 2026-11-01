import { check } from "@/platform/errors";
import { z } from "zod";
import type { Tx } from "@/platform/database";
import {
  type Context,
  placementScope,
  requireModule,
  requirePermission,
} from "@/platform/policy";
import { dateSchema } from "./agency";
export const filterSchema = z
  .object({
    from: dateSchema,
    to: dateSchema,
    clientId: z.uuid().optional(),
    entityId: z.uuid().optional(),
  })
  .strict()
  .refine((v) => v.from <= v.to, "Choose an ordered date range");
export type MetricRow = {
  id: string;
  version?: number;
  status: string;
  original: string;
  planned: string;
  actual: string | null;
  client: string;
  candidate: string;
  overdue: number;
};
export function metricMembership(rows: MetricRow[], from: string, to: string) {
  const started = rows.filter(
    (r) =>
      r.status === "started" &&
      r.actual &&
      r.original >= from &&
      r.original <= to,
  );
  return {
    confirmedStarts: rows
      .filter(
        (r) =>
          r.status === "started" &&
          r.actual &&
          r.actual >= from &&
          r.actual <= to,
      )
      .map((r) => r.id),
    onTimeRate: started.map((r) => r.id),
    overdueRequired: rows.filter((r) => r.overdue > 0).map((r) => r.id),
    medianDelay: started.map((r) => r.id),
  };
}
export function calculate(rows: MetricRow[], from: string, to: string) {
  const cohort = rows.filter((r) => r.original >= from && r.original <= to),
    started = cohort.filter((r) => r.status === "started" && r.actual),
    delays = started
      .map((r) =>
        Math.max(
          0,
          (Date.parse(r.actual!) - Date.parse(r.original)) / 86400000,
        ),
      )
      .sort((a, b) => a - b),
    n = delays.length;
  return {
    confirmedStarts: rows.filter(
      (r) =>
        r.status === "started" &&
        r.actual &&
        r.actual >= from &&
        r.actual <= to,
    ).length,
    onTimeRate: n
      ? (100 * started.filter((r) => r.actual! <= r.original).length) / n
      : null,
    overdueRequired: rows.reduce((sum, r) => sum + r.overdue, 0),
    medianDelay: n
      ? n % 2
        ? delays[Math.floor(n / 2)]!
        : (delays[n / 2 - 1]! + delays[n / 2]!) / 2
      : null,
    denominator: n,
    unresolved: cohort.filter(
      (r) => !["started", "canceled"].includes(r.status),
    ).length,
    canceled: cohort.filter((r) => r.status === "canceled").length,
  };
}
export async function report(tx: Tx, ctx: Context, input: unknown) {
  requireModule(ctx, "platform.analytics");
  requireModule(ctx, "agency.starts");
  requirePermission(ctx, "reports.read");
  const filters = filterSchema.parse(input),
    now = new Date();
  const sources = await tx.placement.findMany({
    where: {
      AND: [
        placementScope(ctx),
        filters.clientId ? { clientId: filters.clientId } : {},
        filters.entityId ? { entityId: filters.entityId } : {},
        {
          OR: [
            {
              originalPlannedStart: {
                gte: new Date(filters.from),
                lte: new Date(filters.to),
              },
            },
            {
              actualStart: {
                gte: new Date(filters.from),
                lte: new Date(filters.to),
              },
            },
            { status: { notIn: ["started", "canceled"] } },
          ],
        },
      ],
    },
    include: {
      client: { select: { name: true } },
      candidate: { select: { displayName: true } },
      fromPlacementTask_placement: {
        select: { required: true, state: true, dueAt: true },
      },
    },
    take: 10001,
  });
  check(
    sources.length <= 10000,
    422,
    "REPORT_TOO_LARGE",
    "Choose a narrower date range, client or legal entity to report on fewer than 10,000 records.",
  );
  const rows: MetricRow[] = sources.map((r) => ({
    id: r.id,
    version: r.version,
    status: r.status,
    original: r.originalPlannedStart.toISOString().slice(0, 10),
    planned: r.currentPlannedStart.toISOString().slice(0, 10),
    actual: r.actualStart?.toISOString().slice(0, 10) ?? null,
    client: r.client.name,
    candidate: r.candidate.displayName,
    overdue: ["started", "canceled"].includes(r.status)
      ? 0
      : r.fromPlacementTask_placement.filter(
          (t) =>
            t.required &&
            !["completed", "waived"].includes(t.state) &&
            t.dueAt < now,
        ).length,
  }));
  return {
    asOf: now.toISOString(),
    sourceWatermark: new Date(
      sources.length
        ? Math.max(...sources.map((r) => r.updatedAt.getTime()))
        : now.getTime(),
    ).toISOString(),
    filters,
    metrics: calculate(rows, filters.from, filters.to),
    drilldowns: metricMembership(rows, filters.from, filters.to),
    distribution: Object.fromEntries(
      ["accepted", "in_progress", "ready", "started", "canceled"].map(
        (state) => [state, rows.filter((r) => r.status === state).length],
      ),
    ),
    rows,
  };
}
