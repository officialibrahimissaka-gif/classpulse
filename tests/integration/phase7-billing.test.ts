import { it, expect, afterAll, vi } from "vitest";
import { config as dotenv } from "dotenv";
import pg from "pg";
import { randomUUID } from "node:crypto";
import { tenant, within, scopedMember } from "../support/phase6";
import { syncPayment } from "@/operations/billing";
import { billingSummary } from "@/domain/billing";
import { authenticated } from "@/platform/commands";
import { request } from "../support/phase6";
import { database } from "@/platform/database";
dotenv({ path: ".local/admin.env", quiet: true });
it("P7-B04 reconciles exactly, enforces tenant/role scope and prevents mutable amounts, rebinding, regression or automatic grants", async () => {
  const s = await tenant(),
    other = await tenant();
  const id = await within(s, async (_, c) => c.tenantId),
    otherId = await within(other, async (_, c) => c.tenantId);
  const reference = "qa-" + randomUUID(),
    customerCode = "CUS_" + randomUUID().replaceAll("-", "");
  const review = {
    tenantId: id,
    customerCode,
    reference,
    reviewedReference: "TEST-reviewed-order",
    expectedCurrency: "GHS",
    expectedAmountMinor: "100001",
    bindingVerified: true,
  };
  const data = {
    reference,
    domain: "test",
    status: "success",
    currency: "GHS",
    amount: 100001,
    paid_at: "2026-11-02T00:00:00Z",
    customer: { customer_code: customerCode },
  };
  const f = (p: object = data) =>
    vi
      .fn<typeof fetch>()
      .mockImplementation(async () => Response.json({ status: true, data: p }));
  const url = process.env.ADMIN_DATABASE_URL!;
  await syncPayment(url, review, "sk_test_fixture", f());
  await syncPayment(url, review, "sk_test_fixture", f());
  const out = await within(s, billingSummary);
  expect(out.payments).toHaveLength(1);
  expect(out.payments[0]?.amountMinor).toBe("100001");
  expect((await within(other, billingSummary)).payments).toHaveLength(0);
  expect(
    await within(
      s,
      async (tx, c) =>
        (
          await tx.subscription.findFirstOrThrow({
            where: { tenantId: c.tenantId },
          })
        ).state,
    ),
  ).toBe("trialing");
  await expect(
    syncPayment(url, { ...review, tenantId: otherId }, "sk_test_fixture", f()),
  ).rejects.toThrow();
  await expect(
    syncPayment(
      url,
      { ...review, customerCode: "CUS_wrong" },
      "sk_test_fixture",
      f(),
    ),
  ).rejects.toThrow();
  await expect(
    syncPayment(
      url,
      { ...review, expectedAmountMinor: "100002" },
      "sk_test_fixture",
      f({ ...data, amount: 100002 }),
    ),
  ).rejects.toThrow();
  await expect(
    syncPayment(
      url,
      review,
      "sk_test_fixture",
      f({ ...data, status: "failed" }),
    ),
  ).rejects.toThrow();
  await syncPayment(
    url,
    review,
    "sk_test_fixture",
    f({ ...data, status: "reversed" }),
  );
  expect((await within(s, billingSummary)).payments[0]?.status).toBe(
    "reversed",
  );
  await expect(
    syncPayment(url, review, "sk_test_fixture", f()),
  ).rejects.toThrow();
  const recruiter = await scopedMember(s, "self");
  await expect(
    authenticated(request(recruiter), billingSummary),
  ).rejects.toMatchObject({ status: 403 });
  await expect(
    within(s, (tx, c) =>
      tx.billingPayment.create({
        data: {
          tenantId: c.tenantId,
          providerReference: "runtime-forged",
          status: "success",
          currency: "GHS",
          amountMinor: 1n,
          syncedAt: new Date(),
        },
      }),
    ),
  ).rejects.toThrow();
  const narrow = new pg.Client({ connectionString: url });
  await narrow.connect();
  try {
    await narrow.query("SET ROLE app_billing_importer");
    await expect(narrow.query("SELECT * FROM subscription")).rejects.toThrow();
  } finally {
    await narrow.end();
  }
});
afterAll(async () => database().$disconnect());
