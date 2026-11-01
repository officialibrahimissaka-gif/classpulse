import { z } from "zod";
import type { Tx } from "@/platform/database";
import {
  type Context,
  modules,
  requirePermission,
  requireFreshMfa,
} from "@/platform/policy";
import { audit, command } from "@/platform/commands";
import { check } from "@/platform/errors";
const changeSchema = z
  .object({
    module: z.enum(modules),
    state: z.enum(["active", "read_only"]),
    cascade: z.boolean(),
  })
  .strict();
export async function changeModule(
  tx: Tx,
  ctx: Context,
  request: Request,
  input: unknown,
) {
  requirePermission(ctx, "billing.manage");
  requireFreshMfa(ctx);
  const data = changeSchema.parse(input);
  check(
    data.module !== "platform.core",
    409,
    "CORE_REQUIRED",
    "The core platform remains available for administration and export.",
  );
  if (data.state === "active") {
    check(
      !(ctx.writeEndsAt ?? ctx.trialEndsAt) ||
        (ctx.writeEndsAt ?? ctx.trialEndsAt)! > new Date(),
      403,
      "TRIAL_ENDED",
      "An accepted commercial order is required to reactivate after the trial.",
    );
    if (data.module === "agency.starts")
      check(
        ctx.moduleStates["crm.accounts"] === "active",
        409,
        "DEPENDENCY_REQUIRED",
        "Activate CRM accounts first.",
      );
  }
  const dependents =
    data.module === "crm.accounts" &&
    ctx.moduleStates["agency.starts"] === "active" &&
    data.state === "read_only"
      ? ["agency.starts"]
      : [];
  check(
    !dependents.length || data.cascade,
    409,
    "DEPENDENT_CONFIRMATION_REQUIRED",
    "Agency starts also becomes read-only. Confirm this dependent module change.",
  );
  return command(tx, ctx, request, "modules.change", data, async () => {
    const keys = [data.module, ...dependents];
    await tx.moduleActivation.updateMany({
      where: { tenantId: ctx.tenantId, moduleKey: { in: keys } },
      data: {
        state: data.state,
        entitlementRevision: ctx.revision + 1,
        changedAt: new Date(),
        version: { increment: 1 },
      },
    });
    await tx.tenant.update({
      where: { id: ctx.tenantId },
      data: { entitlementRevision: { increment: 1 } },
    });
    await audit(tx, ctx, "module." + data.state, "tenant", ctx.tenantId, {
      modules: keys,
      retained: true,
    });
    return { id: ctx.tenantId, version: ctx.revision + 1 };
  });
}
