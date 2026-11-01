import { it, expect } from "vitest";
import { parse } from "csv-parse/sync";
import { renderReport } from "@/domain/exports";
it("P6-EXP-002 CSV report is readable by a strict independent parser without variable column counts", async () => {
  const bytes = await renderReport("csv", {
    asOf: "2026-11-01T00:00:00Z",
    metrics: { confirmedStarts: 1, onTimeRate: 100 },
    rows: [
      {
        id: crypto.randomUUID(),
        candidate: "Synthetic person",
        client: "Synthetic client",
        status: "started",
        original: "2026-10-01",
        planned: "2026-10-02",
        actual: "2026-10-01",
        overdue: 0,
      },
    ],
  });
  expect(() => parse(bytes.toString("utf8"))).not.toThrow();
});
