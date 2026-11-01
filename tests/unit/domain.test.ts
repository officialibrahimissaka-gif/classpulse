import { describe, it, expect } from "vitest";
import { calculate, type MetricRow } from "@/domain/analytics";
import { dueInstant, placementSchema } from "@/domain/agency";
import { seal, unseal, equal, stableUuid } from "@/platform/crypto";
import { requireModule, type Context } from "@/platform/policy";
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
  client: "Client",
  candidate: "Person",
});
describe("central metric definitions", () => {
  it("keeps actual-date counts separate from original-date on-time cohorts and shows unresolved/canceled", () => {
    const r = calculate(
      [
        row("a", "2026-10-31", "2026-11-01"),
        row("b", "2026-11-01", "2026-11-01"),
        row("c", "2026-11-01", "2026-11-03"),
        row("d", "2026-11-02", null, "accepted", 2),
        row("e", "2026-11-03", null, "canceled"),
      ],
      "2026-11-01",
      "2026-11-30",
    );
    expect(r).toEqual({
      confirmedStarts: 3,
      onTimeRate: 50,
      overdueRequired: 2,
      medianDelay: 1,
      denominator: 2,
      unresolved: 1,
      canceled: 1,
    });
  });
  it("does not fabricate a zero rate or median for empty cohorts", () => {
    expect(calculate([], "2026-01-01", "2026-01-31")).toMatchObject({
      onTimeRate: null,
      medianDelay: null,
    });
  });
});
describe("safe dates and cryptography", () => {
  it("rejects impossible dates and start-before-acceptance", () => {
    expect(
      placementSchema.safeParse({
        clientId: crypto.randomUUID(),
        candidateName: "A",
        sourceProfile: "ATS",
        sourceKey: "1",
        acceptedOn: "2026-02-30",
        plannedStart: "2026-03-01",
      }).success,
    ).toBe(false);
  });
  it("uses configured wall-clock time and rejects DST gaps", () => {
    expect(
      dueInstant("2026-11-01", -1, "17:00", "Asia/Dubai").toISOString(),
    ).toBe("2026-10-31T13:00:00.000Z");
    expect(() =>
      dueInstant("2026-03-08", 0, "02:30", "America/New_York"),
    ).toThrow();
  });
  it("detects ciphertext tampering and uses deterministic registration identifiers", () => {
    const s = seal({ test: "private" });
    expect(unseal(s)).toEqual({ test: "private" });
    expect(() => unseal(s.slice(0, -4) + "xxxx")).toThrow();
    expect(equal("secret", "different")).toBe(false);
    expect(stableUuid("a")).toBe(stableUuid("a"));
  });
});
describe("module enforcement", () => {
  const ctx = {
    moduleStates: { "agency.starts": "read_only", "crm.accounts": "active" },
    accessEndsAt: new Date(Date.now() + 60000),
    trialEndsAt: new Date(Date.now() - 1),
  } as unknown as Context;
  it("allows retained reads but denies writes and unknown features", () => {
    expect(() => requireModule(ctx, "agency.starts")).not.toThrow();
    expect(() => requireModule(ctx, "agency.starts", true)).toThrow();
    expect(() =>
      requireModule({ ...ctx, accessEndsAt: new Date(0) }, "agency.starts"),
    ).toThrow();
  });
});
