import { jsonBody } from "@/platform/body";
import { rateLimit } from "@/platform/rate-limit";
import { randomUUID } from "node:crypto";
import * as oidc from "openid-client";
import { z } from "zod";
import { config } from "@/platform/config";
import {
  cookie,
  sessionResponse,
  identityCookie,
  readCookie,
  readIdentity,
  sessionName,
  validateOrigin,
} from "@/platform/auth";
import { seal, unseal } from "@/platform/crypto";
import { check, problemResponse } from "@/platform/errors";
import { oidcConfig, verifiedMfa } from "@/platform/oidc";
import { loginWorkspace } from "@/domain/setup";
export const runtime = "nodejs";
const flowSchema = z.object({
  verifier: z.string(),
  state: z.string(),
  nonce: z.string(),
  workspace: z
    .string()
    .regex(/^[a-z][a-z0-9-]{2,79}$/)
    .optional(),
});
export async function GET(
  request: Request,
  { params }: { params: Promise<{ action: string }> },
) {
  try {
    const { action } = await params,
      c = config();
    check(
      c.AUTH_MODE === "oidc",
      404,
      "NOT_FOUND",
      "Use the local development sign-in.",
    );
    if (action === "login") {
      const verifier = oidc.randomPKCECodeVerifier(),
        state = oidc.randomState(),
        nonce = oidc.randomNonce();
      const url = oidc.buildAuthorizationUrl(await oidcConfig(), {
        redirect_uri: c.APP_URL + "/api/auth/callback",
        scope: "openid email profile",
        code_challenge: await oidc.calculatePKCECodeChallenge(verifier),
        code_challenge_method: "S256",
        state,
        nonce,
        max_age: "0",
      });
      return new Response(null, {
        status: 303,
        headers: {
          location: url.href,
          "set-cookie": cookie(
            "cp-oidc",
            seal({
              verifier,
              state,
              nonce,
              workspace:
                new URL(request.url).searchParams.get("workspace") ?? undefined,
            }),
            600,
          ),
          "Cache-Control": "no-store",
        },
      });
    }
    check(
      action === "callback",
      404,
      "NOT_FOUND",
      "Unknown identity operation.",
    );
    const raw = readCookie(request, "cp-oidc");
    check(raw, 401, "LOGIN_EXPIRED", "Restart sign-in.");
    const flow = flowSchema.parse(unseal(raw));
    const tokens = await oidc.authorizationCodeGrant(
      await oidcConfig(),
      new URL(request.url),
      {
        pkceCodeVerifier: flow.verifier,
        expectedState: flow.state,
        expectedNonce: flow.nonce,
        idTokenExpected: true,
      },
    );
    const claims = tokens.claims();
    check(
      claims &&
        claims.email_verified === true &&
        typeof claims.email === "string",
      401,
      "VERIFIED_EMAIL_REQUIRED",
      "Use a verified email address.",
    );
    const identity = {
      issuer: String(claims.iss),
      subject: claims.sub,
      email: claims.email,
      name: typeof claims.name === "string" ? claims.name : claims.email,
      authTime:
        typeof claims.auth_time === "number"
          ? claims.auth_time
          : Math.floor(Date.now() / 1000),
      mfa: await verifiedMfa(claims),
      expires: Date.now() + 900000,
      nonce: randomUUID(),
    };
    const response = new Response(null, {
      status: 303,
      headers: { location: c.APP_URL, "Cache-Control": "no-store" },
    });
    if (flow.workspace) {
      const session = await loginWorkspace(identity, flow.workspace);
      response.headers.set("location", c.APP_URL + "/workspace");
      response.headers.append("set-cookie", session.cookie);
    }
    response.headers.append(
      "set-cookie",
      flow.workspace ? cookie("cp-identity", "", 0) : identityCookie(identity),
    );
    response.headers.append("set-cookie", cookie("cp-oidc", "", 0));
    return response;
  } catch (error) {
    return problemResponse(error);
  }
}
export async function POST(
  request: Request,
  { params }: { params: Promise<{ action: string }> },
) {
  try {
    await rateLimit(request);
    validateOrigin(request);
    const { action } = await params,
      c = config();
    if (action === "development") {
      check(
        c.AUTH_MODE === "development" && c.APP_ENV !== "production",
        404,
        "NOT_FOUND",
        "Not available",
      );
      const data = z
        .object({
          email: z.email().max(320),
          name: z.string().trim().min(1).max(200),
        })
        .strict()
        .parse(await jsonBody(request));
      return Response.json(
        { ok: true },
        {
          headers: {
            "set-cookie": identityCookie({
              issuer: "local-development",
              subject: data.email.toLowerCase(),
              email: data.email.toLowerCase(),
              name: data.name,
              authTime: Math.floor(Date.now() / 1000),
              mfa: false,
              expires: Date.now() + 900000,
              nonce: randomUUID(),
            }),
            "Cache-Control": "no-store",
          },
        },
      );
    }
    if (action === "workspace") {
      const { slug } = z
        .object({ slug: z.string().max(80) })
        .strict()
        .parse(await jsonBody(request));
      const session = await loginWorkspace(readIdentity(request), slug);
      return sessionResponse(session.cookie);
    }
    check(action === "logout", 404, "NOT_FOUND", "Unknown identity operation.");
    const { authenticated } = await import("@/platform/commands");
    const { parseSession } = await import("@/platform/auth");
    const { hash } = await import("@/platform/crypto");
    const parsed = parseSession(request);
    await authenticated(
      request,
      async (tx, ctx) => {
        await tx.session.update({
          where: {
            tenantId_tokenHash: {
              tenantId: ctx.tenantId,
              tokenHash: hash(parsed.secret),
            },
          },
          data: { revokedAt: new Date(), version: { increment: 1 } },
        });
      },
      true,
    );
    const response = Response.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
    for (const name of [
      sessionName(),
      "cp-identity",
      "cp-invitation",
      "cp-oidc",
    ])
      response.headers.append("set-cookie", cookie(name, "", 0));
    return response;
  } catch (error) {
    return problemResponse(error);
  }
}
