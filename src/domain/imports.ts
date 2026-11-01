import { randomUUID } from "node:crypto";
import { z } from "zod";
import { parse } from "csv-parse/sync";
import type { Tx } from "@/platform/database";
import {
  type Context,
  requireModule,
  requirePermission,
  clientScope,
} from "@/platform/policy";
import { allocate, audit, command, event } from "@/platform/commands";
import { check } from "@/platform/errors";
import { hash, encrypt, decrypt } from "@/platform/crypto";
import { putArtifact, getArtifact } from "@/platform/storage";
import { dateSchema, dueInstant } from "./agency";
const columns = [
  "clientCode",
  "clientName",
  "candidateKey",
  "candidateName",
  "placementKey",
  "acceptedOn",
  "plannedStart",
];
const rowSchema = z
  .object({
    clientCode: z.string().trim().min(1).max(60),
    clientName: z.string().trim().min(1).max(200),
    candidateKey: z.string().trim().min(1).max(160),
    candidateName: z.string().trim().min(1).max(200),
    placementKey: z.string().trim().min(1).max(160),
    acceptedOn: dateSchema,
    plannedStart: dateSchema,
  })
  .strict()
  .refine((r) => r.plannedStart >= r.acceptedOn, {
    path: ["plannedStart"],
    message: "Start precedes acceptance",
  });
export function validateCsv(csv: string) {
  let raw: unknown;
  try {
    raw = parse(csv, {
      columns: (header: string[]) => {
        check(
          header.length === columns.length &&
            header.every((v, i) => v === columns[i]),
          422,
          "CSV_HEADERS",
          "Use the supplied CSV columns in the same order.",
        );
        return header;
      },
      bom: true,
      skip_empty_lines: true,
      max_record_size: 8192,
      trim: true,
    });
  } catch {
    check(
      false,
      422,
      "INVALID_CSV",
      "The CSV has invalid columns, quoting, or row length.",
    );
  }
  const parsed = z
      .array(z.record(z.string(), z.string()))
      .min(1)
      .max(1000)
      .parse(raw),
    errors: { rowNumber: number; columnKey: string; errorCode: string }[] = [],
    rows: z.infer<typeof rowSchema>[] = [],
    seen = new Set<string>();
  parsed.forEach((raw, index) => {
    const result = rowSchema.safeParse(raw);
    if (!result.success) {
      for (const e of result.error.issues)
        errors.push({
          rowNumber: index + 2,
          columnKey: String(e.path[0] ?? "row"),
          errorCode: "INVALID_VALUE",
        });
      return;
    }
    const row = result.data;
    for (const [key, value] of Object.entries(row))
      if (/^[\s]*[=+@\-\t\r]/.test(value))
        errors.push({
          rowNumber: index + 2,
          columnKey: key,
          errorCode: "FORMULA_PREFIX",
        });
    if (seen.has(row.placementKey))
      errors.push({
        rowNumber: index + 2,
        columnKey: "placementKey",
        errorCode: "DUPLICATE_REFERENCE",
      });
    seen.add(row.placementKey);
    rows.push(row);
  });
  return { rows, errors };
}
const stageSchema = z
  .object({
    sourceProfile: z.string().trim().min(1).max(80),
    entityId: z.uuid().optional(),
    csv: z.string().max(10 * 1024 * 1024),
  })
  .strict();
