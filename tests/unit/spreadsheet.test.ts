import { it, expect } from "vitest";
import readXlsxFile from "read-excel-file/node";
import { spreadsheet } from "@/platform/spreadsheet";
import { validateCsv } from "@/domain/imports";
it("produces interoperable XLSX with literal formulas, XML escaping, numeric cells and Arabic names", async () => {
  const bytes = spreadsheet([
    {
      name: "Placements",
      rows: [
        ["Name", "Value"],
        ["=SUM(1,2)", 42],
        ["علي & <Example>", null],
      ],
    },
  ]);
  const rows = await readXlsxFile(bytes);
  expect(rows[0]?.data).toEqual([
    ["Name", "Value"],
    ["=SUM(1,2)", 42],
    ["علي & <Example>", null],
  ]);
});
it("rejects duplicate CSV references and dangerous spreadsheet prefixes without returning raw row values", () => {
  const csv =
    "clientCode,clientName,candidateKey,candidateName,placementKey,acceptedOn,plannedStart\nA,Client,C1,=FORMULA(),P1,2026-11-01,2026-11-03\nA,Client,C2,Other,P1,2026-11-01,2026-11-03";
  const result = validateCsv(csv);
  expect(result.errors.map((e) => e.errorCode)).toEqual([
    "FORMULA_PREFIX",
    "DUPLICATE_REFERENCE",
  ]);
  expect(JSON.stringify(result.errors)).not.toContain("FORMULA()");
});
