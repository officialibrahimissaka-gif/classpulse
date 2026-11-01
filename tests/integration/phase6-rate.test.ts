import { it, expect, vi, afterAll } from "vitest";
import { Redis } from "ioredis";
import { config } from "@/platform/config";
it("P6-RATE-001 rotating untrusted X-Real-IP cannot bypass the authentication limit", async () => {
  const url = new URL(config().REDIS_URL);
  url.pathname = "/14";
  vi.stubEnv("REDIS_URL", url.toString());
  const cleanup = new Redis(url.toString());
  const keys = await cleanup.keys("cp:rate:*");
  if (keys.length) await cleanup.del(...keys);
  await cleanup.quit();
  const { rateLimit } = await import("@/platform/rate-limit");
  let blocked = false,
    accepted = 0;
  for (let i = 0; i < 121; i++) {
    try {
      await rateLimit(
        new Request(config().APP_URL + "/api/auth/development", {
          headers: { "x-real-ip": "198.51.100." + ((i % 250) + 1) },
        }),
      );
      accepted++;
    } catch (error) {
      expect(error).toMatchObject({ status: 429, code: "RATE_LIMITED" });
      blocked = true;
      break;
    }
  }
  expect(blocked).toBe(true);
  expect(accepted).toBe(120);
});
afterAll(() => vi.unstubAllEnvs());
