import { entities, createEntity } from "@/domain/entities";
import { config } from "@/platform/config";
import { requestPrivacy, createHold } from "@/domain/privacy";
import { availableViews, saveView } from "@/domain/views";
import { template, publishTemplate } from "@/domain/templates";
import {
  internalInvite,
  deactivate,
  assign,
  requestPlan,
} from "@/domain/admin";
import { jsonBody } from "@/platform/body";
import { stageImport, commitImport, importStatus } from "@/domain/imports";
import { z } from "zod";
import { authenticated } from "@/platform/commands";
import { problemResponse, check } from "@/platform/errors";
import { rateLimit } from "@/platform/rate-limit";
import { readIdentity, validateOrigin, sessionResponse } from "@/platform/auth";
import { setup } from "@/domain/setup";
import * as agency from "@/domain/agency";
import { report, filterSchema } from "@/domain/analytics";
import {
  requestExport,
  exportStatus,
  download,
  contentTypes,
} from "@/domain/exports";
import * as collaboration from "@/domain/collaboration";
import { changeModule } from "@/domain/modules";
import { requirePermission } from "@/platform/policy";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Params = { params: Promise<{ path: string[] }> };
export async function GET(request: Request, { params }: Params) {
  try {
    await rateLimit(request);
    const { path } = await params;
    if (path[0] === "exports" && path[2] === "content" && path.length === 3) {
      const artifact = await authenticated(request, (tx, ctx) =>
        download(tx, ctx, z.uuid().parse(path[1])),
      );
      return new Response(new Uint8Array(artifact.bytes), {
        headers: {
          "Content-Type": contentTypes[artifact.format],
          "Content-Disposition": `attachment; filename="placement-report.${artifact.format}"`,
          "Cache-Control": "no-store",
        },
      });
    }
    const result = await authenticated(request, async (tx, ctx) => {
      if (path.join("/") === "me") {
        const tenant = await tx.tenant.findUniqueOrThrow({
          where: { id: ctx.tenantId },
        });
        return {
          name: ctx.name,
          company: tenant.name,
          slug: tenant.slug,
          csrf: ctx.csrf,
          external: ctx.external,
          reauthAvailable: config().AUTH_MODE === "oidc",
          permissions: [...new Set(ctx.grants.map((g) => g.permission))],
          modules: ctx.moduleStates,
          trialEndsAt: ctx.trialEndsAt,
          subscription: await tx.subscription.findFirst({
            where: { tenantId: ctx.tenantId },
            orderBy: { createdAt: "desc" },
            select: { planKey: true, state: true },
          }),
          usage: ctx.external
            ? []
            : (
                await tx.usageCounter.findMany({
                  where: { tenantId: ctx.tenantId },
                })
              ).map((u) => ({
                resourceKey: u.resourceKey,
                used: Number(u.used),
                hardLimit: Number(u.hardLimit),
              })),
        };
      }
      if (path.join("/") === "privacy") {
        requirePermission(ctx, "privacy.manage");
        const { requireModule } = await import("@/platform/policy");
        requireModule(ctx, "agency.starts");
        return {
          requests: await tx.privacyRequest.findMany({
            where: { tenantId: ctx.tenantId },
            select: { id: true, state: true, requestType: true, dueAt: true },
          }),
          candidates: await tx.candidate.findMany({
            where: { tenantId: ctx.tenantId, deletedAt: null },
            select: { id: true, displayName: true },
            take: 1000,
          }),
          contacts: await tx.contact.findMany({
            where: { tenantId: ctx.tenantId, deletedAt: null },
            select: { id: true, displayName: true },
            take: 1000,
          }),
        };
      }
      if (path.join("/") === "entities") return entities(tx, ctx);
      if (path.join("/") === "views") return availableViews(tx, ctx);
      if (path.join("/") === "template") return template(tx, ctx);
      if (path.join("/") === "teams") {
        return tx.teamMembership.findMany({
          where: {
            tenantId: ctx.tenantId,
            membershipId: ctx.memberId,
            revokedAt: null,
          },
          select: { team: { select: { id: true, name: true } } },
        });
      }
      if (path.join("/") === "members") {
        requirePermission(ctx, "tasks.assign");
        return tx.membership.findMany({
          where: { tenantId: ctx.tenantId, isExternal: false },
          select: { id: true, displayName: true, status: true },
        });
      }
      if (path[0] === "imports" && path.length === 2)
        return importStatus(tx, ctx, z.uuid().parse(path[1]));
      if (path[0] === "exports" && path.length === 2)
        return exportStatus(tx, ctx, z.uuid().parse(path[1]));
      if (path.join("/") === "shared") return collaboration.shared(tx, ctx);
      if (path.join("/") === "clients")
        return agency.listClients(
          tx,
          ctx,
          agency.pageSchema.parse(
            Object.fromEntries(new URL(request.url).searchParams),
          ),
        );
      if (path.join("/") === "placements")
        return agency.listPlacements(
          tx,
          ctx,
          agency.pageSchema.parse(
            Object.fromEntries(new URL(request.url).searchParams),
          ),
        );
      if (path[0] === "placements" && path.length === 2)
        return agency.detail(tx, ctx, z.uuid().parse(path[1]));
      if (path.join("/") === "reports") {
        const url = new URL(request.url);
        return report(
          tx,
          ctx,
          filterSchema.parse(Object.fromEntries(url.searchParams)),
        );
      }
      if (path[0] === "participants" && path.length === 2) {
        requirePermission(ctx, "participants.manage");
        return {
          grants: await tx.participantGrant.findMany({
            where: {
              tenantId: ctx.tenantId,
              placementId: z.uuid().parse(path[1]),
            },
            select: {
              id: true,
              revokedAt: true,
              expiresAt: true,
              contact: { select: { displayName: true } },
            },
          }),
          invitations: await tx.invitation.findMany({
            where: {
              tenantId: ctx.tenantId,
              placementId: z.uuid().parse(path[1]),
            },
            select: {
              id: true,
              acceptedAt: true,
              expiresAt: true,
              deliveryRows: { select: { state: true } },
            },
          }),
        };
      }
      if (path.join("/") === "audit") {
        requirePermission(ctx, "audit.read");
        return tx.auditEvent.findMany({
          where: { tenantId: ctx.tenantId },
          orderBy: { occurredAt: "desc" },
          take: 100,
          select: {
            id: true,
            action: true,
            resourceType: true,
            resourceId: true,
            occurredAt: true,
          },
        });
      }
      check(false, 404, "NOT_FOUND", "This API operation is unavailable.");
    });
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return problemResponse(error);
  }
}
export async function POST(request: Request, { params }: Params) {
  try {
    await rateLimit(request);
    const { path } = await params;
    check(
      Number(request.headers.get("content-length") ?? 0) <
        (path[0] === "imports" ? 11 * 1024 * 1024 : 100000),
      413,
      "REQUEST_TOO_LARGE",
      "Submit a smaller request.",
    );
    const body = await jsonBody(
      request,
      path[0] === "imports" ? 11 * 1024 * 1024 : 100000,
    );
    if (path.join("/") === "tenants") {
      validateOrigin(request);
      const session = await setup(readIdentity(request), body);
      return sessionResponse(session.cookie, 201);
    }
    const result = await authenticated(
      request,
      async (tx, ctx) => {
        if (path.join("/") === "privacy")
          return requestPrivacy(tx, ctx, request, body);
        if (path.join("/") === "holds")
          return createHold(tx, ctx, request, body);
        if (path.join("/") === "entities")
          return createEntity(tx, ctx, request, body);
        if (path.join("/") === "views") return saveView(tx, ctx, request, body);
        if (path.join("/") === "template")
          return publishTemplate(tx, ctx, request, body);
        if (path.join("/") === "members/invite")
          return internalInvite(tx, ctx, request, body);
        if (path.join("/") === "members/deactivate")
          return deactivate(tx, ctx, request, body);
        if (path.join("/") === "tasks/assign")
          return assign(tx, ctx, request, body);
        if (path.join("/") === "commercial-requests")
          return requestPlan(tx, ctx, request, body);
        if (path.join("/") === "imports")
          return stageImport(tx, ctx, request, body);
        if (path[0] === "imports" && path[2] === "commit" && path.length === 3)
          return commitImport(tx, ctx, request, z.uuid().parse(path[1]));
        if (path.join("/") === "exports")
          return requestExport(tx, ctx, request, body);
        if (path.join("/") === "invitations")
          return collaboration.invite(tx, ctx, request, body);
        if (path.join("/") === "shared/complete")
          return collaboration.completeShared(tx, ctx, request, body);
        if (path.join("/") === "participants/revoke")
          return collaboration.revoke(tx, ctx, request, body);
        if (path.join("/") === "clients")
          return agency.createClient(tx, ctx, request, body);
        if (path.join("/") === "placements")
          return agency.createPlacement(tx, ctx, request, body);
        if (
          path[0] === "placements" &&
          path[2] === "actions" &&
          path.length === 3
        )
          return agency.act(tx, ctx, request, z.uuid().parse(path[1]), body);
        if (path.join("/") === "modules")
          return changeModule(tx, ctx, request, body);
        check(false, 404, "NOT_FOUND", "This API operation is unavailable.");
      },
      true,
      path[0] === "modules",
    );
    return Response.json(result, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return problemResponse(error);
  }
}
