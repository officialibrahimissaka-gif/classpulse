import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("P7-UX01 pricing is explicit GHS experiment and owner billing is accessible, responsive and authenticated", async ({
  page,
}) => {
  await page.goto("/pricing");
  await expect(
    page.getByRole("heading", { name: "Starter", exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/GHS.*1,000/)).toBeVisible();
  await expect(
    page.getByText(/Prices below are proposed experiments/),
  ).toBeVisible();
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  expect((await page.request.get("/api/v1/billing")).status()).toBe(401);
  const origin = "http://127.0.0.1:3000",
    suffix = crypto.randomUUID().slice(0, 8);
  expect(
    (
      await page.request.post("/api/auth/development", {
        headers: { Origin: origin },
        data: {
          name: "Synthetic billing owner",
          email: `billing-${suffix}@example.invalid`,
        },
      })
    ).status(),
  ).toBe(200);
  expect(
    (
      await page.request.post("/api/v1/tenants", {
        headers: { Origin: origin },
        data: {
          name: "Billing preview",
          slug: "billing-" + suffix,
          country: "AE",
          authority: "TEST ONLY",
          timeZone: "Asia/Dubai",
          currency: "AED",
          retentionDays: 90,
          retentionReference: "Synthetic fixture policy",
          acknowledged: true,
        },
      })
    ).status(),
  ).toBe(201);
  await page.goto("/billing");
  await expect(page.getByText("No payment observations yet.")).toBeVisible();
  await page.getByRole("button", { name: "Refresh records" }).click();
  await expect(page.getByText("No payment observations yet.")).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});
