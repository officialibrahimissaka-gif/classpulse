import { it, expect, vi, afterEach } from "vitest";
import { config } from "@/platform/config";
import { z } from "zod";
import { problemResponse } from "@/platform/errors";
afterEach(() => vi.unstubAllEnvs());
it("P6-AUTH-001 NODE_ENV=production cannot bypass production controls through APP_ENV=development", () => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("APP_ENV", "development");
  vi.stubEnv("AUTH_MODE", "oidc");
  expect(() => config()).toThrow();
});
it("P6-AUTH-002 production requires provider identifiers and secure Redis rather than adapter labels alone", () => {
  vi.stubEnv("APP_ENV", "production");
  vi.stubEnv("APP_URL", "https://app.example.invalid");
  vi.stubEnv("AUTH_MODE", "oidc");
  vi.stubEnv("STORAGE_DRIVER", "s3");
  vi.stubEnv("MAIL_DRIVER", "ses");
  vi.stubEnv("OIDC_ISSUER", "");
  vi.stubEnv("OIDC_CLIENT_ID", "");
  vi.stubEnv("COGNITO_USER_POOL_ID", "");
  vi.stubEnv("S3_BUCKET", "");
  expect(() => config()).toThrow();
});
it("P6-ERR-001 validation errors use the same no-store problem envelope as other errors and omit rejected values", async () => {
  const result = z
    .object({ email: z.email() })
    .safeParse({ email: "synthetic-sensitive-invalid" });
  if (result.success) throw Error("Invalid fixture");
  const response = problemResponse(result.error);
  expect(response.headers.get("content-type")).toContain(
    "application/problem+json",
  );
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(await response.text()).not.toContain("synthetic-sensitive-invalid");
});
