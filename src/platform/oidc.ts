import * as oidc from "openid-client";
import {
  CognitoIdentityProviderClient,
  DescribeUserPoolCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { config } from "./config";
import { check } from "./errors";
let discovery: Promise<oidc.Configuration> | undefined;
export function oidcConfig() {
  const c = config();
  check(
    c.OIDC_ISSUER && c.OIDC_CLIENT_ID,
    503,
    "IDENTITY_NOT_CONFIGURED",
    "Identity provider is not configured.",
  );
  discovery ??= oidc.discovery(
    new URL(c.OIDC_ISSUER),
    c.OIDC_CLIENT_ID,
    c.OIDC_CLIENT_SECRET,
  );
  return discovery;
}
export async function verifiedMfa(claims: Record<string, unknown>) {
  const c = config();
  if (
    !c.COGNITO_USER_POOL_ID ||
    c.OIDC_ISSUER !==
      `https://cognito-idp.${c.AWS_REGION}.amazonaws.com/${c.COGNITO_USER_POOL_ID}` ||
    claims.identities ||
    typeof claims.auth_time !== "number" ||
    Date.now() / 1000 - claims.auth_time > 600 ||
    claims.auth_time > Date.now() / 1000 + 60
  )
    return false;
  const pool = await new CognitoIdentityProviderClient({
    region: c.AWS_REGION,
  }).send(new DescribeUserPoolCommand({ UserPoolId: c.COGNITO_USER_POOL_ID }));
  return (
    pool.UserPool?.MfaConfiguration === "ON" &&
    !pool.UserPool.DeviceConfiguration
  );
}
