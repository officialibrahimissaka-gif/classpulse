import { Redis } from "ioredis";
import { isIP } from "node:net";
import { config } from "./config";
import { sign, hash } from "./crypto";
import { parseSession } from "./auth";
import { check } from "./errors";
let redis: Redis | undefined;
async function consume(key: string, limit: number) {
  redis ??= new Redis(config().REDIS_URL, {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
  });
  const result = await redis.eval(
    "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],90) end; return n",
    1,
    key,
  );
  check(
    Number(result) <= limit,
    429,
    "RATE_LIMITED",
    "Too many requests. Wait a minute and try again.",
  );
}
export async function rateLimit(request: Request) {
  const c = config(),
    header = request.headers.get("x-real-ip"),
    peer =
      c.TRUST_INGRESS_IP === "true" && header && isIP(header)
        ? header
        : "untrusted-peer",
    window = Math.floor(Date.now() / 60000);
  const anonymous =
    new URL(request.url).pathname.startsWith("/api/auth/") ||
    new URL(request.url).pathname === "/api/invitation";
  let subject: string | undefined;
  if (!anonymous) {
    try {
      const s = parseSession(request);
      subject = s.tenantId + ":" + hash(s.secret);
    } catch {
      /* Invalid cookies cannot create a new throttle identity. */
    }
  }
  await consume(
    `cp:rate:peer:${subject ? "authenticated" : "anonymous"}:${sign(peer)}:${window}`,
    subject ? 1200 : 120,
  );
  if (subject) await consume(`cp:rate:session:${sign(subject)}:${window}`, 120);
}
