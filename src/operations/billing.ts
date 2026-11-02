import { randomUUID } from "node:crypto";
import { z } from "zod";
import pg from "pg";
import { verifyPaystack, paymentReference } from "@/billing/paystack";
export const billingReview = z
  .object({
    tenantId: z.uuid(),
    customerCode: z.string().regex(/^CUS_[A-Za-z0-9]+$/),
    reference: paymentReference,
    reviewedReference: z.string().min(8).max(160),
    expectedCurrency: z.literal("GHS"),
    expectedAmountMinor: z.string().regex(/^(0|[1-9][0-9]{0,15})$/),
    bindingVerified: z.literal(true),
  })
  .strict();
export async function syncPayment(
  connectionString: string,
  input: unknown,
  secret: string,
  transport: typeof fetch = fetch,
) {
  const a = billingReview.parse(input);
  // Verify externally before opening a database transaction. Never trust return URL or client status.
  const p = await verifyPaystack(a.reference, secret, transport);
  if (
    p.customer.customer_code !== a.customerCode ||
    p.currency !== a.expectedCurrency ||
    BigInt(p.amount) !== BigInt(a.expectedAmountMinor)
  )
    throw Error("Reviewed customer, currency or amount differs from provider");
  const c = new pg.Client({
    connectionString,
    ssl: ["127.0.0.1", "localhost"].includes(new URL(connectionString).hostname)
      ? false
      : { rejectUnauthorized: true },
  });
  await c.connect();
  try {
    await c.query("BEGIN");
    await c.query("SET LOCAL ROLE app_billing_importer");
    await c.query("SELECT set_config('app.tenant_id',$1,true)", [a.tenantId]);
    await c.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
      a.tenantId,
    ]);
    await c.query(
      "INSERT INTO billing_connection(tenant_id,provider_customer_id,reviewed_reference) VALUES($1,$2,$3) ON CONFLICT(tenant_id) DO NOTHING",
      [a.tenantId, a.customerCode, a.reviewedReference],
    );
    const binding = await c.query(
      "SELECT provider_customer_id FROM billing_connection WHERE tenant_id=$1 FOR UPDATE",
      [a.tenantId],
    );
    if (binding.rows[0]?.provider_customer_id !== a.customerCode)
      throw Error(
        "Existing customer binding mismatch; reviewed maintenance required",
      );
    const prior = await c.query(
      "SELECT currency,amount_minor,status FROM billing_payment WHERE tenant_id=$1 AND provider_reference=$2 FOR UPDATE",
      [a.tenantId, a.reference],
    );
    if (
      prior.rowCount &&
      (prior.rows[0].currency !== p.currency ||
        BigInt(prior.rows[0].amount_minor) !== BigInt(p.amount))
    )
      throw Error("Immutable payment amount or currency changed");
    // Do not regress terminal payment evidence after an inconsistent provider reply.
    if (
      (prior.rows[0]?.status === "reversed" && p.status !== "reversed") ||
      (prior.rows[0]?.status === "success" &&
        !["success", "reversed"].includes(p.status))
    )
      throw Error("Provider status regression requires reconciliation");
    await c.query(
      "INSERT INTO billing_payment(tenant_id,provider_reference,status,currency,amount_minor,paid_at,synced_at) VALUES($1,$2,$3,$4,$5,$6,now()) ON CONFLICT(tenant_id,provider_reference) DO UPDATE SET status=EXCLUDED.status,paid_at=EXCLUDED.paid_at,synced_at=now()",
      [
        a.tenantId,
        a.reference,
        p.status,
        p.currency,
        String(p.amount),
        p.paid_at,
      ],
    );
    await c.query(
      "UPDATE billing_connection SET synced_at=now() WHERE tenant_id=$1",
      [a.tenantId],
    );
    await c.query(
      "INSERT INTO audit_event(id,tenant_id,version,updated_at,action,resource_type,resource_id,occurred_at,correlation_id,membership_revision,entitlement_revision,redacted_changes) VALUES($1,$2,1,now(),'billing.payment_observed','tenant',$2,now(),$3,0,0,$4)",
      [
        randomUUID(),
        a.tenantId,
        randomUUID(),
        JSON.stringify({
          provider: "paystack",
          mode: "test",
          reviewedReference: a.reviewedReference,
          status: p.status,
        }),
      ],
    );
    await c.query("COMMIT");
    return { status: p.status, mode: "test" };
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    await c.end();
  }
}