export async function stageImport(
  tx: Tx,
  ctx: Context,
  request: Request,
  input: unknown,
) {
  requireModule(ctx, "platform.integrations", true);
  requireModule(ctx, "agency.starts", true);
  requirePermission(ctx, "imports.run");
  const data = stageSchema.parse(input),
    validated = validateCsv(data.csv);
  return command(tx, ctx, request, "imports.stage", data, async () => {
    const id = randomUUID(),
      key = `${ctx.tenantId}/${id}.csv.enc`;
    await putArtifact(
      key,
      Buffer.from(
        encrypt(JSON.stringify({ csv: data.csv, entityId: data.entityId })),
      ),
      "application/octet-stream",
    );
    const row = await tx.importBatch.create({
      data: {
        id,
        tenantId: ctx.tenantId,
        sourceProfile: data.sourceProfile,
        sourceHash: hash(data.csv),
        idempotencyKey: request.headers.get("Idempotency-Key")!,
        state: validated.errors.length ? "invalid" : "validated",
        rowCount: validated.rows.length,
        errorCount: validated.errors.length,
        stagingObjectKey: key,
        expiresAt: new Date(Date.now() + 86400000),
        requesterId: ctx.memberId,
      },
    });
    if (validated.errors.length)
      await tx.importError.createMany({
        data: validated.errors.map((e) => ({
          ...e,
          tenantId: ctx.tenantId,
          batchId: id,
        })),
      });
    await audit(tx, ctx, "import.validated", "import_batch", id, {
      rows: row.rowCount,
      errors: row.errorCount,
    });
    return { id, version: 1, state: row.state };
  });
}
export async function importStatus(tx: Tx, ctx: Context, id: string) {
  requireModule(ctx, "platform.integrations");
  requirePermission(ctx, "imports.run");
  const batch = await tx.importBatch.findFirst({
    where: { tenantId: ctx.tenantId, id, requesterId: ctx.memberId },
  });
  check(batch, 404, "NOT_FOUND", "Import unavailable");
  return {
    id,
    state: batch.state,
    rowCount: batch.rowCount,
    errorCount: batch.errorCount,
    expiresAt: batch.expiresAt,
    errors: await tx.importError.findMany({
      where: { tenantId: ctx.tenantId, batchId: id },
      select: { rowNumber: true, columnKey: true, errorCode: true },
      take: 1000,
    }),
  };
}
export async function commitImport(
  tx: Tx,
  ctx: Context,
  request: Request,
  id: string,
) {
  requireModule(ctx, "platform.integrations", true);
  requireModule(ctx, "agency.starts", true);
  requirePermission(ctx, "imports.run");
  requirePermission(ctx, "accounts.write");
  requirePermission(ctx, "placements.write");
  check(!ctx.external, 403, "FORBIDDEN", "Internal access required");
  return command(tx, ctx, request, "imports.commit", { id }, async () => {
    await tx.$queryRaw`SELECT id FROM import_batch WHERE tenant_id=${ctx.tenantId}::uuid AND id=${id}::uuid FOR UPDATE`;
    const batch = await tx.importBatch.findFirst({
      where: { tenantId: ctx.tenantId, id, requesterId: ctx.memberId },
    });
    check(
      batch && batch.state === "validated" && batch.expiresAt > new Date(),
      409,
      "IMPORT_UNAVAILABLE",
      "Import is invalid, expired, or already committed.",
    );
    const staged = z
      .object({ csv: z.string(), entityId: z.uuid().optional() })
      .parse(
        JSON.parse(
          decrypt(
            (await getArtifact(batch.stagingObjectKey, "unversioned")).toString(
              "utf8",
            ),
          ),
        ),
      );
    const csv = staged.csv;
    check(
      hash(csv) === batch.sourceHash,
      409,
      "SOURCE_CHANGED",
      "Staged file integrity check failed",
    );
    const { rows, errors } = validateCsv(csv);
    check(
      !errors.length,
      422,
      "INVALID_CSV",
      "Correct the source file and validate again.",
    );
    const tenantId = ctx.tenantId,
      entity = await tx.legalEntity.findFirstOrThrow({
        where: {
          tenantId,
          ...(staged.entityId ? { id: staged.entityId } : {}),
        },
      }),
      template = await tx.templateVersion.findFirstOrThrow({
        where: {
          tenantId,
          state: "published",
          template: { moduleKey: "agency.starts" },
        },
        orderBy: { revision: "desc" },
        include: { fromTaskDefinition_templateVersion: true },
      });
    const existingClients = await tx.clientAccount.findMany({
        where: {
          AND: [
            clientScope(ctx),
            { accountCode: { in: rows.map((r) => r.clientCode) } },
          ],
        },
      }),
      clients = new Map(existingClients.map((c) => [c.accountCode, c]));
    const newClients: {
      id: string;
      tenantId: string;
      entityId: string;
      ownerId: string;
      accountCode: string;
      name: string;
      status: string;
    }[] = [];
    const candidateRows = await tx.candidate.findMany({
        where: {
          tenantId,
          sourceProfile: batch.sourceProfile,
          sourceKey: { in: rows.map((r) => r.candidateKey) },
          deletedAt: null,
        },
      }),
      candidates = new Map(
        candidateRows.map((c) => [
          c.sourceKey,
          { id: c.id, displayName: c.displayName },
        ]),
      );
    const newCandidates: {
      id: string;
      tenantId: string;
      ownerId: string;
      sourceProfile: string;
      sourceKey: string;
      displayName: string;
    }[] = [];
    const previous = await tx.placement.findMany({
        where: {
          tenantId,
          sourceProfile: batch.sourceProfile,
          sourceKey: { in: rows.map((r) => r.placementKey) },
        },
      }),
      existing = new Map(previous.map((p) => [p.sourceKey, p]));
    const pending: typeof rows = [];
    for (const r of rows) {
      let c = clients.get(r.clientCode);
      if (c)
        check(
          c.name === r.clientName &&
            c.status === "active" &&
            c.entityId === entity.id,
          409,
          "SOURCE_CONFLICT",
          "A client reference has different values or is inactive.",
        );
      else {
        const n = {
          id: randomUUID(),
          tenantId,
          entityId: entity.id,
          ownerId: ctx.memberId,
          accountCode: r.clientCode,
          name: r.clientName,
          status: "active",
        };
        newClients.push(n);
        c = {
          ...n,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          archivedAt: null,
          deletedAt: null,
        };
        clients.set(r.clientCode, c);
      }
      let candidate = candidates.get(r.candidateKey);
      if (candidate)
        check(
          candidate.displayName === r.candidateName,
          409,
          "SOURCE_CONFLICT",
          "A candidate reference has different values.",
        );
      else {
        const n = {
          id: randomUUID(),
          tenantId,
          ownerId: ctx.memberId,
          sourceProfile: batch.sourceProfile,
          sourceKey: r.candidateKey,
          displayName: r.candidateName,
        };
        newCandidates.push(n);
        candidate = n;
        candidates.set(r.candidateKey, candidate);
      }
      const old = existing.get(r.placementKey);
      if (old) {
        check(
          old.clientId === c.id &&
            old.candidateId === candidate.id &&
            old.acceptedOn.toISOString().slice(0, 10) === r.acceptedOn &&
            old.originalPlannedStart.toISOString().slice(0, 10) ===
              r.plannedStart,
          409,
          "SOURCE_CONFLICT",
          "A placement source reference has different values. Nothing was imported.",
        );
      } else pending.push(r);
    }
    if (pending.length)
      await allocate(tx, ctx, "active_placements", pending.length);
    if (newClients.length)
      await tx.clientAccount.createMany({ data: newClients });
    if (newCandidates.length)
      await tx.candidate.createMany({ data: newCandidates });
    const placements = pending.map((r) => ({
      id: randomUUID(),
      tenantId,
      clientId: clients.get(r.clientCode)!.id,
      entityId: entity.id,
      candidateId: candidates.get(r.candidateKey)!.id,
      ownerId: ctx.memberId,
      sourceProfile: batch.sourceProfile,
      sourceKey: r.placementKey,
      acceptedOn: new Date(r.acceptedOn),
      originalPlannedStart: new Date(r.plannedStart),
      currentPlannedStart: new Date(r.plannedStart),
      timeZone: entity.timeZone,
      templateVersionId: template.id,
    }));
    const milestones = placements.map((p) => ({
      id: randomUUID(),
      tenantId,
      placementId: p.id,
      milestoneKey: "pre-start",
      label: "Before the first day",
      sortOrder: 0,
    }));
    if (placements.length) {
      await tx.placement.createMany({ data: placements });
      await tx.milestone.createMany({ data: milestones });
      await tx.placementTask.createMany({
        data: placements.flatMap((p, i) =>
          template.fromTaskDefinition_templateVersion.map((d) => ({
            tenantId,
            placementId: p.id,
            milestoneId: milestones[i]!.id,
            definitionId: d.id,
            label: d.label,
            required: d.required,
            ownerId: ctx.memberId,
            dueAt: dueInstant(
              p.currentPlannedStart.toISOString().slice(0, 10),
              d.dueOffsetDays,
              d.dueTime,
              p.timeZone,
            ),
          })),
        ),
      });
    }
    await tx.importBatch.update({
      where: { tenantId_id: { tenantId, id } },
      data: { state: "committed", version: { increment: 1 } },
    });
    await audit(tx, ctx, "import.committed", "import_batch", id, {
      created: placements.length,
      unchanged: rows.length - placements.length,
    });
    await event(tx, ctx, "agency.import.committed", "import_batch", id, 2, {
      created: placements.length,
    });
    return { id, version: 2, state: "committed" };
  });
}
