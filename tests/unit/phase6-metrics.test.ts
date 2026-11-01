import { it, expect } from "vitest";
import {
  calculate,
  metricMembership,
  type MetricRow,
} from "@/domain/analytics";
it("P6-MET-001 independent boundary/early/late/odd-median fixture reconciles KPI values and drill-down IDs", () => {
  const row = (
    id: string,
    original: string,
    actual: string | null,
    status = "started",
    overdue = 0,
  ): MetricRow => ({
    id,
    original,
    actual,
    status,
    overdue,
    planned: original,
    candidate: "Synthetic",
    client: "Synthetic",
  });
  const rows = [
    row("early", "2026-10-01", "2026-09-30"),
    row("late-one", "2026-10-10", "2026-10-11"),
    row("late-four", "2026-10-27", "2026-10-31"),
    row("outside-original", "2026-09-30", "2026-10-01"),
    row("unresolved", "2026-10-31", null, "accepted", 2),
    row("canceled", "2026-10-01", null, "canceled"),
  ];
  const result = calculate(rows, "2026-10-01", "2026-10-31");
  expect(result).toMatchObject({
    confirmedStarts: 3,
    overdueRequired: 2,
    medianDelay: 1,
    denominator: 3,
    unresolved: 1,
    canceled: 1,
  });
  expect(result.onTimeRate).toBeCloseTo(100 / 3, 10);
  expect(metricMembership(rows, "2026-10-01", "2026-10-31")).toEqual({
    confirmedStarts: ["late-one", "late-four", "outside-original"],
    onTimeRate: ["early", "late-one", "late-four"],
    overdueRequired: ["unresolved"],
    medianDelay: ["early", "late-one", "late-four"],
  });
});
