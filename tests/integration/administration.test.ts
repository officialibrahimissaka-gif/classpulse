import { it, expect, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import { setup } from "@/domain/setup";
import { authenticated } from "@/platform/commands";
import { config } from "@/platform/config";
import { database } from "@/platform/database";
import { internalInvite, deactivate } from "@/domain/admin";
import { accept, invitationSecret } from "@/domain/collaboration";
import { availableViews, saveView } from "@/domain/views";
import { publishTemplate, template } from "@/domain/templates";
const identity = {
  issuer: "test-only",
  subject: randomUUID(),
  email: "admin@example.invalid",
  name: "Admin",
  authTime: Math.floor(Date.now() / 1000),
  mfa: true,
  expires: Date.now() + 900000,
  nonce: randomUUID(),
};
type Session = Awaited<ReturnType<typeof setup>>;
function req(s: Session) {
  return new Request(config().APP_URL + "/api/v1/test", {
    method: "POST",
    headers: {
      cookie: s.cookie.split(";")[0]!,
      origin: config().APP_URL,
      "X-CSRF-Token": s.csrf,
      "Idempotency-Key": randomUUID(),
    },
  });
}
it("requires fresh MFA, accepts a bounded internal role, shares views by explicit team, and revokes access", async () => {
  const s = await setup(identity, {
      name: "Admin fixture",
      slug: "admin-" + randomUUID(),
      country: "AE",
      authority: "Test authority",
      timeZone: "Asia/Dubai",
      currency: "AED",
      retentionDays: 90,
      retentionReference: "Company policy test",
      acknowledged: true,
    }),
    r = req(s),
    email = `recruiter-${randomUUID()}@example.invalid`;
  const invite = await authenticated(
    r,
    (tx, c) =>
      internalInvite(tx, c, req(s), {
        name: "Recruiter",
        email,
        role: "recruiter",
      }),
    true,
  );
  const tenantId = s.cookie.split("=")[1]!.split(".")[0]!,
    client = await accept(
      {
        ...identity,
        subject: randomUUID(),
        email,
        mfa: false,
        nonce: randomUUID(),
      },
      {
        tenantId,
        invitationId: invite.id,
        secret: invitationSecret(tenantId, invite.id),
      },
    ),
    cr = req(client);
  await expect(
    authenticated(
      cr,
      (tx, c) =>
        internalInvite(tx, c, req(client), {
          name: "No",
          email: "no@example.invalid",
          role: "owner",
        }),
      true,
    ),
  ).rejects.toMatchObject({ code: "FORBIDDEN" });
  const team = await authenticated(r, async (tx, c) =>
    tx.teamMembership.findFirstOrThrow({
      where: { tenantId: c.tenantId, membershipId: c.memberId },
    }),
  );
  const shared = await authenticated(
    r,
    (tx, c) =>
      saveView(tx, c, req(s), {
        name: "Team pipeline",
        visibility: "team",
        teamId: team.teamId,
        filters: { from: "2026-11-01", to: "2026-11-30" },
      }),
    true,
  );
  await authenticated(
    r,
    (tx, c) =>
      saveView(tx, c, req(s), {
        name: "Private view",
        visibility: "private",
        filters: { from: "2026-11-01", to: "2026-11-30" },
      }),
    true,
  );
  expect(
    (await authenticated(cr, (tx, c) => availableViews(tx, c))).map(
      (v) => v.id,
    ),
  ).toEqual([shared.id]);
  const next = await authenticated(
    r,
    (tx, c) =>
      publishTemplate(tx, c, req(s), {
        tasks: [
          {
            label: "New required handoff",
            required: true,
            dueOffsetDays: -2,
            dueTime: "16:30",
          },
        ],
      }),
    true,
  );
  expect(next.id).toBeTruthy();
  expect((await authenticated(r, (tx, c) => template(tx, c))).revision).toBe(2);
  const member = await authenticated(cr, async (_tx, c) => c.memberId);
  await authenticated(
    r,
    (tx, c) => deactivate(tx, c, req(s), { membershipId: member }),
    true,
  );
  await expect(
    authenticated(cr, (tx, c) => availableViews(tx, c)),
  ).rejects.toMatchObject({ code: "ACCESS_CHANGED" });
});
afterAll(async () => {
  await database().$disconnect();
});
