import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { config } from "./config";
import { check } from "./errors";
export const hash = (value: string | Buffer) =>
  createHash("sha256").update(value).digest("hex");
export const sign = (value: string) =>
  createHmac("sha256", Buffer.from(config().SESSION_KEY, "hex"))
    .update(value)
    .digest("base64url");
export function equal(a: string, b: string) {
  const aa = Buffer.from(a),
    bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}
export function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.entries(value)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`)
    .join(",")}}`;
}
export function encrypt(value: string) {
  const iv = randomBytes(12),
    cipher = createCipheriv(
      "aes-256-gcm",
      Buffer.from(config().DATA_KEY, "hex"),
      iv,
    );
  const bytes = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), bytes]).toString("base64url");
}
export function decrypt(value: string) {
  const bytes = Buffer.from(value, "base64url");
  check(bytes.length > 28, 401, "INVALID_SESSION", "Sign in again");
  const cipher = createDecipheriv(
    "aes-256-gcm",
    Buffer.from(config().DATA_KEY, "hex"),
    bytes.subarray(0, 12),
  );
  cipher.setAuthTag(bytes.subarray(12, 28));
  return Buffer.concat([
    cipher.update(bytes.subarray(28)),
    cipher.final(),
  ]).toString("utf8");
}
export function seal(value: unknown) {
  return encrypt(JSON.stringify(value));
}
export function unseal(value: string): unknown {
  try {
    return JSON.parse(decrypt(value));
  } catch {
    throw new Error("Invalid sealed context");
  }
}
export function stableUuid(seed: string) {
  const h = hash(seed).slice(0, 32);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20)}`;
}
export const token = () => randomBytes(32).toString("base64url");
