import { z } from "zod";
import type { Tx } from "@/platform/database";
import {
  type Context,
  requireModule,
  requirePermission,
} from "@/platform/policy";
import { check } from "@/platform/errors";
import { command, audit } from "@/platform/commands";
import { filterSchema } from "./analytics";
export async function availableViews(tx: Tx, ctx: Context) {
  requireModule(ctx, "platform.analytics");
  requirePermission(ctx, "reports.read");
  const teams = await tx.teamMembership.findMany({
    where: {
      tenantId: ctx.tenantId,
      membershipId: ctx.memberId,
      revokedAt: null,
    },
    select: { teamId: true },
  });
  return tx.savedView.findMany({
    where: {
      tenantId: ctx.tenantId,
      deletedAt: null,
      OR: [
        { ownerId: ctx.memberId },
        { visibility: "team", teamId: { in: teams.map((t) => t.teamId) } },
      ],
    },
    select: {
      id: true,
      name: true,
      visibility: true,
      filterSchema: true,
      teamId: true,
    },
    orderBy: { name: "asc" },
    take: 100,
  });
}
export async function saveView(
  tx: Tx,
  ctx: Context,
  request: Request,
  input: unknown,
) {
  requireModule(ctx, "platform.analytics", true);
  requirePermission(ctx, "reports.read");
  const data = z
    .object({
      name: z.string().trim().min(1).max(160),
      visibility: z.enum(["private", "team"]),
      filters: filterSchema,
      teamId: z.uuid().optional(),
    })
    .strict()
    .parse(input);
  if (data.visibility === "team") {
    check(
      data.teamId &&
        (await tx.teamMembership.findFirst({
          where: {
            tenantId: ctx.tenantId,
            membershipId: ctx.memberId,
            teamId: data.teamId,
            revokedAt: null,
          },
        })),
      403,
      "TEAM_REQUIRED",
      "Choose a team you belong to.",
    );
  }
  return command(tx, ctx, request, "views.create", data, async () => {
    const row = await tx.savedView.create({
      data: {
        tenantId: ctx.tenantId,
        ownerId: ctx.memberId,
        name: data.name,
        visibility: data.visibility,
        teamId: data.visibility === "team" ? data.teamId : null,
        filterSchema: data.filters,
        timeZone: "UTC",
        schemaVersion: 1,
      },
    });
    await audit(tx, ctx, "view.created", "saved_view", row.id);
    return { id: row.id, version: 1 };
  });
}
