import { z } from "zod";
import type { Tx } from "@/platform/database";
import {
  type Context,
  requirePermission,
  requireFreshMfa,
} from "@/platform/policy";
import { allocate, audit, command } from "@/platform/commands";
import { setupSchema } from "./setup";
export async function entities(tx: Tx, ctx: Context) {
  requirePermission(ctx, "accounts.read");
  return tx.legalEntity.findMany({
    where: { tenantId: ctx.tenantId, deletedAt: null },
    select: {
      id: true,
      code: true,
      name: true,
      countryCode: true,
      authorityCode: true,
      timeZone: true,
      defaultCurrency: true,
    },
    orderBy: { code: "asc" },
  });
}
export async function createEntity(
  tx: Tx,
  ctx: Context,
  request: Request,
  input: unknown,
) {
  requirePermission(ctx, "tenant.manage");
  requireFreshMfa(ctx);
  const data = z
    .object({
      code: z.string().trim().min(1).max(40),
      name: setupSchema.shape.name,
      country: setupSchema.shape.country,
      authority: setupSchema.shape.authority,
      timeZone: setupSchema.shape.timeZone,
      currency: setupSchema.shape.currency,
    })
    .strict()
    .parse(input);
  return command(tx, ctx, request, "entities.create", data, async () => {
    await allocate(tx, ctx, "legal_entities", 1);
    const row = await tx.legalEntity.create({
      data: {
        tenantId: ctx.tenantId,
        code: data.code,
        name: data.name,
        countryCode: data.country,
        authorityCode: data.authority,
        timeZone: data.timeZone,
        defaultCurrency: data.currency,
      },
    });
    await audit(tx, ctx, "entity.created", "legal_entity", row.id);
    return { id: row.id, version: 1 };
  });
}
