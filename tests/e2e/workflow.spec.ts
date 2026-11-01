import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("company setup, client, placement, checklist, readiness, and a confirmed first day", async ({
  page,
}) => {
  const suffix = crypto.randomUUID().slice(0, 8);
  await page.goto("/");
  await page.getByLabel("Your name").fill("Agency Owner");
  await page.getByLabel("Work email").fill(`owner-${suffix}@example.invalid`);
  await page.getByRole("button", { name: "Continue locally" }).click();
  await page.getByLabel("Company name", { exact: true }).fill("Start Agency");
  await page
    .getByLabel("Workspace address")
    .last()
    .fill("agency-" + suffix);
  await page
    .getByLabel("Employment authority")
    .fill("Customer specified authority");
  await page.getByLabel("Retention days").fill("90");
  await page
    .getByLabel("Retention policy reference")
    .fill("Company policy reviewed for this test");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Create trial workspace" }).click();
  await expect(page).toHaveURL("/workspace");
  await expect(
    page.getByRole("heading", { name: "Every start, in sight." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clients", exact: true }).click();
  await page.getByLabel("Company name").fill("Example Client");
  await page.getByLabel("Client reference").fill("CLIENT-1");
  await page.getByRole("button", { name: "Add client", exact: true }).click();
  await expect(
    page.getByRole("cell", { name: "Example Client" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Placements", exact: true }).click();
  await page.getByLabel("Candidate name").fill("Alex Candidate");
  await page.getByLabel("Source system", { exact: true }).fill("ATS");
  await page.getByLabel("Placement source reference").fill("SOURCE-1");
  await page.getByLabel("Candidate source reference").fill("CAND-1");
  await page.getByLabel("Accepted on").fill("2026-10-01");
  await page.getByLabel("Planned first day").fill("2026-10-28");
  await page
    .getByRole("button", { name: "Create placement checklist" })
    .click();
  await page.getByRole("button", { name: "Alex Candidate" }).click();
  await expect(
    page.getByRole("heading", { name: "Start checklist" }),
  ).toBeVisible();
  for (let i = 0; i < 2; i++) {
    await page
      .locator(".task")
      .filter({ hasText: "Required" })
      .getByPlaceholder("Evidence reference or confirmation")
      .first()
      .fill("Confirmed with client by phone");
    await page
      .locator(".task")
      .filter({ hasText: "Required" })
      .getByRole("button", { name: "Complete", exact: true })
      .first()
      .click();
    await expect(
      page.getByRole("status").filter({ hasText: "Changes saved." }),
    ).toBeVisible();
  }
  await page.getByLabel("Reason", { exact: true }).fill("Readiness checked");
  await page.getByRole("button", { name: "Save decision" }).click();
  await expect(page.locator(".record-heading .pill")).toHaveText("ready");
  await page
    .getByRole("combobox", { name: "Action", exact: true })
    .selectOption("start");
  await page.getByLabel("Date (start / reschedule)").fill("2026-10-28");
  await page.getByRole("button", { name: "Save decision" }).click();
  await expect(page.locator(".record-heading .pill")).toHaveText("started");
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await page.getByRole("button", { name: "Placements", exact: true }).click();
  await page.getByLabel("Import source system").fill("browser-import");
  await page.getByLabel("Placement CSV").setInputFiles({
    name: "placements.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(
      "clientCode,clientName,candidateKey,candidateName,placementKey,acceptedOn,plannedStart\nCLIENT-2,Imported Client,CAND-2,Imported Candidate,PLACE-2,2026-10-01,2026-10-29\n",
    ),
  });
  await page.getByRole("button", { name: "Validate CSV" }).click();
  await expect(
    page.getByRole("button", { name: "Commit validated import" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Commit validated import" }).click();
  await expect(
    page.getByRole("button", { name: "Imported Candidate" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await page.getByRole("button", { name: "Generate export" }).click();
  await expect(page.getByRole("link", { name: "Download report" })).toBeVisible(
    { timeout: 30000 },
  );
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: "Download report" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("placement-report.pdf");
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByLabel("Your name")).toBeVisible();
  expect((await page.request.get("/api/v1/me")).status()).toBe(401);
});
