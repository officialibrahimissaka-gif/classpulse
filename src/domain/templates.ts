import { z } from "zod";
import type { Tx } from "@/platform/database";
import {
  type Context,
  requireModule,
  requirePermission,
} from "@/platform/policy";
import { command, audit } from "@/platform/commands";
const taskSchema = z
  .object({
    label: z.string().trim().min(1).max(200),
    required: z.boolean(),
    dueOffsetDays: z.number().int().min(-365).max(365),
    dueTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  })
  .strict();
export async function template(tx: Tx, ctx: Context) {
  requireModule(ctx, "agency.starts");
  requirePermission(ctx, "templates.manage");
  return tx.templateVersion.findFirstOrThrow({
    where: {
      tenantId: ctx.tenantId,
      state: "published",
      template: { moduleKey: "agency.starts" },
    },
    orderBy: { revision: "desc" },
    select: {
      revision: true,
      fromTaskDefinition_templateVersion: {
        select: {
          label: true,
          required: true,
          dueOffsetDays: true,
          dueTime: true,
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}
export async function publishTemplate(
  tx: Tx,
  ctx: Context,
  request: Request,
  input: unknown,
) {
  requireModule(ctx, "agency.starts", true);
  requirePermission(ctx, "templates.manage");
  const data = z
    .object({ tasks: z.array(taskSchema).min(1).max(50) })
    .strict()
    .parse(input);
  return command(tx, ctx, request, "templates.publish", data, async () => {
    await tx.$queryRaw`SELECT id FROM workflow_template WHERE tenant_id=${ctx.tenantId}::uuid FOR UPDATE`;
    const old = await tx.templateVersion.findFirstOrThrow({
      where: {
        tenantId: ctx.tenantId,
        template: { moduleKey: "agency.starts" },
      },
      orderBy: { revision: "desc" },
    });
    const next = await tx.templateVersion.create({
      data: {
        tenantId: ctx.tenantId,
        templateId: old.templateId,
        revision: old.revision + 1,
        state: "published",
        publishedAt: new Date(),
        publisherId: ctx.memberId,
      },
    });
    await tx.taskDefinition.createMany({
      data: data.tasks.map((t, i) => ({
        ...t,
        tenantId: ctx.tenantId,
        templateVersionId: next.id,
        taskKey: "task-" + i,
        milestoneKey: "pre-start",
        sortOrder: i,
      })),
    });
    await audit(tx, ctx, "template.published", "template_version", next.id, {
      revision: next.revision,
    });
    return { id: next.id, version: 1 };
  });
}
