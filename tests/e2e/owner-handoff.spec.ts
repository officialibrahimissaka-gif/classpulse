import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
test("OWNER-LOCAL03 sample workspace is preserved on restart and owner can open graphs and download a real PDF", async ({
  page,
}) => {
  const slug = "owner-demo-" + crypto.randomUUID().slice(0, 8);
  const first = execFileSync(
    process.execPath,
    ["--import", "tsx", "scripts/demo-sample.ts", slug],
    { encoding: "utf8" },
  );
  expect(first).toContain("5 sample placements");
  const again = execFileSync(
    process.execPath,
    ["--import", "tsx", "scripts/demo-sample.ts", slug],
    { encoding: "utf8" },
  );
  expect(again).toContain("No sample records were added or reset");
  await page.goto("/");
  await page.getByLabel("Your name").fill("Portfolio Demo Owner");
  await page.getByLabel("Work email").fill("demo-owner@example.invalid");
  await page.getByRole("button", { name: "Continue locally" }).click();
  await page
    .getByRole("heading", { name: "Join your workspace" })
    .locator("..")
    .getByLabel("Workspace address")
    .fill(slug);
  await page
    .getByRole("button", { name: "Open workspace", exact: true })
    .click();
  await expect(page).toHaveURL("/workspace");
  await expect(
    page.getByRole("button", { name: "Demo Candidate 1" }),
  ).toBeVisible();
  await expect(
    page
      .locator(".metric")
      .filter({ hasText: "Confirmed starts" })
      .locator("strong"),
  ).toHaveText("2");
  await page
    .getByRole("button", { name: "Generate export", exact: true })
    .click();
  await expect(page.getByRole("link", { name: "Download report" })).toBeVisible(
    { timeout: 30000 },
  );
  const [file] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: "Download report" }).click(),
  ]);
  expect(file.suggestedFilename()).toBe("placement-report.pdf");
});
