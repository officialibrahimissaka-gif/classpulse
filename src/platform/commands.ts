import { randomUUID } from "node:crypto";
import type { Prisma } from "@/generated/prisma/client";
import type { Tx } from "./database";
import { tenantTransaction } from "./database";
import { parseSession, validateOrigin } from "./auth";
import { canonical, equal, hash } from "./crypto";
import { check } from "./errors";
import { memberContext, type Context } from "./policy";
export type Ack = { id: string; version: number; state?: string };
export async function authenticated<T>(
  request: Request,
  fn: (tx: Tx, ctx: Context) => Promise<T>,
  write = false,
  exclusive = false,
): Promise<T> {
  const session = parseSession(request);
  if (write) {
    validateOrigin(request);
    check(
      equal(request.headers.get("X-CSRF-Token") ?? "", session.csrf),
      403,
      "CSRF_DENIED",
      "Please reload this workspace before submitting.",
    );
  }
  return tenantTransaction(session.tenantId, async (tx) => {
    // Every business operation shares the module transition fence. Exclusive transition locks are taken by the module command.
    if (exclusive || write)
      await tx.$queryRaw`SELECT id FROM tenant WHERE id=${session.tenantId}::uuid FOR UPDATE`;
    else
      await tx.$queryRaw`SELECT id FROM tenant WHERE id=${session.tenantId}::uuid FOR SHARE`;
    const row = await tx.session.findUnique({
      where: {
        tenantId_tokenHash: {
          tenantId: session.tenantId,
          tokenHash: hash(session.secret),
        },
      },
    });
    check(
      row &&
        !row.revokedAt &&
        row.expiresAt > new Date() &&
        row.idleExpiresAt > new Date(),
      401,
      "SESSION_EXPIRED",
      "Sign in again to continue.",
    );
    const ctx = await memberContext(
      tx,
      session.tenantId,
      row.membershipId,
      session.csrf,
      row.lastMfaAt,
    );
    check(
      row.membershipRevision === ctx.membershipRevision,
      401,
      "ACCESS_CHANGED",
      "Your access has changed. Sign in again.",
    );
    if (row.idleExpiresAt.getTime() < Date.now() + 29 * 60000)
      await tx.session.update({
        where: { tenantId_id: { tenantId: ctx.tenantId, id: row.id } },
        data: {
          idleExpiresAt: new Date(Date.now() + 30 * 60000),
          version: { increment: 1 },
        },
      });
    return fn(tx, ctx);
  });
}
export async function audit(
  tx: Tx,
  ctx: Context,
  action: string,
  resourceType: string,
  resourceId: string | null,
  changes: Prisma.InputJsonValue = {},
) {
  await tx.auditEvent.create({
    data: {
      tenantId: ctx.tenantId,
      actorId: ctx.memberId,
      action,
      resourceType,
      resourceId,
      occurredAt: new Date(),
      correlationId: randomUUID(),
      membershipRevision: ctx.membershipRevision,
      entitlementRevision: ctx.revision,
      redactedChanges: changes,
    },
  });
}
export async function event(
  tx: Tx,
  ctx: Context,
  eventType: string,
  aggregateType: string,
  aggregateId: string,
  aggregateVersion: number,
  payload: Prisma.InputJsonValue = {},
) {
  await tx.outboxEvent.create({
    data: {
      tenantId: ctx.tenantId,
      eventType,
      schemaVersion: 1,
      aggregateType,
      aggregateId,
      aggregateVersion,
      occurredAt: new Date(),
      correlationId: randomUUID(),
      payload,
    },
  });
}
export function expectedVersion(request: Request, version: number) {
  const h = request.headers.get("If-Match");
  check(
    h,
    428,
    "VERSION_REQUIRED",
    "Reload the record before making this change.",
  );
  check(
    h === `"v${version}"`,
    412,
    "VERSION_CONFLICT",
    "This record changed. Reload it and review the latest values.",
  );
}
export async function command(
  tx: Tx,
  ctx: Context,
  request: Request,
  operation: string,
  payload: unknown,
  run: () => Promise<Ack>,
): Promise<Ack> {
  const key = request.headers.get("Idempotency-Key");
  check(
    key && key.length >= 16 && key.length <= 160,
    400,
    "IDEMPOTENCY_REQUIRED",
    "Provide a valid operation key.",
  );
  const digest = hash(canonical(payload));
  // Tenant fence serializes only this member/operation/key, not all tenant activity.
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`${ctx.tenantId}:${ctx.memberId}:${operation}:${key}`},0))::text`;
  const old = await tx.idempotencyRecord.findUnique({
    where: {
      tenantId_actorId_operationType_idempotencyKey: {
        tenantId: ctx.tenantId,
        actorId: ctx.memberId,
        operationType: operation,
        idempotencyKey: key,
      },
    },
  });
  if (old) {
    check(
      old.payloadHash === digest,
      409,
      "IDEMPOTENCY_CONFLICT",
      "This operation key was used with different data.",
    );
    check(
      old.resourceId,
      409,
      "OPERATION_PENDING",
      "This operation is still pending.",
    );
    return { id: old.resourceId, version: 0, state: "replayed" };
  }
  const result = await run();
  await tx.idempotencyRecord.create({
    data: {
      tenantId: ctx.tenantId,
      actorId: ctx.memberId,
      operationType: operation,
      idempotencyKey: key,
      payloadHash: digest,
      state: "committed",
      resourceId: result.id,
      resourceType: operation,
      expiresAt: new Date(Date.now() + 86400000),
    },
  });
  return result;
}
export async function allocate(
  tx: Tx,
  ctx: Context,
  resourceKey: string,
  quantity: number,
  periodKey = "gauge",
  limit?: number,
) {
  check(
    Number.isSafeInteger(quantity) && quantity > 0,
    422,
    "INVALID_QUANTITY",
    "Allocation quantity must be a positive safe integer.",
  );
  if (limit !== undefined)
    await tx.usageCounter.upsert({
      where: {
        tenantId_resourceKey_periodKey: {
          tenantId: ctx.tenantId,
          resourceKey,
          periodKey,
        },
      },
      create: {
        tenantId: ctx.tenantId,
        resourceKey,
        periodKey,
        used: 0,
        reserved: 0,
        hardLimit: limit,
      },
      update: {},
    });
  const changed = await tx.$queryRaw<
    { id: string }[]
  >`UPDATE usage_counter SET used=used+${quantity},version=version+1 WHERE tenant_id=${ctx.tenantId}::uuid AND resource_key=${resourceKey} AND period_key=${periodKey} AND used+reserved+${quantity}<=hard_limit RETURNING id`;
  check(
    changed.length === 1,
    409,
    "CAPACITY_REACHED",
    "The current plan capacity is reached. Existing data is retained; contact your administrator.",
  );
  await tx.usageEvent.create({
    data: {
      tenantId: ctx.tenantId,
      counterId: changed[0]!.id,
      operationKey: randomUUID(),
      quantity,
      eventType: "consumed",
      occurredAt: new Date(),
    },
  });
}
export async function release(tx: Tx, ctx: Context, resourceKey: string) {
  const rows = await tx.$queryRaw<
    { id: string }[]
  >`UPDATE usage_counter SET used=used-1,version=version+1 WHERE tenant_id=${ctx.tenantId}::uuid AND resource_key=${resourceKey} AND period_key='gauge' AND used>0 RETURNING id`;
  check(
    rows.length === 1,
    409,
    "COUNTER_CONFLICT",
    "Usage must be reconciled before proceeding.",
  );
  await tx.usageEvent.create({
    data: {
      tenantId: ctx.tenantId,
      counterId: rows[0]!.id,
      operationKey: randomUUID(),
      quantity: 1,
      eventType: "released",
      occurredAt: new Date(),
    },
  });
}
