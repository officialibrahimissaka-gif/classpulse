import { Redis } from "ioredis";
import { config } from "./config";
import { sign } from "./crypto";
import { check } from "./errors";
let redis: Redis | undefined;
export async function rateLimit(request: Request) {
  redis ??= new Redis(config().REDIS_URL, {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
  });
  const key =
    "cp:rate:" +
    sign(request.headers.get("x-real-ip") ?? "local") +
    ":" +
    Math.floor(Date.now() / 60000);
  const result = await redis.eval(
    "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],90) end; return n",
    1,
    key,
  );
  check(
    Number(result) <= 120,
    429,
    "RATE_LIMITED",
    "Too many requests. Wait a minute and try again.",
  );
}
