import { z } from "zod";
import { config } from "./config";
import { equal, hash, seal, sign, token, unseal } from "./crypto";
import { check } from "./errors";
import type { Tx } from "./database";
export const identitySchema = z.object({
  issuer: z.string(),
  subject: z.string(),
  email: z.email(),
  name: z.string(),
  authTime: z.number(),
  mfa: z.boolean(),
  expires: z.number(),
  nonce: z.string(),
});
export type Identity = z.infer<typeof identitySchema>;
export const sessionName = () =>
  config().APP_URL.startsWith("https:")
    ? "__Host-cp-session"
    : "cp-local-session";
export function cookie(name: string, value: string, age: number) {
  return `${name}=${value}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${age}${config().APP_URL.startsWith("https:") ? "; Secure" : ""}`;
}
export function readCookie(request: Request, name: string) {
  return request.headers
    .get("cookie")
    ?.split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith(name + "="))
    ?.slice(name.length + 1);
}
export function readIdentity(request: Request): Identity {
  const raw = readCookie(request, "cp-identity");
  check(raw, 401, "AUTH_REQUIRED", "Sign in to continue");
  let value: unknown;
  try {
    value = unseal(raw);
  } catch {
    check(false, 401, "AUTH_REQUIRED", "Sign in again");
  }
  const identity = identitySchema.parse(value);
  check(identity.expires > Date.now(), 401, "AUTH_EXPIRED", "Sign in again");
  return identity;
}
export function identityCookie(identity: Identity) {
  return cookie("cp-identity", seal(identity), 900);
}
export function parseSession(request: Request) {
  const raw = readCookie(request, sessionName());
  check(raw, 401, "AUTH_REQUIRED", "Sign in to continue");
  const [tenantId, secret, signature] = raw.split(".");
  check(
    tenantId &&
      secret &&
      signature &&
      /^[a-f0-9-]{36}$/.test(tenantId) &&
      equal(sign(`${tenantId}.${secret}`), signature),
    401,
    "INVALID_SESSION",
    "Sign in again",
  );
  return { tenantId, secret, csrf: sign(`csrf:${secret}`) };
}
export async function createSession(
  tx: Tx,
  tenantId: string,
  memberId: string,
  identity: Identity,
) {
  const member = await tx.membership.findUniqueOrThrow({
    where: { tenantId_id: { tenantId, id: memberId } },
  });
  const secret = token(),
    now = new Date();
  await tx.session.create({
    data: {
      tenantId,
      membershipId: memberId,
      tokenHash: hash(secret),
      expiresAt: new Date(now.getTime() + 12 * 3600000),
      idleExpiresAt: new Date(now.getTime() + 30 * 60000),
      membershipRevision: member.membershipRevision,
      lastMfaAt: identity.mfa ? new Date(identity.authTime * 1000) : null,
    },
  });
  return {
    cookie: cookie(
      sessionName(),
      `${tenantId}.${secret}.${sign(`${tenantId}.${secret}`)}`,
      12 * 3600,
    ),
    csrf: sign(`csrf:${secret}`),
  };
}
export function validateOrigin(request: Request) {
  check(
    request.headers.get("origin") === new URL(config().APP_URL).origin,
    403,
    "ORIGIN_DENIED",
    "Please submit from this workspace",
  );
}

export function sessionResponse(sessionCookie: string, status = 200) {
  const response = Response.json(
    { ok: true },
    { status, headers: { "Cache-Control": "no-store" } },
  );
  response.headers.append("set-cookie", sessionCookie);
  response.headers.append("set-cookie", cookie("cp-identity", "", 0));
  return response;
}
