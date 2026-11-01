import { database } from "@/platform/database";
import { Redis } from "ioredis";
import { config } from "@/platform/config";
export const dynamic = "force-dynamic";
export async function GET() {
  let redis: Redis | undefined;
  try {
    await database().$queryRaw`SELECT 1 AS ready`;
    redis = new Redis(config().REDIS_URL, {
      connectTimeout: 3000,
      maxRetriesPerRequest: 0,
      lazyConnect: true,
    });
    await redis.ping();
    return Response.json(
      { status: "ready" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { status: "unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  } finally {
    redis?.disconnect();
  }
}
