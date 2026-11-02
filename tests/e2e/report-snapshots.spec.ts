import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("CONT-SNAP06 frozen dashboard exports each format, survives source edit, and refreshes explicitly", async ({
  page,
}) => {
  const origin = "http://127.0.0.1:3000",
    suffix = crypto.randomUUID().slice(0, 8);
  await page.goto("/");
  expect(
    (
      await page.request.post("/api/auth/development", {
        headers: { Origin: origin },
        data: {
          name: "Snapshot browser owner",
          email: `snapshot-${suffix}@example.invalid`,
        },
      })
    ).status(),
  ).toBe(200);
  expect(
    (
      await page.request.post("/api/v1/tenants", {
        headers: { Origin: origin },
        data: {
          name: "Snapshot browser tenant",
          slug: "snapshot-" + suffix,
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
  const me = await (await page.request.get("/api/v1/me")).json();
  const headers = () => ({
    Origin: origin,
    "X-CSRF-Token": me.csrf,
    "Idempotency-Key": crypto.randomUUID(),
  });
  const clientResponse = await page.request.post("/api/v1/clients", {
    headers: headers(),
    data: { name: "Snapshot browser client", code: suffix },
  });
  expect(clientResponse.status()).toBe(200);
  const client = await clientResponse.json();
  const sourceResponse = await page.request.post("/api/v1/placements", {
    headers: headers(),
    data: {
      clientId: client.id,
      candidateName: "Snapshot browser person",
      candidateKey: suffix,
      sourceProfile: "browser-fixture",
      sourceKey: suffix,
      acceptedOn: "2026-10-01",
      plannedStart: "2026-10-29",
    },
  });
  expect(sourceResponse.status()).toBe(200);
  const source = await sourceResponse.json();
  await page.goto("/workspace");
  await expect(
    page.getByRole("button", { name: "Snapshot browser person" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Freeze report", exact: true })
    .click();
  await expect(page.getByText(/Frozen snapshot · expires/)).toBeVisible();
  expect(
    (
      await page.request.post(`/api/v1/placements/${source.id}/actions`, {
        headers: { ...headers(), "If-Match": `"v${source.version}"` },
        data: {
          action: "cancel",
          reason: "Synthetic mutation after dashboard freeze",
        },
      })
    ).status(),
  ).toBe(200);
  await expect(
    page.getByRole("button", { name: "Snapshot browser person" }),
  ).toBeVisible();
  for (const format of ["csv", "xlsx", "pdf"]) {
    await page.getByLabel("Export format").selectOption(format);
    await page
      .getByRole("button", { name: "Generate export", exact: true })
      .click();
    await expect(
      page.getByRole("link", { name: "Download report" }),
    ).toBeVisible({ timeout: 30000 });
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("link", { name: "Download report" }).click(),
    ]);
    expect(download.suggestedFilename()).toBe("placement-report." + format);
  }
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Refresh live report" }).click();
  await expect(page.getByText(/Frozen snapshot · expires/)).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Snapshot browser person" }),
  ).toHaveCount(0);
});
