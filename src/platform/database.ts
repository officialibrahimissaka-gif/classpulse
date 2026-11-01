import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "@/generated/prisma/client";
import { config } from "./config";
const globalDb = globalThis as unknown as { classpulseDb?: PrismaClient };
export function database() {
  if (!globalDb.classpulseDb) {
    const c = config();
    const local = ["localhost", "127.0.0.1"].includes(
      new URL(c.DATABASE_URL).hostname,
    );
    const url = new URL(c.DATABASE_URL);
    if (!local) {
      url.searchParams.delete("sslmode");
      url.searchParams.delete("sslaccept");
    }
    const adapter = new PrismaPg({
      connectionString: url.toString(),
      max: 10,
      ssl: local ? false : { rejectUnauthorized: true },
    });
    globalDb.classpulseDb = new PrismaClient({ adapter });
  }
  return globalDb.classpulseDb;
}
export type Tx = Prisma.TransactionClient;
export async function tenantTransaction<T>(
  tenantId: string,
  fn: (tx: Tx) => Promise<T>,
  isolationLevel: Prisma.TransactionIsolationLevel = "ReadCommitted",
): Promise<T> {
  return database().$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
      await tx.$queryRaw`SELECT set_config('statement_timeout', '10000', true)`;
      return fn(tx);
    },
    { maxWait: 10000, timeout: 15000, isolationLevel },
  );
}
