import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("P6-HTTP-001 real HTTP authorization, injection, unsupported webhooks, keyboard and responsive accessibility", async ({
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
          name: "Synthetic HTTP auditor",
          email: `http-${suffix}@example.invalid`,
        },
      })
    ).status(),
  ).toBe(200);
  expect(
    (
      await page.request.post("/api/v1/tenants", {
        headers: { Origin: origin },
        data: {
          name: "HTTP audit tenant",
          slug: "http-" + suffix,
          country: "AE",
          authority: "TEST ONLY",
          timeZone: "Asia/Dubai",
          currency: "AED",
          retentionDays: 90,
          retentionReference: "TEST ONLY policy fixture",
          acknowledged: true,
        },
      })
    ).status(),
  ).toBe(201);
  const me = await (await page.request.get("/api/v1/me")).json(),
    headers = {
      Origin: origin,
      "X-CSRF-Token": me.csrf,
      "Idempotency-Key": crypto.randomUUID(),
    };
  const literal = "QA '); DROP TABLE tenant; -- <img src=x onerror=alert(1)>";
  expect(
    (
      await page.request.post("/api/v1/clients", {
        headers,
        data: { name: literal, code: "HTTP-" + suffix },
      })
    ).status(),
  ).toBe(200);
  const bad = await page.request.post("/api/v1/clients", {
    headers: { ...headers, "Idempotency-Key": crypto.randomUUID() },
    data: {
      name: "Synthetic private value",
      code: "EXTRA",
      tenantId: crypto.randomUUID(),
      salary: 123,
    },
  });
  expect(bad.status()).toBe(422);
  expect(bad.headers()["content-type"]).toContain("application/problem+json");
  expect(bad.headers()["cache-control"]).toBe("no-store");
  expect(await bad.text()).not.toContain("Synthetic private value");
  expect(
    (
      await page.request.post("/api/v1/clients", {
        headers: { ...headers, "X-CSRF-Token": "forged" },
        data: { name: "Denied", code: "DENY" },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await page.request.post("/api/v1/clients", {
        headers: { ...headers, Origin: "https://attacker.example.invalid" },
        data: { name: "Denied", code: "DENY" },
      })
    ).status(),
  ).toBe(403);
  expect((await page.request.get("/api/v1/clients?limit=1000")).status()).toBe(
    422,
  );
  for (const path of ["/api/v1/payroll", "/api/v1/webhooks/payment"])
    expect(
      (await page.request.post(path, { headers, data: {} })).status(),
    ).toBe(404);
  await page.goto("/workspace");
  await expect(
    page.getByRole("button", { name: "Overview", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Overview", exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Placements", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Clients", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("cell", { name: literal, exact: true }),
  ).toBeVisible();
  expect(await page.locator("td img").count()).toBe(0);
  for (const tab of ["Clients", "Placements", "Settings"]) {
    await page.getByRole("button", { name: tab, exact: true }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: tab, exact: true }),
    ).toBeVisible();
    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  }
  const cookies = await page.context().cookies();
  const session = cookies.find((c) => c.name === "cp-local-session")!;
  await page.context().addCookies([
    {
      ...session,
      value:
        session.value.slice(0, -1) + (session.value.endsWith("A") ? "B" : "A"),
    },
  ]);
  expect((await page.request.get("/api/v1/me")).status()).toBe(401);
});
