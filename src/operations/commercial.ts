import { z } from "zod";
import { randomUUID } from "node:crypto";
import pg from "pg";
export const orderApproval = z
  .object({
    tenantId: z.uuid(),
    requestId: z.uuid(),
    orderReference: z.string().min(8).max(160),
    operatorReference: z.string().min(8).max(160),
    effectiveAt: z.iso.datetime(),
    acceptedOrderVerified: z.literal(true),
  })
  .strict();
export async function acceptOrder(connectionString: string, input: unknown) {
  const a = orderApproval.parse(input);
  if (new Date(a.effectiveAt) > new Date())
    throw Error(
      "The reviewed effective time has not arrived; no early downgrade or cancellation",
    );
  const c = new pg.Client({
    connectionString,
    ssl: ["localhost", "127.0.0.1"].includes(new URL(connectionString).hostname)
      ? false
      : { rejectUnauthorized: true },
  });
  await c.connect();
  try {
    await c.query("BEGIN");
    await c.query("SET LOCAL ROLE app_runtime");
    await c.query("SELECT set_config('app.tenant_id',$1,true)", [a.tenantId]);
    await c.query("SELECT id FROM tenant WHERE id=$1 FOR UPDATE", [a.tenantId]);
    const request = (
      await c.query(
        "SELECT * FROM commercial_change_request WHERE tenant_id=$1 AND id=$2 FOR UPDATE",
        [a.tenantId, a.requestId],
      )
    ).rows[0];
    if (request?.state === "accepted") {
      if (request.order_reference !== a.orderReference)
        throw Error("Order reference conflict");
      await c.query("ROLLBACK");
      return;
    }
    if (
      !request ||
      request.state !== "requested" ||
      !["starter", "growth"].includes(request.plan_key) ||
      !["upgrade", "downgrade", "cancel"].includes(request.request_type)
    )
      throw Error("Pending reviewed subscription request required");
    const current = (
      await c.query(
        "SELECT * FROM subscription WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT 1 FOR UPDATE",
        [a.tenantId],
      )
    ).rows[0];
    if (!current || new Date(a.effectiveAt) < new Date(current.effective_at))
      throw Error("Invalid effective ordering");
    let subscriptionId = current.id;
    if (request.request_type === "cancel") {
      await c.query(
        "UPDATE subscription SET state='canceled',ends_at=$3,version=version+1 WHERE tenant_id=$1 AND id=$2",
        [a.tenantId, current.id, a.effectiveAt],
      );
    } else {
      const limits =
        request.plan_key === "starter"
          ? { internal_seats: 10, active_placements: 100, legal_entities: 1 }
          : { internal_seats: 30, active_placements: 500, legal_entities: 3 };
      for (const [key, limit] of Object.entries(limits)) {
        const counter = await c.query(
          "UPDATE usage_counter SET hard_limit=$3,version=version+1 WHERE tenant_id=$1 AND resource_key=$2 AND period_key='gauge' RETURNING id",
          [a.tenantId, key, limit],
        );
        if (counter.rowCount !== 1) throw Error("Usage counter unavailable");
      }
      await c.query(
        "UPDATE subscription SET ends_at=$3,version=version+1 WHERE tenant_id=$1 AND id=$2",
        [a.tenantId, current.id, a.effectiveAt],
      );
      subscriptionId = randomUUID();
      await c.query(
        "INSERT INTO subscription(id,tenant_id,version,updated_at,plan_key,state,effective_at,order_reference) VALUES($1,$2,1,now(),$3,'active',$4,$5)",
        [
          subscriptionId,
          a.tenantId,
          request.plan_key,
          a.effectiveAt,
          a.orderReference,
        ],
      );
    }
    await c.query(
      "UPDATE commercial_change_request SET state='accepted',order_reference=$3,version=version+1 WHERE tenant_id=$1 AND id=$2",
      [a.tenantId, a.requestId, a.orderReference],
    );
    const tenant = await c.query(
      "UPDATE tenant SET entitlement_revision=entitlement_revision+1 WHERE id=$1 RETURNING entitlement_revision",
      [a.tenantId],
    );
    await c.query(
      "INSERT INTO audit_event(id,tenant_id,version,updated_at,action,resource_type,resource_id,occurred_at,correlation_id,membership_revision,entitlement_revision,redacted_changes) VALUES($1,$2,1,now(),'commercial.order_accepted','subscription',$3,now(),$4,0,$5,$6)",
      [
        randomUUID(),
        a.tenantId,
        subscriptionId,
        randomUUID(),
        tenant.rows[0].entitlement_revision,
        JSON.stringify({
          operatorReference: a.operatorReference,
          orderReference: a.orderReference,
          plan: request.plan_key,
          requestType: request.request_type,
          effectiveAt: a.effectiveAt,
        }),
      ],
    );
    await c.query("COMMIT");
  } catch (error) {
    await c.query("ROLLBACK");
    throw error;
  } finally {
    await c.end();
  }
}
