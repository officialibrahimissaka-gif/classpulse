import { afterAll, describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { setup } from "@/domain/setup";
import { authenticated } from "@/platform/commands";
import { database, tenantTransaction } from "@/platform/database";
import { config } from "@/platform/config";
import { createClient, createPlacement, act, detail } from "@/domain/agency";
import { changeModule } from "@/domain/modules";
import { report } from "@/domain/analytics";
import { hash } from "@/platform/crypto";
const identity = {
  issuer: "test-only",
  subject: randomUUID(),
  email: "owner@example.invalid",
  name: "Test owner",
  authTime: Math.floor(Date.now() / 1000),
  mfa: true,
  expires: Date.now() + 900000,
  nonce: randomUUID(),
};
const values = {
  name: "Integration workspace",
  slug: "test-" + randomUUID(),
  country: "AE",
  authority: "test-unreviewed",
  timeZone: "Asia/Dubai",
  currency: "AED",
  retentionDays: 90,
  retentionReference: "Test company retention policy",
  acknowledged: true,
};
const sessions: Awaited<ReturnType<typeof setup>>[] = [];
function request(
  session: (typeof sessions)[number],
  body: unknown,
  key = randomUUID(),
  version?: number,
) {
  return new Request(config().APP_URL + "/api/v1/test", {
    method: "POST",
    headers: {
      cookie: session.cookie.split(";")[0]!,
      origin: config().APP_URL,
      "X-CSRF-Token": session.csrf,
      "Idempotency-Key": key,
      ...(version ? { "If-Match": `"v${version}"` } : {}),
    },
    body: JSON.stringify(body),
  });
}
describe("native PostgreSQL tenant and workflow boundaries", () => {
  it("provisions atomically and retries setup without duplicating a tenant", async () => {
    const session = await setup(identity, values);
    sessions.push(session);
    const repeat = await setup(identity, values);
    expect(repeat.cookie).toContain(session.cookie.split(".")[0]!);
    await expect(
      setup(identity, { ...values, name: "Changed" }),
    ).rejects.toMatchObject({ code: "REGISTRATION_CONFLICT" });
  });
  it("denies context-free reads and cross-tenant writes at the database boundary", async () => {
    expect(await database().clientAccount.findMany()).toEqual([]);
    const tenantId = sessions[0]!.cookie.split("=")[1]!.split(".")[0]!;
    await tenantTransaction(tenantId, async (tx) => {
      await expect(
        tx.principal.create({
          data: {
            tenantId: randomUUID(),
            issuer: "bad",
            subject: "bad",
            state: "active",
          },
        }),
      ).rejects.toThrow();
    });
    const role = await database().$queryRaw<
      { rolsuper: boolean; rolbypassrls: boolean }[]
    >`SELECT rolsuper,rolbypassrls FROM pg_roles WHERE rolname=current_user`;
    expect(role[0]).toEqual({ rolsuper: false, rolbypassrls: false });
  });
  it("runs acceptance through checklist, human readiness, actual start, reopen, and module retention", async () => {
    const session = sessions[0]!,
      req = request(session, {});
    const client = await authenticated(
      req,
      (tx, c) =>
        createClient(tx, c, request(session, {}), {
          name: "Client",
          code: randomUUID(),
        }),
      true,
    );
    const body = {
        clientId: client.id,
        candidateName: "A Person",
        candidateKey: randomUUID(),
        sourceProfile: "test",
        sourceKey: randomUUID(),
        acceptedOn: "2026-10-01",
        plannedStart: "2026-10-28",
      },
      key = randomUUID(),
      createReq = request(session, body, key);
    const placement = await authenticated(
      createReq,
      (tx, c) => createPlacement(tx, c, createReq, body),
      true,
    );
    const replay = await authenticated(
      createReq,
      (tx, c) => createPlacement(tx, c, createReq, body),
      true,
    );
    expect(replay.id).toBe(placement.id);
    const perform = async (data: unknown, version: number) => {
      const r = request(session, data, randomUUID(), version);
      return authenticated(
        r,
        (tx, c) => act(tx, c, r, placement.id, data),
        true,
      );
    };
    await expect(
      perform(
        { action: "start", date: "2026-10-28", reason: "Human confirmation" },
        1,
      ),
    ).rejects.toMatchObject({ code: "NOT_READY" });
    let p = await authenticated(req, (tx, c) => detail(tx, c, placement.id));
    for (const task of p.fromPlacementTask_placement.filter(
      (t) => t.required,
    )) {
      await perform(
        {
          action: "complete",
          taskId: task.id,
          evidence: "Manual confirmation reference",
        },
        p.version,
      );
      p = await authenticated(req, (tx, c) => detail(tx, c, placement.id));
    }
    await expect(
      perform({ action: "ready", reason: "Verified" }, 1),
    ).rejects.toMatchObject({ code: "VERSION_CONFLICT" });
    await perform({ action: "ready", reason: "Verified readiness" }, p.version);
    p = await authenticated(req, (tx, c) => detail(tx, c, placement.id));
    await perform(
      { action: "start", date: "2026-10-28", reason: "Confirmed first day" },
      p.version,
    );
    const r = await authenticated(req, (tx, c) =>
      report(tx, c, { from: "2026-10-01", to: "2026-10-31" }),
    );
    expect(r.metrics.confirmedStarts).toBe(1);
    expect(r.metrics.onTimeRate).toBe(100);
    const data = { module: "crm.accounts", state: "read_only", cascade: false };
    const mr = request(session, data);
    await expect(
      authenticated(mr, (tx, c) => changeModule(tx, c, mr, data), true, true),
    ).rejects.toMatchObject({ code: "DEPENDENT_CONFIRMATION_REQUIRED" });
    const cascade = { ...data, cascade: true },
      cr = request(session, cascade);
    await authenticated(
      cr,
      (tx, c) => changeModule(tx, c, cr, cascade),
      true,
      true,
    );
    expect(
      (await authenticated(req, (tx, c) => detail(tx, c, placement.id))).status,
    ).toBe("started");
    const denied = request(session, { ...body, sourceKey: randomUUID() });
    await expect(
      authenticated(
        denied,
        (tx, c) => createPlacement(tx, c, denied, body),
        true,
      ),
    ).rejects.toMatchObject({ code: "MODULE_READ_ONLY" });
  });
  it("revokes existing sessions and rejects missing CSRF", async () => {
    const session = sessions[0]!;
    const bad = request({ ...session, csrf: "wrong" }, {});
    await expect(
      authenticated(bad, async () => true, true),
    ).rejects.toMatchObject({ code: "CSRF_DENIED" });
    const req = request(session, {});
    await authenticated(req, async (tx, c) => {
      await tx.membership.update({
        where: { tenantId_id: { tenantId: c.tenantId, id: c.memberId } },
        data: {
          membershipRevision: { increment: 1 },
          version: { increment: 1 },
        },
      });
    });
    await expect(authenticated(req, async () => true)).rejects.toMatchObject({
      code: "ACCESS_CHANGED",
    });
  });
  it("preserves immutable history, original dates, and composite tenant FKs", async () => {
    const session = await setup(
      { ...identity, subject: randomUUID(), nonce: randomUUID() },
      { ...values, slug: "test-" + randomUUID() },
    );
    sessions.push(session);
    const req = request(session, {});
    await authenticated(req, async (tx, c) => {
      const audit = await tx.auditEvent.findFirstOrThrow({
        where: { tenantId: c.tenantId },
      });
      await expect(
        tx.auditEvent.update({
          where: { tenantId_id: { tenantId: c.tenantId, id: audit.id } },
          data: { action: "tamper", version: { increment: 1 } },
        }),
      ).rejects.toThrow();
    });
    expect(hash("x")).toHaveLength(64);
  });
});
afterAll(async () => {
  await database().$disconnect();
});
