import { spawnSync } from "node:child_process";
import { it, expect, vi } from "vitest";
import { verifyPaystack, createTestCheckout } from "@/billing/paystack";
import { validateRelease, gateNames } from "@/operations/release";
const payload = {
  status: true,
  data: {
    reference: "qa-1",
    domain: "test",
    status: "success",
    currency: "GHS",
    amount: 100001,
    paid_at: "2026-11-02T00:00:00Z",
    customer: { customer_code: "CUS_test1" },
  },
};
function transport(body: unknown) {
  return vi
    .fn<typeof fetch>()
    .mockImplementation(async () => Response.json(body));
}
it("P7-B01 rejects live secrets before network access and never trusts an unverified status", async () => {
  const f = transport(payload);
  await expect(
    verifyPaystack("qa-1", "sk_live_unavailable", f),
  ).rejects.toMatchObject({ code: "BILLING_TEST_KEY_REQUIRED" });
  expect(f).not.toHaveBeenCalled();
  const p = await verifyPaystack("qa-1", "sk_test_fixture", f);
  expect(p.amount).toBe(100001);
  expect(p.currency).toBe("GHS");
  await expect(
    verifyPaystack("different", "sk_test_fixture", f),
  ).rejects.toMatchObject({ code: "PAYMENT_REFERENCE_MISMATCH" });
  await expect(
    verifyPaystack(
      "qa-1",
      "sk_test_fixture",
      transport({ ...payload, data: { ...payload.data, domain: "live" } }),
    ),
  ).rejects.toThrow();
});
it("P7-B02 rejects unsafe, fractional, negative and unsupported amounts/currencies; preserves zero", async () => {
  for (const amount of [-1, 0.5, Number.MAX_SAFE_INTEGER + 1])
    await expect(
      verifyPaystack(
        "qa-1",
        "sk_test_fixture",
        transport({ ...payload, data: { ...payload.data, amount } }),
      ),
    ).rejects.toThrow();
  expect(
    (
      await verifyPaystack(
        "qa-1",
        "sk_test_fixture",
        transport({ ...payload, data: { ...payload.data, amount: 0 } }),
      )
    ).amount,
  ).toBe(0);
  await expect(
    verifyPaystack(
      "qa-1",
      "sk_test_fixture",
      transport({ ...payload, data: { ...payload.data, currency: "AED" } }),
    ),
  ).rejects.toThrow();
  await expect(
    verifyPaystack("../secret", "sk_test_fixture", transport(payload)),
  ).rejects.toThrow();
});
it("P7-B03 verifies the recurring GHS plan and rejects hostile hosted links without granting access", async () => {
  const a = {
    customerEmail: "test@example.invalid",
    planCode: "PLN_test1",
    reference: "qa-1",
    expectedAmountMinor: 100000,
    currency: "GHS",
  };
  const plan = {
    status: true,
    data: {
      domain: "test",
      plan_code: a.planCode,
      amount: a.expectedAmountMinor,
      currency: "GHS",
      interval: "monthly",
    },
  };
  const f = vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(Response.json(plan))
    .mockResolvedValueOnce(
      Response.json({
        status: true,
        data: {
          authorization_url: "https://checkout.paystack.com/test",
          reference: "qa-1",
        },
      }),
    );
  expect((await createTestCheckout(a, "sk_test_fixture", f)).reference).toBe(
    "qa-1",
  );
  const wrong = transport({ ...plan, data: { ...plan.data, amount: 200000 } });
  await expect(
    createTestCheckout(a, "sk_test_fixture", wrong),
  ).rejects.toMatchObject({ code: "BILLING_PLAN_MISMATCH" });
  expect(wrong).toHaveBeenCalledTimes(1);
  const bad = vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(Response.json(plan))
    .mockResolvedValueOnce(
      Response.json({
        status: true,
        data: {
          authorization_url: "https://evil.example/checkout",
          reference: "qa-1",
        },
      }),
    );
  await expect(
    createTestCheckout(a, "sk_test_fixture", bad),
  ).rejects.toMatchObject({ code: "CHECKOUT_RESPONSE_INVALID" });
});
it("P7-DEP01 fails closed for missing gates, target/source mismatch and mutable image tags", () => {
  const sha = "a".repeat(40),
    image =
      "123456789012.dkr.ecr.me-central-1.amazonaws.com/classpulse/web@sha256:" +
      "b".repeat(64);
  const m = {
    schemaVersion: 1,
    decision: "GO",
    target: "staging",
    sourceCommit: sha,
    images: { web: image, worker: image, operations: image },
    gates: Object.fromEntries(
      gateNames.map((n) => [
        n,
        {
          status: "pass",
          evidence: "https://example.invalid/evidence/" + n,
          approver: "Test reviewer",
        },
      ]),
    ),
  };
  expect(validateRelease(m, "staging", sha).decision).toBe("GO");
  for (const input of [
    { ...m, decision: "NO_GO" },
    { ...m, gates: {} },
    { ...m, images: { ...m.images, web: "latest" } },
  ])
    expect(() => validateRelease(input, "staging", sha)).toThrow();
  expect(() => validateRelease(m, "production", sha)).toThrow();
  expect(() => validateRelease(m, "staging", "c".repeat(40))).toThrow();
});

it("P7-DEP02 direct deployment entry point refuses NO_GO before invoking AWS", () => {
  const result = spawnSync(process.execPath, ["scripts/deploy-cell.mjs"], {
    encoding: "utf8",
    env: {
      ...process.env,
      TARGET: "staging",
      STACK_NAME: "classpulse-test",
      EXPECTED_ACCOUNT: "000000000000",
      PARAMETERS_PATH: "infra/aws/staging.parameters.example.json",
      RELEASE_EVIDENCE_PATH: "infra/release-evidence.json",
    },
  });
  expect(result.status).toBe(1);
  expect(result.stderr).toContain("Release blocked: exact reviewed source");
});
