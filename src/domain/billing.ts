import type { Tx } from "@/platform/database";
import { requirePermission, type Context } from "@/platform/policy";
import { audit } from "@/platform/commands";
export async function billingSummary(tx: Tx, ctx: Context) {
  requirePermission(ctx, "billing.manage");
  await audit(tx, ctx, "billing.inspected", "tenant", ctx.tenantId);
  const connection = await tx.billingConnection.findUnique({
    where: { tenantId: ctx.tenantId },
    select: { syncedAt: true },
  });
  const rows = await tx.billingPayment.findMany({
    where: { tenantId: ctx.tenantId },
    orderBy: [{ syncedAt: "desc" }, { providerReference: "desc" }],
    take: 100,
  });
  return {
    provider: "paystack",
    mode: "test",
    syncedAt: connection?.syncedAt?.toISOString() ?? null,
    payments: rows.map((r) => ({
      reference: r.providerReference,
      status: r.status,
      currency: r.currency,
      amountMinor: r.amountMinor.toString(),
      paidAt: r.paidAt?.toISOString() ?? null,
      syncedAt: r.syncedAt.toISOString(),
    })),
  };
}
