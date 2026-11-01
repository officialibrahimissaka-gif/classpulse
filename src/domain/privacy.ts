import { z } from "zod";
import type { Tx } from "@/platform/database";
import {
  type Context,
  requirePermission,
  requireFreshMfa,
} from "@/platform/policy";
import { audit, command } from "@/platform/commands";
import { check } from "@/platform/errors";
import { hash } from "@/platform/crypto";
import { dateSchema } from "./agency";
export async function requestPrivacy(
  tx: Tx,
  ctx: Context,
  request: Request,
  input: unknown,
) {
  requirePermission(ctx, "privacy.manage");
  requireFreshMfa(ctx);
  const data = z
    .object({
      subjectType: z.enum(["candidate", "contact"]),
      subjectId: z.uuid(),
      dueOn: dateSchema,
      verificationReference: z.string().trim().min(10).max(500),
    })
    .strict()
    .parse(input);
  const subject =
    data.subjectType === "candidate"
      ? await tx.candidate.findUnique({
          where: {
            tenantId_id: { tenantId: ctx.tenantId, id: data.subjectId },
          },
        })
      : await tx.contact.findUnique({
          where: {
            tenantId_id: { tenantId: ctx.tenantId, id: data.subjectId },
          },
        });
  check(subject, 404, "SUBJECT_UNAVAILABLE", "Subject record unavailable");
  return command(tx, ctx, request, "privacy.request", data, async () => {
    const row = await tx.privacyRequest.create({
      data: {
        tenantId: ctx.tenantId,
        ownerId: ctx.memberId,
        requestType: "erasure",
        subjectReferenceHash: hash(data.subjectType + ":" + data.subjectId),
        state: "verified_pending_review",
        verifiedAt: new Date(),
        dueAt: new Date(data.dueOn),
      },
    });
    await audit(tx, ctx, "privacy.verified", "privacy_request", row.id, {
      verificationReferenceHash: hash(data.verificationReference),
      subjectType: data.subjectType,
    });
    return { id: row.id, version: 1, state: row.state };
  });
}
export async function createHold(
  tx: Tx,
  ctx: Context,
  request: Request,
  input: unknown,
) {
  requirePermission(ctx, "privacy.manage");
  requireFreshMfa(ctx);
  const data = z
    .object({
      reasonCode: z.string().trim().min(3).max(60),
      authorityReference: z.string().trim().min(10).max(500),
      reviewOn: dateSchema,
    })
    .strict()
    .parse(input);
  return command(tx, ctx, request, "holds.create", data, async () => {
    const row = await tx.legalHold.create({
      data: {
        tenantId: ctx.tenantId,
        ownerId: ctx.memberId,
        reasonCode: data.reasonCode,
        authorityReference: data.authorityReference,
        reviewDueAt: new Date(data.reviewOn),
      },
    });
    await audit(tx, ctx, "hold.created", "legal_hold", row.id);
    return { id: row.id, version: 1 };
  });
}
